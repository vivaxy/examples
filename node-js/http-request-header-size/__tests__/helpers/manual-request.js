const request = require('./request.js');
(async function () {
  try {
    const res = await request({ method: 'POST' });
    console.log('res', res);
  } catch (e) {
    console.log('error', e);
  }
})();
