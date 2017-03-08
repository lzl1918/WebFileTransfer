"use strict";

(function () {
    "use strict";
    var encode_click = function encode_click() {
        var source = $.trim($("#text_source").val());
        if (!source) return;

        showloading();
        var param = { source: source };
        $.ajax({
            url: 'api/encode',
            type: 'POST',
            data: JSON.stringify(param),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            success: function success(data) {
                if (data && data.code) {
                    $("#text_code").val(data.code);
                } else $("#text_code").val("本小姐的名字你也配知道？");
                hideloading();
            },
            error: function error(err) {
                $("#text_code").val("本小姐的名字你也配知道？");
                hideloading();
            }
        });
    };
    var decode_click = function decode_click() {
        var code = $.trim($("#text_code").val());
        if (!code) return;

        showloading();
        var param = { code: code };
        $.ajax({
            url: 'api/decode',
            type: 'POST',
            data: JSON.stringify(param),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            success: function success(data) {
                if (data && data.source) {
                    $("#text_source").val(data.source);
                } else $("#text_source").val("我的家族里没有这么一位！");
                hideloading();
            },
            error: function error(err) {
                $("#text_source").val("你也配姓璃莹殇？");
                hideloading();
            }
        });
    };

    var showloading = function showloading() {
        $("#btn-encode")[0].context.set_enabled(false);
        $("#btn-decode")[0].context.set_enabled(false);
    };
    var hideloading = function hideloading() {
        $("#btn-encode")[0].context.set_enabled(true);
        $("#btn-decode")[0].context.set_enabled(true);
    };

    var load = function load() {
        $("#btn-encode")[0].context.events.addHandler("click", encode_click);
        $("#btn-decode")[0].context.events.addHandler("click", decode_click);
    };

    window.addEventListener("load", load, false);
})();

