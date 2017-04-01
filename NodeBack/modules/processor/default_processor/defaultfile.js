'use strict';

var path = require('path');
var fs = require('fs');

var defaultfile = function (config) {
    if (!(config && config.wwwroot && config.default_files))
        throw new Error("invalid config for default files");
    if (!(config.default_files instanceof Array))
        throw new Error("invalid config for default files");

    this.wwwroot = path.resolve(config.wwwroot);
    this.default_files = config.default_files;
};

var defaultfile_process = function (req, res) {
    if (req.method !== 'GET') return false;
    if (req.url !== '/') return false;
    var defaultpath;
    var handlingpath = null;
    for (var i = 0; i < this.default_files.length; i++) {
        defaultpath = path.join(this.wwwroot, this.default_files[i]);
        if (fs.existsSync(defaultpath)) {
            handlingpath = defaultpath;
            res.writeHead(200, { 'Content-Type': "text/html" });
            var readstream = fs.createReadStream(handlingpath);
            readstream.pipe(res);
            break;
        }
    }
    return handlingpath !== null;
};

defaultfile.prototype = {
    constructor: defaultfile,
    process: defaultfile_process
};

var create_default = function (config) {
    return new defaultfile(config);
};

module.exports = {
    create: create_default
};