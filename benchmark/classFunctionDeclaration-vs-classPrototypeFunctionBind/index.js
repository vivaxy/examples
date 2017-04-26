/**
 * @since 2017-04-26 16:40:51
 * @author vivaxy
 * 比较在构造中重复声明函数和在构造函数中绑定 this 的运行差异
 *  `node --expose_gc index.js`
 * 结果：
 *  - 时间不确定
 *  - 内存开销：重复声明函数 < 绑定 this
 */

const ClassA = function() {
    this.handleClick = function() {
        console.log(0);
    };
};

const ClassB = function() {
    this.handleClick = this.handleClick.bind(this);
};

ClassB.prototype.handleClick = function() {
    console.log(0);
};

const g = global;

const getNow = () => {
    return new Date().getTime();
};

const count = 1000000;
const run = (func) => {
    const beginTime = getNow();
    const beginHeap = process.memoryUsage().heapUsed;
    for (let i = 0; i < count; i++) {
        func(i);
    }
    const endTime = getNow();
    const endHeap = process.memoryUsage().heapUsed;
    return {
        time: endTime - beginTime,
        heap: endHeap - beginHeap
    };
};

global.gc();

const aResults = run(function(i) {
    g['a' + i] = new ClassA();
});

global.gc();

const bResults = run(function(i) {
    g['b' + i] = new ClassB();
});

global.gc();

console.log('time', aResults.time, bResults.time);
console.log('heap', aResults.heap, bResults.heap);

run(function(i) {
    return g['a' + i] === g['b' + i];
});
