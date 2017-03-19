"use strict";

(function () {
    "use strict";

    var dataset_helper = {
        set: function set(obj, property, val) {
            if (obj != undefined) {
                if (obj.dataset == undefined) {
                    obj.setAttribute("data-" + property, val);
                } else {
                    obj.dataset[property] = val;
                }
            }
        },
        read: function read(obj, property) {
            if (obj == undefined) return undefined;
            if (obj.dataset == undefined) return obj.getAttribute("data-" + property);else return obj.dataset[property];
        },
        clear: function clear(obj, property) {
            if (obj == undefined) return;
            if (obj.hasAttribute("data-" + property)) obj.removeAttribute("data-" + property);
        }
    };

    function handler_base() {
        this.handlers = {};
    }

    handler_base.prototype = {
        constructor: handler_base,
        addHandler: function addHandler(type, handler) {
            if (typeof this.handlers[type] == 'undefined') {
                this.handlers[type] = new Array();
            }
            this.handlers[type].push(handler);
        },
        removeHandler: function removeHandler(type, handler) {
            if (this.handlers[type] instanceof Array) {
                var handlers = this.handlers[type];
                for (var i = 0, len = handlers.length; i < len; i++) {
                    if (handler[i] == handler) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            }
        },
        clearHandler: function clearHandler(type) {
            if (this.handlers[type] instanceof Array) {
                this.handlers[type] = undefined;
            }
        },
        trigger: function trigger(event, sender) {
            if (this.handlers[event] instanceof Array) {
                var handlers = this.handlers[event];
                for (var i = 0, len = handlers.length; i < len; i++) {
                    handlers[i](sender);
                }
            }
        }
    };

    var getStyle = function getStyle(dom, attr) {
        return dom.currentStyle ? dom.currentStyle[attr] : getComputedStyle(dom, false)[attr];
    };

    var flyout_curr = undefined;
    var flyout_pos_curr = undefined;
    //#region Flyout
    var windowresizing = function windowresizing() {
        $.throttle(10, function () {
            var context = flyout_curr;
            if (context == undefined) return;
            var base = $("div[data-control='flyoutbase']")[0];
            var top = $(context.parent).offset().top + context.parent.offsetHeight + 5;
            if (flyout_pos_curr == "top") {
                top = $(context.parent).offset().top - base.offsetHeight - 5;
            }
            var left = $(context.parent).offset().left;
            var itemwidth = context.item.offsetWidth + parseInt(getStyle(base, "paddingLeft"), 10) + parseInt(getStyle(base, "paddingRight"), 10);
            if (left + itemwidth + 10 > $(window).width()) left = $(window).width() - 10 - itemwidth;
            base.style.top = top + "px";
            base.style.left = left + "px";
        })();
    };
    var flyout_cover_click = function flyout_cover_click() {
        flyout_hide();
    };
    var flyout_hide = function flyout_hide() {
        window.removeEventListener("resize", windowresizing, false);
        $("div[data-control='flyoutlayer']").removeClass("flyoutshow");
        if (flyout_curr == undefined) return;
        if (flyout_curr.parent.context != undefined && flyout_curr.parent.context.events != undefined) flyout_curr.parent.context.events.trigger("flyoutHide", {
            context: flyout_curr,
            flyout: $("div[data-control='flyoutbase']")[0].children[0]
        });
        flyout_curr = undefined;
        flyout_pos_curr = undefined;
    };
    var flyout_show = function flyout_show() {
        var context = this;
        var position = "bottom";
        var _p = dataset_helper.read(context.item, "place");
        if (_p) position = _p;
        flyout_curr = context;
        flyout_pos_curr = position;
        $("div[data-control='flyoutlayer']").addClass("flyoutshow");
        var base = $("div[data-control='flyoutbase']")[0];
        base.innerHTML = "";
        base.appendChild(context.item);
        var top = $(context.parent).offset().top + context.parent.offsetHeight + 5;
        if (position == "top") {
            top = $(context.parent).offset().top - base.offsetHeight - 5;
        }
        var left = $(context.parent).offset().left;
        var itemwidth = context.item.offsetWidth + parseInt(getStyle(base, "paddingLeft"), 10) + parseInt(getStyle(base, "paddingRight"), 10);
        if (left + itemwidth + 10 > $(window).width()) left = $(window).width() - 10 - itemwidth;
        base.style.top = top + "px";
        base.style.left = left + "px";
        if (context.parent.context != undefined && context.parent.context.events != undefined) context.parent.context.events.trigger("flyoutShow", {
            context: context,
            flyout: base.children[0]
        });
        window.addEventListener("resize", windowresizing, false);
    };
    var flyout_init = function flyout_init(obj, flyout) {
        var item = flyout.cloneNode(true);
        button_init(item);
        checkbox_init(item);
        listbox_init(item);
        datepicker_init(item);
        select_init(item);

        var context = {
            parent: obj,
            item: item,
            showFlyout: flyout_show,
            hideFlyout: flyout_hide
        };
        obj.context.flyout = context;
    };
    var flyout_global_init = function flyout_global_init() {
        var layer = document.createElement("div");
        dataset_helper.set(layer, "control", "flyoutlayer");
        var cover = document.createElement("div");
        cover.className = "cover";
        $(cover).click(flyout_cover_click);
        var base = document.createElement("div");
        dataset_helper.set(base, "control", "flyoutbase");
        layer.appendChild(cover);
        layer.appendChild(base);
        document.body.appendChild(layer);
    };
    //#endregion

    //#region Button
    var button_set_enabled = function button_set_enabled(isenable) {
        var context = this;
        var button = context.self;
        dataset_helper.set(button, "enabled", isenable);
    };
    var button_click = function button_click() {
        var button = this;
        if (dataset_helper.read(button, "enabled") == false || dataset_helper.read(button, "enabled") == "false") return;
        if (button.context.flyout != undefined) button.context.flyout.showFlyout();
        button.context.events.trigger("click", button);
    };
    var button_init = function button_init(parent) {
        $(parent).find("div[data-control='button']").each(function () {
            var button = this;
            if (button.hasAttribute("tabindex") == false) button.setAttribute("tabindex", -1);
            button.context = {
                self: button,
                events: new handler_base(),
                set_enabled: button_set_enabled
            };
            $(button).click(button_click);
            var span = document.createElement("span");
            span.innerText = dataset_helper.read(button, "text");
            var flyouts = $(button).children("div[data-control='flyout']");
            if (flyouts.length > 0) flyout_init(button, flyouts[0]);

            button.innerHTML = "";
            button.appendChild(span);
        });
    };

    //#endregion

    //#region ListBox
    var listbox_set_selected = function listbox_set_selected(i) {
        var box = this.self;
        var selected = box.context.selectedItem();
        if (selected != undefined) $(selected).removeClass("selected");
        if (i == -1) dataset_helper.set(box, "selectedindex", -1);else if (i < 0 || i >= box.children[0].children.length) return;

        dataset_helper.set(box, "selectedindex", i);
        $(box.children[0].children[i]).addClass("selected");
        if ($(box).hasClass("expand") == false) box.children[0].style.top = "-" + box.children[0].children[i].offsetTop + "px";
    };
    var listbox_span_click = function listbox_span_click(e) {
        var span = e.currentTarget;
        var listbox_div = span.parentElement;
        var listbox = listbox_div.parentElement;
        var index = 0;
        for (var i = 0; i < listbox_div.children.length; i++) {
            if (span == listbox_div.children[i]) {
                index = i;
                break;
            }
        }
        var lindex = dataset_helper.read(listbox, "selectedindex");
        if (lindex != undefined) lindex = parseInt(lindex, 10);else lindex = -1;
        if (lindex >= 0) $(listbox_div.children[lindex]).removeClass("selected");
        dataset_helper.set(listbox, "selectedindex", index);
        $(listbox_div.children[index]).addClass("selected");
        listbox.blur();
    };
    var listbox_collp = function listbox_collp(e) {
        var b = e.currentTarget;
        var index = parseInt(dataset_helper.read(b, "selectedindex"));
        $(b).removeClass("expand");
        if (index >= 0) b.children[0].style.top = "-" + b.children[0].children[index].offsetTop + "px";else b.children[0].style.top = "2.1em";
        b.style.height = "2.1em";
        var spans = $($(b).children()[0]).children();
        spans.unbind("click");
    };
    var listbox_expand = function listbox_expand() {
        var box = this;
        box.children[0].style.top = 0;
        $(box).addClass("expand");
        box.style.height = box.children[0].offsetHeight + "px";
        var spans = $($(box).children()[0]).children();
        spans.click(listbox_span_click);
    };
    var listbox_cover_click = function listbox_cover_click() {
        var cover = this;
        var box = cover.parentElement;
        $(box).focus();
    };
    var listbox_selectedIndex = function listbox_selectedIndex() {
        var box = this.self;
        return dataset_helper.read(box, "selectedindex");
    };
    var listbox_selectedItem = function listbox_selectedItem() {
        var box = this.self;
        var selected = parseInt(this.selectedIndex());
        return box.children[0].children[selected];
    };
    var listbox_init = function listbox_init(parent) {
        $(parent).find("div[data-control='listbox']").each(function () {
            var box = this;
            if (box.hasAttribute("tabindex") == false) box.setAttribute("tabindex", -1);

            var childs = box.children;
            var div = document.createElement("div");

            var record = dataset_helper.read(box, "selecteditem");
            var findrecord = undefined;
            var i = 0;
            while (box.children.length > 0) {
                if (childs[0].innerText == record) findrecord = i;
                div.appendChild(childs[0].cloneNode(true));
                box.removeChild(childs[0]);
                i++;
            }
            dataset_helper.clear(box, "selecteditem");

            div.className = "itemholder";
            box.appendChild(div);

            if (dataset_helper.read(box, "selectedindex") == undefined) {
                if (record != undefined && findrecord != undefined) dataset_helper.set(box, "selectedindex", findrecord);else dataset_helper.set(box, "selectedindex", -1);
            }

            var index = parseInt(dataset_helper.read(box, "selectedindex"));
            if (index >= 0 && index < div.children.length) {
                div.style.top = "-" + div.children[index].offsetTop + "px";
                $(div.children[index]).addClass("selected");
            } else {
                dataset_helper.set(box, "selectedindex", -1);
                div.style.top = "2.1em";
            }

            div = document.createElement("div");
            div.className = "cover";
            $(div).click(listbox_cover_click);
            box.appendChild(div);

            box.context = {
                self: box,
                selectedItem: listbox_selectedItem,
                selectedIndex: listbox_selectedIndex,
                set_selected: listbox_set_selected
            };

            $(box).focus(listbox_expand);
            $(box).blur(listbox_collp);
        });
    };
    //#endregion

    //#region Select
    var select_set_selected = function select_set_selected(i) {
        var select = this.self;
        var selected = select.context.selectedItem();
        if (selected != undefined) $(selected).removeClass("selected");
        if (i == -1) dataset_helper.set(select, "selectedindex", -1);else if (i < 0 || i >= select.children[0].children[0].children.length) return;

        dataset_helper.set(select, "selectedindex", i);
        $(select.children[0].children[0].children[i]).addClass("selected");
        if ($(select).hasClass("expand")) select.children[0].scrollTop = select.children[0].children[0].children[i].offsetTop;else select.children[0].children[0].style.top = "-" + select.children[0].children[0].children[i].offsetTop + "px";
    };

    var select_selectedItem = function select_selectedItem() {
        var select = this.self;
        var selected = parseInt(this.selectedIndex());
        if (selected == -1) return undefined;
        return select.children[0].children[0].children[selected];
    };
    var select_span_click = function select_span_click(e) {
        var span = e.currentTarget;
        var select_div = span.parentElement.parentElement;
        var select = select_div.parentElement;
        var index = 0;
        for (var i = 0; i < select_div.children[0].children.length; i++) {
            if (span == select_div.children[0].children[i]) {
                index = i;
                break;
            }
        }
        var lindex = dataset_helper.read(select, "selectedindex");
        if (lindex != undefined) lindex = parseInt(lindex, 10);else lindex = -1;
        if (lindex >= 0) $(select_div.children[0].children[lindex]).removeClass("selected");

        dataset_helper.set(select, "selectedindex", index);
        $(select_div.children[0].children[index]).addClass("selected");
        select.blur();
        if (index != lindex) select.context.events.trigger("changed", select);
    };
    var select_focus = function select_focus() {
        var select = this;
        select.children[0].children[0].style.top = "0";
        var height = select.children[0].children[0].offsetHeight;
        if (height > 200) height = 200;
        select.children[0].style.height = height + "px";
        var spans = $(select.children[0].children[0]).children();
        spans.click(select_span_click);
        var index = parseInt(dataset_helper.read(select, "selectedindex"));
        if (index < 0 || isNaN(index)) index = 0;
        if (index > spans.length - 4) index = spans.length - 1;else index = index - 2;
        if (index < 0) index = 0;
        $(select).addClass("expand");
        $(select).addClass("expandimmeditly");
        setTimeout(function () {
            select.children[0].scrollTop = select.children[0].children[0].children[index].offsetTop;
        }, 200);
    };
    var select_collpase = function select_collpase() {
        var select = this;
        var index = parseInt(dataset_helper.read(select, "selectedindex"));
        select.children[0].scrollTop = 0;
        if (index >= 0) select.children[0].children[0].style.top = "-" + select.children[0].children[0].children[index].offsetTop + "px";else select.children[0].children[0].style.top = "0";
        select.children[0].style.height = select.offsetHeight + "px";

        var spans = $(select.children[0].children[0]).children();
        spans.unbind("click");
        $(select).removeClass("expandimmeditly");
        setTimeout(function () {
            $(select).removeClass("expand");
        }, 200);
    };
    var select_init = function select_init(parent) {
        $(parent).find("div[data-control='select']").each(function () {
            var select = this;
            if (select.hasAttribute("tabindex") == false) select.setAttribute("tabindex", -1);

            var childs = select.children;
            var div = document.createElement("div");
            var cdiv = document.createElement("div");
            var record = dataset_helper.read(select, "selecteditem");
            var findrecord = undefined;

            if (dataset_helper.read(select, "selectedindex") == undefined) {
                if (record != undefined && findrecord != undefined) dataset_helper.set(select, "selectedindex", findrecord);else dataset_helper.set(select, "selectedindex", -1);
            }
            var index = parseInt(dataset_helper.read(select, "selectedindex"));

            var i = 0;
            while (select.children.length > 0) {
                if (childs[0].innerText == record) findrecord = i;
                cdiv.appendChild(childs[0].cloneNode(true));
                select.removeChild(childs[0]);
                i++;
            }
            dataset_helper.clear(select, "selecteditem");
            div.appendChild(cdiv);
            div.className = "itemholder";
            select.appendChild(div);
            div.style.height = select.offsetHeight + "px";

            select.children[0].scrollTop = 0;
            if (index >= 0 && index < cdiv.children.length) {
                select.children[0].children[0].style.top = "-" + select.children[0].children[0].children[index].offsetTop + "px";
                $(select.children[0].children[0].children[index]).addClass("selected");
            } else {
                dataset_helper.set(select, "selectedindex", -1);
                select.children[0].children[0].style.top = "0";
            }

            div = document.createElement("div");
            div.className = "cover";
            select.appendChild(div);

            select.context = {
                self: select,
                selectedItem: select_selectedItem,
                selectedIndex: listbox_selectedIndex,
                set_selected: select_set_selected,
                events: new handler_base()
            };

            $(select).focus(select_focus);
            $(select).blur(select_collpase);
        });
    };
    //#endregion

    //#region Checkbox
    var checkbox_getchecked = function checkbox_getchecked() {
        var context = this;
        var checkbox = context.self;
        var ch = dataset_helper.read(checkbox, "checked");
        if (ch == undefined) return false;else return true;
    };
    var checkbox_setchecked = function checkbox_setchecked(checked) {
        var context = this;
        var checkbox = context.self;
        var innerbox = checkbox.children[0].children[0];
        if (checked == false) {
            innerbox.checked = false;
            dataset_helper.set(checkbox, "checked", false);
        } else {
            innerbox.checked = true;
            dataset_helper.set(checkbox, "checked", true);
        }
    };
    var checkbox_click = function checkbox_click(e) {
        var box = e.currentTarget;
        var checkbox = box.children[0].children[0];
        if (checkbox.checked) {
            checkbox.checked = false;
            dataset_helper.set(box, "checked", false);
        } else {
            checkbox.checked = true;
            dataset_helper.set(box, "checked", true);
        }
    };
    var checkbox_init = function checkbox_init(parent) {
        var holder;
        var msg;
        var msgspan;
        var span;
        var checkbox;
        $(parent).find("div[data-control='checkbox']").each(function () {
            var div = this;
            if (div.hasAttribute("tabindex") == false) div.setAttribute("tabindex", -1);
            div.innerHTML = "";
            holder = document.createElement("div");
            msg = document.createElement("div");
            msgspan = document.createElement("span");
            msgspan.innerText = dataset_helper.read(div, "message");
            span = document.createElement("span");
            checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            holder.appendChild(checkbox);
            holder.appendChild(span);
            holder.className = "holder";
            msg.className = "message";
            msg.appendChild(msgspan);
            div.appendChild(holder);
            div.appendChild(msg);
            div.addEventListener("click", checkbox_click, false);
            if (dataset_helper.read(div, "checked") != undefined && (dataset_helper.read(div, "checked") == true || dataset_helper.read(div, "checked") == "true")) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
                dataset_helper.set(div, "checked", false);
            }
            div.context = {
                setChecked: checkbox_setchecked,
                self: div,
                events: new handler_base(),
                checked: checkbox_getchecked
            };
        });
    };
    //#endregion

    //#region DatePicker
    var datepicker_init = function datepicker_init(parent) {
        $(parent).find("div[data-control='datepicker']").each(function () {
            var picker = this;
            if (picker.hasAttribute("tabindex") == false) picker.setAttribute("tabindex", -1);
            picker.innerHTML = "";
            $(picker).focus(datepicker_focus);
            picker.context = {
                setDate: datepicker_setdate,
                self: picker,
                events: new handler_base()
            };

            var mindate = dataset_helper.read(picker, "mindate");
            var maxdate = dataset_helper.read(picker, "maxdate");
            var dateval = dataset_helper.read(picker, "datevalue");
            var date = new Date();
            if (mindate == null || mindate == undefined) mindate = "1990/01/01";
            if (maxdate == null || maxdate == undefined) maxdate = "2100/12/31";
            if (dateval == null || dateval == undefined) dateval = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();

            var minresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(mindate);
            var maxresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(maxdate);
            var valresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(dateval);
            var minyear = 1990,
                minmonth = 1,
                minday = 1;
            var maxyear = 2100,
                maxmonth = 12,
                maxday = 31;
            var valyear = date.getFullYear(),
                valmonth = date.getMonth() + 1,
                valday = date.getDate();

            if (minresult != null) {
                minyear = parseInt(minresult["1"], 10);
                minmonth = parseInt(minresult["2"], 10);
                minday = parseInt(minresult["5"], 10);
                var daycheck = new Date(minyear, minmonth - 1, minday);
                minyear = daycheck.getFullYear();
                minmonth = daycheck.getMonth() + 1;
                minday = daycheck.getDate();
            }
            if (maxresult != null) {
                maxyear = parseInt(maxresult["1"], 10);
                maxmonth = parseInt(maxresult["2"], 10);
                maxday = parseInt(maxresult["5"], 10);
                var daycheck = new Date(maxyear, maxmonth - 1, maxday);
                maxyear = daycheck.getFullYear();
                maxmonth = daycheck.getMonth() + 1;
                maxday = daycheck.getDate();
            }
            if (valresult != null) {
                valyear = parseInt(valresult["1"], 10);
                valmonth = parseInt(valresult["2"], 10);
                valday = parseInt(valresult["5"], 10);
                var daycheck = new Date(valyear, valmonth - 1, valday);
                valyear = daycheck.getFullYear();
                valmonth = daycheck.getMonth() + 1;
                valday = daycheck.getDate();
            }
            mindate = new Date(minyear, minmonth - 1, minday);
            maxdate = new Date(maxyear, maxmonth - 1, maxday);
            dateval = new Date(valyear, valmonth - 1, valday);
            if (mindate.getTime() > dateval.getTime()) dateval.setTime(mindate.getTime());
            if (maxdate.getTime() < dateval.getTime()) dateval.setTime(maxdate.getTime());

            var div;
            div = document.createElement("div");

            div.className = "input-date-value";
            var p;
            p = document.createElement("p");
            p.innerText = dateval.getFullYear() + " 年 " + (dateval.getMonth() + 1) + " 月 " + dateval.getDate() + " 日";
            div.appendChild(p);
            picker.appendChild(div);

            div = document.createElement("div");
            div.className = "input-date-picker-container";
            var cdiv;
            cdiv = document.createElement("div");
            cdiv.className = "input-date-container-itemscrollview";
            $(cdiv).addClass("input-date-container-year");
            for (var i = mindate.getFullYear(); i <= maxdate.getFullYear(); i++) {
                var p = document.createElement("p");
                if (i == dateval.getFullYear()) {
                    p.className = "selected";
                }
                p.innerText = i.toString();
                cdiv.appendChild(p);
                $(p).click(datepicker_year_clicked);
            }
            div.appendChild(cdiv);
            cdiv = document.createElement("div");
            cdiv.className = "input-date-container-itemscrollview";
            $(cdiv).addClass("input-date-container-month");
            var monthbegin = 1;
            var monthend = 12;
            if (mindate.getFullYear() == dateval.getFullYear()) monthbegin = mindate.getMonth() + 1;
            if (maxdate.getFullYear() == dateval.getFullYear()) monthend = maxdate.getMonth() + 1;
            for (var i = monthbegin; i <= monthend; i++) {
                var p = document.createElement("p");
                if (i == dateval.getMonth() + 1) {
                    p.className = "selected";
                }
                p.innerText = i.toString();
                $(p).click(datepicker_month_clicked);
                cdiv.appendChild(p);
            }
            div.appendChild(cdiv);
            cdiv = document.createElement("div");
            cdiv.className = "input-date-container-itemscrollview";
            $(cdiv).addClass("input-date-container-date");
            var daybegin = 1;
            var dayend = new Date(dateval.getFullYear(), dateval.getMonth() + 1, 0).getDate();
            if (mindate.getFullYear() == dateval.getFullYear() && mindate.getMonth() == dateval.getMonth()) daybegin = mindate.getDate();
            if (maxdate.getFullYear() == dateval.getFullYear() && maxdate.getMonth() == dateval.getMonth()) dayend = maxdate.getDate();
            for (var i = daybegin; i <= dayend; i++) {
                var p = document.createElement("p");
                if (i == dateval.getDate()) {
                    p.className = "selected";
                }
                p.innerText = i.toString();
                $(p).click(datepicker_day_clicked);
                cdiv.appendChild(p);
            }
            div.appendChild(cdiv);
            picker.appendChild(div);
            div = document.createElement("div");
            div.className = "cover";
            $(div).click(datepicker_cover_click);
            picker.appendChild(div);

            dataset_helper.set(picker, "datevalue", dateval.getFullYear() + "/" + (dateval.getMonth() + 1) + "/" + dateval.getDate());
            dataset_helper.set(picker, "mindate", mindate.getFullYear() + "/" + (mindate.getMonth() + 1) + "/" + mindate.getDate());
            dataset_helper.set(picker, "maxdate", maxdate.getFullYear() + "/" + (maxdate.getMonth() + 1) + "/" + maxdate.getDate());
            picker.context.events.trigger("change", picker);
        });
    };
    var datepicker_year_clicked = function datepicker_year_clicked() {
        var yearp = this;
        if (yearp.className == "selected") return;
        var container = yearp.parentElement.parentElement;
        var datepicker = yearp.parentElement.parentElement.parentElement;
        var mindate = dataset_helper.read(datepicker, "mindate");
        var maxdate = dataset_helper.read(datepicker, "maxdate");
        var dateval = dataset_helper.read(datepicker, "datevalue");
        var minresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(mindate);
        var maxresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(maxdate);
        var valresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(dateval);
        var minyear = parseInt(minresult["1"], 10),
            minmonth = parseInt(minresult["2"], 10),
            minday = parseInt(minresult["5"], 10);
        var maxyear = parseInt(maxresult["1"], 10),
            maxmonth = parseInt(maxresult["2"], 10),
            maxday = parseInt(maxresult["5"], 10);
        var valyear = parseInt(valresult["1"], 10),
            valmonth = parseInt(valresult["2"], 10),
            valday = parseInt(valresult["5"], 10);
        var yearct = container.children[0];
        var monthct = container.children[1];
        var datect = container.children[2];
        for (var i = 0; i < yearct.children.length; i++) {
            if (yearct.children[i].className == "selected") yearct.children[i].className = "";
        }
        yearp.className = "selected";
        var newyear = parseInt(yearp.innerText, 10);
        monthct.innerHTML = "";
        datect.innerHTML = "";
        var monthbegin = 1,
            monthend = 12;
        if (newyear == minyear) monthbegin = minmonth;
        if (newyear == maxyear) monthend = maxmonth;
        for (var i = monthbegin; i <= monthend; i++) {
            var p = document.createElement("p");
            if (i == monthbegin) {
                p.className = "selected";
            }
            p.innerText = i.toString();
            $(p).click(datepicker_month_clicked);
            monthct.appendChild(p);
        }
        monthct.scrollTop = 0;
        var daybegin = 1,
            dayend = new Date(newyear, monthbegin, 0).getDate();
        if (newyear == minyear && minmonth == monthbegin) daybegin = minday;
        if (newyear == maxyear && monthbegin == maxmonth) dayend = maxday;
        datect.innerHTML = "";
        for (var i = daybegin; i <= dayend; i++) {
            var p = document.createElement("p");
            if (i == daybegin) {
                p.className = "selected";
            }
            p.innerText = i.toString();
            $(p).click(datepicker_day_clicked);
            datect.appendChild(p);
        }
        dataset_helper.set(datepicker, "datevalue", newyear + "/" + monthbegin + "/" + daybegin);
        datepicker.children[0].children[0].innerText = newyear + " 年 " + monthbegin + " 月 " + daybegin + " 日";
        datepicker.context.events.trigger("change", datepicker);
    };
    var datepicker_month_clicked = function datepicker_month_clicked() {
        var monthp = this;
        if (monthp.className == "selected") return;
        var container = monthp.parentElement.parentElement;
        var datepicker = monthp.parentElement.parentElement.parentElement;
        var mindate = dataset_helper.read(datepicker, "mindate");
        var maxdate = dataset_helper.read(datepicker, "maxdate");
        var dateval = dataset_helper.read(datepicker, "datevalue");
        var minresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(mindate);
        var maxresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(maxdate);
        var valresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(dateval);
        var minyear = parseInt(minresult["1"], 10),
            minmonth = parseInt(minresult["2"], 10),
            minday = parseInt(minresult["5"], 10);
        var maxyear = parseInt(maxresult["1"], 10),
            maxmonth = parseInt(maxresult["2"], 10),
            maxday = parseInt(maxresult["5"], 10);
        var valyear = parseInt(valresult["1"], 10),
            valmonth = parseInt(valresult["2"], 10),
            valday = parseInt(valresult["5"], 10);
        var monthct = container.children[1];
        var datect = container.children[2];
        for (var i = 0; i < monthct.children.length; i++) {
            if (monthct.children[i].className == "selected") monthct.children[i].className = "";
        }
        monthp.className = "selected";
        var newmonth = parseInt(monthp.innerText, 10);
        var daybegin = 1,
            dayend = new Date(valyear, newmonth, 0).getDate();
        if (valyear == minyear && minmonth == newmonth) daybegin = minday;
        if (valyear == maxyear && newmonth == maxmonth) dayend = maxday;
        datect.innerHTML = "";
        for (var i = daybegin; i <= dayend; i++) {
            var p = document.createElement("p");
            if (i == daybegin) {
                p.className = "selected";
            }
            p.innerText = i.toString();
            $(p).click(datepicker_day_clicked);
            datect.appendChild(p);
        }
        dataset_helper.set(datepicker, "datevalue", valyear + "/" + newmonth + "/" + daybegin);
        datect.scrollTop = 0;
        datepicker.children[0].children[0].innerText = valyear + " 年 " + newmonth + " 月 " + daybegin + " 日";
        datepicker.context.events.trigger("change", datepicker);
    };
    var datepicker_day_clicked = function datepicker_day_clicked() {
        var datep = this;
        if (datep.className == "selected") return;
        var container = datep.parentElement.parentElement;
        var datepicker = datep.parentElement.parentElement.parentElement;
        var dateval = dataset_helper.read(datepicker, "datevalue");
        var valresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(dateval);
        var valyear = parseInt(valresult["1"], 10),
            valmonth = parseInt(valresult["2"], 10),
            valday = parseInt(valresult["5"], 10);
        var datect = container.children[2];
        for (var i = 0; i < datect.children.length; i++) {
            if (datect.children[i].className == "selected") datect.children[i].className = "";
        }
        datep.className = "selected";
        dataset_helper.set(datepicker, "datevalue", valyear + "/" + valmonth + "/" + datep.innerText);
        datepicker.children[0].children[0].innerText = valyear + " 年 " + valmonth + " 月 " + datep.innerText + " 日";
        datepicker.context.events.trigger("change", datepicker);
    };
    var datepicker_focus = function datepicker_focus() {
        var picker = this;
        var container = picker.children[1];
        var yearct = container.children[0];
        var monthct = container.children[1];
        var datect = container.children[2];
        for (var i = 0; i < yearct.children.length; i++) if ($(yearct.children[i]).hasClass("selected")) yearct.scrollTop = yearct.children[i].offsetTop;
        for (var i = 0; i < monthct.children.length; i++) if ($(monthct.children[i]).hasClass("selected")) monthct.scrollTop = monthct.children[i].offsetTop;
        for (var i = 0; i < datect.children.length; i++) if ($(datect.children[i]).hasClass("selected")) datect.scrollTop = datect.children[i].offsetTop;
    };
    var datepicker_cover_click = function datepicker_cover_click() {
        var cover = this;
        var picker = cover.parentElement;
        $(picker).focus();
    };
    var datepicker_setdate = function datepicker_setdate(date) {
        var i = 0;
        var picker = this.self;
        var mindate = dataset_helper.read(picker, "mindate");
        var maxdate = dataset_helper.read(picker, "maxdate");
        if (mindate == null || mindate == undefined) mindate = "1990/01/01";
        if (maxdate == null || maxdate == undefined) maxdate = "2100/12/31";

        var minresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(mindate);
        var maxresult = /^(\d{4})\/((0?[1-9])|(1[0-2]))\/((0?[1-9])|(1\d)|(2\d)|(3[0-1]))$/g.exec(maxdate);
        var minyear = 1990,
            minmonth = 1,
            minday = 1;
        var maxyear = 2100,
            maxmonth = 12,
            maxday = 31;
        var valyear = date.getFullYear(),
            valmonth = date.getMonth() + 1,
            valday = date.getDate();

        if (minresult != null) {
            minyear = parseInt(minresult["1"], 10);
            minmonth = parseInt(minresult["2"], 10);
            minday = parseInt(minresult["5"], 10);
            var daycheck = new Date(minyear, minmonth - 1, minday);
            minyear = daycheck.getFullYear();
            minmonth = daycheck.getMonth() + 1;
            minday = daycheck.getDate();
        }
        if (maxresult != null) {
            maxyear = parseInt(maxresult["1"], 10);
            maxmonth = parseInt(maxresult["2"], 10);
            maxday = parseInt(maxresult["5"], 10);
            var daycheck = new Date(maxyear, maxmonth - 1, maxday);
            maxyear = daycheck.getFullYear();
            maxmonth = daycheck.getMonth() + 1;
            maxday = daycheck.getDate();
        }

        mindate = new Date(minyear, minmonth - 1, minday);
        maxdate = new Date(maxyear, maxmonth - 1, maxday);
        var dateval = date;
        if (mindate.getTime() > dateval.getTime()) return false;
        if (maxdate.getTime() < dateval.getTime()) return false;

        var container = picker.children[1];
        var yearct = container.children[0];
        var monthct = container.children[1];
        var datect = container.children[2];
        var index = 0;
        for (var i = 0; i < yearct.children.length; i++) {
            if (yearct.children[i].className == "selected") yearct.children[i].className = "";
            if (yearct.children[i].innerText == valyear.toString()) {
                yearct.children[i].className = "selected";
                index = i;
            }
        }
        yearct.scrollTop = yearct.children[index].offsetTop;

        monthct.innerHTML = "";
        datect.innerHTML = "";
        var monthbegin = 1,
            monthend = 12;
        if (valyear == minyear) monthbegin = minmonth;
        if (valyear == maxyear) monthend = maxmonth;
        index = monthbegin;
        for (var i = monthbegin; i <= monthend; i++) {
            var p = document.createElement("p");
            if (i == valmonth) {
                p.className = "selected";
                index = i;
            }
            p.innerText = i.toString();
            $(p).click(datepicker_month_clicked);
            monthct.appendChild(p);
        }
        monthct.scrollTop = monthct.children[index - monthbegin].offsetTop;

        var daybegin = 1,
            dayend = new Date(valyear, valmonth, 0).getDate();
        if (valyear == minyear && valmonth == monthbegin) daybegin = minday;
        if (valyear == maxyear && valmonth == maxmonth) dayend = maxday;
        index = daybegin;
        for (var i = daybegin; i <= dayend; i++) {
            var p = document.createElement("p");
            if (i == valday) {
                p.className = "selected";
                index = i;
            }
            p.innerText = i.toString();
            $(p).click(datepicker_day_clicked);
            datect.appendChild(p);
        }
        datect.scrollTop = datect.children[index - daybegin].offsetTop;

        dataset_helper.set(picker, "datevalue", valyear + "/" + valmonth + "/" + valday);
        picker.children[0].children[0].innerText = valyear + " 年 " + valmonth + " 月 " + valday + " 日";
        picker.context.events.trigger("change", picker);
        return true;
    };
    //#endregion

    var load = function load() {
        var body = document.body;
        flyout_global_init();
        button_init(body);
        checkbox_init(body);
        listbox_init(body);
        select_init(body);
        datepicker_init(body);
    };

    window.addEventListener("load", load, false);
})();

