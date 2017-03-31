var read = function () {
    var file = require('fs');
    var data = file.readFileSync('config.json', 'utf-8');
    return JSON.parse(data);
};


module.exports = {
    read: read
};