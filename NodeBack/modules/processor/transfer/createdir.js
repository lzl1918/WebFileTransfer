'use strict';

var hstr = require('../../public/hstr');
var path = require('path');
var fs = require('fs');

var __verify_name = function (dirname) {
    var reg = /[\\\/\:\*\?\"\<\>\|]/;
    var match = reg.exec(dirname);
    return !match;
};

var __create_dir = function (parent, dirname, res) {
    var dirpath = path.join(parent, dirname);
    fs.exists(dirpath, function (ex) {
        if (ex) {
            res.writeHead(403);
            res.end();
        }
        else {
            fs.mkdir(dirpath, function (err) {
                if (err) {
                    res.writeHead(503);
                    res.end();
                }
                else {
                    res.writeHead(200);
                    res.end();
                }
            });
        }
    });
};

var __createdir_process = function (req, res) {
    if (req.method !== this.method) return false;
    if (!hstr.startswith(req.url, this.listen)) return false;

    var content_root = this.content_root;
    var reqdata = '';

    req.on('data', function (data) { reqdata += data; });
    req.on('end', function () {
        var param = JSON.parse(reqdata);
        var new_dir_name = param.name;
        var dest_path = '';
        if (param.path.length > 0)
            dest_path = path.join(content_root, param.path);
        else
            dest_path = content_root;

        if (hstr.startswith(dest_path, content_root) && __verify_name(new_dir_name))
            __create_dir(dest_path, new_dir_name, res);
        else {
            res.writeHead(403);
            res.end();
        }
    });

    return true;
};

var createdir = function (config) {
    if (!(config && config.content_root && config.listen && config.method))
        throw new Error('invalid config for transfer.createdir');

    this.content_root = path.resolve(config.content_root);
    this.listen = config.listen;
    this.method = config.method;
};

createdir.prototype = {
    constructor: createdir,
    process: __createdir_process
};

module.exports = {
    create: function (config) {
        return new createdir(config);
    }
};