import { ossImageUrl } from '../../utils/imagsUrl'
Component({
  data: {

    OSS_URL: ossImageUrl,
  },
  properties: {
    visible: {
      type: Boolean,
      value: true
    },
  },
  methods: {
    handleCanel: function() {
      this.triggerEvent("cancel");
    }
  }
})