
import { getTokenData } from './index';

export const login = () => {
  return new Promise((resolve, reject) => {
    // 每次登录前清除旧token
    tt.removeStorageSync('TOKEN');
    tt.removeStorageSync('OPENID');
    tt.login({
      success: async (res) => {
        try {
          const data = await getTokenData(res.code);
          if (data.data && data.data.data && data.data.data.token) {
            // 存储新token
            tt.setStorageSync('TOKEN', data.data.data.token);
            tt.setStorageSync('OPENID', data.data.data.user_info.open_id);
            resolve(data.data.data.token);
          } else {
            throw new Error('获取token失败: 响应格式不正确');
          }
        } catch (error) {
          console.error('获取token过程中出错:', error);
          reject(error);
        }
      },
      fail: (err) => {
        console.error('登录失败:', err);
        reject(err);
      }
    });
  });
};