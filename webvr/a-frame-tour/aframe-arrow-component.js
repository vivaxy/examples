/* global AFRAME THREE */

if (typeof AFRAME === 'undefined') {
  throw 'Component attempted to register before AFRAME was available.';
}

AFRAME.registerComponent('arrow', {
  schema: {
    direction: {
      type: 'vec3',
      default: {
        x: 1,
        y: 0,
        z: 0
      }
    },
    length: {
      type: 'number'
    },
    color: {
      type: 'color',
      default: '#ff0'
    },
    headLength: {
      type: 'number'
    },
    headWidth: {
      type: 'number'
    }
  },
  init: function() {
    var data = this.data;
    var direction = new THREE.Vector3(data.direction.x, data.direction.y, data.direction.z);
    var length = data.length || direction.length();
    var headLength = data.headLength || length * .2;
    var headWidth = data.headWidth || headLength * .2;
    var color = new THREE.Color(data.color);
    this.arrow = new THREE.ArrowHelper(direction.normalize(), new THREE.Vector3(), length, color, headLength, headWidth);
    this.el.setObject3D('arrow', this.arrow);
  },
  update: function(oldData) {
    var data = this.data;
    var diff = AFRAME.utils.diff(data, oldData);
    if ('color' in diff) {
      this.arrow.setColor(new THREE.Color(data.color));
    }
    var length;
    if ('direction' in diff) {
      var direction = new THREE.Vector3(data.direction.x, data.direction.y, data.direction.z);
      length = direction.length();
      this.arrow.setDirection(direction.normalize());
    }
    if ('direction' in diff && typeof data.length === 'undefined' || 'length' in diff || 'headLength' in diff || 'headWidth' in diff) {
      length = data.length || length;
      var headLength = data.headLength || length * .2;
      var headWidth = data.headWidth || headLength * .2;
      this.arrow.setLength(length, headLength, headWidth);
    }
  }
});
