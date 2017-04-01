'use strict';

var startswith = function (thisstr, str) {
    if (thisstr.length < str.length) return false;
    for (var i = 0; i < str.length; i++)
        if (thisstr[i] !== str[i])
            return false;
    return true;
};

module.exports = {
    startswith: startswith
};