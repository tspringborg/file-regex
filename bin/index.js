#!/usr/bin/env node

/**
 * Created by ts on 06/03/15.
 */
var fs = require('fs')
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
    REGEX_IN_FILES:'regex replace in files',
    REGEX_ON_FILENAMES:'regex replace on filenames'
}

var questions = {
    operation:{
        type:"list",
        message:"What do you want to do?",
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

var answers = {};
var init = function(){
    //askQuestions([questions.operation],function(){
        //if(answers.op)
    //})
    inquirer.prompt([questions.operation], function(a){
        _.extend(answers, a);
        console.log(answers);
        inquirer.prompt([questions.file_matching_regex], function(a){
            _.extend(answers, a);
            switch(answers.operation){
                case OPS.REGEX_IN_FILES:
                    break;
                case OPS.REGEX_ON_FILENAMES:
                    break;
            }
        })
    })
}

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
                description: "regex to match file names".yellow
            }
        }
    }, function (err, result) {
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
    var walker = walk(process.cwd(),function(path,stat){
        //if not dir
        if(path.match(/\.(.){2,}/gi)){
            //console.log(path+' is file');
            if(path.match(fileRegex)){
                console.log("file-match: "+path);
                foundFiles.push(path);
            }
        }else{
            //console.log(path+' is not file');
        }
    });
    walker.on("end", function () {
        files = foundFiles;
        console.log(foundFiles.length+" files match the regex");
        promptYesNo('Is your regex ok?', promptFileReplace, promptFileRegex)
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

function exit(){
    console.log('kkthx bai bai'.green);
}