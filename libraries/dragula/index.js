/**
 * @since 2017-04-13 11:40:28
 * @author vivaxy
 */

const room1 = document.querySelector('.js-room-1');
const room2 = document.querySelector('.js-room-2');
const dragWrapper = document.querySelector('.js-drag-wrapper');

dragula([room1, room2, dragWrapper], {
  moves: function(el, source, handle, sibling) {
    return !el.classList.contains('js-drag-wrapper'); // elements are always draggable by default
  },
});
