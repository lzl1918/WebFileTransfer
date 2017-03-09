(function () {
    "use strict";
    var debounce_delay = 250;

    var list_dirs = null;
    var list_files = null;
    var p_cnts = null;
    var input_filter = null;
    var btn_reset = null;
    var path_container = null;

    var data_directories = null;
    var data_files = null;

    var size2str = function (length) {
        if (length > 1073741824 * 0.5)
            return (length / 1073741824.0).toFixed(2) + "GB";
        if (length > 1048576 * 0.5)
            return (length / 1048576.0).toFixed(2) + "MB";
        if (length > 1024 * 0.5)
            return (length / 1024.0).toFixed(2) + "KB";
        return length + "B";
    };

    var directory_click = function (e) {
        var path = getpath(null);
        var item = e.currentTarget;
        var itemname = e.currentTarget.children[1].innerText;
        path = path + "\\" + itemname;
        query_files(path);
    };
    var file_click = function (e) {
        var path = getpath(null);
        var item = e.currentTarget;
        var itemname = e.currentTarget.children[1].innerText;
        path = path + "\\" + itemname;
        down_files(path);
    };

    var path_mouse_enter = function (e) {
        var chds = path_container.children;
        var item = e.currentTarget;
        var i = 0;
        for (i = 0; i < chds.length; i++) {
            if (chds[i] == item) break;
        }
        if (i >= chds.length) return;

        $(chds[i]).addClass("hovered");
        if (i > 0)
            $(chds[i - 1]).addClass("hovered-before");
    };
    var path_mouse_out = function (e) {
        var chds = path_container.children;
        var item = e.currentTarget;
        var i = 0;
        for (i = 0; i < chds.length; i++) {
            if (chds[i] == item) break;
        }
        if (i >= chds.length) return;

        $(chds[i]).removeClass("hovered");
        if (i > 0)
            $(chds[i - 1]).removeClass("hovered-before");
    };
    var path_click = function (e) {
        var item = e.currentTarget;
        var path = getpath(item);
        query_files(path);
    };

    var produce_path_div = function (name) {
        var div = document.createElement("div");
        var span = document.createElement("span");

        div.className = "pathitem";
        span.innerText = name;

        div.appendChild(span);
        div.addEventListener("mouseenter", path_mouse_enter, false);
        div.addEventListener("mouseleave", path_mouse_out, false);
        div.addEventListener("click", path_click, false);
        return div;
    };
    var produce_directory_div = function (directory) {
        var div = document.createElement("div");
        var img = document.createElement("img");
        var span_name = document.createElement("span");
        var span_size = document.createElement("span");

        div.className = "item";
        img.src = "images/folder.png";
        span_name.className = "itemname";
        span_name.innerText = directory.name;
        span_size.className = "itemsize";
        span_size.innerText = "0";

        div.appendChild(img);
        div.appendChild(span_name);
        div.appendChild(span_size);

        div.addEventListener("click", directory_click, false);
        return div;
    };
    var produce_file_div = function (file) {
        var div = document.createElement("div");
        var img = document.createElement("img");
        var span_name = document.createElement("span");
        var span_size = document.createElement("span");

        div.className = "item";
        //img.src = "images/file.png";
        img.src = icon_helper.get_icon(file.fileExt);
        span_name.className = "itemname";
        span_name.innerText = file.name;
        span_size.className = "itemsize";
        span_size.innerText = size2str(file.bytes);

        div.appendChild(img);
        div.appendChild(span_name);
        div.appendChild(span_size);

        div.addEventListener("click", file_click, false);
        return div;
    };
    var query_files = function (path) {
        var param = { path: path };
        $.ajax({
            url: "/api/filedata/data",
            type: "POST",
            data: JSON.stringify(param),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            success: function (data) {
                if (data) {
                    data_directories = data.directories;
                    data_files = data.files;
                    setpath(data.path);
                    clearfilter();
                }
            },
            error: function (err) {
            }
        });
    };
    var down_files = function (path) {
        var param = { path: path };
        $.fileDownload("/api/filedata/down", {
            httpMethod: "POST",
            data: param
        });
    };

    var setpath = function (path) {
        path_container.innerHTML = "";

        var pths = path.split("\\");
        for (var i = 0; i < pths.length; i++) {
            var div = produce_path_div(pths[i]);
            path_container.appendChild(div);
        }
    };
    var getpath = function (atbefore) {
        var chds = path_container.children;
        var path = "";
        var i = 0;
        var tpath;
        if (atbefore == chds[0])
            return "";

        for (i = 1; i < chds.length; i++) {
            tpath = chds[i].innerText;
            if (tpath[tpath.length - 1] == '\n' || tpath[tpath.length - 1] == '\r')
                tpath = tpath.substr(0, tpath.length - 1);
            path += tpath + "\\";
            if (chds[i] == atbefore) break;
        }
        if (path.length > 0)
            path = path.substr(0, path.length - 1);
        return path;
    };

    var makefilter = function () {
        filter_files(input_filter.value.trim());
    };
    var clearfilter = function () {
        input_filter.value = "";
        filter_files("");
    };
    var filter_files = function (filter) {
        list_dirs.innerHTML = "";
        list_files.innerHTML = "";

        // match all
        if (filter.length == 0)
            filter = ".";

        var exp = new RegExp(filter, "i");

        var items_dirs = [];
        var items_files = [];
        if (data_directories) {
            for (var i = 0; i < data_directories.length; i++) {
                if (data_directories[i].name.match(exp))
                    items_dirs.push(data_directories[i]);
            }
        }
        if (data_files) {
            for (var i = 0; i < data_files.length; i++) {
                if (data_files[i].name.match(exp))
                    items_files.push(data_files[i]);
            }
        }

        var item;
        for (var i = 0; i < items_dirs.length; i++) {
            item = produce_directory_div(items_dirs[i]);
            list_dirs.appendChild(item);
        }
        for (var i = 0; i < items_files.length; i++) {
            item = produce_file_div(items_files[i]);
            list_files.appendChild(item);
        }
        p_cnts.innerText = items_dirs.length + "个文件夹, " + items_files.length + "个文件";
    };

    var showloading = function () {

    };
    var hideloading = function () {

    };

    var load = function () {
        p_cnts = $("#p_cnts")[0];
        input_filter = $("#input_filter")[0];
        btn_reset = $("#btn_reset")[0];
        list_dirs = $("#list_dirs")[0];
        list_files = $("#list_files")[0];
        path_container = $("#path_container")[0];

        $(input_filter).keyup($.debounce(debounce_delay, makefilter));
        btn_reset.context.events.addHandler("click", clearfilter);

        query_files("");
    };

    window.addEventListener("load", load, false);
})();
