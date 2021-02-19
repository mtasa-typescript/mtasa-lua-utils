const fs = require('fs')
const glob = require('glob')

// const oldPath = 'old/path/file.txt';
// const newPath = 'new/path/file.txt';

const FILES_FROM = 'src/typescript/'
const FILES_TO = 'src/lua/'

let meta_file_content = ''

fs.readFile('./meta.xml', 'utf8', function (err, data) {
    if (err) {
        console.error('Error while opening meta.xml. Please check is the file exists')
        throw err;
    }

    meta_file_content = data;
    moveAllLuaFiles();
});

function checkFileInMeta(file) {
    if (meta_file_content.indexOf(file) === -1) {
        console.warn('File "' + file + '" does not exists in meta.xml')
    } else {
        console.log('File "' + file + '" exists in meta.xml, OK')
    }
}

function moveLuaFile(file) {
    if (file.indexOf(FILES_FROM) === -1) {
        console.error('Cannot move file "' + file + '". Please put all Lua files into "' + FILES_FROM + '"')
        return;
    }

    const file_destination = file.replace(FILES_FROM, FILES_TO);
    fs.rename(file, file_destination, function (err) {
        if (err) {
            console.error('Error occurred while moving "' + file + '" to "' + file_destination + '"')
            console.error(err);
            return;
        }

        checkFileInMeta(file_destination);
    })
}

function moveAllLuaFiles() {
    glob('**/*.lua',
        {ignore: ['node_modules/**/*', 'src/lua/**/*']},
        function (er, files) {
            for (const file of files) {
                moveLuaFile(file)
            }

            console.log('All Lua files was moved from "' + FILES_FROM + '" to "' + FILES_TO + '", OK')
        })
}