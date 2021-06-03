#!/usr/bin/env node

'use strict';
const {parseTemplate} = require('./helper');
const pkg = require('../package.json');
const {Command} = require('commander'); // include commander in git clone of commander repo
const qs = require('qs');
const program = new Command();
const pt = require("path");
const cwd = process.cwd();

program.version(pkg.version, '--version, -v')
    .description('This command could help you to parse the template file with the context you provided.')
    .option('-t, --template <path>', 'optional, The template file\'s pt')
    .option('-c, --context <query...>', 'optional, The context query. \ne.g. -c a=1 b=2 c=3')
    .option('-f, --config <path>', 'optional, The config\'s path. e.g. xxx/xxx.config, default using ./platevia.config.js')
    .option('-e, --encoding <path>', 'optional, The file encoding default to be `utf8`.')
    .option('-o, --output <path>', 'optional, The output file\'s pt, default using the template pt and rename \ne.g. templateFile = \'./xxx/xxx.js\' => outputFile = \'./xxx/xxx.parsed.js\'');

program.parse(process.argv);

const options = program.opts();

let {template, context, output, encoding, config = './platevia.config.js'} = options;

if (context) {
    context = (context || []).reduce((ct, query) => Object.assign(ct, qs.parse(query)), {});
}

try {
    const configs = require(pt.join(cwd, config));
    if (!template) {
        template = configs.template;
    }
    if (!context) {
        context = configs.context;
    }
    if (!output) {
        output = configs.output;
    }
    if (!encoding) {
        encoding = configs.encoding;
    }
} catch (e) {
    console.log('configs not exist.')
}

const startTime = Date.now();
parseTemplate({
    templatePath: template,
    context, outputPath: output,
    ...encoding ? {encoding} : {}
}).then((path) => {
    console.log(`Parsed success(${Date.now() - startTime}ms), output path: ${path}`)
}).catch(e => {
    console.error('Command execute failed,', e);
    console.log(' -- Using `platevia -h` show options.')
});