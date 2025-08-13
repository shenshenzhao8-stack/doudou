Component({
    properties: {
        showLivePreview: {
            type: Boolean,
            value: false
        }
    },
    data: {
        // 自定义组件内部属性
        defaultStates: {},
        list: [{
                banner: "https://n.sinaimg.cn/spider20240728/135/w1284h2051/20240728/3521-e02ea61b7a334b90833d9ed05a746854.jpg",
                liveInfo: {
                    title: '有哪些头像给人一看就感觉十分高级有哪些头像给人一看就感觉十分高级',
                    avatar: 'https://img1.baidu.com/it/u=3217838212,795208401&fm=253&fmt=auto&app=138&f=JPEG?w=514&h=500',
                    userName: '贺正林'
                },

                tag: '超值购',
                brand: '抖音旗舰',
                price: 1234,
                sold: 1417,
                applauseRate: 98,
                showLivePreview: false
            },
            {
                banner: "https://ww3.sinaimg.cn/mw690/0070p6Njly1hpvzbd5c9hj30j60y3n3i.jpg",
                liveInfo: {
                    title: '有哪些头像给人一看就感觉十分高级有哪些头像给人一看就感觉十分高级',
                    avatar: 'https://img1.baidu.com/it/u=3217838212,795208401&fm=253&fmt=auto&app=138&f=JPEG?w=514&h=500',
                    userName: '贺正林'
                },

                tag: '超值购',
                brand: '抖音旗舰',
                price: 1234,
                sold: 1417,
                applauseRate: 98,
                showLivePreview: false
            },
            {
                banner: "https://sf1-ttcdn-tos.pstatp.com/obj/xigua-lvideo-pic/2462c2003e5e356f8d4e1c0ee7928768",
                liveInfo: {
                    title: '有哪些头像给人一看就感觉十分高级有哪些头像给人一看就感觉十分高级',
                    avatar: 'https://img1.baidu.com/it/u=3217838212,795208401&fm=253&fmt=auto&app=138&f=JPEG?w=514&h=500',
                    userName: '贺正林'
                },

                tag: '超值购',
                brand: '抖音旗舰',
                price: 1234,
                sold: 1417,
                applauseRate: 98,
                showLivePreview: false
            },
            {
                banner: "https://pic.rmb.bdstatic.com/bjh/3ea882edca1/240609/9fb1a6c2f14a1b7d0cfe3e99588cbf43.jpeg?x-bce-process=image/resize,m_lfit,w_1242",
                liveInfo: {
                    title: '有哪些头像给人一看就感觉十分高级有哪些头像给人一看就感觉十分高级',
                    avatar: 'https://img1.baidu.com/it/u=3217838212,795208401&fm=253&fmt=auto&app=138&f=JPEG?w=514&h=500',
                    userName: '贺正林'
                },

                tag: '超值购',
                brand: '抖音旗舰',
                price: 1234,
                sold: 1417,
                applauseRate: 98,
                showLivePreview: false
            },
            {
                banner: "https://pic.rmb.bdstatic.com/bjh/3ea882edca1/240609/9fb1a6c2f14a1b7d0cfe3e99588cbf43.jpeg?x-bce-process=image/resize,m_lfit,w_1242",
                liveInfo: {
                    title: '有哪些头像给人一看就感觉十分高级有哪些头像给人一看就感觉十分高级',
                    avatar: 'https://img1.baidu.com/it/u=3217838212,795208401&fm=253&fmt=auto&app=138&f=JPEG?w=514&h=500',
                    userName: '贺正林'
                },

                tag: '超值购',
                brand: '抖音旗舰',
                price: 1234,
                sold: 1417,
                applauseRate: 98,
                showLivePreview: false
            },
            {
                banner: "https://pic.rmb.bdstatic.com/bjh/3ea882edca1/240609/9fb1a6c2f14a1b7d0cfe3e99588cbf43.jpeg?x-bce-process=image/resize,m_lfit,w_1242",
                liveInfo: {
                    title: '有哪些头像给人一看就感觉十分高级有哪些头像给人一看就感觉十分高级',
                    avatar: 'https://img1.baidu.com/it/u=3217838212,795208401&fm=253&fmt=auto&app=138&f=JPEG?w=514&h=500',
                    userName: '贺正林'
                },

                tag: '超值购',
                brand: '抖音旗舰',
                price: 1234,
                sold: 1417,
                applauseRate: 98,
                showLivePreview: false
            },
            {
                banner: "https://pic.rmb.bdstatic.com/bjh/3ea882edca1/240609/9fb1a6c2f14a1b7d0cfe3e99588cbf43.jpeg?x-bce-process=image/resize,m_lfit,w_1242",
                liveInfo: {
                    title: '有哪些头像给人一看就感觉十分高级有哪些头像给人一看就感觉十分高级',
                    avatar: 'https://img1.baidu.com/it/u=3217838212,795208401&fm=253&fmt=auto&app=138&f=JPEG?w=514&h=500',
                    userName: '贺正林'
                },

                tag: '超值购',
                brand: '抖音旗舰',
                price: 1234,
                sold: 1417,
                applauseRate: 98,
                showLivePreview: false
            },
        ],
        hideHeader: true,
        liveStatus: '',
        isScrolling: false
    },
    lifetimes: {
        attached() {
            // 获取系统信息以计算rpx到px的转换比例
            const systemInfo = tt.getSystemInfoSync();
            this.rpxRatio = systemInfo.windowWidth / 750; // 750是设计稿宽度

            // 创建滚动监听
            this.createScrollListener();
        },
        detached() {
            // 清理滚动监听
            if (this.scrollListener) {
                this.scrollListener.disconnect();
            }
        }
    },
    methods: {
        createScrollListener() {
            // 创建 IntersectionObserver 实例
            this.scrollListener = tt.createIntersectionObserver(this, {
                thresholds: [0, 0.5, 1.0],
                observeAll: true
            });

            // 监听所有商品卡片
            this.scrollListener.relativeToViewport({
                top: -500, // 向上扩展500rpx的观察区域
                bottom: 500 // 向下扩展500rpx的观察区域
            }).observe('.footbox', (res) => {
                const {
                    id,
                    intersectionRatio,
                    boundingClientRect
                } = res;
                if (id) {
                    // 找到对应的商品
                    const index = this.data.list.findIndex(item => item.id === id);
                    if (index !== -1) {
                        // 计算元素距离视口顶部的距离
                        const distanceFromTop = Math.abs(boundingClientRect.top);
                        // 设置目标距离为500rpx（转换为px）
                        const targetDistance = 500 * this.rpxRatio;
                        // 设置容差范围（10rpx）
                        const tolerance = 10 * this.rpxRatio;

                        // 当元素距离顶部在目标距离的容差范围内时显示直播预览
                        const showLivePreview = Math.abs(distanceFromTop - targetDistance) <= tolerance;

                        // 更新商品状态
                        if (this.data.list[index].showLivePreview !== showLivePreview) {
                            const newList = [...this.data.list];
                            newList[index] = {
                                ...newList[index],
                                showLivePreview
                            };
                            this.setData({
                                list: newList
                            });
                        }
                    }
                }
            });
        },
        onPreviewLiveStatus(res) {
            console.log("onPreviewLiveStatus", res.detail.errMsg);
            this.setData({
                liveStatus: res.detail.errMsg === 'live' ? '直播中' : '预约'
            })
        }
    },

});