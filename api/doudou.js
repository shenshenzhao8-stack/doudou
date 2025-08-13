import {
    request
} from '../api/request';

/**
 * 
 * @param {*} data  获取当日抽奖次数
 * @returns 
 */
export function getDrawNums() {
    return request({
        url: '/openapi/v1/lottery/get-daily-remaining-times',
        method: 'get',
    });
}

/**
 * 
 * @param {*} data  抽奖
 * @returns 
 */
export function draw(data) {
    return request({
        url: '/openapi/v1/lottery/draw',
        method: 'post',
        data
    });
}

/**
 * 
 * @param {*} data  设置收货地址
 * @returns 
 */
export function setAddress(data) {
    return request({
        url: '/openapi/v1/lottery/set-shipping-address',
        method: 'post',
        data
    });
}