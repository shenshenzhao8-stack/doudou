import {
  request
} from '../api/request';
import {
  subscribeMessage,
  lotteryTmplIds
} from "./message-subscription"
import {
  responseInterceptor
} from "../utils"

/**
 * 获取尖货抽签列表
 * @param {*} page 
 * @param {*} type 1 全部抽奖 2 我参与的
 * @returns 
 */
export function dataLotteryPage({
  page,
  type
}) {
  const _type = type === 2 ? 2 : 1;
  return request({
    url: _type === 1 ? '/openapi/v1/jh/products' : '/openapi/v1/jh/my-join-products',
    method: 'get',
    data: {
      limit: 10,
      page: page
    }
  }).then(responseInterceptor);
}

/**
 * 获取尖货详情
 * @param {*} id 
 * @returns 
 */
export function dataLotteryDetail(id) {
  return request({
    url: '/openapi/v1/jh/product-detail',
    method: 'get',
    data: {
      id: id
    }
  }).then(responseInterceptor);
}

/**
 * 参加抽签
 */
export function dataLotteryParticipate(id, invite_user_id) {
  return request({
    url: '/openapi/v1/jh/join-draw',
    method: 'post',
    data: {
      activity_id: id,
      invite_user_id: invite_user_id ? invite_user_id : undefined
    }
  }).then(responseInterceptor);
}

/**
 * 添加小程序
 */
export function dataLotteryAddApp(jh_activity_id) {
  return request({
    url: '/openapi/v1/jh/mini-favorite',
    method: 'post',
    data: {
      jh_activity_id
    }
  })
}

/**
 * 完成各个任务
 * 
 * @param {*} param0
 * task_id 任务 id
 * activity_id 活动 id
 * category 任务类型: 'signup' | 'detail' | 'top' | 'live' | 'favorite' | 'share'
 * @returns 
 */
export function dataLotteryFinishTask({
  task_id,
  activity_id,
  category
}) {
  return request({
    url: '/openapi/v1/jh/finish-task',
    method: 'post',
    data: {
      task_id,
      activity_id,
      category
    }
  }).then(responseInterceptor);
}

/**
 * 开启消息订阅
 */
export async function dataLotterySaveMessage(activity_id, template) {
  try {
    return await request({
      url: "/openapi/v1/jh/save-subscribe-template",
      method: "post",
      data: {
        jh_activity_id: activity_id,
        template: template
      }
    }).then(responseInterceptor);
  } catch (err) {
    console.log(err);
    throw new Error(err)
  }
}

/**
 * 删除订阅通知模版
 */
export function dataLotteryDeleteMessage(activity_id, templateIds) {
  return request({
    url: "/openapi/v1/jh/delete-subscribe-template",
    method: "POST",
    data: {
      jh_activity_id: activity_id,
      template_id: templateIds
    }
  }).then(responseInterceptor);
}

/**
 * 获取消息模版
 */
export function dataLotteryGetMessage() {
  return request({
    url: "/openapi/v1/jh/subscribe-template",
    method: "get"
  })
}

/**
 * 获取中奖后的 code
 */
export function dataLotteryCode(activity_id) {
  return request({
    url: '/openapi/v1/jh/get-my-prize',
    method: 'get',
    data: {
      activity_id
    }
  }).then(responseInterceptor);
}

/**
 * 是否可以助力
 * @param {*} friend_user_id 好友 id
 * @param {*} jh_activity_id 活动 id
 * @returns 
 */
export function dataLotteryIsHelp(jh_activity_id, friend_user_id) {
  return request({
    url: '/openapi/v1/jh/can-assist-friend',
    method: 'get',
    data: {
      friend_user_id,
      jh_activity_id
    }
  }).then(responseInterceptor);
}
