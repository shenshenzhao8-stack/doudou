Component({
  data: {
    internalVisible: false // 内部数据，用于存储 properties.visible 的值
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    attached() {
      // 组件初始化时，将 properties.visible 的值赋给 data.internalVisible
      this.setData({
        internalVisible: this.properties.visible
      });
    }
  },
  observers: {
    'visible': function (newVal) {
      // 监听 properties.visible 的变化，并更新 data.internalVisible
      this.setData({
        internalVisible: newVal
      });
    }
  },
  methods: {
    noop() { },
    handleTap() {
      this.setData({
        internalVisible: false
      });

      this.triggerEvent("cancel", {});
    }
  }
});
