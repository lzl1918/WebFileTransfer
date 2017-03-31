"use strict";

var icon_helper = (function () {
    var icon_map = {};
    var raw_support = ["css", "doc", "exe", "html", "iso", "json", "pdf", "png", "ppt", "txt", "xls", "xml"];
    var path_prefix = "images/fileicons/";
    var default_icon = "images/file.png";

    var gen_icon_map = function gen_icon_map() {
        var i = 0;
        for (i = 0; i < raw_support.length; i++) icon_map["." + raw_support[i]] = raw_support[i];
        icon_map[".docx"] = "doc";
        icon_map[".xlsx"] = "xls";
        icon_map[".pptx"] = "ppt";
    };
    gen_icon_map();

    var get_icon = function get_icon(ext) {
        var icon = icon_map[ext.toLowerCase()];
        if (icon) return path_prefix + icon + ".png";
        return default_icon;
    };

    return {
        get_icon: get_icon
    };
})();

