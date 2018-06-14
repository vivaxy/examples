/**
 * @since 20180614 11:23
 * @author vivaxy
 */

import * as layerActions from '../enums/layer-actions.js';
import * as layerIndexes from '../enums/layer-indexes.js';
import * as layerFunctions from '../enums/layer-functions.js';
import * as layerProperties from '../enums/layer-properties.js';

const curveLineWidth = 2;
const pointRadius = 4;
const curveColor = '#333';
const activeCurveColor = '#f63';
const pointColor = '#333';
const controlPointColor = '#333';
const activePointColor = '#0ff';
const activeControlPointColor = '#08c';
const inCurveThreshold = 4;

function getLength(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getBezier(p1, cp1, p2, cp2, t) {
  function bezier(_0, _1, _2, _3, _t) {
    return _0 * Math.pow(1 - _t, 3) + 3 * _1 * _t * Math.pow(1 - _t, 2) + 3 * _2 * Math.pow(_t, 2) * (1 - _t) + _3 * Math.pow(_t, 3);
  }

  return {
    x: bezier(p1.x, cp1.x, cp2.x, p2.x, t),
    y: bezier(p1.y, cp1.y, cp2.y, p2.y, t)
  }
}

export default class Curve {
  constructor({ p1, cp1, p2, cp2 }) {
    this.p1 = p1;
    this.cp1 = cp1;
    this.p2 = p2;
    this.cp2 = cp2;
    this.active = true;
  }

  setActive(v) {
    this.active = v;
  }

  setP1(v) {
    this.p1 = v;
  }

  setCp1(v) {
    this.cp1 = v;
  }

  setP2(v) {
    this.p2 = v;
  }

  setCp2(v) {
    this.cp2 = v;
  }

  isInCurve(coord) {
    const probablyLength = getLength(this.p1, this.cp1) + getLength(this.p1, this.p2) + getLength(this.p2, this.cp2);
    for (let i = 0; i < probablyLength; i++) {
      const p = getBezier(this.p1, this.cp1, this.p2, this.cp2, i / probablyLength);
      if (getLength(p, coord) < inCurveThreshold) {
        return true;
      }
    }
    return false;
  }

  render() {
    const actions = [
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.STROKE_STYLE,
        value: this.active ? activeCurveColor : curveColor,
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.LINE_WIDTH,
        value: curveLineWidth,
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.LINE_JOIN,
        value: 'round',
      },
      {
        type: layerActions.PROPERTY,
        prop: layerProperties.LINE_CAP,
        value: 'round',
      },
      {
        type: layerActions.FUNCTION,
        func: layerFunctions.BEGIN_PATH,
        params: [],
      },
      {
        type: layerActions.FUNCTION,
        func: layerFunctions.MOVE_TO,
        params: [this.p1.x, this.p1.y],
      },
      {
        type: layerActions.FUNCTION,
        func: layerFunctions.BEZIER_CURVE_TO,
        params: [this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.p2.x, this.p2.y],
      },
      {
        type: layerActions.FUNCTION,
        func: layerFunctions.STROKE,
        params: [],
      },
    ];
    if (this.active) {
      return actions.concat(
        // draw control line 1
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.MOVE_TO,
          params: [this.p1.x, this.p1.y],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.LINE_TO,
          params: [this.cp1.x, this.cp1.y],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.STROKE,
          params: [],
        },

        // draw control line 2
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.MOVE_TO,
          params: [this.p2.x, this.p2.y],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.LINE_TO,
          params: [this.cp2.x, this.cp2.y],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.STROKE,
          params: [],
        },

        // draw point
        {
          type: layerActions.PROPERTY,
          prop: layerProperties.FILL_STYLE,
          value: this.active ? activePointColor : pointColor,
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.FILL_RECT,
          params: [this.p1.x - pointRadius, this.p1.y - pointRadius, pointRadius * 2, pointRadius * 2],
        },
        {
          type: layerActions.PROPERTY,
          prop: layerProperties.FILL_STYLE,
          value: activePointColor,
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.FILL_RECT,
          params: [this.p2.x - pointRadius, this.p2.y - pointRadius, pointRadius * 2, pointRadius * 2],
        },

        // draw control point
        {
          type: layerActions.PROPERTY,
          prop: layerProperties.FILL_STYLE,
          value: activeControlPointColor,
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.BEGIN_PATH,
          params: [],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.ARC,
          params: [this.cp1.x, this.cp1.y, pointRadius, 0, Math.PI * 2],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.FILL,
          params: [],
        },
        {
          type: layerActions.PROPERTY,
          prop: layerProperties.FILL_STYLE,
          value: activeControlPointColor,
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.BEGIN_PATH,
          params: [],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.ARC,
          params: [this.cp2.x, this.cp2.y, pointRadius, 0, Math.PI * 2],
        },
        {
          type: layerActions.FUNCTION,
          func: layerFunctions.FILL,
          params: [],
        }
      );
    }
    return actions;
  }
}
