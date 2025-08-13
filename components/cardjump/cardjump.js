// /Users/kaiyang/Desktop/He/frontend-doudou-mini/components/cardjump/cardjump.js
Component({
  data: {
    buttonOptions:{
      unappliedText: "去领取",
      appliedText: "去使用",
      expiredText: "过期了",
      usedText: "用完了",
      activeBackgroundColor: "red",
      activeColor: "yellow",
      disableBackgroundColor: "blue",
      disableColor: "green",
    },
    modalOptions:{
      title: "确定领取嘛",
      content: "你真的确定领取嘛",
      confirmText: "确定啊",
      confirmColor: "#FF9B9B",
      showCancel: true,
      cancelText: "不确定",
      cancelColor: "#CBFFA9",
    }
  },
  properties: {

  },
  methods: {
    handleCouponError () {
      console.log('Coupon Error')
    },
    handleCouponSuccess(){
      console.log('Coupon Success');
    }
  }
})
