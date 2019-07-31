/**
 * @since 2019-02-03 15:26
 * @author vivaxy
 * @see https://developers.google.com/web/updates/2018/03/cssom
 */

const el = document.querySelector('.styled-element');

// Accessing styles
console.log(
  "el.attributeStyleMap.get('margin-top')",
  el.attributeStyleMap.get('margin-top'),
);
el.attributeStyleMap.set('margin-top', CSS.px(2));
el.attributeStyleMap.set('margin-left', '2px');
el.attributeStyleMap.set('display', new CSSKeywordValue('block'));
console.log(
  "el.attributeStyleMap.get('display')",
  el.attributeStyleMap.get('display'),
);

// Computed styles
console.log(
  "el.computedStyleMap().get('padding-top')",
  el.computedStyleMap().get('padding-top'),
);

// Value clamping / rounding
el.attributeStyleMap.set('opacity', 3);
console.log(
  "el.attributeStyleMap.get('opacity')",
  el.attributeStyleMap.get('opacity'),
);
console.log(
  "el.computedStyleMap().get('opacity')",
  el.computedStyleMap().get('opacity'),
);

// CSSStyleValue.parse
console.log(
  "CSSStyleValue.parse('transition-duration', '1s, 2s, 3s')",
  CSSStyleValue.parse('transition-duration', '1s, 2s, 3s'),
);
console.log(
  "CSSStyleValue.parseAll('transition-duration', '1s, 2s, 3s')",
  CSSStyleValue.parseAll('transition-duration', '1s, 2s, 3s'),
);
