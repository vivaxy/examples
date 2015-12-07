/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @since 2015-12-07 16:47
	 * @author vivaxy
	 */
	'use strict';

	var _arrayPrototypeFind = __webpack_require__(1);

	var _arrayPrototypeFind2 = _interopRequireDefault(_arrayPrototypeFind);

	var _application = __webpack_require__(2);

	var _application2 = _interopRequireDefault(_application);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	new _application2.default({
	  canvas: document.querySelector('canvas')
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * @since 2015-12-05 17:18
	 * @author vivaxy
	 */
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	if (!Array.prototype.find) {
	    Array.prototype.find = function (predicate) {
	        if (this === null) {
	            throw new TypeError('Array.prototype.find called on null or undefined');
	        }
	        if (typeof predicate !== 'function') {
	            throw new TypeError('predicate must be a function');
	        }
	        var list = Object(this);
	        var length = list.length >>> 0;
	        var thisArg = arguments[1];
	        var value;

	        for (var i = 0; i < length; i++) {
	            value = list[i];
	            if (predicate.call(thisArg, value, i, list)) {
	                return value;
	            }
	        }
	        return undefined;
	    };
	}

	exports.default = Array.prototype.find;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @since 2015-12-07 16:54
	 * @author vivaxy
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _input = __webpack_require__(3);

	var _input2 = _interopRequireDefault(_input);

	var _graph = __webpack_require__(5);

	var _graph2 = _interopRequireDefault(_graph);

	var _preload2 = __webpack_require__(6);

	var _preload3 = _interopRequireDefault(_preload2);

	var _resources = __webpack_require__(7);

	var _resources2 = _interopRequireDefault(_resources);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Application = (function () {
	    function Application(config) {
	        var _this = this;

	        _classCallCheck(this, Application);

	        this.canvas = config.canvas;

	        this.ctx = this.canvas.getContext('2d');

	        this.activeGraph = null;
	        this.savedRotation = null;

	        this._preload(function () {
	            _this.graphList = _this._getGraphList();
	            _this.input = _this._getInput();
	            _this._paint();
	        });
	    }

	    _createClass(Application, [{
	        key: '_getGraphList',
	        value: function _getGraphList() {
	            var _this2 = this;

	            return _resources2.default.map(function (resource) {

	                var image = new Image();
	                image.src = resource.src;

	                return new _graph2.default({
	                    ctx: _this2.ctx,
	                    width: resource.width,
	                    height: resource.height,
	                    x: resource.x,
	                    y: resource.y,
	                    image: image,
	                    src: resource.src
	                });
	            });
	        }
	    }, {
	        key: '_preload',
	        value: function _preload(done) {
	            var preload = new _preload3.default(_resources2.default.map(function (resource) {
	                return resource.src;
	            }));
	            preload.on('done', done);
	            preload.start();
	        }
	    }, {
	        key: '_getInput',
	        value: function _getInput() {
	            var _this3 = this;

	            var input = new _input2.default(this.canvas);

	            input.on('drag-start', function (center, delta) {

	                var graph = _this3._getActiveGraph(center);
	                if (!graph) {
	                    return false;
	                }
	                _this3.activeGraph = graph;

	                _this3._sortGraphList(graph);

	                _this3._paint();
	                _this3.activeGraph.paint(delta.x, delta.y);
	            });

	            input.on('drag-move', function (center, delta) {
	                if (!_this3.activeGraph) {
	                    return false;
	                }
	                _this3._paint();
	                _this3.activeGraph.paint(delta.x, delta.y);
	            });

	            input.on('drag-end', function (center, delta) {
	                if (!_this3.activeGraph) {
	                    return false;
	                }
	                _this3.activeGraph.move(delta.x, delta.y);
	                // 先清除正在拖动的元素，让 paint 方法能够画出所有元素
	                _this3.activeGraph = null;
	                _this3._paint();
	            });

	            input.on('pinch-start', function (center, rotation, scale) {
	                var graph = _this3._getActiveGraph(center);
	                if (!graph) {
	                    return false;
	                }
	                _this3.activeGraph = graph;
	                _this3._sortGraphList(graph);

	                _this3._paint();
	                _this3.activeGraph.paint(null, null, rotation, scale);
	            });

	            input.on('pinch-move', function (center, rotation, scale) {
	                if (!_this3.activeGraph) {
	                    return false;
	                }
	                _this3._paint();
	                _this3.activeGraph.paint(null, null, rotation, scale);
	                _this3.savedRotation = rotation;
	            });

	            input.on('pinch-end', function (center, rotation, scale) {
	                if (!_this3.activeGraph) {
	                    return false;
	                }
	                _this3.activeGraph.resize(scale);
	                _this3.activeGraph.rotate(_this3.savedRotation);
	                _this3.savedRotation = null;
	                _this3.activeGraph = null;
	                _this3._paint();
	            });

	            input.on('double-tap', function (center) {
	                var graph = _this3._getActiveGraph(center);
	                graph.resize(2);
	                _this3._paint();
	            });

	            return input;
	        }
	    }, {
	        key: '_getActiveGraph',
	        value: function _getActiveGraph(center) {
	            return this.graphList.find(function (graph) {
	                return graph.inRange(center);
	            });
	        }
	    }, {
	        key: '_paint',
	        value: function _paint() {
	            var _this4 = this;

	            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	            this.graphList.forEach(function (o) {
	                // 不画正在拖动的元素，都则会有残影
	                if (o !== _this4.activeGraph) {
	                    console.log(o.src);
	                    o.paint();
	                }
	            });
	            return this;
	        }
	    }, {
	        key: '_sortGraphList',
	        value: function _sortGraphList(graph) {
	            var index = this.graphList.indexOf(graph);
	            this.graphList.splice(index, 1);
	            this.graphList.push(graph);
	            return this;
	        }
	    }]);

	    return Application;
	})();

	exports.default = Application;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @since 2015-12-05 16:15
	 * @author vivaxy
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _eventEmitter = __webpack_require__(4);

	var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Input = (function (_EventEmitter) {
	    _inherits(Input, _EventEmitter);

	    function Input(canvas) {
	        _classCallCheck(this, Input);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Input).call(this));

	        _this.element = canvas;
	        _this.ctx = canvas.getContext('2d');

	        _this.ratio = _this._getRatio();
	        _this.offset = _this._getOffset();

	        _this.hammer = _this._getHammer();

	        return _this;
	    }

	    /**
	     * 计算缩放比例，canvas 的绘图板像素 除以 元素样式的像素
	     * @returns {{}}
	     */

	    _createClass(Input, [{
	        key: '_getRatio',
	        value: function _getRatio() {
	            var element = this.element;
	            var ratio = {};
	            var rect = element.getBoundingClientRect();
	            var styleWidth = rect.width;
	            var width = element.width;
	            ratio.x = width / styleWidth;
	            var styleHeight = rect.height;
	            var height = element.height;
	            ratio.y = height / styleHeight;
	            return ratio;
	        }

	        /**
	         * 得到 canvas 在整个页面中的位置
	         * @returns {{}}
	         */

	    }, {
	        key: '_getOffset',
	        value: function _getOffset() {
	            var element = this.element;
	            var offset = {};
	            var rect = element.getBoundingClientRect();
	            offset.x = rect.left;
	            offset.y = rect.top;
	            return offset;
	        }

	        /**
	         * 取消所有事件绑定
	         * @returns {Input}
	         */

	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            this.hammer.destroy();
	            return this;
	        }

	        /**
	         * 绑定事件
	         * @returns {Hammer}
	         */

	    }, {
	        key: '_getHammer',
	        value: function _getHammer() {
	            var _this2 = this;

	            // tap, doubletap, press, horizontal pan and swipe, and the multi-touch pinch and rotate
	            var hammer = new Hammer(this.element);

	            hammer.get('pinch').set({ enable: true });
	            hammer.get('tap').set({ enable: false });
	            hammer.get('press').set({ enable: false });
	            hammer.get('swipe').set({ enable: false });
	            hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

	            hammer.on('panstart', function (e) {
	                _this2.emit('drag-start', _this2._getCoordinates(e.center), _this2._getDistance({
	                    x: e.deltaX,
	                    y: e.deltaY
	                }));
	            });

	            hammer.on('panmove', function (e) {
	                _this2.emit('drag-move', _this2._getCoordinates(e.center), _this2._getDistance({
	                    x: e.deltaX,
	                    y: e.deltaY
	                }));
	            });

	            hammer.on('panend', function (e) {
	                _this2.emit('drag-end', _this2._getCoordinates(e.center), _this2._getDistance({
	                    x: e.deltaX,
	                    y: e.deltaY
	                }));
	            });

	            hammer.on('pancancel', function (e) {
	                _this2.emit('drag-end', _this2._getCoordinates(e.center), _this2._getDistance({
	                    x: e.deltaX,
	                    y: e.deltaY
	                }));
	            });

	            hammer.on('doubletap', function (e) {
	                var coordinate = _this2._getCoordinates(e.center);
	                _this2.emit('double-tap', coordinate);
	            });

	            hammer.on('pinchstart', function (e) {
	                var coordinate = _this2._getCoordinates(e.center);
	                var scale = e.scale;
	                var rotation = e.rotation;
	                _this2.emit('pinch-start', coordinate, rotation, scale);
	            });

	            hammer.on('pinchmove', function (e) {
	                var coordinate = _this2._getCoordinates(e.center);
	                var scale = e.scale;
	                var rotation = e.rotation;
	                _this2.emit('pinch-move', coordinate, rotation, scale);
	            });

	            hammer.on('pinchend', function (e) {
	                var coordinate = _this2._getCoordinates(e.center);
	                var scale = e.scale;
	                var rotation = e.rotation;
	                _this2.emit('pinch-end', coordinate, rotation, scale);
	            });

	            hammer.on('pinchcancel', function (e) {
	                var coordinate = _this2._getCoordinates(e.center);
	                var scale = e.scale;
	                var rotation = e.rotation;
	                _this2.emit('pinch-end', coordinate, rotation, scale);
	            });

	            return hammer;
	        }

	        /**
	         * 计算事件点坐标对应绘图的坐标
	         * @param point
	         * @returns {{x, y}|*}
	         */

	    }, {
	        key: '_getCoordinates',
	        value: function _getCoordinates(point) {
	            var offset = this.offset;
	            return this._getDistance({
	                x: point.x - offset.x,
	                y: point.y - offset.y
	            });
	        }

	        /**
	         * 计算事件点距离对应绘图的距离
	         * @param delta
	         * @returns {{x: number, y: number}}
	         */

	    }, {
	        key: '_getDistance',
	        value: function _getDistance(delta) {
	            var ratio = this.ratio;
	            return {
	                x: delta.x * ratio.x,
	                y: delta.y * ratio.y
	            };
	        }
	    }]);

	    return Input;
	})(_eventEmitter2.default);

	exports.default = Input;

