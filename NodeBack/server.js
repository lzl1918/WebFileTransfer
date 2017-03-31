'use strict';

var config = require('./modules/configreader').read();
var pipeline = require('./modules/pipeline').create(config);
var http = require('http');

pipeline.use_default();
pipeline.use_static();

http.createServer(function (req, res) {
    // go through the pipe line
    if (!pipeline.traverse(req, res)) {
        res.writeHead(404);
        res.end();
    }
}).listen(config.port);
console.log('listening on port %d', config.port);
