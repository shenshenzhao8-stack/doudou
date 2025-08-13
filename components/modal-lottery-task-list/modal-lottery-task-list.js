import { ossImageUrl } from '../../utils/imagsUrl'
import { checkFirstVisitToday } from '../../utils/date'
import {
  dataLotteryAddApp,
  dataLotteryFinishTask
} from "../../api/lottery"
import {
  openEcShop,
  openGood
} from "../../utils/douyin-shop"
Component({
  data: {
    internalVisible: false,
    taskMap: [],
    OSS_URL: ossImageUrl,
    isLive: false,
    isOutside: false,
    outsideInfo: {
      id: '',
      type: ''
    },
    isPayAttentionToTheLayer: false,
    isAwemeError: false,
    pageInTime: ""
  },
  properties: {
    // 是否显示弹窗
    visible: {
      type: Boolean,
      value: false
    },
    detail: {
      type: Object,
      value: {},
    },
    /**
     * shareName
     * 
     * shareId
     */
    shareInfo: {
      type: Object,
      value: {}
    },
  },
  observers: {
    'visible': function (newVal) {
      // 监听 properties.visible 的变化，并更新 data.internalVisible
      if (newVal === true) {
        this.setData({
          pageInTime: new Date().getTime()
        })
        // UV埋点
        const isFirstVisit = checkFirstVisitToday('flash_sale__task_page_uv');
        if (isFirstVisit) {
          tt.reportAnalytics('flash_sale__task_page_uv', {
            user_id: tt.getStorageSync("OPENID"),
            page: 'flash_sale_detail',
            share_user_id: this.properties.shareInfo?.shareOpenId,
            share_user_name: this.properties.shareInfo?.shareName,
            goods_name: this.properties.detail.title,
            goods_ID: this.properties.detail.product_id
          });
        }
        tt.reportAnalytics('flash_sale_task_page_view', {
          share_user_id: this.properties.shareInfo?.shareOpenId,
          share_user_name: this.properties.shareInfo?.shareName,
          goods_name: this.properties.detail.title,
          goods_ID: this.properties.detail.product_id,
          user_id: tt.getStorageSync("OPENID"),
          page: 'flash_sale_detail',
        });
      } else {
        const outTime = (new Date().getTime() - this.data.pageInTime) / 1000;
        this.data.pageInTime && tt.reportAnalytics('flash_sale__task_page_stay_duration', {
          stay_time: Math.floor(outTime),
          user_id: tt.getStorageSync("OPENID"),
          page: 'flash_sale_detail',
          share_user_id: this.properties.shareInfo?.shareOpenId,
          share_user_name: this.properties.shareInfo?.shareName,
          goods_name: this.properties.detail.title,
          goods_ID: this.properties.detail.product_id
        });
        this.data.pageInTime && tt.reportAnalytics('flash_sale__task_item_close', {
          user_id: tt.getStorageSync("OPENID"),
          goods_name: this.properties.detail.title,
          goods_ID: this.properties.detail.product_id,
          page: 'flash_sale_detail',
          share_user_id: this.properties.shareInfo?.shareOpenId,
          share_user_name: this.properties.shareInfo?.shareName,
        });
      }
      this.setData({
        internalVisible: newVal
      });
    },
  },
  // 直播
  livePlayerContext: undefined,
  ready() {
    // try {
    //   this.livePlayerContext = tt.createLivePlayerContext("myLivePlayer");
    //   console.log("this.livePlayerContext", this.livePlayerContext);
    // } catch (err) {
    //   console.log("createLivePlayerContext fail: ", err);
    // }
  },
  pageLifetimes: {
    show: function () {
      console.log("任务列表展示", this.data.outsideInfo);

      if (this.data.isOutside) {
        this.finishTask(this.data.outsideInfo.id, this.data.outsideInfo.type);
      }
    },
  },
  methods: {
    // 显示弹窗
    show() {
      tt.reportAnalytics('flash_sale_task_page_view', {
        share_user_id: this.properties.shareInfo?.shareOpenId,
        share_user_name: this.properties.shareInfo?.shareName,
        goods_name: this.properties.detail.title,
        goods_ID: this.properties.detail.product_id,
        user_id: tt.getStorageSync("OPENID"),
        page: 'flash_sale_detail',
      });
      this.setData({
        internalVisible: true,
      })
    },
    goShare() {
      if (this.data.detail.share.finish_task_times !== this.data.detail.share.max_task_times) {
        tt.reportAnalytics('invite_friends_gocompleteClick', {
          page: 'flash_sale_detail',
          user_id: tt.getStorageSync('OPENID'),
          share_user_id: this.properties.shareInfo?.shareOpenId,
          share_user_name: this.properties.shareInfo?.shareName,
          goods_name: this.properties.detail.title,
          goods_ID: this.properties.detail.product_id
        });
      }
    },
    // 关闭弹窗
    closePopup() {
      this.setData({ internalVisible: false })
      this.triggerEvent('cancel', {
        type: "modal-lottery-task-list"
      })
    },

    handleCanelTap() {
      this.closePopup()
    },

    handleTaskLiveTap(e) {
      const id = e.target.dataset.id;
      const third_id = e.target.dataset.third_id;
      const type = e.target.dataset.type;
      const istap = e.target.dataset.istap;
      const businessId = e.currentTarget.dataset.businessid;

      const that = this;

      tt.setStorageSync("is-show-source", "task-list");
      this.handleLiveTap();
      console.log('istap', istap)
      if (istap) return;
      console.log('openSchema', true)
      tt.openSchema({
        schema: `sslocal://user/profile/${businessId}?profile_type=1`,
        success(res) {
          that.setData({
            isOutside: true,
            outsideInfo: {
              id,
              type
            }
          })
        },
        fail(err) {
          console.log(err)
          that.setData({
            isOutside: true,
            outsideInfo: {
              id,
              type
            }
          })
          setTimeout(() => {
            that.finishTask(id, type);
          }, 500)
        },
      })
    },

    /**
     * 
     * type 的类型：top 热门 / share 分享 / live 直播间 / detail 店铺
     */
    handleTaskTap(e) {
      console.log(e, "modal-lottery-task-list -> handleTaskTap");
      const id = e.currentTarget.dataset.id;
      const type = e.currentTarget.dataset.type;
      const istap = e.currentTarget.dataset.istap;
      const businessId = e.currentTarget.dataset.businessid;

      tt.setStorageSync("is-show-source", "task-list");

      if (istap) return;

      if (type == 'top' && businessId) {
        tt.reportAnalytics('View_product_Click', {
          page: 'flash_sale_detail',
          goods_name: businessId,
          user_id: tt.getStorageSync('OPENID'),
          share_user_id: this.properties.shareInfo?.shareOpenId,
          share_user_name: this.properties.shareInfo?.shareName,
          goods_ID: businessId
        });
        openGood(businessId).then(res => {
          this.setData({
            isOutside: true,
            outsideInfo: {
              id,
              type
            }
          })
        }).catch(() => {
          this.finishTask(id, type)
        })
      }

      if (type == 'detail' && businessId) {
        this.handleShopTap()
        openEcShop(businessId).then(res => {
          this.setData({
            isOutside: true,
            outsideInfo: {
              id,
              type
            }
          })
        }).catch(() => {
          this.finishTask(id, type)
        })
      }
    },

    finishTask(id, type) {
      dataLotteryFinishTask({
        task_id: id,
        activity_id: this.properties.detail.id,
        category: type
      }).then(res => {
        console.log(res, "finishTask");

        this.triggerEvent("handleTap");
      }).finally(() => {
        this.setData({
          isOutside: false,
          outsideInfo: {
            id: '',
            type: ''
          }
        })
      })
    },
    // 阻止触摸滚动穿透
    preventTouchMove(e) {
      // 空函数用于阻止默认滚动行为
      return false;
    },
    handleAwemeError(e) {
      if (e.detail.errMsg) {
        this.setData({
          isAwemeError: true
        })

        console.error(e, 'handleAwemeError');
      }
    },
    closePayAttentionToTheLayer() {
      this.setData({
        isPayAttentionToTheLayer: false
      })
    },
    showFavoriteGuide(e) {
      const that = this;
      const istap = e.currentTarget.dataset.istap;
      if (istap) return;

      that.setData({
        isPayAttentionToTheLayer: true
      })

      tt.showFavoriteGuide({
        type: 'bar',
        content: "一键添加「抖音商城上新了」",
        position: "bottom",
        success(res) {
          console.log(res, "showFavoriteGuide");
          if (res.errMsg !== 'showFavoriteGuide:fail had added to favorites list') {
            const res = tt.setStorageSync('showFavoriteGuide', true);
            dataLotteryAddApp(that.properties.detail.id).then(() => {
              that.triggerEvent("handleTap");
            })
          }
        },
        fail(err) {
        },
        complete(res) {
          console.log('showFavoriteGuide complete', res);
          that.setData({
            isPayAttentionToTheLayer: false
          })
          if (res.errMsg === 'showFavoriteGuide:fail had added to favorites list') {
            tt.showToast({
              title: '已经加入收藏列表',
              icon: 'none'
            });
            dataLotteryAddApp(that.properties.detail.id).then(() => {
              that.triggerEvent("handleTap");
            })
          }
        }
      })
    },
    handleProdTap() {
      if (!this.data.detail.tapTask.tapTaskHotStatus) {
        // 点击去完成
        tt.reportAnalytics('View_product_gocompleteClick', {
          page: 'flash_sale_detail',
          user_id: tt.getStorageSync('OPENID'),
          share_user_id: this.properties.shareInfo?.shareOpenId,
          share_user_name: this.properties.shareInfo?.shareName,
          goods_name: this.properties.detail.title,
          goods_ID: this.properties.detail.product_id
        });

        const tasks = this.properties.detail.top;
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].max_task_times !== tasks[i].finish_task_times) {
            const item = tasks[i]
            this.handleTaskTap({
              currentTarget: {
                dataset: {
                  id: item.id,
                  type: 'top',
                  istap: false,
                  businessid: item.third_id
                }
              }
            })
            break; // 跳出循环
          }
        }
      }
    },
    handleLiveTap() {
      // 点击去完成
      if (this.data.detail.live.max_task_times === this.data.detail.live.finish_task_times) {
        return
      }

      tt.reportAnalytics('View_living_gocompleteClick', {
        page: 'flash_sale_detail',
        user_id: tt.getStorageSync('OPENID'),
        share_user_id: this.properties.shareInfo?.shareOpenId,
        share_user_name: this.properties.shareInfo?.shareName,
        goods_name: this.properties.detail.title,
        goods_ID: this.properties.detail.product_id
      });

    },
    handleShopTap() {
      // 点击去完成
      if (this.data.detail.detail.max_task_times === this.data.detail.detail.finish_task_times) {
        return
      }
      tt.reportAnalytics('View_store_gocompleteClick', {
        page: 'flash_sale_detail',
        user_id: tt.getStorageSync('OPENID'),
        share_user_id: this.properties.shareInfo?.shareOpenId,
        share_user_name: this.properties.shareInfo?.shareName,
        goods_name: this.properties.detail.title,
        goods_ID: this.properties.detail.product_id
      });
    },
    // 直播间
    onPreviewError(err) {
      // console.log("preview error", err);
    },
    onPreviewUserPage(res) {
      // console.log("onPreviewUserPage", res);

    },
    onPreviewLiveRoom(res) {
      // console.log("onPreviewLiveRoom", res);
    },
    onPreviewLiveStatus(res) {
      // console.log("onPreviewLiveStatus", res);
      // this.livePlayerContext.mute();
      if (res.detail.errMsg == 'offline') {
        this.setData({
          isLive: false
        })
      } else {
        this.setData({
          isLive: true
        })
      }
    },
  }
})
