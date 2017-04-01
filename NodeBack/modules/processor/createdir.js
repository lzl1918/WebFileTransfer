var startswith = function (thisstr, str) {
    if (thisstr.length < str.length) return false;
    for (var i = 0; i < str.length; i++)
        if (thisstr[i] !== str[i])
            return false;
    return true;
};

var path = require('path');
var fs = require('fs');

var varify_path = function (parampath, fullpath, fileroot) {
    if (!startswith(fullpath, fileroot)) return false;
    return true;
};
var varify_name = function (dirname) {
    var reg = /[\\\/\:\*\?\"\<\>\|]/;
    var match = reg.exec(dirname);
    return !match;
};
var create_dir = function (parent, dirname, res) {
    var dirpath = path.join(parent, dirname);
    fs.exists(dirpath, function (ex) {
        if (ex) {
            res.writeHead(403);
            res.end();
        }
        else {
            fs.mkdir(dirpath, function (err) {
                res.writeHead(200);
                res.end();
            });
        }
    });
};

var createdir = function (fileroot, url) {
    this.fileroot = path.resolve(fileroot);
    this.url = url;
};
var createdir_process = function (req, res) {
    if (req.method !== 'POST') return false;
    if (startswith(req.url, this.url) === false) return false;

    var fileroot = this.fileroot;
    var reqdata = '';

    req.on('data', function (data) { reqdata += data; });
    req.on('end', function () {
        var param = JSON.parse(reqdata);
        var paramname = param.name;
        var parampath = param.path;
        var filepath = '';
        if (parampath.length > 0)
            filepath = path.join(fileroot, parampath);
        else
            filepath = fileroot;

        if (varify_path(parampath, filepath, fileroot) && varify_name(paramname))
            create_dir(filepath, paramname, res);
        else {
            res.writeHead(403);
            res.end();
        }
    });

    return true;
};
createdir.prototype = {
    constructor: createdir,
    process: createdir_process
};
module.exports = {
    createdir: createdir
};