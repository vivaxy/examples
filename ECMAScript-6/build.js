#!/usr/bin/env node
/**
 * @since 150521 19:18
 * @author vivaxy
 */
var fs = require('fs'),
    babel = require('babel-core');

fs.readFile('menu.json', 'utf-8', function (err, data) {
    JSON.parse(data).forEach(function (item) {
        var path = item.link;
        babel.transformFile(path + '/index.es6.js', {
            filename: path + '/index.es6.js'
        }, function (err, result) {
            if (err) {
                console.log('error: ' + path + '\n' + err);
            } else {
                fs.writeFile(path + '/index.js', result.code, function () {
                    console.log('done: ' + path);
                });
            }
        });
    });
});
