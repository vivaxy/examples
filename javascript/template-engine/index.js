/**
 * @since 150519 20:25
 * @author vivaxy
 */
var compile = function (functionObject) {
    return function (it) {
        return functionObject.toString().match(/\/\*([\s\S]*?)\*\//)[1].replace(/\$\{\w.+\}/g, function (variable) {
            var temp = it;
            variable = variable.replace('${', '').replace('}', '');
            variable.split('.').forEach(function (vari) {
                temp = temp[vari];
            });
            return temp;
        });
    }
};

var html = compile(function () {/*
 <div>
    <h2>${title}</h2>
    <div class="content">${content}</div>
 </div>
 */
});

var title = 'title string 1',
    content = 'content string 1',
    test = {
        title: 'title string 2',
        content: 'content string 2'
    };

document.body.innerHTML += html(window);
document.body.innerHTML += html(test);
