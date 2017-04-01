'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');

var config = require('./modules/configreader').read();

var pipeline = require('./modules/pipeline').create();

// default files
pipeline.use_default({
    wwwroot: config.wwwroot,
    default_files: ["index.html", "index.htm", "index"]
});

// static files
pipeline.use_static({
    wwwroot: config.wwwroot
});

var transfer = require('./modules/processor/transfer');

// file listing
pipeline.add(transfer.list.create({
    content_root: config.content_root,
    method: 'POST',
    listen: '/api/filedata/data'
}));
// file downloading
pipeline.add(transfer.download.create({
    content_root: config.content_root,
    method: 'POST',
    listen: '/api/filedata/down'
}));
// directory creation
pipeline.add(transfer.createdir.create({
    content_root: config.content_root,
    method: 'POST',
    listen: '/api/filedata/createdir'
}));
// file uploading
pipeline.add(transfer.upload.create({
    content_root: config.content_root,
    upload_temp: config.upload_tmp,
    method: 'POST',
    listen: '/api/filedata/up'
}));

http.createServer(function (req, res) {
    // go through the pipe line 
    if (!pipeline.traverse(req, res)) {
        res.writeHead(404);
        res.end();
    }
}).listen(config.port);
console.log('listening on port %d', config.port);
