import { openEcShop, openGood } from "../../utils/douyin-shop";
import { jumpPage } from "../../utils/jump";
import { BANNER_TYPE } from "../../utils"
Component({
  data: {
    // 自定义组件内部属性
    defaultStates: {},
    shopBg: "",
    leftList: [],
    rightList: [],
    hideHeader: true,
    exposedProductIds: {}, // 新增：已曝光商品记录
  },
  properties: {
    list: {
      // 接收外部传入的选项
      type: Array,
      value: [],
      observer(newList) {
        this.splitList && this.splitList(newList);
      },
    },
    bg: { type: String, value: "" },
    ads: {
      type: Array,
      value: [],
    },
    tabName: {
      type: String,
    },
  },
  methods: {
    // 自定义组件内部方法
    customMethod: function () { },
    splitList(list) {
      function formatSellNum(num) {
        if (num >= 100000000) {
          // 亿
          let val = (num / 100000000).toFixed(1);
          val = val.replace(/\\.0$/, "");
          return val + "亿件";
        } else if (num >= 10000) {
          // 万
          let val = (num / 10000).toFixed(1);
          val = val.replace(/\\.0$/, "");
          return val + "万件";
        } else {
          return num + "件";
        }
      }

      const left = [];
      const right = [];

      // 判断是否有广告数据
      const hasAds = this.data.ads && this.data.ads.length > 0;

      list.forEach((item, idx) => {
        // 新增：格式化销量字段
        item.sellNumStr = formatSellNum(Number(item.sell_num) || 0);
        if (hasAds) {
          // 有广告时：右列第一个是商品第一个
          if (idx % 2 === 0) {
            right.push(item);
          } else {
            left.push(item);
          }
        } else {
          // 没有广告时：左列第一个是商品第一个
          if (idx % 2 === 0) {
            left.push(item);
          } else {
            right.push(item);
          }
        }
      });

      // 原有的平衡逻辑保持不变
      if (
        this.data.ads &&
        this.data.ads.length > 0 &&
        left.length > right.length
      ) {
        const last = left.pop();
        right.push(last);
      }

      this.setData(
        {
          leftList: left,
          rightList: right,
        },
        () => {
          // 新增：商品渲染后延迟初始化曝光监听，确保 DOM 完全渲染
          setTimeout(() => {
            this.observeProductExposure && this.observeProductExposure();
          }, 100);
        }
      );
    },
    jumpDetail(e) {
      tt.reportAnalytics('feeds_click', {
        good_name: e.currentTarget.dataset.title,
        good_id: e.currentTarget.dataset.id,
        user_id: tt.getStorageSync("OPENID"),
        module_type: this.data.tabName + 'feed',
        card1_content: '',
      });
      this.triggerEvent("handleGoods", {
        id: e.currentTarget.dataset.id,
        title: e.currentTarget.dataset.title,
      });
      openGood(e.currentTarget.dataset.id);
    },
    onPreviewLiveStatus(res) {
      this.setData({
        liveStatus: res.detail.errMsg,
      });
    },
    handleAd(e) {
      const jumpType = e.currentTarget.dataset.item.jump_type;
      const jump_name = BANNER_TYPE[jumpType];
      tt.reportAnalytics('feeds_click', {
        good_name: e.currentTarget.dataset.item.title,
        good_id: e.currentTarget.dataset.item.id,
        user_id: tt.getStorageSync("OPENID"),
        card1_content: jump_name,
        module_type: this.data.tabName + 'feed',
      });

      this.triggerEvent("handleAdGoods", {
        item: e.currentTarget.dataset.item,
      });
      const data = e.currentTarget.dataset.item;
      jumpPage(data);
    },
    /**
     * 监听商品卡片曝光
     */
    observeProductExposure() {
      // 清理旧的 observer
      if (this.productExposureObservers) {
        this.productExposureObservers.forEach((observer) =>
          observer.disconnect()
        );
      }
      this.productExposureObservers = [];
      const that = this;
      const allItems = [
        ...(this.data.leftList || []),
        ...(this.data.rightList || []),
      ];
      allItems.forEach((item) => {
        const selector = `#waterfall-item-${item.product_id}`;
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
              if (that.data.tabName == "首发上新") {
                tt.reportAnalytics("home_first_launch_card_expose", {
                  page: "home",
                  goods_name: item.title,
                  goods_id: item.product_id,
                  section: that.data.tabName,
                });
              } else {
                tt.reportAnalytics("home_goods_card_expose", {
                  page: "home",
                  goods_name: item.title,
                  goods_id: item.product_id,
                  section: that.data.tabName,
                });
              }

              that.setData({
                [`exposedProductIds.${item.product_id}`]: true,
              });
            }
          });
        this.productExposureObservers.push(observer);
      });
    },
    eventHandler(e) {
      if (e.detail.errNo) {
        console.log("跳转抖音直播间失败", e.detail);
      } else {
        console.log("跳转抖音直播间成功");
      }
    },
  },
  lifetimes: {
    attached() {
      this.splitList(this.data.list);
    },
    detached() {
      if (this.productExposureObservers) {
        this.productExposureObservers.forEach((observer) =>
          observer.disconnect()
        );
        this.productExposureObservers = null;
      }
    },
  },
});
