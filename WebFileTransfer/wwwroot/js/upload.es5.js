"use strict";

(function (window) {
    "use strict";
    var url = "/api/filedata/up";

    var uploading = false;
    var upload_flyout_showed = function upload_flyout_showed(sender, args) {
        sender.context.events.add("flyout_hiding", upload_flyout_hiding);
        sender.context.events.add("flyout_hide", upload_flyout_hide);

        var upload_sender = sender;

        var flyout = $(args.flyout);
        var btn_pick = flyout.find(".upload-btn-pick")[0];
        var btn_ok = flyout.find(".upload-btn-ok")[0];
        var $input_file = flyout.find(".upload-pick-input");
        var $input_filename = flyout.find(".upload-input-filename");

        var preview_img = flyout.find(".upload-pic-preivew")[0];
        var progress_real = flyout.find(".upload-progress-real")[0];
        var progress_indi = flyout.find(".upload-progress-indicator")[0];

        $input_file.val('');
        $input_filename.val('');
        progress_real.style.width = 0;
        progress_indi.innerText = "0%";
        preview_img.src = "";

        btn_ok.context.set_enabled(false);

        btn_pick.context.events.add("click", function () {
            $input_file.click();
        });
        $input_file.change(function (e) {
            var input = this;
            var files = input.files;
            var windowURL = window.URL || window.webkitURL;

            if (files.length > 0) {
                if (files.length > 1) $input_filename.val("多个文件");else $input_filename.val(files[0].name);
                btn_ok.context.set_enabled(true);

                var dataurl = windowURL.createObjectURL(this.files[0]);
                preview_img.src = dataurl;
            } else {
                $input_filename.val("");
                btn_ok.context.set_enabled(false);
                preview_img.src = "";
            }
        });
        btn_ok.context.events.add("click", function (sender, args) {
            uploading = true;
            var data = new FormData();
            for (var i = 0; i < $input_file[0].files.length; i++) data.append("files[]", $input_file[0].files[i]);
            data.append("fileName", $input_filename.val());
            data.append("filePath", window.control.get_path());
            $.ajax({
                type: "POST",
                url: url,
                processData: false,
                contentType: false,
                data: data,
                success: function success(data) {
                    uploading = false;
                    window.control.query_files(window.control.get_path());
                    upload_sender.context.flyout.hideFlyout();
                },
                error: function error(err) {
                    alert("upload error");
                    uploading = false;
                },
                xhr: function xhr() {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener("progress", function (evt) {
                            var loaded = evt.loaded;
                            var total = evt.total;
                            var per = Math.floor(100 * loaded / total);
                            progress_real.style.width = per + "%";
                            progress_indi.innerText = per + "%";
                        }, false);
                    }
                    return xhr;
                }
            });
        });
    };
    var upload_flyout_hiding = function upload_flyout_hiding(sender, args) {
        if (uploading === true) args.prevent_hide = true;
    };
    var upload_flyout_hide = function upload_flyout_hide(sender, args) {
        sender.context.events.clear("flyout_hiding");
        sender.context.events.clear("flyout_hide");

        var flyout = $(sender.context.flyout.item);
        var btn_pick = flyout.find(".upload-btn-pick")[0];
        var btn_ok = flyout.find(".upload-btn-ok")[0];
        var btn_cancel = flyout.find(".upload-btn-cancel")[0];
        var $input_file = flyout.find(".upload-pick-input");
        var $input_filename = flyout.find(".upload-input-filename");

        btn_pick.context.events.clear("click");
        $input_file.unbind("change");
        btn_ok.context.events.clear("click");
    };

    var load = function load() {
        $("#btn_upload")[0].context.events.add("flyout_showed", upload_flyout_showed);
    };
    window.addEventListener("load", load, false);
})(window);

