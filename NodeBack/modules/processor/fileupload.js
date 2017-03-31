var startswith = function (thisstr, str) {
    if (thisstr.length < str.length) return false;
    for (var i = 0; i < str.length; i++)
        if (thisstr[i] !== str[i])
            return false;
    return true;
};

var fileupload = function (fileroot, url) {
    this.fileroot = path.resolve(fileroot);
    this.url = url;
};
var fileupload_process = function (req, res) {
    if (req.method !== 'POST') return false;
    if (startswith(req.url, this.url) === false) return false;
};

fileupload.prototype = {
    constructor: fileupload,
    process: fileupload_process
};

module.exports = {
    fileupload: fileupload
};