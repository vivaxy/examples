/*
 * @author            : vivaxy
 * @date              : 2015-04-06 16:29:04
 * @last modified by  : vivaxy
 * @last modified time: 2015-04-06 19:19:45
 */

'use strict';

var Card = function (options) {
        this.events = {};

        this.data = options.data;
        this.container = options.container;

        this.render();
    },
    p = new Base();

Card.prototype = p;

p.template = function () {
    var _this = this,
        fragment = document.createDocumentFragment();
    var title = document.createElement('div');
    title.classList.add('title');
    title.innerText = this.data.title;
    fragment.appendChild(title);
    var detail = document.createElement('div');
    detail.classList.add('detail');
    detail.innerText = this.data.detail;
    fragment.appendChild(detail);
    return fragment;
};
