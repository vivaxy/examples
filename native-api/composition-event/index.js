const inputElement = document.querySelector('.js-input');
const logUlElement = document.querySelector('.js-log-ul');

const map = {};

const log = (e) => {
    map[e.type].innerHTML = 'type: ' + e.type + ', data: ' + e.data + ', locale: ' + e.locale + ', target.value: ' + e.target.value;
};

const initializeLogForEvent = (eventName) => {
    inputElement.addEventListener(eventName, log);
    const logElement = document.createElement('li');
    map[eventName] = logElement;
    logUlElement.appendChild(logElement);
};

initializeLogForEvent('compositionstart');
initializeLogForEvent('compositionupdate');
initializeLogForEvent('compositionend');
initializeLogForEvent('input');
initializeLogForEvent('keydown');
initializeLogForEvent('keyup');
initializeLogForEvent('change');
