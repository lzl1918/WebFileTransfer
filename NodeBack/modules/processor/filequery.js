var startswith = function (thisstr, str) {
    if (thisstr.length < str.length) return false;
    for (var i = 0; i < str.length; i++)
        if (thisstr[i] !== str[i])
            return false;
    return true;
};

var path = require('path');
var fs = require('fs');

var filequery = function (fileroot, url) {
    this.fileroot = path.resolve(fileroot);
    this.url = url;

    var rootname = path.basename(this.fileroot);
    if (rootname === '.')
        rootname = 'Root';
    this.rootname = rootname;
};

var varify_path = function (parampath, fullpath, fileroot) {
    if (!startswith(fullpath, fileroot)) return false;
    return true;
};
var enum_directory = function (rootname, fileroot, filepath, res) {
    var _directories = [];
    var _files = [];
    fs.readdir(filepath, function (err, files) {
        for (var i = 0; i < files.length; i++) {
            var stat = fs.statSync(path.join(filepath, files[i]));
            if (stat.isDirectory()) {
                _directories.push({
                    name: files[i],
                    path: path.join(filepath, files[i])
                });
            }
            else if (stat.isFile()) {
                _files.push({
                    name: files[i],
                    path: path.join(filepath, files[i]),
                    bytes: stat.size,
                    fileExt: path.extname(files[i])
                });
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        var displaypath = path.relative(fileroot, filepath);
        res.write(JSON.stringify({
            files: _files,
            directories: _directories,
            path: path.join(rootname, displaypath)
        }));
        res.end();
    });
};

var filequery_process = function (req, res) {
    if (req.method !== 'POST') return false;
    if (startswith(req.url, this.url) === false) return false;
    var reqdata = '';
    var fileroot = this.fileroot;
    var rootname = this.rootname;
    req.on('data', function (data) { reqdata += data; });
    req.on('end', function () {
        var param = JSON.parse(reqdata);
        var filepath = '';
        if (param.path.length > 0)
            filepath = path.join(fileroot, param.path);
        else
            filepath = fileroot;

        if (varify_path(param.path, filepath, fileroot)) {
            enum_directory(rootname, fileroot, filepath, res);
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{files: [], directories:[], path: ' + rootname + ' }');
        }
    });

    return true;
};

filequery.prototype = {
    constructor: filequery,
    process: filequery_process
};

module.exports = {
    filequery: filequery
};