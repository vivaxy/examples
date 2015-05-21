#!/usr/bin/env node
/**
 * @since 150521 19:18
 * @author vivaxy
 */
var fs = require('fs'),
    es6tr = require('es6-transpiler');

fs.readFile('menu.json', 'utf-8', function (err, data) {
    JSON.parse(data).forEach(function (item) {
        var path = item.link,
            result = es6tr.run({filename: path + '/index.es6.js'});
        if (result.errors.length === 0) {
            fs.writeFile(path + '/index.js', result.src, function () {
                console.log('done: ' + path);
            });
        } else {
            console.log('error: ' + path + '\n' + result.errors);
        }
    });
});
