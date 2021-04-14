/**
 * @since 150109 10:16
 * @author vivaxy
 */
var consoleDIV = document.querySelector('.console');
if (location.href.indexOf('product=dpapp') >= 0) {
  consoleDIV.innerHTML += '是点评客户端\n';
  var shareData = {
    title: '大众点评分享标题 by vivaxy',
    desc: '大众点评分享内容 by vivaxy',
    url: location.href,
    image: 'http://vivaxy.github.io/vivaxy.png',
  };
  var iframe = document.createElement('iframe');
  var frameContainer = document.createElement('div');
  frameContainer.style.display = 'none';
  var shareConfig =
    'dpshare://_?content=' + encodeURIComponent(JSON.stringify(shareData));
  frameContainer.appendChild(iframe);
  document.body.appendChild(frameContainer);
  iframe.setAttribute('src', shareConfig);

  document.querySelector('button').addEventListener('click', function () {
    location.href =
      'js://_?method=share&args=' +
      encodeURIComponent(JSON.stringify(shareData));
  });
} else {
  consoleDIV.innerHTML += '不是点评客户端\n';
}
