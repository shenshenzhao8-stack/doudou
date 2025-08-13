import { jumpPage } from "../../utils/jump";
Component({
  properties: {
    productList: Array,
    current: Number,
    source: String,
  },
  data: {
    current: 0,
    // slideKey: "",
    pulseBtn: true,
    autoplay:true,
  },
  methods: {
    handleChange(e) {
      const newIndex = e.detail.current;
      this.setData({
        current: newIndex,
      });
      tt.reportAnalytics("home_banner_expose", {
        banner_content: this.data.productList[e.detail.current].jump_type,
        banner_index: e.detail.current,
        page: "home",
      });
      this.triggerEvent("change", { current: newIndex });
    },
    handleSwiper(e) {
      const item = e.currentTarget.dataset.item;
      if(this.data.source === 'lottery-detail'){
        tt.reportAnalytics("flash_sale_agg_page_banner_click", {
          target_page: 'flash_sale_detail',
          banner_id: item.id,
          page: "flash_sale_agg",
          goods_name:item.title
        });
      }else{
        tt.reportAnalytics("home_banner_click", {
          target_page: e.currentTarget.dataset.item.jump_type,
          banner_index: e.currentTarget.dataset.index,
          page: "home",
        });
      }
     
      jumpPage(item);
      this.triggerEvent("swiper", { item });
    },
  },
  pageLifetimes: {
    show: function ({ showFrom }) {
      this.setData({
        autoplay: true,
      })
      // 页面被展示
    },
    hide: function () {
      this.setData({
        autoplay: false,
      })
      // 页面被隐藏
    },
  },
  lifetimes: {
    attached() {
      // 初始化 slideKey 和 pulseBtn
      this.setData({
        // slideKey: Date.now() + "_" + Math.random(),
        pulseBtn: true,
      });
    },
  },
});
