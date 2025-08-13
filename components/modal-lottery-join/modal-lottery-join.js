import { ossImageUrl } from '../../utils/imagsUrl'
Component({
  data: {
    OSS_URL: ossImageUrl,
    time: ""
  },
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newV) {
        if (newV) {
          tt.reportAnalytics('draw_lottery_success_popup_expose', {
            page: 'flash_sale_detail',
            goods_name: this.properties.detail.title,
            goods_ID: this.properties.detail.product_id
          });
        }else{
          tt.reportAnalytics('task_continue_entriesclose_click', {
            page: 'flash_sale_detail',
          });
          tt.reportAnalytics('flash_sale_success_popup_close', {
            page: 'flash_sale_detail',
          });
        }
      }
    },
    detail: {
      type: Object,
      value: {},
      observer(newV) {
        const _time = newV.publish_time
        this.setData({
          time: _time
        })
      }
    },
    shareInfo: {
      type: Object,
      value: {}
    }
  },
  methods: {
    handleTap: function() {
      tt.reportAnalytics('btn_task_continue_entries_click', {
        page: 'flash_sale_detail',
      });
      this.triggerEvent("clicktap", {});
    },
    handleCanel: function() {
      this.triggerEvent("cancel");
    }
  }
})
