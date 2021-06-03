const {parsePlate} = require("../dist/platevia");
const fs = require("fs");
const pt = require("path");
var cwd = process.cwd();

function existsAsync(path) {
    return new Promise((resolve, reject) => {
        fs.exists(path, (exists => resolve(exists)))
    })
}

function writeFileAsync(...args) {
    return new Promise((resolve, reject) => {
        args.push(error => {
            if (error) {
                reject(error)
            } else {
                resolve(undefined)
            }
        });
        fs.writeFile.apply(fs, args)
    })
}

function readFileAsync(...args) {
    return new Promise((resolve, reject) => {
        args.push((error, buffer) => {
            if (error) {
                reject(error)
            } else {
                resolve(buffer)
            }
        });
        fs.readFile.apply(fs, args)
    })
}

function statAsync(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, ((error, stat) => {
            if (error) {
                reject(error)
            } else {
                resolve(stat)
            }
        }))
    })
}


module.exports = {
    async parseTemplate(
        {templatePath, context, outputPath, encoding = 'utf8'} = {}
    ) {

        if (!context) {
            context = {}
        }

        if (!templatePath) {
            return Promise.reject('Template path must be specified.')
        }

        if (!templatePath.startsWith('/')) {
            templatePath = pt.join(cwd, templatePath);
        }

        console.log(`Parsing from: ${templatePath}`);

        if (!await existsAsync(templatePath) || (await statAsync(templatePath)).isDirectory()) {
            return Promise.reject('Template file is not exist.');
        }
        if (!outputPath) {
            const pathParts = templatePath.split('/');
            const fileName = pathParts[pathParts.length - 1];
            outputPath = pt.join(templatePath, '../', fileName.replace(/\.[^.]+$/, (suffix) => {
                return '.parsed' + suffix
            }))
        } else {
            if (!outputPath.startsWith('/')) {
                outputPath = pt.join(cwd, outputPath);
            }
            const outputDir = pt.join(outputPath, '../');
            if (!await existsAsync(outputDir) || !(await statAsync(outputDir)).isDirectory()) {
                return Promise.reject(`Output dir '${outputDir}' is not exist.`);
            }
        }

        const templateStr = (await readFileAsync(templatePath)).toString(encoding);
        const str = '`' + templateStr + '`';
        await writeFileAsync(outputPath, Buffer.from(parsePlate(str).via(context)))
        return outputPath;
    }
};