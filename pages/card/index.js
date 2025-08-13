import {
  getCardList
} from "../../api/my"
import { openEcShop } from '../../utils/douyin-shop'
Page({
  data: {
    couponList: [],
    page: 1,
    limit: 10,
    isRefreshTriggered: false,
    dataStatus: 'not-data',
    showPopup: false,
    isAllLoaded: false
  },

  onShow: async function () {
    this.setData({
      dataStatus: 'loading',
      isAllLoaded: false
    })

    // 重新加载第一页数据
    this.setData({ page: 1 })
    const res = await this.getCardData()

    // 检查数据是否为空
    if (res.data.length === 0) {
      this.setData({ dataStatus: 'not-data' })
    } else {
      this.setData({
        couponList: res.data,
        dataStatus: res.data.length < this.data.limit ? 'not-more-data' : ''
      })
    }
  },
  // 卡券包
  getCardData() {
    return getCardList({ page: this.data.page, limit: 10 }).then(res => {
      if (res.code === 200) {
        this.setData({
          total: res.data?.pagination?.total || 0
        })
        // 暂无数据
        if (res.data?.pagination?.total == 0) {
          this.setData({
            dataStatus: 'not-data',
            couponList: []
          })

          return {
            data: [],
            total: 0
          }
        }
        const list = res.data?.data?.map(item => {
          return {
            ...item,
          }
        })
        // 不够一页
        if (res.data.pagination?.total === list.length) {
          this.setData({
            dataStatus: 'not-more-data'
          })
        }

        return {
          data: list,
          total: res.data.pagination?.total || 0
        }
      } else {
        this.setData({
          dataStatus: 'not-data',
          couponList: []
        })
      }

    })
  },

  copyId(e) {
    const { storeid, type, code, shopid, couponid, tit, name } = e.currentTarget.dataset;
    // type ==1 招商礼品   type ==2 优惠券详情    type ==3 自采礼品 弹窗扫码领取 
    if (type === 1) {
      tt.reportAnalytics('contact_customer_Click', {
        page: 'my',
        user_id: tt.getStorageSync('OPENID'),
        gift_name: name
      });
      console.log('复制id 跳转店铺首页', code, storeid);
      tt.setClipboardData({
        data: code,
        success: () => {
          tt.showToast({
            title: `ID ${code} 已复制`,
            icon: 'none'
          })
        }
      })
      openEcShop(storeid)
    } else if (type === 2) {
      tt.reportAnalytics('goto_claim_Click', {
        page: 'my',
        user_id: tt.getStorageSync('OPENID')
      });
      console.log('优惠券详情，跳转领取优惠券');
      tt.navigateTo({
        url: '/pages/cpuonCard/cpuonCard',
        query: {
          id: shopid,
          couponId: couponid,
          tit: tit
        }
      });
    } else {
      tt.reportAnalytics('contact_assistant_Click', {
        page: 'my',
        user_id: tt.getStorageSync('OPENID'),
        gift_name: name
      });
      this.setData({ showPopup: true })

      tt.setClipboardData({
        data: code,
        success: () => {
          tt.showToast({
            title: `ID ${code} 已复制`,
            icon: 'none'
          })
        }
      })
    }
  },
  // 选择地址
  address(e) {
    tt.reportAnalytics('MyPage_add_address_Click', {
      page: 'my',
      user_id: tt.getStorageSync('OPENID')
    });
    const { id } = e.target.dataset
    tt.navigateTo({
      url: "/pages/address/index",
      query: {
        id: id
      }
    })
  },

  async onRefreshRefresh(e) {
    this.setData({
      page: 1,
      isRefreshTriggered: true,
      couponList: []
    })

    const res = await this.getCardData();

    this.setData({
      isRefreshTriggered: false,
      couponList: res.data
    })
  },
  // 上拉加载
  handleBindscrolltolower: async function (val) {
    if (this.data.total === 0) return

    this.setData({
      dataStatus: 'loading'
    })
    const page = this.data.page + 1;

    this.setData({
      page: page
    })

    if (this.data.couponList.length >= this.data.total) {
      this.setData({
        dataStatus: 'not-more-data'
      })

      return
    }

    const res = await this.getCardData()

    const list = res.data || [];


    const arr = this.data.couponList.concat(list);

    this.setData({
      couponList: arr,
      status: 'loading-completed'
    })
  },
  closeRulePopup() {
    this.setData({
      showPopup: false
    })
  },

  handleCanelCode: function () {
    this.setData({
      showPopup: false,
    })
  },
})