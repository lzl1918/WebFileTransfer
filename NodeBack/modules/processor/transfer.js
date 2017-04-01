
var list = require('./transfer/list');
var upload = require('./transfer/upload');
var createdir = require('./transfer/createdir');
var download = require('./transfer/download');

module.exports = {
    list: list,
    upload: upload,
    createdir: createdir,
    download: download
};