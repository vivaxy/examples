/**
 * @since 20180419 14:45
 * @author vivaxy
 */


const fs = require('fs');
const path = require('path');

module.exports = fs.readFileSync(path.join(__dirname, 'googlelogo_color_272x92dp_interlaced_smallest.png'));
