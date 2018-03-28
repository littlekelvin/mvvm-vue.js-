
function observe(data){
    if(!data || typeof data !== 'object'){
        return;
    }
    Object.keys(data).forEach(function (key) { // 遍历object的所有属性
        defineReactive(data, key, data[key]);
    });
}

function defineReactive(data, key, val) {
    observe(val);   //递归遍历监听属性
    var dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true, // 属性可以枚举
        configurable:false, // 属性描述法不可以修改
        get:function () {
            if(Dep.target){
                dep.addSub(Dep.target);
            }
            console.log('get....');
            return val;
        },
        set:function (newVal) {
            if(val === newVal){
                return;
            }
            val = newVal;
            dep.notify(); // data发生变化，通知所有订阅者
            console.log('属性' + key + '已经被监听了，现在值为：“' + newVal.toString() + '”');
        }
    });
}

function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub: function (sub) {
        this.subs.push(sub);
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update();
        });
    }
}

// var obj = {
//     a:'aaa',
//     b:'bbb',
//     c:{
//         aa:'ccaa',
//         bb:'ccbb'
//     }
// }
//
// observe(obj);
// obj.a = 'AAA';
// obj.b = 'BBB';
// obj.c.aa = 'CCAA';
// obj.c.bb = 'CCNN';