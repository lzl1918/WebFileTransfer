'use strict';

var hstr = require('../../public/hstr');
var path = require('path');
var fs = require('fs');
var multiparty = require('multiparty');

var __cleanfile = function (fullpath) {
    fs.unlinkSync(fullpath);
};
var __cleanfiles = function (files) {
    for (var i = 0; i < files.length; i++) {
        __cleanfile(files.path);
    }
};

var __upload_process = function (req, res) {
    if (req.method !== this.method) return false;
    if (hstr.startswith(req.url, this.listen) === false) return false;

    var content_root = this.content_root;

    var form = new multiparty.Form({
        uploadDir: this.upload_temp
    });

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.writeHeader(503);
            res.end();
            return;
        }
        if (fields && fields['filePath'] && files['files[]']) {
            var dest_dir_path = path.join(content_root, fields['filePath'][0]);
            if (!hstr.startswith(dest_dir_path, content_root)) {
                __cleanfiles(files['files[]']);
                res.writeHeader(403);
                res.end();
                return;
            }

            var uploadfiles = files['files[]'];
            var fullpath;
            if (uploadfiles.length <= 0) {
                res.writeHeader(200);
                res.end();
            }
            else if (uploadfiles.length === 1) {
                var filename = fields['fileName'][0];
                if (!(filename && filename.length > 0))
                    filename = uploadfiles[0].originalFilename;
                fullpath = path.join(dest_dir_path, filename);
                fs.exists(fullpath, function (ext) {
                    if (ext) {
                        __cleanfile(uploadfiles[0].path);
                        res.writeHeader(200);
                        res.end();
                        return;
                    }
                    fs.renameSync(uploadfiles[0].path, fullpath);
                    res.writeHeader(200);
                    res.end();
                });
            }
            else {
                var file;
                for (var i = 0; i < uploadfiles.length; i++) {
                    file = uploadfiles[i];
                    fullpath = path.join(dest_dir_path, file.originalFilename);
                    if (fs.existsSync(fullpath)) {
                        __cleanfile(file.path);
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

var upload = function (config) {
    if (!(config && config.content_root && config.upload_temp && config.listen && config.method))
        throw new Error('invalid config for transfer.upload');

    this.content_root = path.resolve(config.content_root);
    this.upload_temp = path.resolve(config.upload_temp);
    this.listen = config.listen;
    this.method = config.method;
};

upload.prototype = {
    constructor: upload,
    process: __upload_process
};

module.exports = {
    create: function (config) {
        return new upload(config);
    }
};