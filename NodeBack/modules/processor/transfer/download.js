'use strict';
var hstr = require('../../public/hstr');
var path = require('path');
var fs = require('fs');


var __download_file = function (dest_file_path, res) {
    var stat = fs.statSync(dest_file_path);
    if (stat.isFile()) {
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + path.basename(dest_file_path),
            'Content-Length': stat.size
        });
        var reader = fs.createReadStream(dest_file_path);
        reader.pipe(res);
    }
    else {
        res.writeHead(404);
        res.end();
    }
};

var __download_process = function (req, res) {
    if (req.method !== this.method) return false;
    if (!hstr.startswith(req.url, this.listen)) return false;

    var content_root = this.content_root;
    var reqdata = '';

    req.on('data', function (data) { reqdata += data; });
    req.on('end', function () {
        reqdata = decodeURI(reqdata);
        var parampath = reqdata.substr('path='.length);
        var dest_path = '';
        if (parampath.length > 0)
            dest_path = path.join(content_root, parampath);
        else
            dest_path = content_root;
        if (hstr.startswith(dest_path, content_root))
            __download_file(dest_path, res);
        else {
            res.writeHead(404);
            res.end();
        }
    });
    return true;
};

var download = function (config) {
    if (!(config && config.content_root && config.listen && config.method))
        throw new Error('invalid config for transfer.download');

    this.content_root = path.resolve(config.content_root);
    this.listen = config.listen;
    this.method = config.method;
};

download.prototype = {
    constructor: download,
    process: __download_process
};

module.exports = {
    create: function (config) {
        return new download(config);
    }
};