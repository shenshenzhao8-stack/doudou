import { jumpPage } from "../../utils/jump";
import { BANNER_TYPE } from "../../utils"
Component({
  properties: {
    productList: Array,
    current: { type: Number, value: 0 },
    source: String,
    autoplay: { type: Boolean, value: true },
    interval: { type: Number, value: 3000 }
  },
  data: {
    current: 0, // 真实索引
    displayIndex: 1, // 视图索引（0是假头，1~n为真，n+1是假尾）
    pulseBtn: true,
    isAnimating: false,
    touchStartX: 0,
    touchDeltaX: 0
  },
  methods: {
    startAutoplay() {
      this.stopAutoplay();
      const len = (this.data.productList || []).length;
      if (!this.data.autoplay || len <= 1) return;
      this._timer = setInterval(() => {
        this.next();
      }, this.data.interval);
    },
    stopAutoplay() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    },
    next() {
      const len = (this.data.productList || []).length;
      if (len <= 1) return;
      let nextDisplayIndex = this.data.displayIndex + 1;
      this.setData({ isAnimating: true, displayIndex: nextDisplayIndex }, () => {
        if (nextDisplayIndex > len) {
          // 到达假尾，动画结束后瞬间跳到真头
          setTimeout(() => {
            this.setData({ isAnimating: false, displayIndex: 1, current: 0 });
            this.triggerExpose(0);
          }, 400);
        } else {
          this.setData({ current: nextDisplayIndex - 1 });
          this.triggerExpose(nextDisplayIndex - 1);
        }
      });
    },
    prev() {
      const len = (this.data.productList || []).length;
      if (len <= 1) return;
      let prevDisplayIndex = this.data.displayIndex - 1;
      this.setData({ isAnimating: true, displayIndex: prevDisplayIndex }, () => {
        if (prevDisplayIndex < 1) {
          // 到达假头，动画结束后瞬间跳到真尾
          setTimeout(() => {
            this.setData({ isAnimating: false, displayIndex: len, current: len - 1 });
            this.triggerExpose(len - 1);
          }, 400);
        } else {
          this.setData({ current: prevDisplayIndex - 1 });
          this.triggerExpose(prevDisplayIndex - 1);
        }
      });
    },
    onTouchStart(e) {
      this.stopAutoplay();
      this.setData({ touchStartX: e.touches[0].pageX, touchDeltaX: 0, isAnimating: false });
    },
    onTouchMove(e) {
      const deltaX = e.touches[0].pageX - this.data.touchStartX;
      this.setData({ touchDeltaX: deltaX });
    },
    onTouchEnd(e) {
      const deltaX = this.data.touchDeltaX;
      const threshold = 50;
      if (deltaX > threshold) {
        this.prev();
      } else if (deltaX < -threshold) {
        this.next();
      } else {
        this.setData({ isAnimating: true });
      }
      this.setData({ touchDeltaX: 0 });
      this.startAutoplay();
    },
    handleSwiper(e) {
      const item = e.currentTarget.dataset.item;
      console.log(item, "handleSwiper")
      if (this.data.source === 'lottery-detail') {
        tt.reportAnalytics("flash_sale_agg_page_banner_click", {
          target_page: 'flash_sale_detail',
          banner_id: item.id,
          page: "flash_sale_agg",
          goods_name: item.title
        });
      } else {
        tt.reportAnalytics("home_banner_click", {
          target_page: item.jump_type,
          banner_index: e.currentTarget.dataset.index,
          page: "home",
        });

        tt.reportAnalytics('home_page_click', {
          banner_id: item.id,
          banner_name: item.title,
          banner_content: BANNER_TYPE[item.jump_type],
          good_name: "",
          good_id: "",
          user_id: tt.getStorageSync("OPENID"),
          module_type: "首页banner点击"
        });
      }
      jumpPage(item);
      this.triggerEvent("swiper", { item });
    },
    triggerExpose(index) {
      const item = (this.data.productList || [])[index];
      if (!item) return;
      tt.reportAnalytics("home_banner_expose", {
        banner_content: item.jump_type + item.title,
        banner_index: index,
        page: "home",
      });
      this.triggerEvent("change", { current: index });
    }
  },
  observers: {
    current(newVal) {
      this.setData({ current: newVal, displayIndex: newVal + 1 });
    },
    productList(newList) {
      this.setData({ current: 0, displayIndex: 1 });
      this.startAutoplay();
    }
  },
  lifetimes: {
    attached() {
      this.setData({ pulseBtn: true, displayIndex: this.data.current + 1 });
      this.startAutoplay();
      this.triggerExpose(this.data.current);
    },
    detached() {
      this.stopAutoplay();
    }
  },
  pageLifetimes: {
    show() {
      this.startAutoplay();
    },
    hide() {
      this.stopAutoplay();
    }
  }
});