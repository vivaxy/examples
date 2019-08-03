/**
 * @since 2015-12-07 16:54
 * @author vivaxy
 */
'use strict';

import Input from './input.js';
import Graph from './graph.js';
import Preload from './preload.js';
import resourceList from './resources.js';

class Application {
  constructor(config) {
    this._canvas = config.canvas;

    this._ctx = this._canvas.getContext('2d');

    this._activeGraph = undefined;
    this._savedRotation = undefined;

    this._preload(() => {
      this._graphList = this._getGraphList();
      this._input = this._getInput();
      this._paint();
    });
  }

  _getGraphList() {
    return resourceList.map((resource) => {
      return new Graph({
        ctx: this._ctx,
        width: resource.width,
        height: resource.height,
        x: resource.x,
        y: resource.y,
        image: resource.image,
        src: resource.src,
      });
    });
  }

  _preload(done) {
    let preload = new Preload(resourceList);
    preload.on('done', done);
    preload.start();
  }

  _getInput() {
    let input = new Input(this._canvas);

    input.on('drag-start', (center, delta) => {
      let graph = this._getActiveGraph(center);
      if (!graph) {
        return false;
      }
      this._activeGraph = graph;

      this._sortGraphList(graph);

      this._paint(delta.x, delta.y, undefined, undefined);
    });

    input.on('drag-move', (center, delta) => {
      if (!this._activeGraph) {
        return false;
      }
      this._paint(delta.x, delta.y, undefined, undefined);
    });

    input.on('drag-end', (center, delta) => {
      if (!this._activeGraph) {
        return false;
      }
      this._activeGraph.move(delta.x, delta.y, undefined, undefined);
      // 先清除正在拖动的元素，让 paint 方法能够画出所有元素
      this._activeGraph = undefined;
      this._paint();
    });

    input.on('pinch-start', (center, rotation, scale) => {
      let graph = this._getActiveGraph(center);
      if (!graph) {
        return false;
      }
      this._activeGraph = graph;
      this._sortGraphList(graph);

      this._paint(undefined, undefined, rotation, scale);
      this._activeGraph.paint();
    });

    input.on('pinch-move', (center, rotation, scale) => {
      if (!this._activeGraph) {
        return false;
      }
      this._paint(undefined, undefined, rotation, scale);
      this._savedRotation = rotation;
    });

    input.on('pinch-end', (center, rotation, scale) => {
      if (!this._activeGraph) {
        return false;
      }
      this._activeGraph.resize(scale);
      this._activeGraph.rotate(this._savedRotation);
      this._savedRotation = undefined;
      this._activeGraph = undefined;
      this._paint();
    });

    input.on('double-tap', (center) => {
      let graph = this._getActiveGraph(center);
      graph.resize(2);
      this._paint();
    });

    return input;
  }

  _getActiveGraph(center) {
    this._graphList.reverse();
    let found = this._graphList.find((graph) => {
      return graph.inRange(center);
    });
    this._graphList.reverse();
    return found;
  }

  _paint(x, y, angle, scale) {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._graphList.forEach((o) => {
      // 不画正在拖动的元素，都则会有残影
      if (o !== this._activeGraph) {
        o.paint();
      } else {
        o.paint(x, y, angle, scale);
      }
    });
    return this;
  }

  _sortGraphList(graph) {
    let index = this._graphList.indexOf(graph);
    if (index === -1) {
      return this;
    }
    this._graphList.splice(index, 1);
    this._graphList.push(graph);
    return this;
  }
}

export default Application;
