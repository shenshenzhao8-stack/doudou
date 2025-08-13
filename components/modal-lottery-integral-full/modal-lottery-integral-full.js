import { ossImageUrl } from '../../utils/imagsUrl'
Component({
  data: {
    OSS_URL: ossImageUrl,
  },
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newV) {
        if (newV) {
          tt.reportAnalytics('luckyfull_popup_view', {
            page: "flash_sale_detail",
            user_id: tt.getStorageSync("OPENID"),
            goods_name: this.properties.detail.title,
            goods_id: this.properties.detail.product_id
          });
        }
      }
    },
    detail: {
      type: Object,
      value: {},
    }
  },
  methods: {
    handleTap: function() {
      this.triggerEvent("handleTap", {});
    },
    handleCanel: function() {
      tt.reportAnalytics('luckyfull_close_click', {
        page: 'flash_sale_detail',
        user_id: tt.getStorageSync("OPENID"),
        goods_name: this.properties.detail.title,
        goods_id: this.properties.detail.product_id
      });
      this.triggerEvent("cancel");
    }
  }
})
