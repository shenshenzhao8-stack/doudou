Component({
  data:{
    needLeft:false,
    needRight:false,
  },
  properties: {
    options: { // 接收外部传入的选项
      type: Array,
      value: []
    },
    current: { // 接收外部传入的当前选中的选项
      type: Number,
      value: 0,
    }
  },
  methods: {
    handleTabbarClick(event) { // 处理tabbar选项的点击事件
      console.log('1', event)
      const index = event.currentTarget.dataset.index
      this.setData({
        current: index
      })
      this.triggerEvent('change', { // 将当前选中的选项通过properties传递给外部
        id: event.currentTarget.dataset.id,
        index: event.currentTarget.dataset.index
      })
    }
  },
  ready(){
  }
})
