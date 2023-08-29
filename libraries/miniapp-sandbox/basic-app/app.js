/**
 * @since 2023-08-29
 * @author vivaxy
 */
function App(appConfig) {
  appConfig.setData = function setData(newData) {
    this.data = { ...this.data, ...newData };
    self.postMessage({
      type: 'data-updated',
      data: this.data,
    });
  };

  self.postMessage({
    type: 'load',
    data: appConfig.data,
  });

  self.addEventListener('message', function (e) {
    if (e.data.type === 'onLoad') {
      appConfig.onLoad();
    } else if (e.data.type === 'dispatch-event') {
      appConfig[e.data.handlerName]();
    }
  });
}

App({
  data: {
    count: 0,
  },
  onLoad() {
    console.log('onLoad');
  },
  handleClick() {
    console.log('handleClick');
    this.setData({
      count: this.data.count + 1,
    });
  },
});
