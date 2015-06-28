/**
 * @since 150628 11:19
 * @author vivaxy
 */
poll(function () {
    return document.querySelector('.text').value.length > 0;
}, function () {// 执行，成功的回调函数
    console.log('success');
}, function (e) {// 错误，失败的回调函数
    console.log(e);
});
