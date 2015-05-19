/*
 * @author            : vivaxy
 * @date              : 2015-04-06 16:51:55
 * @last modified by  : vivaxy
 * @last modified time: 2015-04-06 19:30:58
 */

'use strict';

var Form = function (options) {
        this.events = {};
        this.children = [];

        this.data = options.data;
        this.container = options.container;

        this.render();
    },
    p = new Base();

Form.prototype = p;

p.template = function () {
    var _this = this;
    var fragment = document.createDocumentFragment();

    var titleLabel = document.createElement('label');
    titleLabel.setAttribute('for', 'title');
    titleLabel.innerText = 'title:';
    fragment.appendChild(titleLabel);

    var title = document.createElement('input');
    title.id = 'title';
    fragment.appendChild(title);

    var detailLabel = document.createElement('label');
    detailLabel.setAttribute('for', 'detail');
    detailLabel.innerText = 'detail:';
    fragment.appendChild(detailLabel);

    var detail = document.createElement('input');
    detail.id = 'detail';
    fragment.appendChild(detail);

    var button = document.createElement('a');
    button.innerText = 'submit';
    button.href = '#';
    button.addEventListener('click', function () {
        _this.fire('submit', title.value, detail.value);
    }, false);

    fragment.appendChild(button);
    return fragment;
};
