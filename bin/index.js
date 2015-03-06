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
    case 'undefined':
    case null:
    case false:
    case '':
    case 'help':
        help();
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

function help(){
    console.log('')
    console.log('#########  HELP  #################')
    console.log('file-regex can do batch regex operations recursively in a directory')
    console.log('')
    console.log('$ file-regex [type] [filename regex] [ [filedata regex] [replace value] ]')
    console.log('')
    console.log('[type]: replace')
    console.log('replaces in the files')
    console.log('')
    console.log('[type]: test')
    console.log('tests what files will be matched')
    console.log('')
    console.log('--- example ----')
    console.log('replace all instances of monkey with horse in txt files')
    console.log('file-regex replace \\\\.txt$ \\([M|m)onkey\\) horse')
}