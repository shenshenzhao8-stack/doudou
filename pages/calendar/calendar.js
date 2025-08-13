import {
  getAndSetCurrentDate,
  formatToMonthDay,
  getMonthNameByMonth,
} from "../../utils/date";
import { getBannerList, getTabs, getShopList } from "../../api/index";
import { openGood } from "../../utils/douyin-shop";
import { jumpPage } from "../../utils/jump";
import { ossImageUrl } from "../../utils/imagsUrl";
import { checkFirstVisitToday } from "../../utils/date";
Page({
  data: {
    imgUrl: ossImageUrl,
    top: "0rpx",
    coverShow: false,
    shopList: [],
    currentIndex: "", // 当前选中索引
    scrollLeft: 0, // 滚动容器的横向偏移量
    activeIndex: 0,
    // 轮播图数据列表
    swiperItems: [],
    currentBgImageStyle: "",
    calendarDate: getAndSetCurrentDate(),
    pagination: {
      page: 1,
      tab_id: null,
      limit: 10,
      total: 0,
    },
    product_items: [],
    loadingMore: false, // 新增：加载更多状态
    noMore: false, // 新增：无更多数据
    tabList: [],
    prevIndex: null, // 新增：上一个tab索引
    gifKeyMap: {},
    hideTabAnimating: false, // 是否正在播放离开动画
    // leftIconKeys: [],
    leftIconInfo: {},
    // capsuleKeys: [],
    capsuleInfo: {},
    customNavigation: {},
    pageInTime: "",
    shopListState: "init",
    exposedProductIds: {}, // 新增：已曝光商品记录
    noData: false,
    isLoad: false,
    isBanner: false,
    pagePV: null,
  },

  // Tab切换
  switchTab: function (e) {
    const index = e.currentTarget.dataset.index;
    const tabId = e.currentTarget.dataset.id;
    if (index === this.data.currentIndex) return;
    tt.reportAnalytics("new_calendar_month_tab_click", {
      month: this.data.tabList[index].title,
      page: "new_calendar",
    });
    const prevIndex = this.data.currentIndex;

    // 关键：为 prevIndex 和 index 都生成新的 key
    const gifKeyMap = { ...this.data.gifKeyMap };
    gifKeyMap[prevIndex] = Date.now() + "_" + Math.random();
    gifKeyMap[index] = Date.now() + "_" + Math.random();

    this.setData({
      prevIndex,
      currentIndex: index,
      gifKeyMap,
      hideTabAnimating: true,
    });
    this.onTabChange(tabId);
    setTimeout(() => {
      this.setData({
        prevIndex: null,
        hideTabAnimating: false,
      });
    }, 500); // 500ms根据你的gif时长调整
  },
  // 轮播图切换
  handleSwiperChange: function (e) {
    const newIndex = e.detail.current;
    tt.reportAnalytics("new_calendar_banner_expose", {
      banner_content: "立即抢购",
      page: "new_calendar",
      banner_index: newIndex,
      Banner_id: this.data.swiperItems[newIndex].id,
    });
    this.setData({
      activeIndex: newIndex,
    });
    this.updateBgImage(newIndex);
  },
  handleSwiperDetails(item) {
    tt.reportAnalytics("new_calendar_banner_click", {
      Banner_id: item.currentTarget.dataset.item.id,
      page: "new_calendar",
    });
    const data = item.currentTarget.dataset.item;
    jumpPage(data);
  },
  // 更新背景图
  updateBgImage(index) {
    const imageUrl = this.data.swiperItems[index]?.image_url || "";
    this.setData({
      currentBgImageStyle: `background-image: url('${imageUrl}'); background-size: cover; background-position: center;`,
    });
  },

  // 跳转商品详情
  goShopDetails: function (e) {
    tt.reportAnalytics("new_calendar_goods_card_click", {
      page: "new_calendar",
      id: e.currentTarget.dataset.id,
      goods_name: e.currentTarget.dataset.item.title,
    });
    const id = e.currentTarget.dataset.id;
    openGood(id);
  },
  formatSellNum(num) {
    if (num >= 100000000) {
      // 亿
      let val = (num / 100000000).toFixed(1);
      val = val.replace(/\\.0$/, "");
      return val + "+亿件";
    } else if (num >= 10000) {
      // 万
      let val = (num / 10000).toFixed(1);
      val = val.replace(/\\.0$/, "");
      return val + "万件";
    } else {
      return num + "件";
    }
  },
  getCustomButtonInfo(callback) {
    if (tt.canIUse("getCustomButtonBoundingClientRect")) {
      try {
        let res = tt.getCustomButtonBoundingClientRect();
        this.setData(
          {
            leftIconInfo: res.leftIcon,
            // leftIconKeys: Object.keys(res.leftIcon),
            capsuleInfo: res.capsule,
            customNavigation: res.customNavigation,
            // capsuleKeys: Object.keys(res.capsule),
            isLoad: true,
            // top: res.customNavigation.marginTop + 'px'
          },
          () => {
            if (callback) callback();
          }
        );
      } catch (error) {
        if (callback) callback();
      }
    } else {
      if (callback) callback();
      tt.showModal({
        title: "提示",
        content:
          "当前客户端版本过低，无法使用该功能，请升级客户端或关闭后重启更新。",
      });
    }
  },
  async initCustomButtonAndLoadData() {
    await new Promise((resolve) => {
      this.getCustomButtonInfo(resolve);
    });
    await this.loadPageData();
  },
  // 页面加载
  onLoad: async function () {
    await this.initCustomButtonAndLoadData();
    const isFirstVisit = checkFirstVisitToday("calendar");
    if (isFirstVisit) {
      tt.reportAnalytics("new_calendar_page_uv", {
        page: "new_calendar",
        user_id: tt.getStorageSync("OPENID"),
      });
    }
    this.setData({
      pageInTime: new Date().getTime(),
    });
    // await this.loadPageData();
  },
  onShow: async function () {
    this.data.pagePV = setTimeout(() => {
      tt.reportAnalytics("new_calendar_page_view", {
        page: "new_calendar",
        user_id: tt.getStorageSync("OPENID"),
      });
    }, 1000);
    await this.getCustomButtonInfo();
  },
  onReady: async function () {
    await this.getCustomButtonInfo();
  },

  // 并行加载banner和tabs
  loadPageData: async function () {
    try {
      const [bannerRes, tabsRes] = await Promise.all([
        getBannerList({ position: 2 }),
        getTabs({ position_id: "2" }),
      ]);

      const updates = {};
      if (bannerRes.code === 200 && bannerRes.data.items.length > 0) {
        updates.swiperItems = bannerRes.data.items;
        updates.top = "903rpx";
        updates.currentBgImageStyle = `background-image: url('${bannerRes.data.items[0]?.image_url || ""
          }'); background-size: cover; background-position: center;`;
      }
      if (bannerRes.code === 200 && bannerRes.data.items.length === 0) {
        this.setData({
          top: this.data.leftIconInfo.bottom + 10 + "px",
          isBanner: true,
        });
      }

      if (tabsRes.code === 200 && tabsRes.data.length > 0) {
        updates.tabList = tabsRes.data;
        const monthName = getMonthNameByMonth();
        updates.tabList.map((item, index) => {
          if (item.title === monthName) {
            updates["pagination.tab_id"] = tabsRes.data[index].id;
            updates["pagination.page"] = 1;
            updates.product_items = [];
            updates.noMore = false;

            this.setData({
              currentIndex: index,
            });
          }
        });
      }

      this.setData(updates);

      if (updates["pagination.tab_id"]) {
        await this.loadShopData(true);
      }
    } catch (error) {
      console.error("Failed to load page data", error);
      // wx.showToast({ title: '数据加载失败', icon: 'none' });
    }
  },

  // 商品数据加载（支持初始化和加载更多）
  loadShopData: async function (isInit = false, from) {
    if (this.data.noMore) return;
    try {
      const res = await getShopList(this.data.pagination);
      const items = (res.data.product_items || []).map((item) => ({
        ...item,
        new_up_time: item.product_update_time
          ? formatToMonthDay(item.product_update_time)
          : "",
      }));

      const total = res.data.pagination.total || 0;
      const newList = isInit ? items : this.data.product_items.concat(items);
      const noMore = newList.length >= total;
      newList &&
        newList.map((item) => {
          item.sellNumStr = this.formatSellNum(Number(item.sell_num) || 0);
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
      this.setData({
        shopListState: "slideOut-animate",
      });
      let time = setTimeout(() => {
        this.setData(
          {
            product_items: newList,
            "pagination.total": total,
            noMore,
            shopListState: "none",
            noData: newList.length > 0 ? false : true,
          },
          () => {
            this.setData({
              shopListState: "slideIn-animate",
            });
            // 新增：商品渲染后初始化曝光监听
            this.observeProductExposure && this.observeProductExposure();
          }
        );
        clearTimeout(time);
      }, 500);
    } catch (err) {
      console.error("加载商品失败", err);
    }
  },

  // 上拉加载更多
  onReachBottom: async function () {
    if (this.data.noMore || this.data.loadingMore) return;
    this.setData({
      "pagination.page": this.data.pagination.page + 1,
    });
    await this.loadShopData();
  },

  // tab点击切换
  onTabChange: async function (id) {
    this.setData({
      "pagination.tab_id": id,
      "pagination.page": 1,
      // product_items: [],
      noMore: false,
    });
    await this.loadShopData(true);
  },
  onHide() {
    const outTime = Number(
      (new Date().getTime() - this.data.pageInTime) / 1000
    );
    tt.reportAnalytics("new_calendar_page_stay_duration", {
      user_id: tt.getStorageSync("OPENID"),
      stay_time: Math.floor(outTime),
      page: "new_calendar",
    });
  },
  /**
   * 监听商品卡片曝光
   */
  observeProductExposure() {
    if (this.productExposureObservers) {
      this.productExposureObservers.forEach((observer) =>
        observer.disconnect()
      );
    }
    this.productExposureObservers = [];
    const that = this;
    (this.data.product_items || []).forEach((item) => {
      const selector = `#shop-item-${item.product_id}`;
      const observer = tt.createIntersectionObserver(this, {
        observeAll: false,
      });
      observer
        .relativeToViewport({ top: 0, bottom: 0 })
        .observe(selector, (res) => {
          if (
            res.intersectionRatio > 0 &&
            !that.data.exposedProductIds[item.product_id]
          ) {
            tt.reportAnalytics("new_calendar_goods_card_expose", {
              page: "new_calendar",
              goods_name: item.title,
              goods_id: item.product_id
            });
            that.setData({
              [`exposedProductIds.${item.product_id}`]: true,
            });
          }
        });
      this.productExposureObservers.push(observer);
    });
  },
  onUnload() {
    clearTimeout(this.data.pagePV)
    if (this.productExposureObservers) {
      this.productExposureObservers.forEach((observer) =>
        observer.disconnect()
      );
      this.productExposureObservers = null;
    }
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
});
