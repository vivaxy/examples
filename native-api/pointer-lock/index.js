/**
 * @since 2016-02-04 15:59
 * @author vivaxy
 */

const text = document.querySelector('.js-text');

const getCurrentLockElement = () => {
    return document.pointerLockElement;
};

text.addEventListener('click', () => {
    text.requestPointerLock();
});

let rotateY = 0;
let rotateX = 0;

const rotate3D = (event = { movementX: 0, movementY: 0 }) => {
    rotateY = rotateY + event.movementX;
    rotateX = rotateX + event.movementY;
    text.style.transform = 'translate3d(-50%, -50%, 0) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
};

rotate3D();

document.addEventListener('click', () => {
    if (getCurrentLockElement() === text) {
        document.exitPointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    if (getCurrentLockElement() === text) {
        document.addEventListener('mousemove', rotate3D);
    } else {
        document.removeEventListener('mousemove', rotate3D);
    }
});
