/**
 * @since 2017-03-19 10:39:07
 * @author vivaxy
 * @see https://css-tricks.com/minecraft-webvr-html-using-frame/
 */

/**
 * Spawn entity at the intersection point on click, given the properties passed.
 *
 * `<a-entity intersection-spawn="mixin: box; material.color: red">` will spawn
 * `<a-entity mixin="box" material="color: red">` at intersection point.
 */

AFRAME.registerComponent('intersection-spawn', {
  schema: {
    default: '',
    parse: AFRAME.utils.styleParser.parse,
  },

  init: function () {
    var data = this.data;
    var el = this.el;

    el.addEventListener(data.event, function (evt) {
      // Create element.
      var spawnEl = document.createElement('a-entity');

      // Snap intersection point to grid and offset from center.
      spawnEl.setAttribute('position', evt.detail.intersection.point);

      // Set components and properties.
      Object.keys(data).forEach(function (name) {
        if (name === 'event') {
          return;
        }
        AFRAME.utils.entity.setComponentProperty(spawnEl, name, data[name]);
      });

      // Append to scene.
      el.sceneEl.appendChild(spawnEl);
    });
  },
});
