
var hstr = require('../../public/hstr');
var path = require('path');
var fs = require('fs');

var __enum_directory = function (rootname, content_root, dest_path, res) {
    var _directories = [];
    var _files = [];
    fs.readdir(dest_path, function (err, files) {
        for (var i = 0; i < files.length; i++) {
            var stat = fs.statSync(path.join(dest_path, files[i]));
            if (stat.isDirectory()) {
                _directories.push({
                    name: files[i],
                    path: files[i]
                });
            }
            else if (stat.isFile()) {
                _files.push({
                    name: files[i],
                    path: files[i],
                    bytes: stat.size,
                    fileExt: path.extname(files[i])
                });
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        var displaypath = path.relative(content_root, dest_path);
        res.write(JSON.stringify({
            files: _files,
            directories: _directories,
            path: path.join(rootname, displaypath)
        }));
        res.end();
    });
};

var __list_process = function (req, res) {
    if (req.method !== this.method) return false;
    if (!hstr.startswith(req.url, this.listen)) return false;

    var reqdata = '';
    var content_root = this.content_root;
    var rootname = this.rootname;
    req.on('data', function (data) { reqdata += data; });
    req.on('end', function () {
        var param = JSON.parse(reqdata);
        var dest_path = '';
        if (param.path.length > 0)
            dest_path = path.join(content_root, param.path);
        else
            dest_path = content_root;

        if (hstr.startswith(dest_path, content_root)) {
            __enum_directory(rootname, content_root, dest_path, res);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{files: [], directories:[], path: ' + rootname + ' }');
        }
    });

    return true;
};

var list = function (config) {
    if (!(config && config.content_root && config.listen && config.method))
        throw new Error('invalid config for transfer.list');

    this.content_root = path.resolve(config.content_root);
    this.listen = config.listen;
    this.method = config.method;

    var rootname = path.basename(this.content_root);
    if (rootname === '.')
        rootname = 'Root';
    this.rootname = rootname;
};

list.prototype = {
    constructor: list,
    process: __list_process
};

module.exports = {
    create: function (config) {
        return new list(config);
    }
};