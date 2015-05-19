/**
 * @since 14/12/5 上午9:34
 * @author vivaxy
 */

var appendItem = function (item) {
    var template = document.querySelector('.list .item.hide');
    var one = document.querySelector('.list .item.hide').cloneNode(true);
    one.href = item.link;
    one.querySelector('.image').src = item.image;
    one.querySelector('.title').innerText = item.title;
    one.querySelector('.detail').innerText = item.detail;
    one.classList.remove('hide');
    document.querySelector('.list').insertBefore(one, template);
};

var loadPage = function (callback) {
    request(function (data) {
        if (typeof data === 'string') data = JSON.parse(data);
        if (data && data.code && data.code == 200 && data.msg && data.msg.list) {
            data.msg.list.forEach(appendItem);
            callback();
        }
    });
};

var request = function (callback) {
    var ajax = new XMLHttpRequest();
    ajax.addEventListener('readystatechange', function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            callback(ajax.responseText);
        }
    });
    ajax.open("GET", "main.json", true);
    ajax.send();
};

new Drag2Load(loadPage);
