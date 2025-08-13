Component({
  data: {
    hideHeader: false,
    liveStatus: "",
  },

  methods: {
    hideHeader() {
      this.setData({
        hideHeader: true,
      });
    },
    onPreviewError(err) {
      console.log("preview error", err);
    },
    onPreviewUserPage(res) {
      console.log("onPreviewUserPage", res);
      tt.showToast({
        title: "成功跳转抖音主页",
        icon: "none",
      });
    },
    onPreviewLiveRoom(res) {
      console.log("onPreviewLiveRoom", res);
      tt.showToast({
        title: "成功跳转直播间",
        icon: "none",
      });
    },
    onPreviewLiveStatus(res) {
      console.log("onPreviewLiveStatus", res);
      this.setData({
        liveStatus: res.detail.errMsg ?? "",
      });
    },
  },
});
