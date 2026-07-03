const elemenet = document.querySelector('.js-element');

const growKeyframes = [{ transform: 'none' }, { transform: 'scale(2)' }];

const alteredGrowOptions = {
  duration: 3000,
  iterations: Infinity,
  direction: 'alternate',
  delay: 0,
};

const myAnimation = elemenet.animate(growKeyframes, alteredGrowOptions);

//
myAnimation.pause();
myAnimation.play();
