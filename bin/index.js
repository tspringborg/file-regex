#!/usr/bin/env node

/**
 * Created by ts on 06/03/15.
 */
var fs = require('fs-extra')
var inquirer = require("inquirer");
var _ = require("lodash");
var walk = require('walkdir');
var path = require('path');
var prompt = require('prompt');
var type = process.argv[2];
var fileRegex,files;

console.log('file-regex in directory: ' + process.cwd());

prompt.message = 'File-Regex'.underline;

var OPS = {
    REGEX_CHANGE:'Change file matching regex'.yellow,
    REGEX_IN_FILES:'Regex on files'.yellow,
    REGEX_ON_FILENAMES:'Regex on filenames'.yellow,
    REPORT:"Generate report".yellow,
    EXIT:"Exit".red
}

var FILENAME_REGEX = "filename regex";
var FILEDATA_REGEX = "filedata regex";
var FILEDATA_REPLACE = "filedata replace";

var questions = {
    operation:{
        type:"list",
        message:OPS.REGEX_IN_FILES,
        name:"operation",
        default:'regex replace in files',
        choices: _.toArray(OPS)
    },
    file_matching_regex:{
        type:"input",
        message:"Regex to match file names".yellow,
        name:"filename_regex",
        default:''
    }
}
var files = [];
var menu = function(){
    if(files.length>0){
        //show full menu
        inquirer.prompt(
            [
                {
                    type:"list",
                    message:"What do you want to do?",
                    name:"operation",
                    default:'regex replace in files',
                    choices: _.toArray(OPS)
                }
            ], function(a){
                switch(a.operation){
                    case OPS.REGEX_IN_FILES:
                        promptFileReplace();
                        break;
                    case OPS.REGEX_ON_FILENAMES:
                        promptFileRename();
                        break;
                    case OPS.REGEX_CHANGE:
                        console.log('asd');
                        promptFileRegex();
                        break;
                }
        })
    }else{
        //prompt file matching regex
        promptFileRegex();
    }
}

var answers = {};

menu();


function askQuestions(q, callback){
    inquirer.prompt(q, function(a){
        _.extend(answers, a);
        callback;
    })
}



function promptFileRegex(){
    prompt.start();
    prompt.get({
        properties: {
            fileregex: {
                description: "regex to match file names".yellow,
                default:answers.FILEDATA_REGEX || ""
            }
        }
    }, function (err, result) {
        _.extend(answers, {FILEDATA_REGEX:result.fileregex});
        fileRegex = new RegExp(result.fileregex, 'g');
        getFiles();
    });
}

//promptFileRegex();

function promptYesNo(message, yes, no){
    prompt.start();
    prompt.get({
        properties: {
            "y/n": {
                description: message.yellow+" (y,n)".yellow
            }
        }
    }, function (err, result) {
        if(result["y/n"] == 'y'){
            yes();
        }else{
            no();
        }
    });
}

function getFiles(){
    var foundFiles = [];
    var walker = walk(process.cwd());
    walker.on("file", function(file){
        if(file.match(fileRegex)){
            console.log("file-match: "+file);
            foundFiles.push(file);
        }
    })
    walker.on("end", function () {
        files = foundFiles;
        var msg = foundFiles.length+" files match the regex";
        console.log(msg.underline);
        menu();
    });
}


var filesToReplace;
function promptFileReplace(){
    prompt.start();
    prompt.get({
        properties: {
            regex: {
                description: "regex to match data in files".yellow
            },
            replace:{
                description:"replace with...   ".yellow
            }
        }
    }, function (err, result) {
        filesToReplace = files.length;
        function checkIfDone(){
            if(filesRemaining.length == 0){
                console.log("Done".underline)
                promptYesNo("Do another replace on the same batch of files?", promptFileReplace, exit)
            }else{
                replaceInNextFile();
            }
        }
        var file;
        var filesRemaining = files.concat([]);
        var regex = new RegExp(result.regex, 'g');
        var replaceInNextFile = function(){
            file = filesRemaining.pop();
            console.log('replacing in :'+file);
            fs.readFile(file, 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }
                var regexed = data.replace(regex, result.replace);
                fs.writeFile(file, regexed, 'utf8', function (err) {
                    if (err) return console.log(err);
                    checkIfDone();
                });
            });
        }
        checkIfDone();
    });
}

var filesToRename;
function promptFileRename(){
    prompt.start();
    prompt.get({
        properties: {
            regex: {
                description: "regex to run on filename".yellow
            },
            flags: {
                description: "flags".yellow,
                default: "gi"
            },
            replace:{
                description:"replace with...   ".yellow
            },
            copy:{
                description:"Copy file? (y/n)".yellow,
                default: "n"
            }
        }
    }, function (err, result) {
        filesToRename = files.length;
        function checkIfDone(){
            if(filesRemaining.length == 0){
                console.log("Done".underline)
                promptYesNo("Do another rename on the same batch of files?", promptFileRename, menu)
            }else{
                handleNextFile();
            }
        }
        var file;
        var filesRemaining = files.concat([]);
        console.log(result.flags);
        var regex = new RegExp(result.regex, ""+result.flags);
        var handleNextFile = function(){
            file = filesRemaining.pop();
            var newFile = file.replace(regex, result.replace)
            //fs.rename(oldPath, newPath, callback)#
            if(result.copy == 'n'){
                console.log('renaming: '+file+" -> "+newFile);
                fs.rename(file, newFile, function(err){
                    if (err) throw err;
                    checkIfDone();
                })
            }else{
                console.log('copying: '+file+" -> "+newFile);
                fs.copy(file, newFile, function(err){
                    if (err) throw err;
                    checkIfDone();
                })
            }
        }
        checkIfDone();
    });
}

function exit(){
    console.log('kkthx bai bai'.green);
}