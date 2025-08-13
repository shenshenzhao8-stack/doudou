import {
  dataLotteryPage
} from "../../api/lottery"
import {
  getBannerList
} from "../../api/index"
import { ossImageUrl } from '../../utils/imagsUrl'
import {
  navigateTo
} from "../../utils"
import {
  checkFirstVisitToday
} from "../../utils/date"
Page({
  data: {
    isRefreshTriggered: false,
    dataPage: [],
    page: 1,
    type: 1,
    total: 0,
    bannerSource: "lottery-detail",
    bannerList: [],
    /**
     * 数据状态
     * not-data 暂无数据
     * 
     * loading 加载中
     * 
     * not-more-data 暂无更多数据
     * 
     * loading-completed
     */
    dataStatus: 'not-data',
    OSS_URL: ossImageUrl,
    coverShow: false,
    pageInTime: '',
    leftIconInfo: {},
    customNavigation: {}
  },
  getCustomButtonInfo() {
    if (tt.canIUse("getCustomButtonBoundingClientRect")) {
      try {
        let res = tt.getCustomButtonBoundingClientRect();

        console.log(res, "lottery -> getCustomButtonBoundingClientRect");
        this.setData({
          leftIconInfo: res.leftIcon,
          customNavigation: res.customNavigation,
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
  onLoad: function () {
    this.getCustomButtonInfo()
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
  onShow: async function () {
    this.setData({
      pageInTime: new Date().getTime()
    })
    const active = tt.getStorageSync('form');
    // tt.reportAnalytics('flash_sale_agg_page_uv', {
    //   page: 'flash_sale_agg',
    // });

    tt.reportAnalytics("flash_sale_agg_page_view", {
      page: "flash_sale_agg",
      user_id: tt.getStorageSync("OPENID"),
      adsource: tt.getStorageSync("adsource") ?? '',
    });

    if (active == 'index') {
      this.setData({
        type: 2
      })
    }

    if (active == 'look-lottery') {
      this.setData({
        type: 1
      })
    }

    tt.removeStorage({
      key: 'form'
    })

    this.setData({
      page: 1,
      dataPage: [],
    })

    const res = await this.getLotteryPage()
    const isFirstVisit = checkFirstVisitToday('flash_sale_agg');
    if (isFirstVisit) {
      tt.reportAnalytics('flash_sale_agg_page_uv', {
        page: 'flash_sale_agg',
        user_id: tt.getStorageSync("OPENID"),
      });
    }

    this.setData({
      dataPage: res.data
    })

  },
  onReady: async function () {
    this.setData({
      dataStatus: 'loading'
    })

    // const res = await this.getLotteryPage()
    // this.setData({
    //   dataPage: res.data
    // })

    this.getBannerList();
  },
  async getBannerList() {
    const bannerList = await getBannerList({ position: 3 })

    this.setData({
      bannerList: bannerList.data.items,
    });
  },
  getLotteryPage() {
    return dataLotteryPage({ page: this.data.page, type: this.data.type }).then(res => {
      const total = res.data?.page_info?.total || 0;

      this.setData({
        total: total
      })

      // 暂无数据
      if (total == 0) {
        this.setData({
          dataStatus: 'not-data',
          dataPage: []
        })

        return {
          data: [],
          total: 0
        }
      }

      const list = res.data.data.map(item => {
        if (this.data.type === 2) {
          tt.reportAnalytics("participation_activity_card_exposure", {
            page: "flash_sale_agg",
            tab_name: "参与的",
            goods_id: item.product_id
          });
        }

        let status;

        if (item.status === 1) {
          status = 'in-progress'
        } else if (item.status === 2) {
          status = 'to-be-announced'
        } else if (item.status === 3) {
          status = "ended"
        } else {
          status = 'not-started'
        }

        return {
          ...item,
          status: status
        }
      })

      // 不够一页
      if (total === list.length) {
        this.setData({
          dataStatus: 'not-more-data'
        })
      }

      return {
        data: list,
        total: total
      }
    }).catch(() => {
      this.setData({
        dataStatus: 'not-data',
        dataPage: []
      })

      return {
        data: [],
        total: 0
      }
    })
  },
  // 下拉刷新
  async onRefreshRefresh() {
    this.setData({
      page: 1,
      isRefreshTriggered: true,
      dataPage: [],
      bannerList: []
    })

    this.getBannerList();

    const res = await this.getLotteryPage();

    this.setData({
      isRefreshTriggered: false,
      dataPage: res.data
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

    if (this.data.dataPage.length >= this.data.total) {
      this.setData({
        dataStatus: 'not-more-data'
      })

      return
    }

    const res = await this.getLotteryPage()

    const list = res.data || [];


    const arr = this.data.dataPage.concat(list);

    this.setData({
      dataPage: arr,
      status: 'loading-completed'
    })
  },
  handleTabTap: async function (val) {
    const index = val.target.dataset.index;
    if (index === 1) {
      tt.reportAnalytics("limited_click", {
        page: "flash_sale_agg"
      });
    }
    if (index === 2) {
      tt.reportAnalytics("my_participation_click", {
        page: "flash_sale_agg",
      });
    }
    this.setData({
      type: index,
      page: 1,
      dataPage: [],
      dataStatus: 'loading'
    })

    const res = await this.getLotteryPage()
    this.setData({
      dataPage: res.data
    })
  },
  handleLotteryClick: function (val) {
    const id = val.target.id
    if (this.data.type == 1) {
      tt.reportAnalytics('limited_activity_card_click', {
        page: 'flash_sale_agg',
        tab_name: '限量抽',
        goods_id: val.target.dataset.item.product_id
      });
    } else {
      tt.reportAnalytics('participation_activity_card_click', {
        page: 'flash_sale_agg',
        tab_name: '参与的',
        goods_id: val.target.dataset.item.product_id
      });
    }

    navigateTo({
      url: '/pages/lottery-detail/index',
      query: {
        id: id
      }
    })
  },
  handleBindscroll: function (e) {
    if (e.detail.scrollTop > 50) {
      if (!this.data.coverShow) {
        this.setData({ coverShow: true });
      }
    } else {
      if (this.data.coverShow) {
        this.setData({ coverShow: false });
      }
    }
  }
});
