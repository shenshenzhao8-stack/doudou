import { ossImageUrl } from '../../utils/imagsUrl'
Component({
  data: {
    modalUserAgreementVisible: false,
    avatarUrl: '',
    nickName: '',
    OSS_URL: ossImageUrl,
  },
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        if (newVal === true) {
          console.log(this.properties.detail, "this.properties.detail");
          tt.reportAnalytics('join_assist_popup_view', {
            page: "flash_sale_detail",
            user_id: tt.getStorageSync('OPENID'),
            share_user_id: this.properties.shareInfo?.shareOpenId,
            share_user_name: this.properties.shareInfo?.shareName,
            goods_name: this.properties.detail.title,
            goods_ID: this.properties.detail.product_id
          });
        } else {
          tt.reportAnalytics('join_assist_close_click', {
            page: "flash_sale_detail",
            user_id: tt.getStorageSync('OPENID'),
            share_user_id: this.properties.shareInfo?.shareOpenId,
            share_user_name: this.properties.shareInfo?.shareName,
            goods_name: this.properties.detail.title,
            goods_ID: this.properties.detail.product_id
          });
        }
      }
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
    detail: {
      type: Object,
      value: {}
    },
    userInfo: {
      type: Object,
      value: {}
    }
  },
  methods: {
    handleTap() {
      tt.reportAnalytics('join_assist_click', {
        page: 'flash_sale_detail',
        user_id: tt.getStorageSync('OPENID'),
        share_user_id: this.properties.shareInfo?.shareId,
        share_user_name: this.properties.shareInfo?.shareName,
        goods_name: this.properties.detail.title,
        goods_ID: this.properties.detail.product_id
      });

      console.log(this.properties.userInfo, "modal-lottery-invite-to-help-and-participate -> this.properties.userInfo");
      if (this.properties.userInfo.avatarUrl && this.properties.userInfo.nickName) {
        this.triggerEvent("handleTap");
        return
      }

      const that = this;

      tt.getUserProfile({
        success(res) {
          that.setData({
            modalUserAgreementVisible: true,
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName
          })
        },
        fail(res) {
          console.error("modal-lottery-invite-to-help-and-participate -> tt.getUserProfile 调用失败", res);
        }
      })
    },
    handleCanel() {
      this.triggerEvent("cancel", {
        type: 'modal-lottery-invite-to-help-and-participate'
      });
    },
    handleUserAgreementTap(e) {
      console.log(e, 'modal-lottery-invite-to-help-and-participate -> handleUserAgreementTap');

      this.triggerEvent("handleTap", {
        version: e.detail.version,
        avatarUrl: this.data.avatarUrl,
        nickName: this.data.nickName,
      });
    },
    handleUserAgreementCancel() {
      this.setData({
        modalUserAgreementVisible: false,
      })
    }
  }
})
