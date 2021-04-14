/**
 * @since 150115 11:19
 * @author vivaxy
 */
var theConsole = document.querySelector('.console');
var log = function (text) {
  theConsole.innerHTML += text + '<br>';
};
// 需要分享的内容，请放到ready里
WeixinApi.ready(function (Api) {
  // 微信分享的数据
  var wxData = {
    appId: '', // 服务号可以填写appId
    imgUrl: 'http://vivaxy.github.io/vivaxy.png',
    link: location.href,
    desc: '微信分享的描述',
    title: '微信分享的标题',
  };
  // 分享的回调
  var wxCallbacks = {
    // 收藏操作是否触发回调，默认是开启的
    favorite: false,
    // 用async模式，表示每次分享之前，都需要更新分享内容
    async: true,
    // 分享操作开始之前
    ready: function () {
      // 你可以在这里对分享的数据进行动态修改：*可以只修改某些字段*
      log('准备分享');
      // 下面我们只修改标题和图片地址
      this.dataLoaded({
        desc: '修改后微信分享的描述',
        title: '修改后微信分享的标题',
      });
    },
    // 分享被用户自动取消
    cancel: function (resp) {
      // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
      log('分享被取消，msg=' + resp.err_msg);
    },
    // 分享失败了
    fail: function (resp) {
      // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
      log('分享失败，msg=' + resp.err_msg);
    },
    // 分享成功
    confirm: function (resp) {
      // 分享成功了，我们是不是可以做一些分享统计呢？
      log('分享成功，msg=' + resp.err_msg);
    },
    // 整个分享过程结束
    all: function (resp, shareTo) {
      // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
      log(
        '分享' + (shareTo ? '到' + shareTo : '') + '结束，msg=' + resp.err_msg,
      );
    },
  };
  // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
  Api.shareToFriend(wxData, wxCallbacks);
  // 点击分享到朋友圈，会执行下面这个代码
  Api.shareToTimeline(wxData, wxCallbacks);
  // iOS上，可以直接调用这个API进行分享，一句话搞定
  Api.generalShare(wxData, wxCallbacks);

  log('分享就绪');
});
