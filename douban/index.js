/**
 * @since 2017-01-26 19:39
 * @author vivaxy
 */

// 1. visit:
//      https://movie.douban.com/people/${username}/collect?sort=time&amp;start=0&amp;filter=all&amp;mode=list&amp;tags_sort=count
//      https://book.douban.com/people/${username}/collect?start=0&sort=time&rating=all&filter=all&mode=list
// 2. run scrips in your console

const pageResults = Array.prototype.map.call(document.querySelectorAll('.list-view .item'), function(item) {
    const _item = item.querySelector('.item-show');
    const a = _item.querySelector('.title a');
    const title = a.innerText.trim();
    const link = a.href;
    const rating = Number(_item.querySelector('.date span').className.substring(6, 7));
    const date = _item.querySelector('.date').innerText.trim();
    const commentDOM = item.querySelector('.comment');
    const comment = commentDOM ? commentDOM.innerText.trim() : '';
    return title + '\t' + rating + '\t' + date + '\t' + link + '\t' + comment;
}).join('\n');
copy(pageResults);

// 3. paste into a number/excel file
// 4. go to next page, do the same thing
