/**
 * @since 2015-12-05 16:15
 * @author vivaxy
 */
'use strict';

import EventEmitter from '../node_modules/event-emitter/src/event-emitter.js';

class Input extends EventEmitter {
  constructor(canvas) {
    super();

    this._element = canvas;
    //this._ctx = canvas.getContext('2d');

    this._ratio = this._getRatio();
    this._offset = this._getOffset();

    this._hammer = this._getHammer();
  }

  /**
   * 计算缩放比例，canvas 的绘图板像素 除以 元素样式的像素
   * @returns {{}}
   */
  _getRatio() {
    let element = this._element;
    let ratio = {};
    let rect = element.getBoundingClientRect();
    let styleWidth = rect.width;
    let width = element.width;
    ratio.x = width / styleWidth;
    let styleHeight = rect.height;
    let height = element.height;
    ratio.y = height / styleHeight;
    return ratio;
  }

  /**
   * 得到 canvas 在整个页面中的位置
   * @returns {{}}
   */
  _getOffset() {
    let element = this._element;
    let offset = {};
    let rect = element.getBoundingClientRect();
    offset.x = rect.left;
    offset.y = rect.top;
    return offset;
  }

  /**
   * 取消所有事件绑定
   * @returns {Input}
   */
  destroy() {
    this._hammer.destroy();
    return this;
  }

  /**
   * 绑定事件
   * @returns {Hammer}
   */
  _getHammer() {
    // tap, doubletap, press, horizontal pan and swipe, and the multi-touch pinch and rotate
    var hammer = new Hammer(this._element);

    hammer.get('pinch').set({ enable: true });
    hammer.get('tap').set({ enable: false });
    hammer.get('press').set({ enable: false });
    hammer.get('swipe').set({ enable: false });
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    hammer.on('panstart', (e) => {
      this.emit(
        'drag-start',
        this._getCoordinates(e.center),
        this._getDistance({
          x: e.deltaX,
          y: e.deltaY,
        }),
      );
    });

    hammer.on('panmove', (e) => {
      this.emit(
        'drag-move',
        this._getCoordinates(e.center),
        this._getDistance({
          x: e.deltaX,
          y: e.deltaY,
        }),
      );
    });

    hammer.on('panend', (e) => {
      this.emit(
        'drag-end',
        this._getCoordinates(e.center),
        this._getDistance({
          x: e.deltaX,
          y: e.deltaY,
        }),
      );
    });

    hammer.on('pancancel', (e) => {
      this.emit(
        'drag-end',
        this._getCoordinates(e.center),
        this._getDistance({
          x: e.deltaX,
          y: e.deltaY,
        }),
      );
    });

    hammer.on('doubletap', (e) => {
      let coordinate = this._getCoordinates(e.center);
      this.emit('double-tap', coordinate);
    });

    hammer.on('pinchstart', (e) => {
      let coordinate = this._getCoordinates(e.center);
      let scale = e.scale;
      let rotation = e.rotation;
      this.emit('pinch-start', coordinate, rotation, scale);
    });

    hammer.on('pinchmove', (e) => {
      let coordinate = this._getCoordinates(e.center);
      let scale = e.scale;
      let rotation = e.rotation;
      this.emit('pinch-move', coordinate, rotation, scale);
    });

    hammer.on('pinchend', (e) => {
      let coordinate = this._getCoordinates(e.center);
      let scale = e.scale;
      let rotation = e.rotation;
      this.emit('pinch-end', coordinate, rotation, scale);
    });

    hammer.on('pinchcancel', (e) => {
      let coordinate = this._getCoordinates(e.center);
      let scale = e.scale;
      let rotation = e.rotation;
      this.emit('pinch-end', coordinate, rotation, scale);
    });

    return hammer;
  }

  /**
   * 计算事件点坐标对应绘图的坐标
   * @param point
   * @returns {{x, y}|*}
   */
  _getCoordinates(point) {
    let offset = this._offset;
    return this._getDistance({
      x: point.x - offset.x,
      y: point.y - offset.y,
    });
  }

  /**
   * 计算事件点距离对应绘图的距离
   * @param delta
   * @returns {{x: number, y: number}}
   */
  _getDistance(delta) {
    let ratio = this._ratio;
    return {
      x: delta.x * ratio.x,
      y: delta.y * ratio.y,
    };
  }
}

export default Input;
