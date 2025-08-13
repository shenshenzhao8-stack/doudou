// index.ts
const app = getApp()
import { openEcShop } from '../../utils/douyin-shop'
Page({
  data: {
    buttonOptions: {
      unappliedText: "去领取",
      appliedText: "去使用",
      expiredText: "过期了",
      usedText: "用完了",
      activeColor: "yellow",
      disableBackgroundColor: "blue",
      disableColor: "green",
    },
    modalOptions: {
      title: "",
      content: "点击领取按钮，即可获得此优惠券",
      confirmText: "领取",
      confirmColor: "#1c5cfb",
      showCancel: true,
      cancelText: "不领取",
      cancelColor: "#333",
    },
    cpuonTit: '',
    couponId: '',
    shopId: '',

  },
  onLoad: function (e) {
    this.setData({
      cpuonTit: e.tit,
      couponId: e.couponId,
      shopId: e.id
    })
  },
  handleCouponError(e) {
    console.log('Coupon Error', e);
  },
  handleCouponSuccess() {
    console.log('Coupon Success');
  },
  handleCouponUse(e) {
    if (this.data.shopId) {
      openEcShop(this.data.shopId)
    } else {
      tt.showToast({
        title: '跳转失败，您可以去抖音app 我的钱包查看',
        icon: 'none'
      })
    }
  }
})