import { ossImageUrl } from '../../utils/imagsUrl'
// /Users/liyong/Desktop/work/frontend-doudou-mini/components/card-commodity/card-commodity.js
import dayjs from "dayjs"
Component({
  data: {
    /**
     * in-progress 进行中
     * to-be-announced 待公布
     * ended 已结束
     * not-started 未开始
     */
    status: "in-progress",
    isAfterTarget: false,
    isShowTwoRow: false,
    OSS_URL: ossImageUrl,
    publishTime: '',
    Yuan: '',
    listPriceYuan: ''
  },
  externalClasses: ['item-class'],
  properties: {
    id: {
      type: String
    },
    title: {
      type: String,
    },
    imageUrl: {
      type: String,
      value: "/assets/_images-01.png"
    },
    detail: {
      type: String
    },
    isMyPage: {
      type: Boolean,
      value: false
    },
    item: {
      type: Object,
      value: {},
      observer(newV) {

        // 获取当前时间
        const currentTime = dayjs();

        // 解析指定时间
        const parsedTargetTime = dayjs(newV.publish_time);

        if (!this.properties.detail && newV.signup_num < 10) {
          this.setData({
            isShowTwoRow: true
          })
        }

        // 判断当前时间是否大于指定时间
        const isAfterTarget = currentTime.isAfter(parsedTargetTime);

        const time = dayjs(newV.publish_time).format('MM月DD日 HH:mm')

        this.setData({
          isAfterTarget: isAfterTarget,
          publishTime: time
        })
      }
    },
    /**
     * 价格
     */
    price: {
      type: Number,
      value: 0,
      observer(newV){
        const yuan = (newV / 100).toFixed(2);
        this.setData({
          Yuan: yuan
        })
      }
    },
    /**
     * 优惠价
     */
    list_price: {
      type: Number,
      value: 0,
      observer(newV) {
        const yuan = (newV / 100).toFixed(2)

        this.setData({
          listPriceYuan: yuan
        })
      }
    },
    publish_time: {
      type: String
    },
    limit_num: {
      type: Number,
      value: 0
    },
    status: {
      type: String
    },
    isMyParticipate: {
      type: Boolean,
      value: false
    },
    page_name: {
      type: String,
      value: ''
    }
  },
  methods: {
    handleTap() {
      if (!this.data.isAfterTarget && this.properties.page_name == 'my') {
        tt.reportAnalytics('MyPage_increase_probability_click', {
          page: 'my',
          user_id: tt.getStorageSync('OPENID'),
          activity_id: this.properties.id
        });
      } else if (this.data.isAfterTarget && this.properties.page_name == 'my') {
        tt.reportAnalytics('MyPage_go_check_click', {
          page: 'my',
          user_id: tt.getStorageSync('OPENID'),
          activity_id: this.properties.id
        });
      }
      if(this.data.isAfterTarget && this.properties.page_name == 'lottery'){
        tt.reportAnalytics('go_check_click', {
          page: 'flash_sale_agg',
          user_id: tt.getStorageSync('OPENID'),
          activity_id: this.properties.id
        });
      }

      this.triggerEvent("bindtap", {
        id: this.properties.id
      });

    },
    isAfter(publish_time) {

      // 获取当前时间
      const currentTime = dayjs();

      // 解析指定时间
      const parsedTargetTime = dayjs(publish_time);

      // 判断当前时间是否大于指定时间
      const isAfterTarget = currentTime.isAfter(parsedTargetTime);
      return isAfterTarget
    }
  },
  observers: {
    'properties.publish_time'(field) {
      console.log('some.field 变化啦', field);
    },
  }
})
