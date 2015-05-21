/**
 * @since 150519 20:25
 * @author vivaxy
 */
/**
 * test 1:
 * global variables
 */
var toHtml1 = compile(function () {/*
 <div>
     <h2>${title}</h2>
     <div class="content">${content}</div>
 </div>
 */
});
var title = 'title string 1',
    content = 'content string 1';
document.body.innerHTML += toHtml1(window);

/**
 * test 2:
 * level 2 variables
 */
var test2 = {
    title: 'title string 2',
    content: 'content string 2'
};
document.body.innerHTML += toHtml1(test2);

/**
 * test 3:
 * level 3 variables
 */
var test3 = {
    data: {
        title: 'title string 3',
        content: 'content string 3'
    }
};
var toHtml3 = compile(function () {/*
 <div>
     <h2>${data.title}</h2>
     <div class="content">${data.content}</div>
 </div>
 */
});
document.body.innerHTML += toHtml3(test3);
