/**
 * @since 2014/8/29 8:36
 * @author vivaxy
 */
var i = 0;
var data = {};
var timedCount = function () {
  i = i + 1;
  data.timedCount = i;
  //console.log(JSON.stringify(data));
  self.postMessage(JSON.stringify(data));
  setTimeout(timedCount, 500);
};
timedCount();
