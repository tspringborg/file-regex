# file-regex
performs batch regex operations in your filesystem.

## get started

have node installed and navigate to this directory in the terminal.

$ npm install
$ npm link

now $ file-regex should be available everywhere.

## how to use
```javascript
$ file-regex
```
A prompt should start.

1. Input a regex that matches the files that should be modified. (ex. \.txt$ matches all txt files)
2. Verify that the files matched are okay or try again.
3. Input a regex that matches the text you want to replace. Not possible to set flags. Global flag is on per default.
4. Input a replace value for the matches. Reference captured groups with $1, $2, $3 etc.
5. Perform another regex on the matched files or exit.


### Roadmap
* Set flags.
* Setup as npm module and submit.
* Write tests.


