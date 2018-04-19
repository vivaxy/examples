/**
 * @since 20180419 14:38
 * @author vivaxy
 */

const fs = require('fs');
const path = require('path');

module.exports = fs.readFileSync(path.join(__dirname, 'googlelogo_color_272x92dp.png'));
