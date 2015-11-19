/**
 * @since 2015-11-19 16:26
 * @author vivaxy
 */
'use strict';
const fs = require('fs');
const path = require('path');

const koa = require('koa');
const mime = require('mime');

const app = koa();

//app.on('error', function (err, context) {
//     log error
//});
const INDEX_PAGE = 'index.html';

app.use(function* (next) {
    let requestPath = this.request.path;
    console.log(requestPath);
    var fillRequestPath = path.join(__dirname, requestPath);
    yield function (done) {
        fs.readFile(fillRequestPath, (err, fileContent) => {
            if (err) {
                if (err.code === 'EISDIR') {
                    // request a folder
                    // read files
                    fs.readdir(fillRequestPath, (e, files) => {
                        if (e) {
                            done();
                        } else {
                            // redirect if index.html found
                            if (~files.indexOf(INDEX_PAGE)) {
                                this.status = 302;
                                this.redirect(path.join(requestPath, INDEX_PAGE));
                                this.body = `Redirecting to ${INDEX_PAGE}`;
                                done();
                                //_this._redirect(res, join(pathname, 'index.html'));
                            } else {
                                //list folder
                            }
                        }
                    });
                } else {
                    done();
                }
            } else {
                this.body = fileContent;
                this.type = mime.lookup(fillRequestPath);
                done();
            }
        });
    };
});

app.listen(3001);
