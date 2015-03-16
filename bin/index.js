#!/usr/bin/env node

/**
 * Created by ts on 06/03/15.
 */
var fs = require('fs')
var walk = require('walkdir');
var path = require('path');
var prompt = require('prompt');
var type = process.argv[2];
var fileRegex,files;

console.log('file-regex in directory: ' + process.cwd());

prompt.message = 'File-Regex'.underline;



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

promptFileRegex();

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