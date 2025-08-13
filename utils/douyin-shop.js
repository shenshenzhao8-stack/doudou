const plugin = tt.requirePlugin("tt95aee3130ae1cbe911");

// 跳转商品详情
export const openGood = (id) => {
  return new Promise((resolve, reject) => {
    plugin.openEcGood({
      promotionId: id,
      success(res) {
        resolve(res);
      },
      fail(res) {
        reject(res)
      }
    })
  })
};

// 跳转店铺首页
export const openEcShop = (id) => {
  // 5893575
  return new Promise((resolve, reject) => {
    plugin.openEcShop({
      shopId: id,
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        // tt.showToast({
        //   title: res.errMsg,
        //   duration: 1500,
        //   icon: 'fail'

        // })
        reject(res)
      }
    })
  })
};

//  跳转H5
export const openEcPage = (url) => {
  plugin.openEcPage({
    // schema: "sslocal://webcast_webview?disable_host_jsb_method=1&disable_thread_spread=1&hide_nav_bar=1&should_full_screen=1&trans_status_bar=1&url=https%3A%2F%2Flf-ecom-gr-sourcecdn.bytegecko.com%2Fobj%2Fbyte-gurd-source-gr%2Fecom%2Fmix%2Foffline%2Fmix_page%2Findex.html%3F__live_platform__%3Dwebcast%26_pia_%3D1%26allowMediaAutoPlay%3D1%26enter_from%3Dlivestream-test%26hide_nav_bar%3D1%26hide_system_video_poster%3D1%26id%3D7509697167125119282%26origin_type%3Dlivestream-test%26pia_mixrender%3D1%26should_full_screen%3D1%26trans_status_bar%3D1%26ttwebview_extension_mixrender%3D1%26web_bg_color%3D%2523F5F6F9&web_bg_color=%23ffF5F6F9",
    schema: url,
    success(res) {
      console.log("打开成功", res);
    },
    fail(err) {
      console.log("打开失败", err);
      tt.showToast({
        title: res.errMsg,
        duration: 1500,
        icon: 'fail'
      });
    },
  });
};

//  上新剧透

export const openNewSpoilersAvailable = () => {
  plugin.openEcPage({
    schema: 'sslocal://webcast_webview?disable_host_jsb_method=1&disable_thread_spread=1&hide_nav_bar=1&should_full_screen=1&trans_status_bar=1&url=https%3A%2F%2Flf-ecom-gr-sourcecdn.bytegecko.com%2Fobj%2Fbyte-gurd-source-gr%2Fecom%2Fmix%2Foffline%2Fmix_page%2Findex.html%3F__live_platform__%3Dwebcast%26_pia_%3D1%26allowMediaAutoPlay%3D1%26enter_from%3Dxiaoxiyebanner%26hide_nav_bar%3D1%26hide_system_video_poster%3D1%26id%3D7522318762822140206%26origin_type%3Dxiaoxiyebanner%26pia_mixrender%3D1%26should_full_screen%3D1%26trans_status_bar%3D1%26ttwebview_extension_mixrender%3D1%26web_bg_color%3D%2523FBFBFA&web_bg_color=%23ffFBFBFA',
    success(res) {
      console.log("打开成功", res);
    },
    fail(err) {
      console.log("打开失败", err);
      tt.showToast({
        title: res.errMsg,
        duration: 1500,
        icon: 'fail'
      });
    },
  });
};

//  上新直播
export const openNewLive = () => {
  plugin.openEcPage({
    schema: 'sslocal://webcast_webview?disable_host_jsb_method=1&disable_thread_spread=1&hide_nav_bar=1&should_full_screen=1&trans_status_bar=1&url=https%3A%2F%2Flf-ecom-gr-sourcecdn.bytegecko.com%2Fobj%2Fbyte-gurd-source-gr%2Fecom%2Fmix%2Foffline%2Fmix_page%2Findex.html%3F__live_platform__%3Dwebcast%26_pia_%3D1%26allowMediaAutoPlay%3D1%26enter_from%3Dzhibojianbanner%26hide_nav_bar%3D1%26hide_system_video_poster%3D1%26id%3D7522385416067121459%26origin_type%3Dzhibojianbanner%26pia_mixrender%3D1%26should_full_screen%3D1%26trans_status_bar%3D1%26ttwebview_extension_mixrender%3D1%26web_bg_color%3D%2523FBFBFA&web_bg_color=%23ffFBFBFA',
   // schema: 'sslocal://webcast_room?user_id=3021070635112467',
    success(res) {
      console.log("打开成功", res);
    },
    fail(err) {
      console.log("打开失败", err);
      tt.showToast({
        title: res.errMsg,
        duration: 1500,
        icon: 'fail'
      });
    },
  });
};
//  新奇榜单
export const openNoveltyRanking = () => {
  plugin.openEcPage({
    schema: 'sslocal://webcast_webview?type=fullscreen&url=https%3A%2F%2Fwebcast.amemv.com%2Fmagic%2Feco%2Fruntime%2Frelease%2F67b75779a7f21206e4bd9e8b%3Fshould_full_screen%3D1%26show_back%3D0%26hide_nav_bar%3D1%26hide_status_bar%3D1%26auto_play_bgm%3D1%26web_bg_color%3D%2523FFBFF4FF%26loader_name%3Dforest%26disable_all_bounces%3D1%26delay_preload%3D1%26mix_container_type%3Dannie%26bdhm_bid%3Dmagic_eco%26bdhm_pid%3D67b75779a7f21206e4bd9e8b%26__live_platform__%3Dwebcast%26appType%3Dwebcast%26magic_page_no%3D1%26magic_source%3Dmp_default%26activity%3D67ac3c785b37300e1a4b35b3',
    success(res) {
      console.log("打开成功", res);
    },
    fail(err) {
      console.log("打开失败", err);
      tt.showToast({
        title: res.errMsg,
        duration: 1500,
        icon: 'fail'
      });
    },
  });
};