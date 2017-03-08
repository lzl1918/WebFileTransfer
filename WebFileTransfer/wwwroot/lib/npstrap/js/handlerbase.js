function HandlerBase() {
    this.handlers = {};
}

HandlerBase.prototype = {
    constructor: HandlerBase,
    addHandler: function (type, handler) {
        if (typeof this.handlers[type] == 'undefined') {
            this.handlers[type] = new Array();
        }
        this.handlers[type].push(handler);
    },
    removeHandler: function (type, handler) {
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
    clearHandler: function (type) {
        if (this.handlers[type] instanceof Array) {
            this.handlers[type] = undefined;
        }
    },
    trigger: function (event, sender) {
        if (this.handlers[event] instanceof Array) {
            var handlers = this.handlers[event];
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i](sender);
            }
        }
    }
}