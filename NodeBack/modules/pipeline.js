
var pipeline_usestatic = function (config) {
    if (this.used_static) return;
    this.add(require('./processor/default_processor/staticfile').create(config));
    this.used_static = true;
};
var pipeline_usedefault = function (config) {
    if (this.used_default) return;
    this.add(require('./processor/default_processor/defaultfile').create(config));
    this.used_default = true;
};


var pipeline = function () {
    this.pipe = [];
};

var pipeline_add = function (processor) {
    this.pipe.push(processor);
};

var pipeline_traverse = function (req, res) {
    for (var i = 0; i < this.pipe.length; i++) {
        if (this.pipe[i].process(req, res))
            return true;
    }
    return false;
};

pipeline.prototype = {
    constructor: pipeline,
    add: pipeline_add,
    traverse: pipeline_traverse,

    use_static: pipeline_usestatic,
    use_default: pipeline_usedefault
};

var create_pipeline = function () {
    return new pipeline();
};

module.exports = {
    create: create_pipeline
};