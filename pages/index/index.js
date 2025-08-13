import {
  getBannerList,
  getTabs,
  getShopList,
  recordDailyPopup,
} from "../../api/index";
import { checkFirstVisitToday } from "../../utils/date";
import {
  openNewSpoilersAvailable,
  openNewLive,
  openNoveltyRanking,
} from "../../utils/douyin-shop";
import { ossImageUrl } from "../../utils/imagsUrl";

Page({
  data: {
    noShopTips: false,
    internalVisible: false,
    coverShow: false,
    showPrivacy: false,
    awemeId: "1178956297",
    currentIndex: 0,
    ads: [],
    product_items: [],
    source: "index",
    hideHeader: false,
    sortList: [
      {
        title: "上新日历",
        icon: ossImageUrl + "/ad1_1.gif",
        gif: ossImageUrl + "/ad1.gif",
        url: "../calendar/calendar",
      },
      {
        title: "上新剧透",
        icon: ossImageUrl + "/ad2_2.gif",
        gif: ossImageUrl + "/ad2.gif",
      },

      {
        title: "上新直播",
        icon: ossImageUrl + "/ad3_3.gif",
        gif: ossImageUrl + "/ad3.gif",
      },
      {
        title: "新奇榜单",
        icon: ossImageUrl + "/ad4_4.gif",
        gif: ossImageUrl + "/ad4.gif",
      },
    ],
    bannerList: [],
    imgUrl: ossImageUrl,
    tabList: [],
    grantPermissions: [],
    errMsg: "",
    pagination: {
      page: 1,
      tab_id: null,
      limit: 10,
      total: 0,
    },
    adTimer: null,
    animation: "",
    isLoading: false,
    hasMore: true,
    dislogShow: [],
    leftIconKeys: [],
    leftIconInfo: {},
    capsuleKeys: [],
    capsuleInfo: {},
    customNavigation: {},
    tabName: "首发上新",
    showBannnerDefault: false,
    pageInTime: "",
    current: 0,
    pagePV: null,
  },
  switchTab(e) {
    if (e.detail.id === this.data.pagination.tab_id) return;
    this.setData({
      "pagination.tab_id": e.detail.id,
      "pagination.page": 1,
      current: e.detail.index,
      hasMore: true,
      tabName: this.data.tabList[e.detail.index].title,
      noShopTips: false,
    });
    tt.reportAnalytics("home_tab_click", {
      name: this.data.tabList[e.detail.index].title,
      page: "home",
    });

    tt.reportAnalytics('home_page_click', {
      banner_id: "",
      banner_name: "",
      banner_content: "",
      good_name: '',
      good_id: "",
      user_id: tt.getStorageSync("OPENID"),
      module_type: this.data.tabList[e.detail.index].title
    });

    this.shopData(() => {
      this.setData({
        product_items: [],
      });
    });
  },
  jumpAd(e) {
    const index = e.currentTarget.dataset.index;
    const name = e.currentTarget.dataset.name;

    console.log(e, "jumpAd");
    if (index === 0) {
      tt.navigateTo({
        url: "../calendar/calendar",
      });

      this.reportAnalytics("上新日历");
    }
    if (index === 1) {
      this.reportAnalytics("上新剧透");
      openNewSpoilersAvailable();
    }
    if (index === 2) {
      this.reportAnalytics("上新直播");
      openNewLive();
    }
    if (index === 3) {
      this.reportAnalytics("新奇榜单");
      openNoveltyRanking();
    }
  },

  reportAnalytics(module_type) {
    tt.reportAnalytics("home_new_ad_click", {
      page: "home",
      name: module_type,
    });

    tt.reportAnalytics('home_page_click', {
      banner_id: '',
      banner_name: "",
      banner_content: "",
      good_name: '',
      good_id: "",
      user_id: tt.getStorageSync("OPENID"),
      module_type: module_type
    });

    // 金刚位汇总埋点
    tt.reportAnalytics("home_position_click", {
      icon_type: module_type,
      user_id : tt.getStorageSync("OPENID"),
    });
  },

  handlDoudou() {
    tt.reportAnalytics("home_doudou_click", {
      name: "doudou",
      page: "home",
    });

    tt.reportAnalytics('home_page_click', {
      banner_id: "",
      banner_name: "",
      banner_content: "",
      good_name: '',
      good_id: "",
      user_id: tt.getStorageSync("OPENID"),
      module_type: "抖抖浮层点击"
    });

    tt.navigateTo({
      url: "../dou/dou",
    });
  },
  getCustomButtonInfo() {
    if (tt.canIUse("getCustomButtonBoundingClientRect")) {
      try {
        let res = tt.getCustomButtonBoundingClientRect();
        this.setData({
          leftIconInfo: res.leftIcon,
          leftIconKeys: Object.keys(res.leftIcon),
          capsuleInfo: res.capsule,
          customNavigation: res.customNavigation,
          capsuleKeys: Object.keys(res.capsule),
        });
      } catch (error) {
        // getCustomButtonBoundingClientRect只适用于自定义导航栏
        // 非自定义（默认）导航栏调用将抛出错误
        console.log(error);
      }
    } else {
      tt.showModal({
        title: "提示",
        content:
          "当前客户端版本过低，无法使用该功能，请升级客户端或关闭后重启更新。",
      });
    }
  },

  async onLoad() {
    this.getCustomButtonInfo();
    const isFirstVisit = checkFirstVisitToday("home");
    if (isFirstVisit) {
      tt.reportAnalytics("home_page_uv", {
        page: "home",
        user_id: tt.getStorageSync("OPENID"),
      });
    }
    this.setData({
      pageInTime: new Date().getTime(),
    });

    this.loadPageData();
    this.data.adTimer = setInterval(() => {
      if (this.data.currentIndex === this.data.sortList.length) {
        this.setData({
          currentIndex: 0,
        });
      } else {
        this.setData({
          currentIndex: this.data.currentIndex + 1,
        });
      }
    }, 2000);
    recordDailyPopup({
      type: [1, 2],
    }).then((res) => {
      if (res.code === 200) {
        res.data.show.map((item, index) => {
          if (item === true) {
            this.setData({
              dislogShow: res.data.show,
              internalVisible: true,
            });
          }
        });
        if (this.data.dislogShow[0] === true) {
          tt.reportAnalytics("Home_UserAuth_Popup_PV", {
            page: "home",
          });
        }
        if (this.data.dislogShow[1] === true) {
          tt.reportAnalytics("Home_HotProd_Popup_PV", {
            page: "home",
          });
        }
      }
    });
  },
  async onReady() { },
  async loadPageData() {
    try {
      const [bannerRes, tabsRes] = await Promise.all([
        getBannerList({ position: 1 }),
        getTabs({ position_id: "1" }),
      ]);

      const updates = {};
      if (bannerRes.code === 200 && bannerRes.data.items.length > 0) {
        updates.bannerList = bannerRes.data.items;
      } else {
        this.setData({
          showBannnerDefault: true,
        });
      }

      if (tabsRes.code === 200 && tabsRes.data.length > 0) {
        updates.tabList = tabsRes.data;
        // 只在 tabId 没有设置时才设置为第一个 tab
        if (!this.data.pagination.tab_id) {
          updates["pagination.tab_id"] = tabsRes.data[0].id;
        }
      }

      this.setData(updates);

      // 用当前 tabId 拉取数据
      const tabId = this.data.pagination.tab_id || updates["pagination.tab_id"];
      if (tabId) {
        await this.shopData();
      }
    } catch (error) {
      console.error("Failed to load page data", error);
      tt.showToast({ title: "数据加载失败", icon: "none" });
    }
  },

  async shopData(callError) {
    try {
      const res = await getShopList(this.data.pagination);
      if (res.code === 200 && res.data?.product_items) {
        res.data.product_items.map((item) => {
          if (item?.cms_white_back_ground_pic) {
            item.imageUrl = item.cms_white_back_ground_pic;
          } else if (item?.white_back_ground_pic) {
            item.imageUrl = item.white_back_ground_pic;
          } else if (item.image_url) {
            item.imageUrl = item.image_url;
          } else {
            item.imageUrl = "";
          }
          let priceFen = Number(item.price) || 0;
          let priceYuan = priceFen / 100; // 先转为元

          // 根据是否有小数来决定显示格式
          if (priceYuan % 1 === 0) {
            // 整数，如 2000分 = 20元
            item.priceArr = [priceYuan.toString(), ""];
          } else {
            // 有小数，最多保留两位
            let priceStr = priceYuan.toFixed(2);
            // 去掉末尾的0，如 19.50 -> 19.5
            priceStr = priceStr.replace(/\.?0+$/, "");
            item.priceArr = priceStr.split(".");
            // 如果只有一位小数，确保数组长度为2
            if (item.priceArr.length === 1) {
              item.priceArr.push("");
            }
          }
        });

        const newItems = res.data.product_items;
        const hasMore = newItems.length >= this.data.pagination.limit;
        this.setData({
          ads: res.data.ads,
          product_items:
            this.data.pagination.page === 1
              ? newItems
              : [...this.data.product_items, ...newItems],
          hasMore,
        });
        if (
          this.data.product_items.length === 0 &&
          this.data.ads.length === 0
        ) {
          this.setData({
            noShopTips: true,
          });
        }
        setTimeout(() => {
          tt.stopPullDownRefresh();
        }, 1000);
      }
    } catch (error) {
      callError && callError();
      console.error("Failed to get shop data", error);
      tt.showToast({ title: "获取商品失败", icon: "none" });
    } finally {
    }
  },

  handleTap() {
    console.log(this.data.dislogShow, "this.data.dislogShow");
    if (this.data.dislogShow[0]) {
      tt.reportAnalytics("close_UserAuth_Click", {
        page: "home",
      });


      tt.reportAnalytics('home_page_click', {
        banner_id: "",
        banner_name: "",
        banner_content: "",
        good_name: '',
        good_id: "",
        user_id: tt.getStorageSync("OPENID"),
        module_type: "0元抽弹框中关闭按钮点击"
      });
    }

    if (this.data.dislogShow[1]) {
      tt.reportAnalytics("close_HotProd_Click", {
        page: "home",
      });

      tt.reportAnalytics('home_page_click', {
        banner_id: "",
        banner_name: "",
        banner_content: "",
        good_name: '',
        good_id: "",
        user_id: tt.getStorageSync("OPENID"),
        module_type: "去看看尖货抽签结果关闭按钮点击"
      });
    }
    this.setData({
      internalVisible: false,
    });
  },
  handldrawlots() {
    if (this.data.dislogShow[0]) {
      tt.reportAnalytics("X_CNY_UserAuth_Click", {
        page: "home",
      });

      tt.reportAnalytics('home_page_click', {
        banner_id: "",
        banner_name: "",
        banner_content: "",
        good_name: '',
        good_id: "",
        user_id: tt.getStorageSync("OPENID"),
        module_type: "0元抽弹框中0元抽按钮点击"
      });
    }
    if (this.data.dislogShow[1]) {
      tt.setStorageSync("form", "index");
      tt.reportAnalytics("look_HotProd_result_Click", {
        page: "home",
      });

      tt.reportAnalytics('home_page_click', {
        banner_id: "",
        banner_name: "",
        banner_content: "",
        good_name: '',
        good_id: "",
        user_id: tt.getStorageSync("OPENID"),
        module_type: "去看看尖货抽签结果按钮点击"
      });
    }
    this.setData({
      internalVisible: false,
    });
    tt.switchTab({
      url: "/pages/lottery/index",
      success: (res) => { },
      fail: (res) => { },
    });
  },
  handleGoods(e) {
    if (this.data.tabName === "首发上新") {
      console.log('e.detail', e.detail);
      tt.reportAnalytics("home_first_launch_click", {
        shop_id: e.detail.id,
        page: "home",
        section: this.data.tabName,
        goods_name: e.detail.title,
      });
    } else {
      tt.reportAnalytics("home_goods_card_click", {
        shop_id: e.detail.id,
        page: "home",
        section: this.data.tabName,
        goods_name: e.detail.title,
      });
    }

    tt.reportAnalytics('home_page_click', {
      banner_id: "",
      banner_name: "",
      banner_content: "",
      good_name: e.detail.title,
      good_id: e.detail.id,
      user_id: tt.getStorageSync("OPENID"),
      module_type: this.data.tabName == '首发上新' ? '首发上新feed商品卡点击' : '新奇好物feed商品卡点击',
    });
  },
  handleAdGoods(e) {
    if (this.data.tabName === "首发上新") {
      tt.reportAnalytics("home_card_click", {
        name: e.detail.item.title,
        cardOne: this.data.tabName,
        page: "home",
      });
    } else {
      tt.reportAnalytics("home_tab_novel_goods_card1_click", {
        name: e.detail.item.title,
        cardOne: this.data.tabName,
        page: "home",
      });
    }

    tt.reportAnalytics('home_page_click', {
      banner_id: "",
      banner_name: "",
      banner_content: "",
      good_name: e.detail.item.title,
      good_id: e.detail.item.id,
      user_id: tt.getStorageSync("OPENID"),
      module_type: this.data.tabName === '首发上新' ? '首发上新feed商品卡点击' : '新奇好物feed商品卡点击'
    });
  },
  noop() { },
  onShow() {
    this.data.pagePV = setTimeout(() => {
      tt.reportAnalytics("home_page_view", {
        page: "home",
        user_id: tt.getStorageSync("OPENID"),
        adsource: tt.getStorageSync("adsource") ?? '',
      });
    }, 1000);
  },
  async onReachBottom() {
    if (!this.data.hasMore) {
      return;
    }
    this.setData({
      "pagination.page": this.data.pagination.page + 1,
    });
    await this.shopData();
  },
  onUnload() {
    clearInterval(this.data.adTimer);
    clearTimeout(this.data.pagePV)
  },
  onHide() {
    const outTime = Number(
      (new Date().getTime() - this.data.pageInTime) / 1000
    );
    tt.reportAnalytics("home_page_stay_duration", {
      user_id: tt.getStorageSync("OPENID"),
      stay_time: Math.floor(outTime),
      page: "home",
    });
  },
  onPageScroll(e) {
    if (e.scrollTop > 0) {
      if (!this.data.coverShow) {
        this.setData({ coverShow: true });
      }
    } else {
      if (this.data.coverShow) {
        this.setData({ coverShow: false });
      }
    }
  },
  onPullDownRefresh() {
    this.setData({
      "pagination.page": 1,
      current: this.data.current,
    });
    this.loadPageData();
  },
});
