/**
 * @since 2023-05-06
 * @author vivaxy
 */
const shadowDOMRoot = document.getElementById('shadow-dom-root');
const shadow = shadowDOMRoot.attachShadow({ mode: 'closed' });

const shadowDOMContent = document.createElement('p');
shadowDOMContent.classList.add('shadow-dom-content');
shadowDOMContent.classList.add('styles-out-of-shadow-dom');
shadowDOMContent.innerHTML = 'ShadowDOM';

const shadowStyle = document.createElement('style');
shadowStyle.innerHTML = `#root { display: none; } .shadow-dom-content:after { content: ' styles inside shadowDOM' } p { font-size: 24px; }`;

shadow.appendChild(shadowDOMContent);
shadow.appendChild(shadowStyle);
