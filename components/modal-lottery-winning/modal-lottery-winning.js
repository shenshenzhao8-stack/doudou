import { ossImageUrl } from '../../utils/imagsUrl'
import {
  dataLotteryCode
} from "../../api/lottery"
import {
  openEcShop
} from "../../utils/douyin-shop"
Component({
  data: {
    code: '',
    OSS_URL: ossImageUrl,
  },
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newV) {
        if (newV) {
          tt.reportAnalytics('lottery_win_popup_view', {
            page: "flash_sale_detail",
            user_id: tt.getStorageSync("OPENID"),
            goods_name: this.properties.detail.title,
            goods_id: this.properties.detail.product_id
          });
          this.getLotteryCode();
        }
      }
    },
    id: {
      type: String
    },
    detail: {
      type: Object,
      value: {},
    }
  },

  methods: {
    handleTap: function () {
      tt.reportAnalytics('lottery_win_contact_service_click', {
        page: "flash_sale_detail",
        user_id: tt.getStorageSync("OPENID"),
        goods_name: this.properties.detail.title,
        goods_id: this.properties.detail.product_id
      });

      tt.setClipboardData({
        data: this.data.code,
        success() {
          tt.showToast({
            title: `ID ${code} 已复制`,
            icon: 'none'
          });
        }
      });
      openEcShop(this.properties.detail.shop_id)
    },
    handleCanel: function () {
      this.triggerEvent("cancel");
    },
    getLotteryCode: function () {
      dataLotteryCode(this.properties.id).then(res => {
        this.setData({
          code: res.data.code
        })
      })
    }
  }
})
