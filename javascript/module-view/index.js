/*
 * @author            : vivaxy
 * @date              : 2015-04-06 15:49:58
 * @last modified by  : vivaxy
 * @last modified time: 2015-04-06 17:31:13
 */

'use strict';

var data = [{
    title: 'title 1',
    detail: 'detail 1'
}, {
    title: 'title 2',
    detail: 'detail 2'
}];

var cardList = new CardList({
    data: data,
    container: document.querySelector('.card-list')
});

var form = new Form({
    container: document.querySelector('.form')
}).on('submit', function (title, detail) {
    data.push({
        title: title,
        detail: detail
    });
    cardList.update(data);
});
