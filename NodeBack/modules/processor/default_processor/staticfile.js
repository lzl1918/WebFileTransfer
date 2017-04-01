var path = require('path');
var mime = require('mime');
var fs = require('fs');

var staticfile = function (config) {
    if (!(config && config.wwwroot))
        throw new Error("invalid config for static files");

    this.wwwroot = path.resolve(config.wwwroot);
};

var staticfile_process = function (req, res) {
    if (req.method !== 'GET') return false;
    var filepath = path.join(this.wwwroot, req.url);
    if (fs.existsSync(filepath)) {
        stat = fs.statSync(filepath);
        if (stat.isFile()) {
            res.writeHead(200, {
                'Content-Type': mime.lookup(filepath),
                'Content-Length': stat.size
            });
            var readstream = fs.createReadStream(filepath);
            readstream.pipe(res);
            return true;
        }
        else
            return false;
        
    }
    else
        return false;
};

staticfile.prototype = {
    constructor: staticfile,
    process: staticfile_process
};

var create_static = function (config) {
    return new staticfile(config);
};

module.exports = {
    create: create_static
};