/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * @since 15-09-02 10:25
	 * @author vivaxy
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var EventEmitter = (function () {
	    function EventEmitter() {
	        _classCallCheck(this, EventEmitter);

	        this.events = {};
	    }

	    /**
	     *
	     * @param event
	     * @param callback
	     * @returns {EventEmitter}
	     */

	    _createClass(EventEmitter, [{
	        key: 'on',
	        value: function on(event, callback) {
	            if (!this.events[event]) {
	                this.events[event] = [];
	            }
	            this.events[event].push(callback);
	            return this;
	        }

	        /**
	         *
	         * @param event
	         * @returns {EventEmitter}
	         */

	    }, {
	        key: 'emit',
	        value: function emit(event) {
	            var _this = this;
	            var callbacks = this.events[event];
	            var _arguments = arguments;
	            if (callbacks) {
	                callbacks.forEach(function (callback) {
	                    callback.apply(_this, Array.prototype.slice.call(_arguments, 1));
	                });
	            }
	            return this;
	        }

	        /**
	         *
	         * @param event
	         * @param callback
	         * @returns {EventEmitter}
	         */

	    }, {
	        key: 'off',
	        value: function off(event, callback) {
	            if (this.events[event] && callback) {
	                this.events[event].splice(this.events[event].indexOf(callback), 1);
	            } else {
	                this.events[event] = [];
	            }
	            return this;
	        }
	    }]);

	    return EventEmitter;
	})();

	exports.default = EventEmitter;

