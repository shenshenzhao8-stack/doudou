import { ossImageUrl } from '../../utils/imagsUrl'
Component({
  data: {
    OSS_URL: ossImageUrl,
  },
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        if (newVal) {
          tt.reportAnalytics('no_win_popup_view', {
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
    handleTap: function () {
      tt.reportAnalytics('no_win_look_other_click', {
        page: "flash_sale_detail",
        user_id: tt.getStorageSync("OPENID"),
        goods_name: this.properties.detail.title,
        goods_id: this.properties.detail.product_id
      });
      this.triggerEvent("handleTap", {});
    },
    handleCanel: function () {
      this.triggerEvent("cancel");
    }
  }
})
