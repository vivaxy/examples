/**
 * @since 20180613 20:15
 * @author vivaxy
 */

import * as layerActions from '../enums/layer-actions.js';
import * as layerFunctions from '../enums/layer-functions.js';
import * as layerProperties from '../enums/layer-properties.js';

export default class Button {
  constructor({ label, top, left, width, height }) {
    this.label = label;
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
  }

  render() {
    return [
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.STROKE_STYLE,
        value: '#333',
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.LINE_WIDTH,
        value: 2,
      },
      {
        type: layerActions.FUNCTION,
        func: layerFunctions.STROKE_RECT,
        params: [this.left, this.top, this.width, this.height],
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.FILL_STYLE,
        value: '#08c',
      },
      {
        type: layerActions.FUNCTION,
        func: layerFunctions.FILL_RECT,
        params: [this.left, this.top, this.width, this.height],
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.FILL_STYLE,
        value: '#fff',
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.TEXT_ALIGN,
        value: 'center',
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.TEXT_BASELINE,
        value: 'middle',
      },
      {
        type: layerActions.SET_FONT,
        fontSize: 16,
        lineHeight: this.height,
      },
      {
        type: layerActions.FUNCTION,
        func: layerFunctions.FILL_TEXT,
        params: [this.label, this.left + this.width / 2, this.top + this.height / 2],
      },
    ];
  }

  coordsInButton({ x, y }) {
    return x > this.left && y > this.top && x < this.left + this.width && y < this.top + this.height;
  }

};
