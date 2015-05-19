/*
 * @author: vivaxy
 * @date:   2015-04-06 16:36:20
 * @last modified by:   vivaxy
 * @last modified time: 2015-04-06 19:32:21
 */

'use strict';

var CardList = function (options) {
        this.enents = {};
        this.children = [];

        this.data = options.data;
        this.container = options.container;

        this.render();
    },
    p = new Base();

CardList.prototype = p;

p.template = function () {
    var _this = this,
        fragment = document.createDocumentFragment();
    this.data.forEach(function (item) {
        var cardContainer = document.createElement('div');
        cardContainer.classList.add('card');
        fragment.appendChild(cardContainer);
        _this.children.push(new Card({
            data: item,
            container: cardContainer,
            parent: _this
        }));
    });
    var hr = document.createElement('hr');
    fragment.appendChild(hr);
    return fragment;
};
