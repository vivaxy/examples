/**
 * @since 2021-04-22
 * @author vivaxy
 */
import { Decoration } from 'https://cdn.skypack.dev/prosemirror-view';

class Comment {
  constructor(from, to, text, id) {
    this.from = from;
    this.to = to;
    this.id = id;
    this.text = text;
  }
}
