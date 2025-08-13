import {
  getDrawNums,
  draw
} from "../../api/doudou"
import {
  dataUserInfo,
  dataUserEdit
} from "../../api/user"
Page({
  data: {
    drawNums: 0,
    isWin: false,
    isDrawing: false,
    showPrizePopup: false,
    showRulePopup: false, // 显示规则弹窗
    isMuted: true,
    autoPlay: false,  // 初始不自动播放
    videoLoop: false,
    videosLoaded: false,       // 视频预加载完成状态
    animationSourceMap: {
      prize0: "https://mini-app.tos-cn-beijing.volces.com/video/prize0.mp4",
      prize1: "https://mini-app.tos-cn-beijing.volces.com/video/prize1.mp4",
      prize4: "https://mini-app.tos-cn-beijing.volces.com/gif/prize4.gif",
    },
    downloadedAnimations: {},       // 存储预加载的视频
    popupTriggered: false,
    videoEnded: false, // 新增标记，记录视频是否自然结束
    video1pacity: 0,
    video0pacity: 0,
    activeVideoType: null, // 新增当前激活的视频类型
    showCodePopup: false, // 显示二维码弹窗
    prizeObj: {},
    userInfo: {},
    refModalUserAgreement: '',
    buttonBottom: 0,
    zindex: 1,
    videoZindex: -1,
    modalUserAgreementVisible: false,
    authorizationUserInfo: {
      avatarUrl: '',
      nickName: ''
    },
  },
  onShow() {
    this.getUserInfo()
    this.getDrawNum()
    tt.reportAnalytics('Doudou_Activity_PageView', {
      page: 'doudou_activites',
      user_id: tt.getStorageSync('OPENID')
    });
  },

  onLoad() {
    // 获取抽奖次数
    !this.data.videosLoaded && tt.showLoading({
      title: '游戏加载中',
    });
    this.videoContextMap = {
      0: tt.createVideoContext('lotteryVideo0', this),
      1: tt.createVideoContext('lotteryVideo1', this),
    };
    // 页面加载时预加载所有动画资源
    this.preloadAllAnimations();

  },
  onReady() {
    // 动态获取抽奖按钮的位置
    tt.createSelectorQuery().select('.poster_gif').boundingClientRect(res => {
      const imageHeight = res.height;
      this.setData({
        buttonBottom: imageHeight * 0.18 + 'px' // 15%高度处
      })
    }).exec()
  },
  // 校验缓存资源有效性
  verifyAnimationTemp() {
    return new Promise((resolve) => {
      tt.getStorage({
        key: 'VIDEO_PATH_DOUDOU',
        success: (res) => {
          const verifyTasks = Object.keys(res.data).map(key => {
            return new Promise((innerResolve, innerReject) => {
              tt.getFileInfo({
                filePath: res.data[key],
                digestAlgorithm: "md5",
                success: (data) => {
                  innerResolve(data);
                },
                fail: (err) => {
                  innerReject(err);
                },
              });
            });
          });
          Promise.all(verifyTasks)
            .then(() => {
              this.setData({
                downloadedAnimations: res.data,
              });
              this.data.videosLoaded = true,
                tt.hideLoading();
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        },
        fail: () => {
          resolve(false);
        },
      });
    });
  },

  // 预加载所有动画资源
  async preloadAllAnimations() {
    const isCacheValid = await this.verifyAnimationTemp();
    // 若无缓存动画资源则并行预加载
    if (!isCacheValid) {
      const downloadTasks = Object.keys(this.data.animationSourceMap).map(key => {
        return new Promise((resolve) => {
          tt.downloadFile({
            url: this.data.animationSourceMap[key],
            success: (res) => {
              if (res.statusCode === 200) {
                // 返回结构化数据而非直接setData
                resolve({
                  key,
                  success: true,
                  tempFilePath: res.tempFilePath
                });
              } else {
                resolve({
                  key,
                  success: false,
                  error: `HTTP ${res.statusCode}`
                });
              }
            },
            fail: (err) => {
              resolve({
                key,
                success: false,
                error: err.errMsg || '网络请求失败'
              });
            }
          });
        });
      });

      // 统一处理所有下载结果
      Promise.all(downloadTasks).then(results => {
        const downloadedAnimations = { ...this.data.downloadedAnimations };
        const failedKeys = [];
        let hasNewData = false;
        // 处理每个下载结果
        results.forEach(item => {
          if (item.success) {
            downloadedAnimations[item.key] = item.tempFilePath;
            hasNewData = true;
          } else {
            failedKeys.push(item.key);
            console.error(`下载失败 [${item.key}]:`, item.error);
          }
        });

        // 批量更新UI和缓存
        if (hasNewData) {
          this.setData({ downloadedAnimations });
          tt.setStorage({
            key: 'VIDEO_PATH_DOUDOU',
            data: downloadedAnimations // 一次性写入缓存
          });
        }

        // 错误处理
        if (failedKeys.length > 0) {
          tt.showToast({
            title: `${failedKeys.length}个资源加载失败`,
            icon: 'none'
          });
        }
        // 完成状态更新
        this.data.videosLoaded = true;
        tt.hideLoading();
      });
    }
  },
  // 获取当日抽奖次数
  getDrawNum() {
    getDrawNums().then(res => {
      if (res.code === 200) {
        this.setData({
          drawNums: res.data.remaining_times || 0
        })
      }
    })
  },

  // 获取用户信息
  getUserInfo() {
    const that = this;
    return new Promise((resolve) => {
      dataUserInfo().then(res => {
        that.setData({
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
  refModalUserAgreement: function (ref) {
    this.data.refModalUserAgreement = ref;
  },
  handleModalUserAgreementTap: async function (e) {
    if (e?.detail?.version) {
      await dataUserEdit(this.data.authorizationUserInfo.avatarUrl, this.data.authorizationUserInfo.nickName, e.detail.version);

      await this.getUserInfo();
    }
  },
  // 开始抽奖
  async startLottery() {
    if (this.data.drawNums === 0) {
      tt.reportAnalytics('Doudou_Chances_Out_PopupExpose', {
        page: 'doudou_activites',
        user_id: tt.getStorageSync('OPENID')
      });
      tt.showToast({
        title: "暂无抽奖次数，请明日再来参与抽奖!",
        icon: "none"
      })
      return
    } else {
      tt.reportAnalytics('Doudou_Click_Button', {
        page: 'doudou_activites',
        user_id: tt.getStorageSync('OPENID')
      });
    }

    // 判断用户是否获取用户信息
    if (this.data.userInfo.auth_version_id == 0) {
      const that = this;

      // this.data.refModalUserAgreement.getUserProfile();
      tt.getUserProfile({
        success(res) {
          console.log(res);
          that.setData({
            authorizationUserInfo: {
              avatarUrl: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName
            }
          })
          that.handleUserAgreementTap();
        },
        fail(res) {
          console.error("dou -> tt.getUserProfile 调用失败", res);
        }
      })

      return
    }
    // 将所有的视频暂停播放
    Object.values(this.videoContextMap).forEach(ctx => {
      ctx.seek(0);  // 回退到起始位置
      ctx.stop();  // 暂停播放
    });
    this.data.videoEnded = false
    this.data.popupTriggered = false;
    if (!this.data.videosLoaded) {
      tt.showToast({
        title: "视频加载中...",
        icon: "none"
      })
      return
    }
    setTimeout(() => {
      this.setData({ zindex: -1, videoZindex: 10 });
    }, 500);
    if (this.data.isDrawing || !this.data.videosLoaded) return;
    // 判断视频是否全部加载完毕 如果没有提示用户加载中
    this.setData({
      isDrawing: true,
    });
    // API请求
    this.simulateApiRequest();
    // 重置所有视频状态
    this.resetAllVideos();
  },
  handleUserAgreementTap() {
    this.handleCanelAgreementModal();
    this.setData({
      modalUserAgreementVisible: true
    })
  },
  resetAllVideos() {
    Object.values(this.videoContextMap).forEach(ctx => {
      ctx.stop();
      ctx.seek(0);
    });
    this.setData({
      video0pacity: 0,
      video1pacity: 0,
      activeVideoType: null
    });
  },
  // 抽奖接口
  simulateApiRequest() {
    draw().then(res => {
      if (res.code === 200) {
        this.getDrawNum();
        let prizeType = 0;
        if (res.data.prize_info?.prize_type === 1 || res.data.prize_info?.prize_type === 2 || res.data.prize_info?.prize_type === 3) {
          prizeType = 1
        } else {
          prizeType = 0
        }
        this.setData({
          isWin: res.data.hit,
          prizeObj: {
            prizeName: res.data.prize_info?.prize_name,
            code: res.data.win_code,
            prizeId: res.data.prize_info.prize_id,
            prizeType: res.data.prize_info.prize_type,
            couponInfo: res.data.prize_info.coupon_info,
            storeName: res.data.prize_info.store_name,
            storeId: res.data.prize_info.store_id,
            recordId: res.data.record_id,
            remotePrizeId: res.data.prize_info.remote_prize_id || ''
          },
          prize_type: prizeType,
          activeVideoType: prizeType, // 设置当前激活的视频
          [`video${prizeType}pacity`]: 1 // 只显示当前奖品视频
        });
        this.switchToLotteryVideo(prizeType);
      } else {
        this.setData({
          zindex: 1,
          videoZindex: -1
        })
        this.resetAllVideos()
        tt.showToast({
          title: '请稍后重试',
          icon: "none"
        })
      }
    });
  },

  switchToLotteryVideo(prizeType) {
    const targetVideo = this.videoContextMap[prizeType];
    if (targetVideo) {
      targetVideo.play();
    }
  },
  // 显示弹窗时调用此方法
  showPopup() {
    this.setData({
      showPrizePopup: true,
    });
  },
  // 监听视频播放进度
  bindtimeupdate(e) {
    const { currentTime } = e.detail;
    const id = e.currentTarget.id;
    const prizeType = id.replace('lotteryVideo', '');
    if (prizeType != this.data.activeVideoType) return;
    if (currentTime >= 5.3 && !this.data.popupTriggered) {
      this.data.popupTriggered = true;
      this.showPopup();
    }
  },

  // 视频播放结束
  videoEnded(e) {
    const prizeType = e.currentTarget.id.replace('lotteryVideo', '');
    if (prizeType != this.data.activeVideoType) return;
    this.videoContextMap[prizeType].pause();
    this.setData({
      videoEnded: true
    });
    // 重置状态
    this.resetLotteryState();
  },

  // 重置状态（优化）
  resetLotteryState() {
    this.setData({
      isDrawing: false,
      popupTriggered: false
    });
    this.data.videoEnded = false;
  },
  // 控制视频声音播放
  tapMuted() {
    this.setData({
      isMuted: !this.data.isMuted
    })
  },
  // 显示规则弹窗
  showRulePopup() {
    // 如果游戏进行中则无法点击
    if (this.data.isDrawing) return
    tt.reportAnalytics('Doudou_Rule_Click', {
      page: 'doudou_activites',
      user_id: tt.getStorageSync('OPENID')
    });

    this.setData({ showRulePopup: true });
  },

  // 关闭规则弹窗
  closeRulePopup() {
    console.log('关闭弹窗');
    this.setData({ showRulePopup: false });
  },
  // 关闭小助理弹窗
  closeCodePopup() {
    this.setData({ showCodePopup: false })
  },
  // 关闭中奖弹窗
  handleCanel() {
    const prizeType = this.data.prize_type;
    // 关键优化：立即停止视频并重置状态
    this.videoContextMap[prizeType].stop();
    this.setData({
      [`video${prizeType}pacity`]: 0,
      showPrizePopup: false,
      zindex: 1,
      videoZindex: -1,
      videoEnded: true
    });
    // 重置状态
    this.resetLotteryState();
  },
  handleCanelAgreementModal() {
    this.setData({
      modalUserAgreementVisible: false
    })
  },
});