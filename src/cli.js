#!/usr/bin/env node

const program = require('commander');
const version = require('../package').version;
const Snap = require('./Snap');

program
    .version(version)
    .option('-f, --entry-file <fileName>', 'Entry file')
    .option('-b, --bundle-id [value]', 'Bundle script id')
    .option('-D, --doc-type-string [value]', 'Document type')
    .option('-d, --delay-render [value]', 'Delay render')
    .option('-s, --link-selector [value]', 'Link selector')
    .option('-i, --index-file [value]', 'Index file')
    .option('-o, --output-dir [value]', 'Output directory')
    .option('-p, --public-url [value]', 'Public url')
    .option('-R, --router-attribute [value]', 'Router attribute')
    .option('--no-clear-dir', 'Disable clear directory before build')
    .option('--no-verbose', 'Disable verbose log')
    .parse(process.argv);

(async ()=>{
    //console.log(program);
    const snap = new Snap(program.entryFile, program);
    await snap.exec();
})();