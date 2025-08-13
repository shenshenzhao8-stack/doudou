// /Users/yida/Desktop/code/frontend-doudou-mini/components/modal-lottery-rules/modal-lottery-rules.js
Component({
  data: {

  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
  },
  methods: {
    handleCanel: function() {
      this.triggerEvent("cancel");
    }
  }
})
