import {
    request
} from '../api/request';
/**
 * 
 * @param {*} data  热门推荐
 * @returns 
 */
export function getHotRecommend(data) {
    return request({
        url: '/openapi/v1/get-hot-recommend',
        method: 'get',
        data
    });
}

/**
 * 
 * @param {*} data  卡券包
 * @returns 
 */
export function getCardList(data) {
    return request({
        url: '/openapi/v1/lottery/get-user-card-package',
        method: 'post',
        data
    });
}