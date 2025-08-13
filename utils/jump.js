/**
 *
 * 跳转类型 1:商品详情；2:H5页面；3:抽签页面；4:直播间
 */
import { openGood, openEcShop, openEcPage } from "./douyin-shop";
export const jumpPage = (data) => {
  console.log("跳转类型", data);
  if(data.jump_type === 1) {
    openGood(data.post_id)
  }
  if(data.jump_type === 2) {
    openEcPage(data.jump_url)
  }
  if(data.jump_type === 3) {
    tt.navigateTo({
      url: `/pages/lottery-detail/index?id=${data.activity_id}`,
      success: (res) => {
        
      },
      fail: (res) => {
        console.log('跳转出错了')
      },
    });
  }
  if(data.jump_type === 4) {
    tt.openSchema({
      schema: `sslocal://webcast_room?user_id=${data.live_id}`,
      success(res) {
        console.log("直播间打开成功", res);
      },
      fail(err) {
        console.log("直播间打开失败", err);
      },
    })
  }
};
