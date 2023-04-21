/**
 * @since 2023-04-21
 * @author vivaxy
 */
const { sdk } = window;
sdk.fn1('message1');
sdk.obj2.fn2('message2');

await import('./sdk.js');
window.sdk.fn1('message3');
window.sdk.obj2.fn2('message4');
