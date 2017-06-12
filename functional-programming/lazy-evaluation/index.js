/**
 * @since 2017-06-12 10:32:41
 * @author vivaxy
 */

const createNode = require('../linked-list').createNode;
const getValue = require('../linked-list').getValue;
const getNext = require('../linked-list').getNext;
const logLinkedList = require('../linked-list').logLinkedList;

const naturalNumber = (n) => {
    return (x) => {
        if (x) {
            return n;
        }
        return naturalNumber(n + 1);
    };
};

const nextMatch = (seq, fn) => {
    return fn(getValue(seq)) ? seq : nextMatch(getNext(seq), fn);
};

const filter = (seq, fn) => {
    const mseq = nextMatch(seq, fn);
    return (x) => {
        if (x) {
            return getValue(mseq);
        }
        return filter(getNext(mseq), fn);
    };
};

const sieve = (seq) => {
    const aPrime = getValue(seq);
    const nextSeq = filter(getNext(seq), (v) => {
        return v % aPrime !== 0;
    });
    return (x) => {
        if (x) {
            return aPrime;
        }
        return sieve(nextSeq);
    };
};

const take = (n, count) => {
    if (n === null || count <= 0) {
        return null;
    }
    return createNode(getValue(n), take(getNext(n), count - 1));
};

const primes = sieve(naturalNumber(2));
console.log(logLinkedList(take(primes, 5))); // => 2, 3, 5, 7, 11
console.log('');
console.log('----------');
console.log('');
