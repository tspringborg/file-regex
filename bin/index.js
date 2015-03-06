#!/usr/bin/env node

/**
 * Created by ts on 06/03/15.
 */
var fs = require('fs')
var walk = require('walkdir');
var path = require('path');
var type = process.argv[2];
var fileNameMatchRegex = new RegExp(process.argv[3]);
var fileDataRegex = new RegExp(process.argv[4], "g");
var fileDataReplace = process.argv[5];
console.log('file-regex in directory: ' + process.cwd());
console.log('type: ' + type);
console.log('fileNameMatchRegex: '+fileNameMatchRegex);
console.log('fileDataRegex: '+fileDataRegex);
console.log('fileDataReplace: '+fileDataReplace);
switch(type){
    case 'help':
        break;
    case 'replace':
    case 'test':
        initWalker();
}

function initWalker(){
    walk(process.cwd(),function(path,stat){
        //if not dir
        if(path.match(/\.(.){2,}/gi)){
            //console.log(path+' is file');
            var filename = path.split('/');
            filename = filename[filename.length-1];
            if(filename.match(fileNameMatchRegex)){
                if(type == 'replace'){
                    replaceInFile(path);
                }else if(type == 'test'){
                    console.log("file-match: "+path);
                }
            }
        }else{
            //console.log(path+' is not file');
        }
    });
}

function replaceInFile(file){
    console.log('replaceInFile: '+file);

    fs.readFile(file, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(fileDataRegex, fileDataReplace);
        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
            console.log('replace done: '+file);
        });
    });

}