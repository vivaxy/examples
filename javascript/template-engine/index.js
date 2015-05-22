/**
 * @since 150519 20:25
 * @author vivaxy
 */
/**
 * test 1:
 * level 1 variables
 */
var toHtml1 = compile(function () {/*
 <div>
     <h2>${title}</h2>
     <div class="content">${content}</div>
 </div>    
*/});
var test1 = {
    title: 'title string 1',
    content: 'content string 1'
};
document.body.innerHTML += toHtml1(test1);

/**
 * test 2:
 * level 2 variables
 */
var test2 = {
    data: {
        title: 'title string 2',
        content: 'content string 2'
    }
};
var toHtml2 = compile(function () {/*
 <div>
     <h2>${data.title}</h2>
     <div class="content">${data.content}</div>
 </div>
 */
});
document.body.innerHTML += toHtml2(test2);
