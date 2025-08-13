import {
  request,
  getToken
} from './request';
import {
  responseInterceptor
} from "../utils"

export function dataUserEdit(avatar_url, nick_name, auth_version_id) {
  return request({
    url: '/openapi/v1/user/update-user-info',
    method: "post",
    data: {
      avatar_url,
      nick_name,
      auth_version_id
    }
  }).then(responseInterceptor)
}

/**
 * 根据 token 获取用户信息
 */
export function dataUserInfo() {
  return request({
    url: '/openapi/v1/user/me',
    method: "get",
  }).then(responseInterceptor)
}
