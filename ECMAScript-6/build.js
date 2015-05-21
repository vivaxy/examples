#!/usr/bin/env node
/**
 * @since 150521 19:18
 * @author vivaxy
 */
var fs = require('fs'),
    es6tr = require('es6-transpiler');

fs.readFile('menu.json', 'utf-8', function (err, data) {
    JSON.parse(data).forEach(function (item) {
        var path = item.link;
        fs.writeFile(path + '/index.js', es6tr.run({filename: path + '/index.es6.js'}).src, function () {
            console.log(path + ' done');
        });
    });
});