/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * @since 2015-12-07 17:00
	 * @author vivaxy
	 */
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Graph = (function () {

	  /**
	   * 构造函数
	   * @param config
	   * {
	   *     ctx: canvas ctx,
	   *     width: number,
	   *     height: number,
	   *     x: left,
	   *     y: top,
	   *     src: 图片源
	   *     image: new Image()
	   * }
	   */

	  function Graph(config) {
	    _classCallCheck(this, Graph);

	    this.ctx = config.ctx;
	    this.width = config.width;
	    this.height = config.height;
	    this.x = config.x;
	    this.y = config.y;
	    this.image = config.image;
	    this.src = config.src;

	    /**
	     * 转动角度
	     * @type {number}
	     */
	    this.theta = 0;
	  }

	  /**
	   * 在 canvas 中画出元素
	   * 以下值如果没有传则认为是按照未偏离的画
	   *
	   * 1. 获得缩放后的 x, y, width, height
	   * 2. 得到位移之前的中心
	   * 3. 计算中心点的位移，位移距离不受缩放和旋转影响
	   * 4. 将画布原点 (0, 0) 移动到物体中心，以使旋转能够按照物体中心进行
	   * 5. 计算旋转角度
	   * 6. 将画布反向旋转
	   * 7. 画上图片
	   * 8. 将画布转回来
	   * 9. 将画布的原点移动回去
	   *
	   * @param offsetX 横向偏移
	   * @param offsetY 纵向偏移
	   * @param angle 旋转角度
	   * @param scale 缩放比例
	   * @returns {Graph}
	   */

	  _createClass(Graph, [{
	    key: 'paint',
	    value: function paint() {
	      var offsetX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	      var offsetY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	      var angle = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	      var scale = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

	      var after = this._getRectFromScale(scale);

	      var center = this._getCenter();

	      center.x += offsetX;
	      center.y += offsetY;

	      var ctx = this.ctx;
	      ctx.translate(center.x, center.y);

	      var rotation = (this.theta + angle) * Math.PI / 180;

	      ctx.rotate(rotation);

	      var width = after.width / 2;
	      var height = after.height / 2;
	      ctx.drawImage(this.image, -width, -height, after.width, after.height);

	      ctx.rotate(-rotation);

	      ctx.translate(-center.x, -center.y);

	      return this;
	    }

	    /**
	     * 计算中心点
	     * @returns {{x: *, y: *}}
	     */

	  }, {
	    key: '_getCenter',
	    value: function _getCenter() {
	      return {
	        x: this.x + this.width / 2,
	        y: this.y + this.height / 2
	      };
	    }

	    /**
	     * 计算中心点是否在这个元素中
	     * @param point
	     * @param tolerance 容差
	     * @returns {boolean}
	     */

	  }, {
	    key: 'inRange',
	    value: function inRange(point) {
	      var tolerance = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	      var x = point.x;
	      var y = point.y;
	      var xLowBound = this.x - tolerance;
	      var xHighBound = this.x + this.width + tolerance;
	      var yLowBound = this.y - tolerance;
	      var yHighBound = this.y + this.height + tolerance;
	      return x > xLowBound && x < xHighBound && y > yLowBound && y < yHighBound;
	    }

	    /**
	     * 移动元素
	     * @param x
	     * @param y
	     * @returns {Graph}
	     */

	  }, {
	    key: 'move',
	    value: function move() {
	      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	      this.x += x;
	      this.y += y;
	      return this;
	    }

	    /**
	     * 旋转元素
	     * @param angle
	     * @returns {Graph}
	     */

	  }, {
	    key: 'rotate',
	    value: function rotate() {
	      var angle = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

	      this.theta += angle;
	      return this;
	    }

	    /**
	     * 根据缩放比例计算元素的 x, y, width, height
	     * @param ratio
	     * @returns {{}}
	     */

	  }, {
	    key: '_getRectFromScale',
	    value: function _getRectFromScale() {
	      var ratio = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

	      var after = {};
	      var center = this._getCenter();
	      after.width = this.width * ratio;
	      after.height = this.height * ratio;
	      after.x = center.x - after.width / 2;
	      after.y = center.y - after.height / 2;
	      return after;
	    }

	    /**
	     * 对元素进行实际缩放
	     * @param ratio
	     * @returns {Graph}
	     */

	  }, {
	    key: 'resize',
	    value: function resize(ratio) {
	      var after = this._getRectFromScale(ratio);
	      this.width = after.width;
	      this.height = after.height;
	      this.x = after.x;
	      this.y = after.y;
	      return this;
	    }
	  }]);

	  return Graph;
	})();

	exports.default = Graph;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @since 2015-12-05 15:38
	 * @author vivaxy
	 */
	'use strict'

	/**
	 * event:
	 * 
	 * progress
	 *     加载的进度
	 *     参数 progress 0 ~ 1
	 * done
	 *     加载结束
	 * error
	 *     某张图片在重试次数后还是加载失败了
	 *     参数 src 图片的路径
	 */

	;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _eventEmitter = __webpack_require__(4);

	var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Preload = (function (_EventEmitter) {
	    _inherits(Preload, _EventEmitter);

	    function Preload(list) {
	        _classCallCheck(this, Preload);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Preload).call(this));

	        if (!list.length) {
	            throw new Error('preload: nothing to load');
	        }

	        _this.retryCount = 5;

	        _this.list = list.map(function (src) {
	            return {
	                src: src,
	                retryCount: _this.retryCount,
	                loaded: false
	            };
	        });
	        return _this;
	    }

	    /**
	     * 预加载开始
	     */

	    _createClass(Preload, [{
	        key: 'start',
	        value: function start() {
	            var _this2 = this;

	            this.list.forEach(function (o) {
	                var load = function load() {
	                    _this2._loadImage(o.src, function () {
	                        o.loaded = true;
	                        var progress = _this2._getProgress();
	                        _this2.emit('progress', progress);
	                        if (progress === 1) {
	                            _this2.emit('done');
	                        }
	                    }, function () {
	                        if (o.retryCount > 0) {
	                            o.retryCount--;
	                            load();
	                            // 重试次数用完了
	                            _this2.emit('error', o.src);
	                        }
	                    });
	                };
	                load();
	            });
	        }

	        /**
	         * 加载单张图片
	         * @param src
	         * @param success
	         * @param error
	         * @returns {Preload}
	         */

	    }, {
	        key: '_loadImage',
	        value: function _loadImage(src, success, error) {
	            var image = new Image();
	            image.addEventListener('load', success);
	            image.addEventListener('error', error);
	            image.src = src;
	            return this;
	        }

	        /**
	         * 计算整体进度
	         * 0 ~ 1
	         * 1 - done
	         * @returns {number}
	         */

	    }, {
	        key: '_getProgress',
	        value: function _getProgress() {

	            var loadedImage = this.list.filter(function (o) {
	                return o.loaded;
	            });

	            return loadedImage.length / this.list.length;
	        }
	    }]);

	    return Preload;
	})(_eventEmitter2.default);

	exports.default = Preload;

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * @since 2015-12-07 17:17
	 * @author vivaxy
	 */
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = [{
	    width: 76,
	    height: 76,
	    x: 320,
	    y: 640,
	    src: './image/snow.png'
	}, {
	    width: 107,
	    height: 81,
	    x: 320,
	    y: 640,
	    src: './image/hat.png'
	}, {
	    width: 94,
	    height: 58,
	    x: 320,
	    y: 640,
	    src: './image/bus.png'
	}];

/***/ }
/******/ ]);