const mediaQueryListEvent = window.matchMedia('(max-width: 600px)');
logMediaQueryListEvent(mediaQueryListEvent);
mediaQueryListEvent.addEventListener('change', logMediaQueryListEvent);

function logMediaQueryListEvent(e) {
  console.log('e', e);
  console.log('  e.matches', e.matches);
  console.log('  e.media', e.media);
}
