/**
 * @since 2019-04-09 14:11
 * @author vivaxy
 */

const intersectionObserverOptions = {
  rootMargin: '0px',
  threshold: [0, 0.25, 0.5, 0.75, 1],
};

const observer = new IntersectionObserver(
  intersectionObserverCallback,
  intersectionObserverOptions,
);

const toBeObservedElement = document.querySelector('.to-be-observed');
const toggleDisplayButton = document.querySelector('.js-toggle-display');
const toggleTransformButton = document.querySelector('.js-toggle-transform');
observer.observe(toBeObservedElement);

toggleDisplayButton.addEventListener('click', toggleDisplay);
toggleTransformButton.addEventListener('click', toggleTransform);

function intersectionObserverCallback(entries, observer) {
  window.requestIdleCallback(() => {
    entries.forEach((entry) => {
      console.log(entry);
    });
  });
}

function toggleDisplay() {
  toBeObservedElement.style.display =
    toBeObservedElement.style.display === 'none' ? '' : 'none';
}

function toggleTransform() {
  toBeObservedElement.style.transform =
    toBeObservedElement.style.transform === 'translateX(-100px)'
      ? ''
      : 'translateX(-100px)';
}
