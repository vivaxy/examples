/**
 * @since 2021-09-08
 * @author vivaxy
 */
const $css = document.querySelector('#css');

// function camelCase(str) {
//   return str.replace(/(-)\w/g, function (found) {
//     return found.slice(-1).toUpperCase();
//   });
// }

const STATE_VALUES = {
  DISABLED: -1,
  UNCHECKED: 0,
  CHECKED: 1,
};

class CSS {
  constructor($container) {
    this.state = {
      h1: {
        'margin: 0 0': STATE_VALUES.DISABLED,
        'margin: 21.44px 0': STATE_VALUES.UNCHECKED,
      },
      tr: {
        'background: #ff0': STATE_VALUES.DISABLED,
        'background: #f00': STATE_VALUES.UNCHECKED,
        'display: block': STATE_VALUES.CHECKED,
        'border-collapse: collapse': STATE_VALUES.CHECKED,
      },
      td: {
        'width: 100px': STATE_VALUES.DISABLED,
        'height: 100px': STATE_VALUES.DISABLED,
        'background: #099': STATE_VALUES.DISABLED,
        'border: 1px solid #999': STATE_VALUES.CHECKED,
        'padding: 1px': STATE_VALUES.UNCHECKED,
        'background-clip: padding-box': STATE_VALUES.CHECKED,
      },
    };

    this.$container = $container;
  }

  toggleStyle(selector, style) {
    this.state[selector][style] =
      this.state[selector][style] === STATE_VALUES.CHECKED
        ? STATE_VALUES.UNCHECKED
        : STATE_VALUES.CHECKED;
  }

  render() {
    this.renderDemo();
    this.renderStyles();
  }

  renderDemo() {
    Object.keys(this.state).forEach((selector) => {
      const $ele = document.querySelector(selector);

      const resultStyle = {};

      Object.keys(this.state[selector]).forEach((style) => {
        const [key, value] = style.split(': ');

        if (
          this.state[selector][style] === STATE_VALUES.CHECKED ||
          this.state[selector][style] === STATE_VALUES.DISABLED
        ) {
          resultStyle[key] = value;
        } else {
          if (!(key in resultStyle)) {
            // clear existing style
            resultStyle[key] = '';
          }
        }
      });

      Object.keys(resultStyle).forEach(function (key) {
        $ele.style[key] = resultStyle[key];
      });
    });
  }

  renderStyles() {
    const { $container, state } = this;
    $container.innerHTML = '';

    Object.keys(state).forEach((selector) => {
      const $selector = document.createElement('div');

      const $intro = document.createElement('div');
      $intro.textContent = `${selector} {`;
      $selector.appendChild($intro);

      Object.keys(state[selector]).forEach((style) => {
        const $style = this.renderStyle(
          selector,
          style,
          this.state[selector][style],
        );

        $selector.appendChild($style);
      });

      const $outro = document.createElement('div');
      $outro.textContent = `}`;
      $selector.appendChild($outro);

      $container.appendChild($selector);
    });
  }

  renderStyle(selector, style, stateValue) {
    const $checkbox = document.createElement('input');
    $checkbox.type = 'checkbox';
    $checkbox.checked = stateValue !== STATE_VALUES.UNCHECKED;
    $checkbox.disabled = stateValue === STATE_VALUES.DISABLED;
    $checkbox.addEventListener('change', () => {
      this.toggleStyle(selector, style);
      this.render();
    });

    const $styleText = document.createElement('span');
    $styleText.textContent = style;

    const $style = document.createElement('div');
    $style.appendChild($checkbox);
    $style.appendChild($styleText);

    return $style;
  }
}

const css = new CSS($css);
css.render();
