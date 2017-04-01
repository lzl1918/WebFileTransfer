var startswith = function (thisstr, str) {
    if (thisstr.length < str.length) return false;
    for (var i = 0; i < str.length; i++)
        if (thisstr[i] !== str[i])
            return false;
    return true;
};

var path = require('path');
var fs = require('fs');
var multiparty = require('multiparty');

var varify_path = function (parampath, fullpath, fileroot) {
    if (!startswith(fullpath, fileroot)) return false;
    return true;
};
var cleanfile = function (fullpath) {
    fs.unlinkSync(fullpath);
};
var cleanfiles = function (files) {
    for (var i = 0; i < files.length; i++) {
        cleanfile(files.path);
    }
};
var fileupload = function (fileroot, tmpdir, url) {
    this.fileroot = path.resolve(fileroot);
    this.tmpdir = path.resolve(tmpdir);
    this.url = url;
};

var fileupload_process = function (req, res) {
    if (req.method !== 'POST') return false;
    if (startswith(req.url, this.url) === false) return false;
    var rootpath = this.fileroot;

    var form = new multiparty.Form({
        uploadDir: this.tmpdir
    });
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.writeHeader(503);
            res.end();
            return;
        }
        if (fields && fields['filePath'] && files['files[]']) {
            var filepath = path.join(rootpath, fields['filePath'][0]);
            if (!startswith(filepath, rootpath)) {
                cleanfiles(files['files[]']);
                res.writeHeader(403);
                res.end();
                return;
            }
            var uploadfiles = files['files[]'];
            var fullpath;
            if (uploadfiles.length == 1) {
                var filename = fields['fileName'][0];
                if (!(filename && filename.length > 0)) filename = uploadfiles[0].originalFilename;
                fullpath = path.join(filepath, filename);
                fs.exists(fullpath, function (ext) {
                    if (ext) { cleanfiles(uploadfiles); res.writeHeader(200); res.end(); return; }
                    fs.renameSync(uploadfiles[0].path, fullpath);
                    res.writeHeader(200);
                    res.end();
                });
            }
            else {
                var file;
                for (var i = 0; i < uploadfiles.length; i++) {
                    file = uploadfiles[i];
                    fullpath = path.join(filepath, file.originalFilename);
                    if (fs.existsSync(fullpath)) {
                        cleanfile(file.path);
                    }
                    else {
                        fs.renameSync(file.path, fullpath);
                    }
                }
                res.writeHeader(200);
                res.end();
            }
        }
        else {
            res.writeHeader(403);
            res.end();
            return;
        }
    });
    return true;
};

fileupload.prototype = {
    constructor: fileupload,
    process: fileupload_process
};

module.exports = {
    fileupload: fileupload
};