// components/lottery-card/index.js
Component({
  properties: {
    list: {
      type: Array,
      value: [
        {
          title: '苹果手机星空白手机',
          time: '2018.04.11',
          status: 0 // 0-待开奖 1-未中奖
        },
        {
          title: '苹果手机星空白手机',
          time: '2018.04.11',
          status: 1
        }
      ]
    }
  }
})