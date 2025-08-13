import { openEcShop } from '../../utils/douyin-shop'
Component({
  data: {
    isCode: false,// 是否显示二维码
    isWinState: false, // 是否显示中奖弹窗
    isVisible: false, // 是否显示弹窗
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    is_win: {
      type: Boolean,
      value: false
    },
    is_win_type: {
      type: Number,
      value: 0
    },
    prize_obj: {
      type: Object,
      value: {
      }
    }
  },
  observers: {
    'visible': function (newVal) {
      // 监听 properties.visible 的变化，并更新 data.internalVisible
      if (this.data.isWinState && newVal == true) {
        tt.reportAnalytics('Doudou_Win_PopupExpose', {
          page: 'doudou_activites',
          user_id: tt.getStorageSync('OPENID'),
        });
      } else if (this.data.isWinState == false && newVal == true) {
        console.log('未中奖123123');
        tt.reportAnalytics('Doudou_Lose_PopupExpose', {
          page: 'doudou_activites',
          user_id: tt.getStorageSync('OPENID'),
        });
      }
    },
    'is_win': function (newVal) {
      // 监听 properties.visible 的变化，并更新 data.internalVisible
      console.log('是否中奖', newVal);
      this.data.isWinState = newVal
    }
  },
  // lifetimes: {
  //   attached() {
  //     this.updatePrizeDisplay()
  //   },
  // },

  methods: {
    // updatePrizeDisplay() {
    //   console.log('this.properties.prize_obj?.couponInfo' , this.properties.prize_obj);
    //   const rawCredit = this.properties.prize_obj?.coupon_info?.credit || 0;
    //   // 清洗非数字字符，避免 NaN
    //   const numValue = parseFloat(String(rawCredit).replace(/[^0-9.-]/g, "")) || 0;
    //   console.log('numValue' , numValue);
    //   const amount = numValue / 100;
    //   let className = "prize_nums";
    //   if (amount > 999) {
    //     className = "thousand_prize_nums";
    //   } else if (amount >= 100) {
    //     className = "hundred_prize_nums";
    //   } // 其他情况保持默认类名
  
    //   this.setData({
    //     prizeClass: className
    //   });
    // },

    handleTap: function () {
      this.triggerEvent("clicktap", {});
    },
    handleCanel: function () {
      this.triggerEvent("cancel");
    },
    handleCanelCode: function () {
      this.setData({
        isCode: false,
      })
    },
    closePopup: function () {
      tt.reportAnalytics('Doudou_Lose_RetryClick', {
        page: 'doudou_activites',
        user_id: tt.getStorageSync('OPENID'),
      });
      this.handleCanel()
    },
    // 跳转领取优惠券
    onenCoupon: function () {
      this.handleCanel()
    },
    // 跳转店铺首页
    openShop: function (e) {
      const { storeid, code, prizename } = e.target.dataset
      tt.reportAnalytics('Doudou_contact_customer_Click', {
        page: 'doudou_activites',
        user_id: tt.getStorageSync('OPENID'),
        gift_card_name: prizename,
      });

      if (storeid && code) {
        tt.setClipboardData({
          data: code,
          success: () => {
            tt.showToast({
              title: `ID ${code} 已复制`,
              icon: 'none'
            })
          }
        })
        openEcShop(storeid)
      }

    },
    // 扫码添加助理
    onenCodePopup: function (e) {
      const { code, storeId, prizename } = e.target.dataset
      tt.reportAnalytics('Doudou_contact_assistant_Click', {
        page: 'doudou_activites',
        user_id: tt.getStorageSync('OPENID'),
        gift_card_name: prizename,
      });
      if (code) {
        tt.setClipboardData({
          data: code,
          success: () => {
            tt.showToast({
              title: `ID ${code} 已复制`,
              icon: 'none'
            })
          }
        })
        this.setData({
          isCode: true,
        })
      }
    },
    // 去填写地址
    goAddress(e) {
      const { recordid, prizename } = e.currentTarget.dataset
      tt.reportAnalytics('Doudou_add_address_Click', {
        page: 'doudou_activites',
        user_id: tt.getStorageSync('OPENID'),
        gift_card_name: prizename,
      });
      this.closePopup()
      tt.navigateTo({
        url: "/pages/address/index",
        query: {
          id: recordid
        }
      })
    },
    // 跳转领取优惠券页面
    openCpuon(e) {
      const { couponid, shopid, tit } = e.target.dataset
      tt.reportAnalytics('Doudou_goto_clam_Click', {
        page: 'doudou_activites',
        user_id: tt.getStorageSync('OPENID'),
        coupon_id: couponid,
      });
      this.closePopup()
      tt.navigateTo({
        url: "/pages/cpuonCard/cpuonCard",
        query: {
          id: shopid,
          couponId: couponid,
          tit: tit
        }
      })
    }
  }
})
