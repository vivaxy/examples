source ~/.bashrc
nvm use 12
node --expose-gc --max-heap-size=100 oom.js
