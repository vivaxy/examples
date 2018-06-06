/**
 * @since 20180606 17:24
 * @author vivaxy
 */

var dimension = 0.8;
var arrows = null;
var sceneEl = null;
var skyEl = null;

AFRAME.registerComponent('movement-listener', {

  init() {
    this.currentSky = '';
  },

  tick() {

    var position = this.el.getAttribute('position');

    if (position.x > dimension) {
      if (position.z > dimension) {
        this.setImage('#bj1');
      } else if (position.z < -dimension) {
        this.setImage('#bj3');
      } else {
        this.setImage('#bj2');
      }
    } else if (position.x < -dimension) {
      if (position.z > dimension) {
        this.setImage('#bj7');
      } else if (position.z < -dimension) {
        this.setImage('#bj5');
      } else {
        this.setImage('#bj6');
      }
    } else {
      if (position.z > dimension) {
        this.setImage('#bj8');
      } else if (position.z < -dimension) {
        this.setImage('#bj4');
      } else {
        this.setImage('');
      }
    }
  },

  remove() {
    this.currentSky = null;
  },

  setImage(newImage) {
    var _this = this;
    if (newImage === this.currentSky) {
      return;
    }

    var dur = 1000;
    var fadeOutAnimation = { property: 'opacity', from: 1, to: 0, dur: dur };
    skyEl.setAttribute('animation', fadeOutAnimation);

    var newSky = createSky(newImage);

    setTimeout(function () {
      skyEl.parentNode.removeChild(skyEl);
      _this.currentSky = newImage;
      skyEl = newSky;
    }, dur);
  }

});

AFRAME.registerComponent('cursor-listener', {
  init() {

    var _this = this;
    this.cameraEl = document.querySelector('#camera');
    this.cameraPosition = this.cameraEl.getAttribute('position');

    this.el.addEventListener('click', handleClick);
    this.el.addEventListener('mouseenter', handleMouseEnter);
    this.el.addEventListener('mouseleave', handleMouseLeave);

    function handleClick(evt) {
      var diffPos = AFRAME.utils.coordinates.parse(evt.target.dataset.movement);
      moveCamera(diffPos);
      moveArrows(diffPos);
    }

    function handleMouseEnter(e) {
      addAnimation(e.target);
    }

    function handleMouseLeave(e) {
      removeAnimation(e.target);
    }

    var animation = { property: 'scale', from: '1 1 1', to: '1.2 1.2 1.2', loop: true, dir: 'alternate' };

    function addAnimation(el) {
      el.setAttribute('animation', animation);
    }

    function removeAnimation(el) {
      el.removeAttribute('animation');
    }

    function moveArrows(diffPos) {
      var dur = 1000;

      // fadeout arrows
      var fadeoutAnimation = { property: 'opacity', from: 1, to: 0, dur: dur };
      arrows.forEach(function(arrow) {
        arrow.setAttribute('animation', fadeoutAnimation);
      });

      var pos = Object.assign({}, _this.cameraPosition);
      pos.x += diffPos.x;
      pos.y += diffPos.y;
      pos.z += diffPos.z;

      var newArrows = createArrows(pos);
      setTimeout(function() {
        arrows.forEach(function(arrow) {
          arrow.parentNode.removeChild(arrow);
        });
        arrows = newArrows;
      }, dur);
    }

    function moveCamera(diffPos) {
      var nextPosition = Object.assign({}, _this.cameraPosition);
      nextPosition.x += diffPos.x;
      nextPosition.y += diffPos.y;
      nextPosition.z += diffPos.z;
      var dur = 1000;
      var animation = { property: 'position', from: _this.cameraPosition, to: nextPosition, dur: dur };
      _this.cameraEl.setAttribute('animation', animation);
      setTimeout(function() {
        _this.cameraEl.removeAttribute('animation');
        _this.cameraPosition = nextPosition;
      }, dur);
    }
  }

});

AFRAME.registerComponent('ready', {
  init() {
    sceneEl = this.el;
    arrows = createArrows({ x: 0, y: 0, z: 0 });
    skyEl = createSky('');
  }
});

function createArrows(position) {

  var dur = 1000;
  var animation = { property: 'opacity', from: 0, to: 1, dur: dur };
  var arrow1 = document.createElement('a-entity');
  arrow1.setAttribute('mixin', 'cursor');
  arrow1.setAttribute('rotation', '0 0 0');
  arrow1.setAttribute('position', {
    x: -1 + position.x,
    y: -0.3 + position.y,
    z: 0 + position.z
  });
  arrow1.setAttribute('animation', animation);
  arrow1.setAttribute('data-movement', '-1 0 0');
  sceneEl.appendChild(arrow1);

  var arrow2 = document.createElement('a-entity');
  arrow2.setAttribute('mixin', 'cursor');
  arrow2.setAttribute('rotation', '0 90 0');
  arrow2.setAttribute('position', {
    x: 0 + position.x,
    y: -0.3 + position.y,
    z: 1 + position.z
  });
  arrow2.setAttribute('animation', animation);
  arrow2.setAttribute('data-movement', '0 0 1');
  sceneEl.appendChild(arrow2);

  var arrow3 = document.createElement('a-entity');
  arrow3.setAttribute('mixin', 'cursor');
  arrow3.setAttribute('rotation', '0 180 0');
  arrow3.setAttribute('position', {
    x: 1 + position.x,
    y: -0.3 + position.y,
    z: 0 + position.z
  });
  arrow3.setAttribute('animation', animation);
  arrow3.setAttribute('data-movement', '1 0 0');
  sceneEl.appendChild(arrow3);

  var arrow4 = document.createElement('a-entity');
  arrow4.setAttribute('mixin', 'cursor');
  arrow4.setAttribute('rotation', '0 270 0');
  arrow4.setAttribute('position', {
    x: 0 + position.x,
    y: -0.3 + position.y,
    z: -1 + position.z
  });
  arrow4.setAttribute('animation', animation);
  arrow4.setAttribute('data-movement', '0 0 -1');
  sceneEl.appendChild(arrow4);

  setTimeout(function() {
    arrow1.removeAttribute('animation');
    arrow2.removeAttribute('animation');
    arrow3.removeAttribute('animation');
    arrow4.removeAttribute('animation');
  }, dur);

  return [arrow1, arrow2, arrow3, arrow4];
}

function createSky(src) {
  var dur = 1000;
  var skyEl = document.createElement('a-sky');
  if (src) {
    skyEl.setAttribute('src', src);
  }
  var animation = { property: 'opacity', from: 0, to: 1, dur: dur };
  skyEl.setAttribute('animation', animation);
  setTimeout(function () {
    skyEl.removeAttribute('animation');
  }, dur);
  sceneEl.appendChild(skyEl);

  return skyEl;
}
