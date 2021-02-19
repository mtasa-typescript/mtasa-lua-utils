#!/usr/bin/env node

const fs = require('fs')
const glob = require('glob')

let meta_file_content = ''

fs.readFile('./meta.xml', 'utf8', function (err, data) {
    if (err) {
        console.error('Error while opening meta.xml. Please check is the file exists')
        throw err;
    }

    meta_file_content = data;
    checkAllLuaFiles();
});

function checkFileInMeta(file) {
    if (meta_file_content.indexOf(file) === -1) {
        console.warn('[WARN] File "' + file + '" does not exists in meta.xml')
    } else {
        console.log('[INFO] File "' + file + '" exists in meta.xml, OK')
    }
}

function checkAllLuaFiles() {
    glob('lua/**/*.lua',
        function (er, files) {
            for (const file of files) {
                checkFileInMeta(file)
            }
        })
}