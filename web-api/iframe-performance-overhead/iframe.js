const root = document.getElementById('root');
for (let i = 0; i < 1e4; i++) {
  const div = document.createElement('div');
  div.innerHTML = i;
  root.appendChild(div);
}
