import { getHotRecommend } from '../../api/my'
import {
  dataUserInfo,
  dataUserEdit
} from "../../api/user"
import {
  recordDailyPopup
} from "../../api/index"
import { checkFirstVisitToday } from "../../utils/date"
const app = getApp()
Page({
  data: {
    current: 0,
    userInfo: {},
    products: [],
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
    loading: false,
    dataStatus: 'not-data',
    awemeId: '1178956297',
    refModalUserAgreement: '',
    isShowUser: false, // 是否当日已经弹窗过
    pageTime: 0,
    coverShow: false,
    pageInTime: "",
    leftIconKeys: [],
    leftIconInfo: {},
    capsuleKeys: [],
    capsuleInfo: {},
    customNavigation: {},
    avatar_url: '',
    modalUserAgreementVisible: false,
    authorizationUserInfo: {
      avatarUrl: '',
      nickName: ''
    },
  },
  async onShow() {
    this.initList()
    await this.getUserNums()
    this.getUserInfo()
    tt.reportAnalytics('MyPage_View', {
      page: 'my',
      user_id: tt.getStorageSync('OPENID')
    });
  },
  onLoad() {
    this.getCustomButtonInfo()
    // UV埋点
    const isFirstVisit = checkFirstVisitToday('my');
    if (isFirstVisit) {
      tt.reportAnalytics('MyPage_UniqueView', {
        page: 'my',
        user_id: tt.getStorageSync('OPENID')
      });
      console.log('my-UV埋点成功');
    }

    // 埋点上报逻辑（与工具函数解耦）
    this.setData({
      pageTime: new Date().getTime()
    })
  },
  getCustomButtonInfo() {
    if (tt.canIUse("getCustomButtonBoundingClientRect")) {
      try {
        let res = tt.getCustomButtonBoundingClientRect();
        this.setData({
          leftIconInfo: res.leftIcon,
          leftIconKeys: Object.keys(res.leftIcon),
          capsuleInfo: res.capsule,
          customNavigation: res.customNavigation,
          capsuleKeys: Object.keys(res.capsule),
        });
      } catch (error) {
        // getCustomButtonBoundingClientRect只适用于自定义导航栏
        // 非自定义（默认）导航栏调用将抛出错误
        console.log(error);
      }
    } else {
      tt.showModal({
        title: "提示",
        content:
          "当前客户端版本过低，无法使用该功能，请升级客户端或关闭后重启更新。",
      });
    }
  },
  onHide() {
    const outTime = Number((new Date().getTime() - this.data.pageInTime) / 1000);
    tt.reportAnalytics("MyPage_StayDuration", {
      user_id: tt.getStorageSync("OPENID"),
      stay_time: Math.floor(outTime),
      page: "my",
    });
  },
  // 初始化/刷新
  async initList() {
    this.setData({
      dataStatus: 'loading',
      page: 1,
      hasMore: true,
      products: [],
      loading: true
    })
    await this.loadList(1)
    this.setData({ loading: false })
  },

  // 加载数据（分页）
  async loadList(page) {
    try {
      const res = await getHotRecommend({ page, limit: this.data.limit })
      if (res.code === 200) {
        const total = res.data?.pagination?.total || 0
        let list = (res.data.products || []).map(item => {
          // 按优先级设置 imageUrl
          if (item?.cms_white_back_ground_pic) {
            item.imageUrl = item.cms_white_back_ground_pic
          } else if (item?.white_back_ground_pic) {
            item.imageUrl = item.white_back_ground_pic
          } else if (item.image_url) {
            item.imageUrl = item.image_url
          } else {
            item.imageUrl = ''
          }
          let priceFen = Number(item.price) || 0;
          let priceYuan = priceFen / 100; // 先转为元
          // 根据是否有小数来决定显示格式
          if (priceYuan % 1 === 0) {
            // 整数，如 2000分 = 20元
            item.priceArr = [priceYuan.toString(), ''];
          } else {
            // 有小数，最多保留两位
            let priceStr = priceYuan.toFixed(2);
            // 去掉末尾的0，如 19.50 -> 19.5
            priceStr = priceStr.replace(/\.?0+$/, '');
            item.priceArr = priceStr.split('.');
            // 如果只有一位小数，确保数组长度为2
            if (item.priceArr.length === 1) {
              item.priceArr.push('');
            }
          }
          return item
        })
        // 如果是第一页，覆盖；否则追加
        let newProducts = page === 1 ? list : this.data.products.concat(list)
        let hasMore = newProducts.length < total
        this.setData({
          products: newProducts,
          total,
          hasMore,
          dataStatus: newProducts.length === 0 ? 'not-data' : (hasMore ? 'more' : 'not-more-data')
        })
      } else {
        this.setData({
          dataStatus: 'not-data',
          products: [],
          hasMore: false
        })
      }
    } catch (e) {
      this.setData({
        dataStatus: 'not-data',
        hasMore: false
      })
    }
  },
  onPageScroll(e) {
    if (e.scrollTop > 0) {
      if (!this.data.coverShow) {
        this.setData({ coverShow: true });
      }
    } else {
      if (this.data.coverShow) {
        this.setData({ coverShow: false });
      }
    }
  },

  handleGoods(e) {
    console.log('e', e.detail);
    tt.reportAnalytics("MyPage_GoodsCardClick", {
      goods_id: e.detail.id,
      page: "my",
      goods_name: e.detail.title
    });
  },

  // 上拉加载更多
  /**
   * Handles the "reach bottom" event for infinite scrolling.
   * Loads the next page of data if more data is available and not already loading.
   * Updates the page number and loading state after fetching data.
   */
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ loading: true })
    const nextPage = this.data.page + 1
    await this.loadList(nextPage)
    this.setData({
      page: nextPage,
      loading: false
    })
  },
  onPullDownRefresh() {
    this.setData({
      page: 1,
    });
    this.loadList();
    setTimeout(() => {
      tt.stopPullDownRefresh();
    }, 1000);
  },
  switchTap(e) {
    this.setData({
      current: e.detail.current
    })
  },

  goCard() {
    tt.reportAnalytics('MyPage_CouponEntryClick', {
      page: 'my',
      user_id: tt.getStorageSync('OPENID')
    });
    tt.navigateTo({
      url: '/pages/card/index',
    })
  },
  goParticipate() {
    tt.reportAnalytics('MyPage_ParticipateEntryClick', {
      page: 'my',
      user_id: tt.getStorageSync('OPENID')
    });
    tt.navigateTo({
      url: '/pages/participate/participate',
    })
  },
  goAddress() {
    tt.navigateTo({
      url: '/pages/address/index',
    })
  },
  refModalUserAgreement(ref) {
    this.data.refModalUserAgreement = ref;
  },
  handleModalUserAgreementTap: async function (e) {
    if (e?.detail?.version) {
      await dataUserEdit(this.data.authorizationUserInfo.avatarUrl, this.data.authorizationUserInfo.nickName, e.detail.version);

      await this.getUserInfo();
    }
  },
  getUserProfile() {
    tt.reportAnalytics('MyPage_AvatarClick', {
      page: 'my',
      user_id: tt.getStorageSync('OPENID')
    });

    const that = this;

    if (this.data.avatar_url === '') {
      tt.getUserProfile({
        success(res) {
          that.setData({
            authorizationUserInfo: {
              avatarUrl: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName
            }
          })
          that.handleUserAgreementTap();
        },
        fail(res) {
          console.error("my -> tt.getUserProfile 调用失败", res);
        }
      })
    }
    // // 判断用户当日是否已经弹出弹窗如果是则不弹
    // if (!this.data.isShowUser) return
    // // 获取用户信息
    // if (this.data.userInfo.auth_version_id == 0) {
    //   this.data.refModalUserAgreement.getUserProfile();
    // }
  },
  handleCanel: function () {
    this.setData({
      modalUserAgreementVisible: false
    })
  },
  handleUserAgreementTap: function () {
    // this.data.refModalUserAgreement.getUserProfile();
    this.handleCanel();
    this.setData({
      modalUserAgreementVisible: true
    })
  },
  // 判断用户当日是否已经弹出弹窗如果是则不弹
  getUserNums() {
    let type = { type: [3] }; // 正确对象结构
    recordDailyPopup(type).then(res => {
      if (res.data) {
        this.data.isShowUser = res.data.show[0]
      } else {
        this.data.isShowUser = false
      }
    })
  },

  // 获取用户信息
  getUserInfo() {
    const that = this;
    return new Promise((resolve) => {
      dataUserInfo().then(res => {
        that.setData({
          avatar_url: res.data.avatar_url,
          userInfo: {
            avatarUrl: res.data.avatar_url,
            nickName: res.data.nick_name,
            id: res.data.user_id,
            auth_version_id: res.data.auth_version_id
          }
        })
        resolve({
          nickName: res.data.nick_name,
          avatarUrl: res.data.avatar_url,
          id: res.data.user_id
        })
      })
    });
  },

  jumpCrad() {
    tt.navigateTo({
      url: '/pages/cpuonCard/cpuonCard',
    })
  },
})