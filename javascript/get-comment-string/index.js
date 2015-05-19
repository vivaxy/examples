/**
 * @since 150519 20:25
 * @author vivaxy
 */
var compile = function (functionObject) {
    return functionObject.toString().match(/\/\*([\s\S]*?)\*\//)[1];
};

var html = compile(function () {/*
 <div>
 <h2>title</h2>
 <div class="content">content</div>
 </div>
 */
});

console.log(html);
document.body.innerHTML += html;
