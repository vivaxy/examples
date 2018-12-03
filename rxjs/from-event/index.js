/**
 * @since 2018-12-03 15:30
 * @author vivaxy
 */

const { fromEvent } = rxjs;

const button = document.querySelector('button');
fromEvent(button, 'click').subscribe(() => console.log('Clicked!'));
