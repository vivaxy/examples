/******/ (function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/ var installedModules = {}; // The require function

  /******/ /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId])
      /******/ return installedModules[moduleId].exports; // Create a new module (and put it into the cache)

    /******/ /******/ var module = (installedModules[moduleId] = {
      /******/ exports: {},
      /******/ id: moduleId,
      /******/ loaded: false,
      /******/
    }); // Execute the module function

    /******/ /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__,
    ); // Flag the module as loaded

    /******/ /******/ module.loaded = true; // Return the exports of the module

    /******/ /******/ return module.exports;
    /******/
  } // expose the modules object (__webpack_modules__)

  /******/ /******/ __webpack_require__.m = modules; // expose the module cache

  /******/ /******/ __webpack_require__.c = installedModules; // __webpack_public_path__

  /******/ /******/ __webpack_require__.p = ''; // Load entry module and return exports

  /******/ /******/ return __webpack_require__(0);
  /******/
})(
  /************************************************************************/
  /******/ [
    /* 0 */
    /***/ function (module, exports) {
      /* global AFRAME, THREE */
      var bind = AFRAME.utils.bind;

      if (typeof AFRAME === 'undefined') {
        throw new Error(
          'Component attempted to register before AFRAME was available.',
        );
      }

      var EVENTS = {
        CLICK: 'click',
        MOUSEENTER: 'mouseenter',
        MOUSEDOWN: 'mousedown',
        MOUSELEAVE: 'mouseleave',
        MOUSEUP: 'mouseup',
      };

      var STATES = {
        HOVERING: 'cursor-hovering',
        HOVERED: 'cursor-hovered',
      };

      /**
       * Controller cursor component.
       *
       * @member {Element} triggerDownEl - Entity that was last clicked.
       * @member {object} intersection - Attributes of the current intersection event, including
       *         3D- and 2D-space coordinates. See: http://threejs.org/docs/api/core/Raycaster.html
       * @member {Element} intersectedEl - Currently-intersected entity. Used to keep track to
       *         emit events when unintersecting.
       */
      AFRAME.registerComponent('controller-cursor', {
        dependencies: ['raycaster'],

        schema: {
          color: { default: '#74BEC1' },
          downEvents: { default: ['triggerdown'] },
          radius: { default: 0.001 },
          upEvents: { default: ['triggerup'] },
        },

        init: function () {
          var cursorEl = this.el;
          var data = this.data;
          this.triggerDownEl = null;
          this.intersection = null;
          this.intersectedEl = null;

          // Wait for canvas to load.
          var canvas = cursorEl.sceneEl.canvas;
          if (!canvas) {
            cursorEl.sceneEl.addEventListener(
              'render-target-loaded',
              bind(this.init, this),
            );
            return;
          }

          // Prevent laser from interfering with raycaster by setting near property
          cursorEl.setAttribute('raycaster', { near: 0.03 });

          // Create laser beam.
          var raycasterLength = cursorEl.getAttribute('raycaster').far;
          var laserLength =
            raycasterLength === Infinity ? 1000 : raycasterLength;

          var cursorGeometry = new THREE.CylinderBufferGeometry(
            data.radius,
            data.radius,
            laserLength,
            32,
          );
          var cursorMaterial = new THREE.MeshBasicMaterial({
            color: data.color,
          });
          var cursorMesh = new THREE.Mesh(cursorGeometry, cursorMaterial);
          // Move mesh so beam starts at tip of controller model.
          cursorMesh.position.z = (-1 * laserLength) / 2;
          // Rotate mesh to point directly away from controller model.
          cursorMesh.rotation.x = 90 * (Math.PI / 180);
          cursorEl.setObject3D('cursormesh', cursorMesh);

          // Bind methods.
          this.onIntersectionBind = bind(this.onIntersection, this);
          this.onIntersectionClearedBind = bind(
            this.onIntersectionCleared,
            this,
          );
          this.onTriggerDownBind = bind(this.onTriggerDown, this);
          this.onTriggerUpBind = bind(this.onTriggerUp, this);
        },

        /**
         * Add event listeners.
         */
        play: function () {
          var cursorEl = this.el;
          var data = this.data;
          var self = this;

          cursorEl.addEventListener(
            'raycaster-intersection',
            this.onIntersectionBind,
          );
          cursorEl.addEventListener(
            'raycaster-intersection-cleared',
            this.onIntersectionClearedBind,
          );

          data.downEvents.forEach(function (downEvent) {
            cursorEl.addEventListener(downEvent, self.onTriggerDownBind);
          });
          data.upEvents.forEach(function (upEvent) {
            cursorEl.addEventListener(upEvent, self.onTriggerUpBind);
          });
        },

        /**
         * Remove event listeners.
         */
        pause: function () {
          var cursorEl = this.el;
          var data = this.data;
          var self = this;
          cursorEl.removeEventListener(
            'raycaster-intersection',
            this.onIntersectionBind,
          );
          cursorEl.removeEventListener(
            'raycaster-intersection-cleared',
            this.onIntersectionClearedBind,
          );

          data.downEvents.forEach(function (downEvent) {
            cursorEl.removeEventListener(downEvent, self.onTriggerDownBind);
          });
          data.upEvents.forEach(function (upEvent) {
            cursorEl.removeEventListener(upEvent, self.onTriggerUpBind);
          });
        },

        /**
         * Remove mesh.
         */
        remove: function () {
          var cursorEl = this.el;
          cursorEl.removeObject3D('cursormesh');
        },

        /**
         * Trigger mousedown and keep track of the mousedowned entity.
         */
        onTriggerDown: function (evt) {
          this.twoWayEmit(EVENTS.MOUSEDOWN);
          this.triggerDownEl = this.intersectedEl;
        },

        /**
         * Trigger mouseup if:
         * - Currently intersecting an entity.
         * - Currently-intersected entity is the same as the one when mousedown was triggered,
         *   in case user mousedowned one entity, dragged to another, and mouseupped.
         */
        onTriggerUp: function (evt) {
          this.twoWayEmit(EVENTS.MOUSEUP);
          if (
            !this.intersectedEl ||
            this.triggerDownEl !== this.intersectedEl
          ) {
            return;
          }
          this.twoWayEmit(EVENTS.CLICK);
        },

        /**
         * Handle intersection.
         */
        onIntersection: function (evt) {
          var self = this;
          var cursorEl = this.el;
          var index;
          var intersectedEl;
          var intersection;

          // Select closest object, excluding the cursor.
          index = evt.detail.els[0] === cursorEl ? 1 : 0;
          intersection = evt.detail.intersections[index];
          intersectedEl = evt.detail.els[index];

          // If cursor is the only intersected object, ignore the event.
          if (!intersectedEl) {
            return;
          }

          // Already intersecting this entity.
          if (this.intersectedEl === intersectedEl) {
            this.intersection = intersection;
            return;
          }

          // Unset current intersection.
          if (this.intersectedEl) {
            this.clearCurrentIntersection();
          }

          // Set new intersection.
          this.intersection = intersection;
          this.intersectedEl = intersectedEl;

          // Hovering.
          cursorEl.addState(STATES.HOVERING);
          intersectedEl.addState(STATES.HOVERED);
          self.twoWayEmit(EVENTS.MOUSEENTER);
        },

        /**
         * Handle intersection cleared.
         */
        onIntersectionCleared: function (evt) {
          var cursorEl = this.el;
          var intersectedEl = evt.detail.el;

          // Ignore the cursor.
          if (cursorEl === intersectedEl) {
            return;
          }

          // Ignore if the event didn't occur on the current intersection.
          if (intersectedEl !== this.intersectedEl) {
            return;
          }

          this.clearCurrentIntersection();
        },

        clearCurrentIntersection: function () {
          var cursorEl = this.el;

          // No longer hovering.
          this.intersectedEl.removeState(STATES.HOVERED);
          cursorEl.removeState(STATES.HOVERING);
          this.twoWayEmit(EVENTS.MOUSELEAVE);

          // Unset intersected entity (after emitting the event).
          this.intersection = null;
          this.intersectedEl = null;
        },

        /**
         * Helper to emit on both the cursor and the intersected entity (if exists).
         */
        twoWayEmit: function (evtName) {
          var el = this.el;
          var intersectedEl = this.intersectedEl;
          var intersection = this.intersection;
          el.emit(evtName, {
            intersectedEl: intersectedEl,
            intersection: intersection,
          });
          if (!intersectedEl) {
            return;
          }
          intersectedEl.emit(evtName, {
            cursorEl: el,
            intersection: intersection,
          });
        },
      });

      /***/
    },
    /******/
  ],
);
