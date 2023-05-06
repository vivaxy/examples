/**
 * @since 2023-05-06
 * @author vivaxy
 */
const root = document.getElementById('root');
const shadow = root.attachShadow({ mode: 'closed' });

const shadowDOMContent = document.createElement('p');
shadowDOMContent.classList.add('shadow-dom-content');
shadowDOMContent.innerHTML = 'ShadowDOM';

const shadowStyle = document.createElement('style');
shadowStyle.innerHTML = `.shadow-dom-content:after { content: 'inside styles' }`;

shadow.appendChild(shadowDOMContent);
shadow.appendChild(shadowStyle);
