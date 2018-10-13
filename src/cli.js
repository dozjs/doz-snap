#!/usr/bin/env node

const program = require('commander');
const version = require('../package').version;
const Snap = require('./Snap');

program
    .version(version)
    .option('-f, --entry-file', 'Entry file')
    .option('-b, --bundle-id', 'Bundle script id', 'bundle')
    .option('-D, --doc-type-string', 'Document type','<!DOCTYPE html>')
    .option('-d, --delay-render', 'Delay render', 0)
    .option('-s, --link-selector', 'Link selector', 'a[href]')
    .option('-i, --index-file', 'Index file', 'index.html')
    .option('-o, --output-dir', 'Output directory', 'snap')
    .option('-p, --public-url', 'Public url' ,'/')
    .option('-R, --router-attribute', 'Router attribute', 'router-link')
    .option('--no-clear-dir', 'Disable clear directory before build')
    .option('--no-verbose', 'Disable verbose log')
    .parse(process.argv);

(async ()=>{
    await new Snap(program.entryFile, program);
})();