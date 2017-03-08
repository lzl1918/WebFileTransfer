var DatasetHelper = {
    set: function (obj, property, val) {
        if (obj != undefined) {
            if (obj.dataset == undefined) {
                obj.setAttribute("data-" + property, val);
            }
            else {
                obj.dataset[property] = val;
            }
        }
    },
    read: function (obj, property) {
        if (obj == undefined)
            return null;
        if (obj.dataset == undefined)
            return obj.getAttribute("data-" + property);
        else
            return obj.dataset[property];
    }
};