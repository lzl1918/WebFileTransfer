"use strict";

(function (window) {
    "use strict";

    var url = "/api/filedata/createdir";

    var set_attr = function set_attr(obj, prop, val) {
        obj.setAttribute("data-" + prop, val);
    };
    var remove_attr = function remove_attr(obj, prop) {
        if (obj.hasAttribute("data-" + prop)) obj.removeAttribute("data-" + prop);
    };

    var dirs = undefined;
    var illegalmatch = /[\\\/\:\*\?\"\<\>\|]/;
    var creating = false;
    var flyout_showed = function flyout_showed(sender, args) {
        var flyout = args.flyout;
        var $input = $(flyout).find(".createdir-name");
        var btn = $(flyout).find(".createdir-ok")[0];
        $input.val("");
        remove_attr($input[0], "containserror");
        btn.context.set_enabled(false);
        dirs = window.control.get_dirs();
        $input.keyup($.debounce(250, function () {
            if (!dirs) return;
            var val = $input.val();
            for (var i = 0; i < dirs.length; i++) if (val == dirs[i]) break;
            if (i >= dirs.length) {
                var match = illegalmatch.exec(val);
                if (match == null) {
                    btn.context.set_enabled(true);
                    set_attr($input[0], "containserror", false);
                } else {
                    btn.context.set_enabled(false);
                    set_attr($input[0], "containserror", true);
                }
            } else {
                btn.context.set_enabled(false);
                set_attr($input[0], "containserror", true);
            }
        }));
        btn.context.events.add("click", function (s, a) {
            var param = { name: $input.val(), path: window.control.get_path() };
            btn.context.set_enabled(false);
            creating = true;
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(param),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: true,
                success: function success() {
                    creating = false;
                    window.control.query_files(window.control.get_path());
                    sender.context.flyout.hideFlyout();
                },
                error: function error(err) {
                    if (err.status == 200) {
                        creating = false;
                        window.control.query_files(window.control.get_path());
                        sender.context.flyout.hideFlyout();
                    } else {
                        creating = false;
                        alert("create directory error");
                    }
                }
            });
        });
    };
    var flyout_hiding = function flyout_hiding(sender, args) {
        var flyout = args.flyout;
        if (creating) {
            args.prevent_hide = true;
            return;
        }
        var $input = $(flyout).find(".createdir-name");
        var btn = $(flyout).find(".createdir-ok")[0];
        btn.context.events.clear("click");
        $input.unbind("keyup");
    };

    var load = function load() {
        var btn = $("#btn_createdir")[0];
        btn.context.events.add("flyout_showed", flyout_showed, false);
        btn.context.events.add("flyout_hiding", flyout_hiding, false);
    };

    window.addEventListener("load", load, false);
})(window);

