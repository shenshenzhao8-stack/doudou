Component({
    properties: {}, // 定义外部传入属性

    data: {
        columns: [{
                id: 'left',
                height: 0,
                cards: []
            },
            {
                id: 'right',
                height: 0,
                cards: []
            }
        ],
        activeCardId: 1,
        loading: true,
        goodsList: [],
        hideHeader: true
    },

    // 生命周期方法
    lifetimes: {
        attached() { // 相当于原onLoad
            this.loadGoodsData();
        },
        detached() { // 相当于原onUnload
            if (this.throttleTimer) clearTimeout(this.throttleTimer);
        }
    },

    methods: { // 所有方法定义在methods中
        // 模拟加载商品数据
        loadGoodsData() {
            const ids = ['iambaby54', '1178956297'];
            const mockData = Array.from({
                length: 30
            }, (_, i) => ({
                id: i + 1,
                awemeid: ids[(i + 1) % 2],
                title: `直播${i + 1}`,
                image: `https://picsum.photos/400/${300 + Math.floor(Math.random() * 500)}`,
                description: i === 0 ? '精选直播～～～' : '',
                height: 400,
            }));
            console.log('goodsList', mockData)
            this.setData({
                goodsList: mockData
            }, () => {
                this.distributeCards();
                this.setData({
                    loading: false
                });
            });
        },

        // 核心：将商品分配到高度最小的列
        distributeCards() {
            const {
                goodsList,
                columns
            } = this.data;
            const newColumns = JSON.parse(JSON.stringify(columns));

            goodsList.forEach(goods => {
                // 找出当前高度最小的列
                const targetColumn = newColumns.reduce(
                    (minCol, currentCol) => minCol.height < currentCol.height ? minCol : currentCol,
                    newColumns[0]
                );

                // 添加商品到该列，并更新列高度
                targetColumn.cards.push(goods);
                targetColumn.height += goods.height + 20; // 加上卡片间距
            });
            console.log("columns", newColumns);
            this.setData({
                columns: newColumns
            });
        },

        // 滚动时检测中间卡片
        onScroll() {
            // 节流处理，避免频繁计算
            if (this.throttleTimer) return;
            this.throttleTimer = setTimeout(() => {
                this.checkMiddleCards();
                this.throttleTimer = null;
            }, 1500);
        },

        // 检测并高亮视口中间的卡片
        // checkMiddleCards() {
        //     const query = tt.createSelectorQuery().in(this);
        //     let middleY = 0;

        //     // 获取视口高度和中心点
        //     query.selectViewport().boundingClientRect(viewportRect => {
        //         if (!viewportRect) return;
        //         const viewportHeight = viewportRect.height;
        //         middleY = viewportHeight / 2;
        //     });

        //     // 获取所有卡片的位置信息
        //     query.selectAll('.waterfall-card').boundingClientRect(cardsRects => {
        //         if (!cardsRects || !cardsRects.length) return;
        //         // 找出最接近视口中心的卡片
        //         const closestCard = cardsRects.reduce((closest, card) => {
        //             const cardMiddle = card.top + card.height / 2;
        //             const distance = Math.abs(cardMiddle - middleY);
        //             return (closest === null || distance < closest.distance) ? {
        //                     id: card.dataset.id,
        //                     distance
        //                 } :
        //                 closest;
        //         }, null);
        //         // 更新活跃卡片ID
        //         closestCard.id && this.setData({
        //             activeCardId: closestCard.id
        //         });
        //     }).exec();
        // },
        checkMiddleCards() {
            const query = tt.createSelectorQuery().in(this);
            let middleY = 800;

            // 获取视口高度和中心点
            query.selectViewport().boundingClientRect(viewportRect => {
                if (!viewportRect) return;
                const viewportHeight = viewportRect.height;
                middleY = viewportHeight / 2;
                // console.log('视口中心点Y坐标:', middleY);
            });

            // 获取所有卡片的位置信息
            query.selectAll('.waterfall-card').boundingClientRect(cardsRects => {
                if (!cardsRects || !cardsRects.length) return;
                // console.log('所有卡片位置信息:', cardsRects);

                // 找出最接近视口中心的卡片
                const closestCard = cardsRects.reduce((closest, card) => {
                    const cardMiddle = card.top + card.height / 2;
                    const distance = Math.abs(cardMiddle - middleY);
                    // console.log('卡片ID:', card.dataset.id, '距离中心点距离:', distance);
                    return (closest === null || distance < closest.distance) ? {
                            id: card.dataset.id,
                            distance
                        } :
                        closest;
                }, null);

                // console.log('最接近中心的卡片:', closestCard);

                // 更新活跃卡片ID
                if (closestCard && closestCard.id) {
                    // console.log('设置新的activeCardId:', closestCard.id);
                    this.setData({
                        activeCardId: closestCard.id
                    });
                }
            }).exec();
        },
        lower(e) {
            console.log('触底', e)
        },
        onPreviewUserPage(res) {
            console.log("onPreviewUserPage", res);
        },
        onPreviewLiveRoom(res) {
            console.log("onPreviewLiveRoom", res);
        },
        onPreviewLiveStatus(res) {
            console.log("onPreviewLiveStatus", res);
        },
    }
});