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

        this.canvas = config.canvas;

        this.ctx = this.canvas.getContext('2d');

        this.activeGraph = null;
        this.savedRotation = null;

        this._preload(() => {
            this.graphList = this._getGraphList();
            this.input = this._getInput();
            this._paint();
        });

    }

    _getGraphList() {

        return resourceList.map(resource => {

            let image = new Image();
            image.src = resource.src;

            return new Graph({
                ctx: this.ctx,
                width: resource.width,
                height: resource.height,
                x: resource.x,
                y: resource.y,
                image: image,
                src: resource.src
            });
        });

    }

    _preload(done) {
        let preload = new Preload(resourceList.map(resource => resource.src));
        preload.on('done', done);
        preload.start();
    }

    _getInput() {

        let input = new Input(this.canvas);

        input.on('drag-start', (center, delta) => {

            let graph = this._getActiveGraph(center);
            if (!graph) {
                return false;
            }
            this.activeGraph = graph;

            this._sortGraphList(graph);

            this._paint();
            this.activeGraph.paint(delta.x, delta.y);
        });

        input.on('drag-move', (center, delta) => {
            if (!this.activeGraph) {
                return false;
            }
            this._paint();
            this.activeGraph.paint(delta.x, delta.y);
        });

        input.on('drag-end', (center, delta) => {
            if (!this.activeGraph) {
                return false;
            }
            this.activeGraph.move(delta.x, delta.y);
            // 先清除正在拖动的元素，让 paint 方法能够画出所有元素
            this.activeGraph = null;
            this._paint();
        });

        input.on('pinch-start', (center, rotation, scale) => {
            let graph = this._getActiveGraph(center);
            if (!graph) {
                return false;
            }
            this.activeGraph = graph;
            this._sortGraphList(graph);

            this._paint();
            this.activeGraph.paint(null, null, rotation, scale);
        });

        input.on('pinch-move', (center, rotation, scale) => {
            if (!this.activeGraph) {
                return false;
            }
            this._paint();
            this.activeGraph.paint(null, null, rotation, scale);
            this.savedRotation = rotation;
        });

        input.on('pinch-end', (center, rotation, scale) => {
            if (!this.activeGraph) {
                return false;
            }
            this.activeGraph.resize(scale);
            this.activeGraph.rotate(this.savedRotation);
            this.savedRotation = null;
            this.activeGraph = null;
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
        return this.graphList.find(graph => {
            return graph.inRange(center);
        });
    }

    _paint() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.graphList.forEach(o => {
            // 不画正在拖动的元素，都则会有残影
            if (o !== this.activeGraph) {
                o.paint();
            }
        });
        return this;

    };

    _sortGraphList(graph) {
        let index = this.graphList.indexOf(graph);
        this.graphList.splice(index, 1);
        this.graphList.push(graph);
        return this;
    }
}

export default Application;
