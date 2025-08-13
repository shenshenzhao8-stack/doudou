import {
    request ,
} from '../api/request';
import { baseRequest } from "./baseRequest"; // 正确导入baseRequest



// export function getPosts() {
//     return request({
//         url: '/posts',
//         data: {
//             name: 'zzz'
//         }
//     });
// }

export function getTokenData(code) {
    return baseRequest({
        url: '/openapi/v1/login',
        method: 'post',
        data: {
            code,
        }
    });
}

// export function getBannerList(data) {
//     return request({
//         url: '/openapi/v1/banner/get-banner-list',
//         method: 'post',
//         data
//     });
// }

export function getBannerList(data) {
    return request({
        url: '/openapi/v1/banner/get-banner-list',
        method: 'post',
        data
    });
}

export function login(data) {
    return request({
        url: '/openapi/v1/login',
        method: 'post',
        data
    });
}
/**
 * 
 * @param {*} data   1:首页；2:上新日历；3:尖货抽签
 * @returns 
 */
export function getTabs(data) {
    return request({
        url: '/openapi/v1/tabs_by_position',
        method: 'get',
        data
    });
}

// export function getTabs(data) {
//     return request({
//         url: '/openapi/v1/tabs_by_position',
//         method: 'get',
//         data
//     });
// }

export function getShopList(data) {
    return request({
        url: '/openapi/v1/list_by_tab',
        method: 'get',
        data
    });
}

// 提交订阅数据

export function submitSubscription(data) {
    return request({
        url: '/openapi/v1/save-subscribe-template',
        method: 'post',
        data
    });
   
}


// 检查每日弹窗

export function recordDailyPopup(data){
    return request({
        url: '/openapi/v1/jh/check-daily-popup',
        method: 'post',
        data
    });
}

// 记录每日弹窗

export function recordDailyPopInfo(){
    return request({
        url: '/openapi/v1/jh/record-daily-pop-info',
        method: 'post',
        data
    });
}