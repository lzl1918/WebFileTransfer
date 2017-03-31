
var defaults = ["index.html"];
var path = require('path');
var fs = require('fs');

var defaultfile = function (config) {
    this.wwwroot = path.normalize(config.wwwroot);
};

var defaultfile_process = function (req, res) {
    if (req.method !== 'GET') return false;
    if (req.url !== '/') return false;
    var defaultpath;
    var handlingpath = null;
    for (var i = 0; i < defaults.length; i++) {
        defaultpath = path.join(this.wwwroot, defaults[i]);
        if (fs.existsSync(defaultpath)) {
            handlingpath = defaultpath;
            res.writeHead(200, { 'Content-Type': "text/html" });
            var readstream = fs.createReadStream(handlingpath);
            readstream.pipe(res);
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