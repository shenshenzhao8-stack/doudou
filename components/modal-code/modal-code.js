Component({
  data: {

  },
  properties: {
    isCode: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    handleTap: function() {
      this.triggerEvent("clicktap", {});
    },
    handleCanel: function() {
      this.triggerEvent("cancel");
    }
  }
})
