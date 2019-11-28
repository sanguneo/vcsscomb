#!/usr/bin/env node

const fs = require('fs');
const csscomb = require('csscomb');

const args = process.argv.slice(2);
const targetVueFilePath = args[args.length - 1];

const configArgIndex = args.indexOf('--config');
const comb = new csscomb((configArgIndex !== -1 ) ? JSON.parse(fs.readFileSync(args[configArgIndex + 1])) : 'csscomb');

const content = fs.readFileSync(targetVueFilePath).toString();

const regExr = /(<style ?(?:scoped)?(?:lang="(.*)")? ?(?:scoped)?>)(.*)?(<\/style>)/gms;
const main = async () => {
    const regResult = regExr.exec(content);
    if (!regResult) {
        console.log('There is no <style /> in "' + targetVueFilePath + '"');
        return;
    }
    const arrayRes = regResult.slice(1);
    try {
        const combResult = await comb.processString(arrayRes[2], {syntax: (arrayRes[1] || 'css')});
        const endResult = content.replace(regExr, arrayRes[0] + combResult + arrayRes[3]);
        fs.unlinkSync(targetVueFilePath);
        fs.writeFileSync(targetVueFilePath, endResult)
        console.log('CSSComb processed for "' + targetVueFilePath + '"');
    } catch (e) {
        console.error(e);
    }

}
main();
