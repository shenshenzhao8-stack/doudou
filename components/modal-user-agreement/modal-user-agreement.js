import { ossImageUrl } from '../../utils/imagsUrl'
import {
  getToken
} from "../../api/request.js"
import {
  login
} from "../../api/login"
import { dataUserEdit } from "../../api/user";

Component({
  data: {
    internalVisible: false, // 内部数据，用于存储 properties.visible 的值
    avatarUrl: '',
    nickName: '',
    version: 1,
    OSS_URL: ossImageUrl
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    pageName: {
      type: String,
      value: ''
    },
    /**
     * 是否协议
     * 
     * 传入 true 时，只调用协议
     * 
     * 推荐传入 true，因为 tt.getUserProfile 在内部调用，存在兼容问题
     */
    isPrivacyPolicy: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    attached() {
      this.setData({
        internalVisible: this.properties.visible
      });
    }
  },
  observers: {
    'visible': function (newVal) {
      // 监听 properties.visible 的变化，并更新 data.internalVisible
      this.setData({
        internalVisible: newVal
      });
    }
  },
  methods: {
    noop() { },
    handleTap() {
      if (this.properties.pageName === 'doudou_activites') {
        tt.reportAnalytics('doudou_privacy_policy_authorization_click', {
          page: 'doudou_activites',
        });
      } else if (this.properties.pageName === 'my') {
        tt.reportAnalytics('my_privacy_policy_authorization_click', {
          page: 'my',
          user_id: tt.getStorageSync('OPENID')
        });
      } else if (this.properties.pageName === 'lottery') {
        tt.reportAnalytics('privacy_policy_authorization_click', {
          page: 'privacy_policy_accept',
        });
      } else {
        tt.reportAnalytics('privacy_policy_authorization_click', {
          page: 'privacy_policy_accept',
        });
      }
      this.setData({
        internalVisible: false
      });
      this.triggerEvent("cancel", {});
    },
    async getUserProfile() {
      let that = this;

      try {
        const res = await new Promise((resolve, reject) => {
          tt.getUserProfile({
            success: (profile) => {
              resolve(profile);
              if (that.properties.pageName === 'doudou_activites') {
                tt.reportAnalytics('Doudou_UserAuth_agree_click', {
                  page: 'doudou_activites',
                });
              }

              if (that.properties.pageName === 'my') {
                tt.reportAnalytics('my_UserAuth_agree_click', {
                  page: 'my',
                  user_id: tt.getStorageSync('OPENID')
                });
              }
              if (that.properties.pageName === 'lottery') {
                tt.reportAnalytics('flash_sale_UserAuth_agree_click', {
                  page: 'flash_sale_UserAuth_Popup',
                });
              }
            },
            fail: (err) => {
              reject(err);
              console.error("modal-user-agreement -> tt.getUserProfile 调用失败", err);

              if (that.properties.pageName === 'doudou_activites') {
                tt.reportAnalytics('Doudou_UserAuth_refuse_click', {
                  page: 'doudou_activites',
                });
                tt.reportAnalytics('Doudou_UserAuth_close_click', {
                  page: 'doudou_activites',
                });
                console.log('买点成功了');
              }
              if (that.properties.pageName === 'my') {
                tt.reportAnalytics('my_UserAuth_close_click', {
                  page: 'my',
                  user_id: tt.getStorageSync('OPENID')
                });
                tt.reportAnalytics('my_UserAuth_refuse_click', {
                  page: 'my',
                  user_id: tt.getStorageSync('OPENID')
                });
              }
              if (that.properties.pageName === 'lottery') {
                tt.reportAnalytics('flash_sale_UserAuth_refuse_click', {
                  page: 'flash_sale_UserAuth_Popup',
                });
                tt.reportAnalytics('flash_sale_UserAuth_close_click', {
                  page: 'flash_sale_UserAuth_Popup',
                });
              }
            },
            complete(res) {
              if (that.properties.pageName === 'lottery') {
                tt.reportAnalytics('flash_sale_UserAuth_Popup_PV', {
                  page: 'flash_sale_UserAuth_Popup',
                });
              }
              if (that.properties.pageName === 'doudou_activites') {
                tt.reportAnalytics('Doudou_UserAuth_Popup_PV', {
                  page: 'doudou_activites',
                });
              }
              if (that.properties.pageName === 'my') {
                tt.reportAnalytics('my_UserAuth_Popup_PV', {
                  page: 'my',
                  user_id: tt.getStorageSync('OPENID')
                });
              }
            }
          });
        });
        // 2. 分离数据处理与UI更新
        const profile = {
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        };

        // 3. 安全更新UI：检查组件状态
        this.setData({
          internalVisible: true,
          ...profile
        });

        if (this.properties.pageName === 'doudou_activites') {
          tt.reportAnalytics('doudou_privacy_policy_accept_Popup_PV', {
            page: 'doudou_activites',
          });
        }
        if (this.properties.pageName === 'my') {
          tt.reportAnalytics('my_privacy_policy_accept_Popup_PV', {
            page: 'my',
            user_id: tt.getStorageSync('OPENID')
          });
        }
        if (this.properties.pageName === 'lottery') {
          tt.reportAnalytics('privacy_policy_accept_Popup_PV', {
            page: 'privacy_policy_accept',
          });
        }

        return profile; // 直接返回数据，避免resolve后操作
      } catch (err) {
        console.error("api 获取用户信息失败:", err);
        throw err; // 向上抛出错误
      }
    },
    async handleTap() {
      if (this.properties.pageName === 'doudou_activites') {
        tt.reportAnalytics('doudou_privacy_policy_authorization_click', {
          page: 'doudou_activites',
        });
      }
      if (this.properties.pageName === 'my') {
        tt.reportAnalytics('my_privacy_policy_authorization_click', {
          page: 'my',
          user_id: tt.getStorageSync('OPENID')
        });
        console.log('埋点成功了');
      }
      if (this.properties.pageName === 'lottery') {
        tt.reportAnalytics('privacy_policy_authorization_click', {
          page: 'privacy_policy_accept',
        });
      }
      this.setData({
        internalVisible: false
      })

      if (this.properties.isPrivacyPolicy) {
        this.triggerEvent("handleTap", {
          version: this.data.version
        });

        return;
      }

      try {
        await dataUserEdit(this.data.avatarUrl, this.data.nickName, this.data.version);
      } catch (err) {
        console.error("获取用户信息失败:", err);
        // 可以在这里添加错误处理逻辑，如显示错误提示
        return;
      }

      await this.triggerEvent("handleTap", {
        avatarUrl: this.data.avatarUrl,
        nickName: this.data.nickName,
        version: this.data.version
      });
    },
    handleCancelTap() {
      if (this.properties.pageName === 'doudou_activites') {
        tt.reportAnalytics('doudou_privacy_policy_reject_click', {
          page: 'doudou_activites',
        });
      }
      if (this.properties.pageName === 'my') {
        tt.reportAnalytics('my_privacy_policy_reject_click', {
          page: 'my',
          user_id: tt.getStorageSync('OPENID')
        });
      }
      if (this.properties.pageName === 'lottery') {
        tt.reportAnalytics('privacy_policy_reject_click', {
          page: 'privacy_policy_accept',
        });
      }
      this.setData({
        internalVisible: false
      })

      this.triggerEvent("cancel");
    },
    handleRouterTap() {
      if (this.properties.pageName === 'doudou_activites') {
        tt.reportAnalytics('doudou_privacy_policy_view', {
          page: 'doudou_activites',
        });
      }
      if (this.properties.pageName === 'my') {
        tt.reportAnalytics('my_privacy_policy_view', {
          page: 'my',
          user_id: tt.getStorageSync('OPENID')
        });
      }
      if (this.properties.pageName === 'lottery') {
        tt.reportAnalytics('privacy_policy_view', {
          page: 'privacy_policy_accept',
        });
      }
      tt.navigateTo({
        url: "/pages/user-agreement/user-agreement"
      })
    }
  }
});
