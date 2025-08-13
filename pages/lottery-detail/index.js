import dayjs from 'dayjs';
import { dataLotteryDetail, dataLotteryParticipate, dataLotterySaveMessage, dataLotteryDeleteMessage, dataLotteryIsHelp, dataLotteryAddApp, dataLotteryGetMessage } from "../../api/lottery"
import { dataUserEdit, dataUserInfo } from "../../api/user"
import { getToken } from "../../api/request"
import { login } from "../../api/login"
import { switchTab, transformObjectToArray } from '../../utils';
import { checkFirstVisitToday } from '../../utils/date';
import { lotteryTmplIds } from "../../api/message-subscription"
import { ossImageUrl } from '../../utils/imagsUrl'

Page({
    async onShareAppMessage(option) {
        const res = await this.getUserInfo();
        const that = this;

        tt.setStorageSync("is-show-source", "task-list");

        console.log(`pages/lottery-detail/index?shareName=${res?.nickName || 'Xxx'}&id=${this.data.id}&shareId=${res?.id}&shareOpenId=${res?.open_id}`);

        return {
            title: `${res?.nickName}分享给你`, // 这是要转发的小程序标题
            desc: "帮我助力，一起赢尖货！",
            path: `pages/lottery-detail/index?shareName=${res?.nickName}&id=${this.data.id}&shareId=${res?.id}&shareOpenId=${res?.open_id}`, // ?后面的参数会在转发页面打开时传入onLoad方法
            imageUrl: this.data.detail.image_url, // 支持本地或远程图片，默认是小程序 icon
            fail() {
                tt.removeStorageSync("is-show-source");
            },
            success() {
                console.log("lottery-detail -> onShareAppMessage", option);
                if (option.from === 'button') {
                    tt.reportAnalytics('invite_friends_Popup_PV', {
                        page: 'flash_sale_detail',
                        user_id: tt.getStorageSync("OPENID"),
                        share_user_id: that.data.shareInfo.shareOpenId,
                        share_user_name: that.data.shareInfo.shareName,
                        goods_name: that.data.detail.title,
                        goods_ID: that.data.detail.product_id
                    });
                }
                if (option.from === 'screenShot') {
                    tt.reportAnalytics('screen_short_Popup_PV', {
                        page: 'flash_sale_detail',
                        user_id: tt.getStorageSync("OPENID"),
                        share_user_id: that.data.shareInfo.shareOpenId,
                        share_user_name: that.data.shareInfo.shareName,
                        goods_name: that.data.detail.title,
                        goods_ID: that.data.detail.product_id
                    });
                }
            },
        };
    },
    getUserInfo() {
        const that = this;
        return new Promise((resolve) => {
            dataUserInfo().then(res => {
                that.setData({
                    userInfo: {
                        avatarUrl: res.data.avatar_url,
                        nickName: res.data.nick_name
                    }
                })
                resolve({
                    nickName: res.data.nick_name,
                    avatarUrl: res.data.avatar_url,
                    id: res.data.id,
                    open_id: res.data.open_id
                })
            }).catch(err => {
                resolve()
            })
        });
    },
    data: {
        modalLotteryRulesVisible: false,
        modalLotteryJoinVisible: false,
        modalLotteryTaskListVisible: false,
        modalLotteryIntegralFullVisible: false,
        modalLotteryHelpSuccessVisible: false,
        modalLotteryInviteToHelpAndParticipateVisible: false,
        modalLotteryWinningVisible: false,
        modalLotteryNotWinningVisible: false,
        modelSmallEnvelopeAnimationVisible: false,
        modelBigEnvelopeAnimationVisible: false,
        modalUserAgreementVisible: false,
        /**
         * 区分抽签状态
         * 
         * not-involved 未参与
         * 
         * and-participation 已参与
         * 
         * in-progress 活动进行中
         * 
         * is-lottery 是否中签
         * 
         * other 容错
         */
        lotteryStatus: "not-involved",
        detail: {},
        id: '',
        refModalUserAgreement: '',
        userInfo: {
            avatarUrl: '',
            nickName: ''
        },
        authorizationUserInfo: {
            avatarUrl: '',
            nickName: ''
        },
        shareInfo: {
            shareName: '',
            shareId: '',
            shareOpenId: ''
        },
        isWinningReminder: false,
        isScrollY: true,
        time: {
            current_time: 0,
            _start_time: 0,
            _publish_time: 0,
            _end_time: 0
        },
        isShare: false,
        templateIds: [],
        coverShow: false,
        pageInTime: '',
        leftIconInfo: {},
        OSS_URL: ossImageUrl,
    },

    onShow: async function () {
        tt.reportAnalytics('page_flash_sale_detail', {
            page: "flash_sale_agg"
        })
        try {
            tt.checkSession({
                success: (res) => {
                    console.log("lottery-detail -> onShow -> tt.checkSession -> success", res);
                },
                fail: (err) => {
                    tt.login();
                }
            });
        } catch (err) {
            console.error(err);
        }

        console.log("lottery-detail -> show");
        const that = this;

        const e = tt.getStorageSync('detail-share');

        console.log("lottery-detail -> detail-share", e);

        that.getCustomButtonInfo();

        // 确保登录完成
        if (!getToken()) {
            await login();
        }

        await that.getUserInfo();

        await dataLotteryGetMessage().then(res => {
            console.log('lottery-detail -> dataLotteryGetMessage', res);
            const list = res.data.data.map(item => item.template_id);

            that.setData({
                templateIds: list
            })
        })

        if (e?.id && e?.shareId) {
            that.setData({
                id: e?.id
            })
        }

        await that.getDetailData();

        if (!e?.shareId) return;

        const showSource = tt.getStorageSync("is-show-source")

        console.log(showSource, "showSource");

        // TOOD 优化
        that.setData({
            isScrollY: true,
            modalLotteryRulesVisible: false,
            modalLotteryJoinVisible: false,
            modalLotteryTaskListVisible: showSource == 'task-list',
            modalLotteryIntegralFullVisible: false,
            modalLotteryHelpSuccessVisible: false,
            modalLotteryInviteToHelpAndParticipateVisible: false,
            modalLotteryWinningVisible: false,
            modalLotteryNotWinningVisible: false,
            modelSmallEnvelopeAnimationVisible: false,
            modelBigEnvelopeAnimationVisible: false,
            modalUserAgreementVisible: false
        });

        await dataLotteryIsHelp(e.id, e.shareId).then(res => {
            that.setData({
                modalLotteryInviteToHelpAndParticipateVisible: true,
                shareInfo: {
                    shareName: e.shareName,
                    shareId: e.shareId,
                    shareOpenId: e?.shareOpenId
                }
            })
        }).catch(err => {
            if (err.code == 100035) {
                that.setData({
                    modalLotteryInviteToHelpAndParticipateVisible: true,
                    shareInfo: {
                        shareName: e.shareName,
                        shareId: e.shareId,
                        shareOpenId: e?.shareOpenId
                    }
                })
                return;
            }

            if (showSource == 'task-list') return;

            tt.showToast({
                title: err.msg,
                icon: "fail",
            })

            tt.removeStorageSync("detail-share")
        })
    },
    async onLoad(e) {
        this.setData({
            pageInTime: new Date().getTime()
        })

        const isFirstVisit = checkFirstVisitToday('flash_sale_detail');
        if (isFirstVisit) {
            tt.reportAnalytics("flash_sale_detail_page_uv", {
                page: "flash_sale_detail",
            });
        }
        const that = this;

        that.getMessage();

        that.setData({
            id: e?.id
        })

        tt.removeStorageSync("lottery-detail");

        tt.removeStorageSync("is-show-source");
    },
    onUnload() {
        tt.reportAnalytics("flash_sale_detail_page_stay_duration", {
            page: "flash_sale_detail",
            user_id: tt.getStorageSync("OPENID"),
            stay_time: Math.floor((new Date().getTime() - this.data.pageInTime) / 1000),
        });
    },
    getCustomButtonInfo() {
        if (tt.canIUse("getCustomButtonBoundingClientRect")) {
            try {
                let res = tt.getCustomButtonBoundingClientRect();
                this.setData({
                    leftIconInfo: res.leftIcon,
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
    getMessage: function () {
        const that = this;

        dataLotteryGetMessage().then(res => {
            const list = res.data.data.map(item => item.template_id);

            that.setData({
                templateIds: list
            })
        })
    },
    getRefreshData: function () {
        this.getDetailData();
    },
    handleCanel: function (e) {
        const type = e?.detail?.type;
        if (type == 'modal-lottery-invite-to-help-and-participate') {
            tt.removeStorageSync("detail-share");
        }

        if (type == "modal-lottery-task-list") {
            tt.removeStorageSync("is-show-source");
        }

        this.setData({
            isScrollY: true,
            modalLotteryRulesVisible: false,
            modalLotteryJoinVisible: false,
            modalLotteryTaskListVisible: false,
            modalLotteryIntegralFullVisible: false,
            modalLotteryHelpSuccessVisible: false,
            modalLotteryInviteToHelpAndParticipateVisible: false,
            modalLotteryWinningVisible: false,
            modalLotteryNotWinningVisible: false,
            modelSmallEnvelopeAnimationVisible: false,
            modelBigEnvelopeAnimationVisible: false,
            modalUserAgreementVisible: false
        });
    },
    getDetailData: async function () {
        const res = await dataLotteryDetail(this.data.id);

        const obj = {
            ...res.data,
            // 收藏小程序
            favorite: res.data.task_map?.favorite?.tasks[0],
            // 店铺详情
            detail: res.data.task_map?.detail?.tasks[0] || {},
            // 直播
            live: res.data.task_map?.live?.tasks[0] || {},
            // 分享
            share: res.data.task_map?.share?.tasks[0] || {},
            // 热点
            top: res.data.task_map?.top?.tasks || [],
            // 参与活动
            signup: res.data.task_map?.signup?.tasks[0] || {},
            _signup: res.data.signup,
            draw_winner: (res.data.draw_winner || []).filter(Boolean).map(item => `恭喜${item}中签！`),
            image: res.data.detail ? JSON.parse(res.data.detail) : {},
            start_time: dayjs(res.data.start_time).format('MM月DD日 HH:mm'),
            publish_time: dayjs(res.data.publish_time).format('MM月DD日 HH:mm'),
            end_time: dayjs(res.data.end_time).format('MM月DD日 HH:mm'),
            original_start_time: res.data.start_time,
            original_publish_time: res.data.publish_time,
            original_end_time: res.data.end_time,
            list_price: (res.data.list_price / 100).toFixed(2),
            price: (res.data.price / 100).toFixed(2),
            listPriceGreaterThanPrice: res.data.list_price < res.data.price,
        }


        const list = obj.top.map(item => {
            return {
                viewed: item.max_task_times === item.finish_task_times
            }
        })

        const allViewed = list.every(item => item.viewed === true);

        const max_task = obj.top.reduce((sum, task) => {
            return sum + (task.max_task_times || 0);
        }, 0);

        const finish_task = obj.top.reduce((sum, task) => {
            return sum + (task.finish_task_times || 0);
        }, 0);

        obj['tapTask'] = {
            tapTaskHotStatus: allViewed,
            max_task: max_task,
            finish_task: finish_task
        }

        this.setData({
            isWinningReminder: obj.subscribe
        })

        this.setData({
            detail: obj
        })

        tt.reportAnalytics('flash_sale_detail_page_view', {
            goods_id: obj.product_id,
            goods_name: obj.title,
            user_id: tt.getStorageSync("OPENID"),
            page: 'flash_sale_detail',
        });

        const current_time = dayjs().valueOf();
        const _start_time = dayjs(obj.original_start_time).valueOf();
        const _publish_time = dayjs(obj.original_publish_time).valueOf();
        const _end_time = dayjs(obj.original_end_time).valueOf();

        // 确保除法次数及触发时机
        if (obj.has_draw_times == obj.total_draw_times && current_time < _publish_time) {
            const isModalLotteryIntegralFullVisible = tt.getStorageSync(this.data.id)

            if (!isModalLotteryIntegralFullVisible) {
                this.handleIntegralFullTop();
                tt.setStorageSync(this.data.id, true);
            }
        }

        this.setData({
            time: {
                current_time,
                _start_time,
                _publish_time,
                _end_time
            }
        })

        /**
         * 当前时间 大于开始时间 及 小于发布时间 可以进行做任务
         * 
         * 当前时间 大于发布时间 都是去查看结果
         * 
         * 当前时间 大于截止时间 都是去查看结果
         * 
         * 如果是未参加活动：活动已达到公布结果时间节点或截止购买时间节点，若用户点击该活动进入详情页面，页面内展示“去看看其他尖货”按钮
         */

        if (!obj._signup && current_time > _publish_time) {
            this.setData({
                lotteryStatus: 'other'
            })
        }

        if (!obj._signup) {
            this.setData({
                lotteryStatus: 'not-involved'
            })

            return obj;
        } else {
            this.setData({
                lotteryStatus: 'and-participation'
            })
        }

        if (_publish_time > current_time && _start_time < current_time) {
            this.setData({
                lotteryStatus: 'in-progress'
            })
        }

        if (current_time > _publish_time) {
            this.setData({
                lotteryStatus: 'is-lottery'
            })
        }

        console.log("lottery-detail -> getDetailData", obj);

        return obj;
    },
    handleModelTop: async function () {
        const that = this;
        if (that.data.lotteryStatus === 'not-involved') {
            tt.reportAnalytics('immediate_lottery_click', {
                page: 'flash_sale_detail',
                user_id: tt.getStorageSync("OPENID"),
                goods_name: that.data.detail.title,
                goods_id: that.data.detail.product_id
            });
        }

        if (that.data.lotteryStatus === 'is-lottery') {
            tt.reportAnalytics('check_now_click', {
                page: 'flash_sale_detail',
                user_id: tt.getStorageSync("OPENID"),
                goods_name: that.data.detail.title,
                goods_id: that.data.detail.product_id
            });
        }

        that.setData({
            isScrollY: false
        })
        console.log(that.data.lotteryStatus, 'this.data.lotteryStatus');
        if (that.data.lotteryStatus === 'not-involved') {
            if (that.data.userInfo.nickName && that.data.userInfo.avatarUrl) {

                const shareId = that.data.isShare ? that.data.shareInfo.shareId : undefined;

                await dataLotteryParticipate(that.data.detail.id, shareId).then(res => {
                    if (shareId) {
                        that.handleHelpSuccessTop();
                    } else {
                        that.handleJoinTap();
                    }

                    that.getDetailData();
                }).catch(err => {
                    tt.showToast({
                        title: err.msg,
                        icon: "fail",
                    });
                })

                that.setData({
                    isShare: false
                })

                return;
            }

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
                    console.error("modal-lottery-invite-to-help-and-participate -> tt.getUserProfile 调用失败", res);
                }
            })
        } else if (that.data.lotteryStatus === 'in-progress') {
            that.handleTaskListTop()
        } else if (that.data.lotteryStatus === 'is-lottery') {
            tt.removeStorageSync(that.data.id);

            if (that.data.detail.is_winner) {
                that.handleWinningTap();
            } else {
                that.handleNotWinningTap();
            }
        } else if (that.data.lotteryStatus === 'other') {
            that.handleRouterTap();
        } else {
            that.handleRouterTap();
        }
    },
    /**
     * TODO 修改订阅通知
     */
    switchChange() {
        const that = this;
        tt.reportAnalytics('subscribe_lotteryaler_tclick', {
            page: "flash_sale_detail",
            user_id: tt.getStorageSync("OPENID"),
            goods_name: that.data.detail.title,
            goods_id: that.data.detail.product_id
        });
        if (this.data.isWinningReminder) {
            dataLotteryDeleteMessage(that.data.id).then(res => {
                that.setData({
                    isWinningReminder: false
                })

                that.getMessage();
            })

            return
        }

        const difference = lotteryTmplIds.filter(item => !that.data.templateIds.includes(item));

        console.log(difference, "lottery-detail -> difference -> 返回值中，是否已经包含全部模版 id");

        // 已经订阅过的判断
        if (difference.length == 0) {
            dataLotterySaveMessage(that.data.id).then(() => {
                that.setData({
                    isWinningReminder: true
                })

                that.getMessage();
            }).catch(err => {
                that.setData({
                    isWinningReminder: false
                })

                tt.showToast({
                    title: "订阅失败",
                    icon: 'fail'
                });
            })

            return
        }

        tt.requestSubscribeMessage({
            tmplIds: difference,
            success(res) {
                console.log(res, "lottery-detail -> tt.requestSubscribeMessage");
                if (res.errMsg === 'requestSubscribeMessage:ok') {
                    tt.reportAnalytics('applicationnotification_agree_click', {
                        page: "flash_sale_detail",
                        user_id: tt.getStorageSync("OPENID"),
                        goods_name: that.data.detail.title,
                        goods_id: that.data.detail.product_id
                    });
                    tt.reportAnalytics('applicationnotification_popup_view', {
                        page: "flash_sale_detail",
                        user_id: tt.getStorageSync("OPENID"),
                        goods_name: that.data.detail.title,
                        goods_id: that.data.detail.product_id
                    });

                    const tem = transformObjectToArray(res.templateSettings) || [];

                    dataLotterySaveMessage(that.data.id, tem).then(() => {
                        that.setData({
                            isWinningReminder: true
                        })

                        that.getMessage();
                    }).catch(err => {
                        that.setData({
                            isWinningReminder: false
                        })

                        tt.showToast({
                            title: "订阅失败",
                            icon: 'fail'
                        });
                    })
                }
            },
            fail(err) {
                tt.reportAnalytics('applicationnotification_refuse_click', {
                    page: "flash_sale_detail",
                    user_id: tt.getStorageSync("OPENID"),
                    goods_name: that.data.detail.title,
                    goods_id: that.data.detail.product_id
                });

                console.log("lottery-detail -> requestSubscribeMessage -> fail", err);

                that.setData({
                    isWinningReminder: false
                })

                tt.showToast({
                    title: "订阅失败",
                    icon: 'fail'
                });
            },
            complete() {
                tt.reportAnalytics('applicationnotification_close_click', {
                    page: "flash_sale_detail",
                    user_id: tt.getStorageSync("OPENID"),
                    goods_name: that.data.detail.title,
                    goods_id: that.data.detail.product_id
                });
            }
        });
    },
    refModalUserAgreement: function (ref) {
        this.data.refModalUserAgreement = ref;
    },
    handleModalUserAgreementTap: async function (e) {
        console.log(e, "lottery-detail -> handleModalUserAgreementTap");
        if (e?.detail?.version) {
            await dataUserEdit(this.data.authorizationUserInfo.avatarUrl,this.data.authorizationUserInfo.nickName, e.detail.version);

            await this.getUserInfo();
        }

        this.handleModelTop();
    },
    handleInviteToHelpAndParticipateTap: async function (e) {
        if (e?.detail?.version) {
            await dataUserEdit(e.detail.avatarUrl, e.detail.nickName, e.detail.version);

            await this.getUserInfo();
        }

        this.setData({
            isShare: true
        })

        tt.removeStorageSync("detail-share")

        this.handleModelTop();

        // this.handleHelpSuccessTop()
    },
    handleRouterTap: function () {
        switchTab({
            url: '/pages/lottery/index'
        })

        tt.setStorageSync('form', 'look-lottery');
    },

    // ———————————— 各种弹出框打开
    handleRulesTap: function () {
        tt.reportAnalytics('flash_sale_detail_page_rule_click', {
            page: 'flash_sale_detail',
            user_id: tt.getStorageSync("OPENID"),
            goods_name: this.data.detail.title,
            goods_id: this.data.detail.product_id
        });
        this.handleCanel();
        this.setData({
            modalLotteryRulesVisible: true
        });
    },
    handleIntegralFullTop: function () {
        this.handleCanel();
        this.setData({
            modalLotteryIntegralFullVisible: true
        })
    },
    handleHelpSuccessTop: function () {
        this.handleCanel();
        this.setData({
            modalLotteryHelpSuccessVisible: true
        })
    },
    handleInviteToHelpAndParticipateTop: function () {
        this.handleCanel();
        this.setData({
            modalLotteryInviteToHelpAndParticipateVisible: true
        })
    },
    handleWinningTap: function () {
        this.handleCanel();
        this.setData({
            modalLotteryWinningVisible: true
        })
    },
    handleNotWinningTap: function () {
        this.handleCanel();
        this.setData({
            modalLotteryNotWinningVisible: true
        })
    },
    handleTaskListTop: function () {
        this.handleCanel();

        this.setData({
            modalLotteryTaskListVisible: true
        })
    },
    handleUserAgreementTap: function () {
        // this.data.refModalUserAgreement.getUserProfile();
        this.handleCanel();
        this.setData({
            modalUserAgreementVisible: true
        })
    },
    handleResetTap: function () {
        dataUserEdit('', '', 0)
    },
    handleJoinTap: function () {
        this.handleCanel();
        this.setData({
            modalLotteryJoinVisible: true
        });
    },
    handleSmallAnimationTap: function () {
        this.handleCanel();
        this.setData({
            modelSmallEnvelopeAnimationVisible: true
        });
    },
    handleBigAnimationTap: function () {
        this.handleCanel();
        this.setData({
            modelBigEnvelopeAnimationVisible: true
        });
    },
    handleCopyTap: function () {
        tt.setClipboardData({
            data: "that.data.copyed",

            success() {
                tt.showToast({
                    title: `ID ${code} 已复制`,
                    icon: 'none'
                })
            },
            fail(res) {
                console.log(res);
            }

        });
    },
    handleTestTap: function (e) {
        console.log(e);
    },
    handleBindscroll: function (e) {
        if (e.detail.scrollTop > 176) {
            if (!this.data.coverShow) {
                this.setData({ coverShow: true });
            }
        } else {
            if (this.data.coverShow) {
                this.setData({ coverShow: false });
            }
        }
    }
})
