function SelfVue(options) {
    this.data = options.data;
    this.methods = options.methods;
    if(options.mounted){
        this.mounted = options.mounted;
    }
    var self = this;
    Object.keys(this.data).forEach(function (key) {
        self.proxyKeys(key);
    });

    observe(this.data);
    new Compile(options.el, this, function () {
        self.mounted();
    });
    return this;
}

SelfVue.prototype = {
    proxyKeys: function (key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function () {
                return self.data[key];
            },
            set: function (newVal) {
                self.data[key] = newVal;
            }
        })
    },
    mounted: function () {
        console.log('mounted')
    }
}
