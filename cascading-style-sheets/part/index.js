/**
 * @since 2023-05-06
 * @author vivaxy
 */
const root = document.getElementById('root');
const shadow = root.attachShadow({ mode: 'closed' });

const shadowContent = document.createElement('p');
shadowContent.part.add('shadow-content');
shadowContent.innerHTML = 'Shadow content.';

shadow.appendChild(shadowContent);
