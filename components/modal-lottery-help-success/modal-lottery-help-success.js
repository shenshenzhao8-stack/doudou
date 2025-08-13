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
        const obj = {
          page: "flash_sale_detail",
          user_id: tt.getStorageSync('OPENID'),
          share_user_id: this.properties.shareInfo?.shareOpenId,
          share_user_name: this.properties.shareInfo?.shareName,
          goods_name: this.properties.detail.title,
          goods_ID: this.properties.detail.product_id
        }
        if (newVal === true) {
          tt.reportAnalytics('assist_success_popup_view', obj);
        } else {
          tt.reportAnalytics('assist_success_close_view', obj);
        }
      }
    },
    detail: {
      type: Object,
      value: {},
    },
    /**
     * shareName
     * 
     * shareId
     */
    shareInfo: {
      type: Object,
      value: {}
    },
  },
  methods: {
    handleCanel: function () {
      this.triggerEvent("cancel");
    },
    handleTap: function () {
      tt.reportAnalytics('dotask_formoresign_sclick', {
        page: "flash_sale_detail",
        user_id: tt.getStorageSync('OPENID'),
        share_user_id: this.properties.shareInfo?.shareOpenId,
        share_user_name: this.properties.shareInfo?.shareName,
        goods_name: this.properties.detail.title,
        goods_ID: this.properties.detail.product_id
      });
      this.triggerEvent("handleTap", {});
    },
  }
})
