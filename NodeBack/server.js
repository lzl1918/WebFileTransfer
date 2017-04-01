'use strict';

var config = require('./modules/configreader').read();
var pipeline = require('./modules/pipeline').create(config);
var http = require('http');
var path = require('path');
var fs = require('fs');

var filequery = require('./modules/processor/filequery');
var filedownload = require('./modules/processor/filedownload');
var fileupload = require('./modules/processor/fileupload');
var createdir = require('./modules/processor/createdir');

pipeline.use_default();
pipeline.use_static();
pipeline.add(new filequery.filequery(config.file_root, '/api/filedata/data'));
pipeline.add(new filedownload.filedownload(config.file_root, '/api/filedata/down'));

pipeline.add(new createdir.createdir(config.file_root, '/api/filedata/createdir'));

var uploadtmp = path.resolve(config.file_root);
uploadtmp = path.join(uploadtmp, "tmp");
if (!fs.existsSync(uploadtmp)) fs.mkdirSync(uploadtmp);
pipeline.add(new fileupload.fileupload(config.file_root, uploadtmp, '/api/filedata/up'));

http.createServer(function (req, res) {
    // go through the pipe line 
    if (!pipeline.traverse(req, res)) {
        res.writeHead(404);
        res.end();
    }
}).listen(config.port);
console.log('listening on port %d', config.port);
