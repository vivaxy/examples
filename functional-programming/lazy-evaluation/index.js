/**
 * @since 2017-06-12 10:32:41
 * @author vivaxy
 */

const createNode = require('../linked-list').createNode;
const getValue = require('../linked-list').getValue;
const getNext = require('../linked-list').getNext;
const logLinkedList = require('../linked-list').logLinkedList;

function naturalNumber(n) {
    return function(x) {
        if (x) {
            return n;
        }
        return naturalNumber(n + 1);
    };
}

function nextMatch(seq, fn) {
    return fn(getValue(seq)) ? seq : nextMatch(getNext(seq), fn);
}

function filter(seq, fn) {
    const mseq = nextMatch(seq, fn);
    return function(x) {
        if (x) {
            return getValue(mseq);
        }
        return filter(getNext(mseq), fn);
    };
}

function sieve(seq) {
    const aPrime = getValue(seq);
    const nextSeq = filter(getNext(seq), function(v) {
        return v % aPrime !== 0;
    });
    return function(x) {
        if (x) {
            return aPrime;
        }
        return sieve(nextSeq);
    };
}

function take(n, count) {
    if (n === null || count <= 0) {
        return null;
    }
    return createNode(getValue(n), take(getNext(n), count - 1));
}

const primes = sieve(naturalNumber(2));
console.log(logLinkedList(take(primes, 5))); // => 2, 3, 5, 7, 11
console.log('');
console.log('----------');
console.log('');
