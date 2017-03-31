
var pipeline_usestatic = function () {
    if (this.used_static) return;
    this.add(require('./processor/staticfile').create(this.config));
    this.used_static = true;
};
var pipeline_usedefault = function () {
    if (this.used_default) return;
    this.add(require('./processor/defaultfile').create(this.config));
    this.used_default = true;
};


var pipeline = function (config) {
    this.config = config;
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

var create_pipeline = function (config) {
    return new pipeline(config);
};

module.exports = {
    create: create_pipeline
};