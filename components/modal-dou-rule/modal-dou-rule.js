// /Users/kaiyang/Desktop/He/frontend-doudou-mini/components/modal-dou-rule/modal-dou-rule.js
Component({
  data: {
  },
  properties: {
    isShowRule: {
      type: Boolean,
      value: false
    },
  },
  methods: {
    handleCanel: function () {
      this.triggerEvent("cancel");
    },
    handleCanelCode : function(){
      this.handleCanel()
    }
  }
})