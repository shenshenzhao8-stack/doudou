import {
  dataLotteryPage
} from "../../api/lottery"
import { ossImageUrl } from '../../utils/imagsUrl'
Page({
  data: {
    tabs: {
      active: 1
    },
    isRefreshTriggered: false,
    dataPage: [],
    page: 1,
    type: 2,
    total: 0,
    bannerSource: "lottery-detail",
    OSS_URL: ossImageUrl,
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
    dataStatus: 'not-data'
  },
  onReady: async function () {
    this.setData({
      dataStatus: 'loading'
    })

    const res = await this.getLotteryPage()
    this.setData({
      dataPage: res.data
    })
  },
  getLotteryPage() {
    return dataLotteryPage({ page: this.data.page, type: 2 }).then(res => {
      const total = res.data?.page_info?.total || 0;
      
      this.setData({
        total: total
      })

      // 暂无数据
      if(total == 0) {
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
        let status;

        if(item.status === 1) {
          status= 'in-progress'
        } else if(item.status === 2) {
          status= 'to-be-announced'
        } else if(item.status === 3) {
          status = "ended"
        } else {
          status= 'not-started'
        }

        return {
          ...item,
          status: status
        }
      })

      // 不够一页
      if(total === list.length) {
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
  async onRefreshRefresh(e) {
    this.setData({
      page: 1,
      isRefreshTriggered: true,
      dataPage: []
    })

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

    this.setData({
      type: index,
      page: 1,
      dataPage: [],
      tabs: {
        active: index
      },
      dataStatus: 'loading'
    })

    const res = await this.getLotteryPage()
    this.setData({
      dataPage: res.data
    })
  },
  handleLotteryClick: function (val) {
    console.log(val)
    const id = val.target.id

    tt.navigateTo({
      url: "/pages/lottery-detail/index",
      query: {
        id: id
      }
    })
  }
});
