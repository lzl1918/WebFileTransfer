var startswith = function (thisstr, str) {
    if (thisstr.length < str.length) return false;
    for (var i = 0; i < str.length; i++)
        if (thisstr[i] !== str[i])
            return false;
    return true;
};

var path = require('path');
var fs = require('fs');

var filedownload = function (fileroot, url) {
    this.fileroot = path.resolve(fileroot);
    this.url = url;
};

var varify_path = function (parampath, fullpath, fileroot) {
    if (!startswith(fullpath, fileroot)) return false;
    return true;
};
var download_file = function (filepath, res) {
    var stat = fs.statSync(filepath);
    if (stat.isFile()) {
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + path.basename(filepath),
            'Content-Length': stat.size
        });
        var reader = fs.createReadStream(filepath);
        reader.pipe(res);
    }
    else {
        res.writeHead(404);
        res.end();
    }
};

var filedownload_process = function (req, res) {
    if (req.method !== 'POST') return false;
    if (startswith(req.url, this.url) === false) return false;

    var fileroot = this.fileroot;
    var reqdata = '';

    req.on('data', function (data) { reqdata += data; });
    req.on('end', function () {
        reqdata = decodeURI(reqdata);
        var parampath = reqdata.substr('path='.length);
        var filepath = '';
        if (parampath.length > 0)
            filepath = path.join(fileroot, parampath);
        else
            filepath = fileroot;
        if (varify_path(parampath, filepath, fileroot))
            download_file(filepath, res);
        else {
            res.writeHead(404);
            res.end();
        }
    });
    return true;
};

filedownload.prototype = {
    constructor: filedownload,
    process: filedownload_process
};

module.exports = {
    filedownload: filedownload
};