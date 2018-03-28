function Compile(el, vm, cb) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init()
    cb.call();
}

Compile.prototype = {
    init: function () {
        if(this.el){
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        }else {
            console.log("dom element is not exited")
        }
    },
    nodeToFragment: function (el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        while(child){
            fragment.appendChild(child);
            child = el.firstChild;
        }
        return fragment;
    },
    compileElement: function (el) {
        var childNodes = el.childNodes;
        var self = this;
        var reg = /\{\{(.*)\}\}/;
        childNodes.forEach(function (node) {
            var text = node.textContent;
            if(self.isElementNode(node)){
                self.compileDirective(node);
            } else if(self.isTextNode(node) && reg.test(text)){
                self.compileText(node, reg.exec(text)[1])
            }

            if(node.childNodes && node.childNodes.length){
                self.compileElement(node);
            }
        });
    },
    compileDirective: function (node) {
        var attrs = node.attributes;
        var self = this;
        [].forEach.call(attrs, function (attr) {
            var attrName = attr.name;
            if(self.isVueDirective(attrName)){
                var exp = attr.value;
                var directive = attrName.substring(2);
                if(self.isEventDirective(directive)){   // v-on:event 事件指令
                    self.compileEventDirective(exp, directive, node);
                }else if(self.isModelDirective(directive)){ // v-model 指令
                    self.compileModelDirective(exp, directive, node);
                }
            }
        });
    },
    compileEventDirective: function (exp, directive, node) {
        var eventName = directive.split(':')[1];
        var vm = this.vm;
        var cb = this.vm.methods && this.vm.methods[exp];
        if(eventName){
            node.addEventListener(eventName, cb.bind(vm), false);
        }
    },
    compileModelDirective: function (exp, directive, node) {
        var val = this.vm[exp];
        this.modelUpdater(node, val);
        var self = this;
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function (e) {
            var newVal = e.target.value;
            if(val == newVal){
                return;
            }
            val = newVal;
            self.vm[exp] = newVal;
        });
    },
    modelUpdater: function (node, value) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
    compileText: function (node, exp) {
        var initText = this.vm[exp];
        this.updateText(node, initText);    // 初始化视图数据
        var self = this;
        new Watcher(this.vm, exp, function (value) { //生成订阅器并绑定更新视图函数
            self.updateText(node, value);
        });
    },
    updateText: function (node, text) {
        node.textContent = typeof text == 'undefined' ? '' : text;
    },
    isTextNode: function (node) {
        return node.nodeType === 3;//节点类型值为3是文本节点
    },
    isElementNode: function (node) {
        return node.nodeType === 1;
    },
    isVueDirective: function (attr) {
        return attr.indexOf('v-') == 0;
    },
    isEventDirective: function (directive) {
        return directive.indexOf('on') == 0;
    },
    isModelDirective: function (directive) {
        return directive.indexOf('model') == 0;
    }
}

