#!/usr/bin/env node

'use strict';
const {parseTemplate} = require('./helper');
const pkg = require('../package.json');
const {Command} = require('commander'); // include commander in git clone of commander repo
const qs = require('qs');
const program = new Command();

program.version(pkg.version, '--version, -v')
    .description('This command could help you to parse the template file with the context you provided.')
    .option('-t, --template <path>', 'required, The template file\'s pt')
    .option('-c, --context <query...>', 'required, The context query. \ne.g. -c a=1 b=2 c=3')
    .option('-e, --encoding <path>', 'optional, The file encoding default to be `utf8`.')
    .option('-o, --output <path>', 'optional, The output file\'s pt, default using the template pt and rename \ne.g. templateFile = \'./xxx/xxx.js\' => outputFile = \'./xxx/xxx.parsed.js\'');

program.parse(process.argv);

const options = program.opts();

const {template, context = [], output, encoding} = options;

const startTime = Date.now();
parseTemplate({
    templatePath: template,
    context: context.reduce((ct, query) => Object.assign(ct, qs.parse(query)), {}), outputPath: output,
    ...encoding ? {encoding} : {}
}).then((path) => {
    console.log(`Parsed success(${Date.now() - startTime}ms), output path: ${path}`)
}).catch(e => {
    console.error('Command execute failed,', e);
    console.log(' -- Using `platevia -h` show options.')
});