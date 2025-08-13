import { login } from "./api/login"
App({
  onLaunch: async function (options) {
    login();
  },
  onHide: function () { },
  onError: function (msg) {
    console.log(msg);
  },
  onPageNotFound: function (msg) { },
  onUnhandledRejection: function (res) { },
  globalData: {},
  onShow: function (options) {
    if (options.path == 'pages/index/index' || options.path == 'pages/lottery/index') {
      console.log(options.query, "获取广告来源");
      const adsource = options.query?.adsource;
      if (!adsource) return;

      tt.setStorageSync("adsource", adsource);
    }

    if (options.path == "pages/lottery-detail/index") {
      const data = options.query;

      console.log("app.js -> onShow -> pages/lottery-detail/index", data);

      tt.setStorageSync("detail-share", data);
    } else {
      tt.removeStorageSync("detail-share");
      tt.removeStorageSync("is-show-source");
    }
  }
})
