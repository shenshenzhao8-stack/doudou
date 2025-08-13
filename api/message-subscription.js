export const lotteryTmplIds = ['MSG2267892823817514504043939645730', 'MSG2267892823707527452401856022810', "MSG2267892823697520467500346296611"];

/**
 * 拉起小程序订阅通知
 * @param {*} ids  string[]
 * @returns 
 */
export const subscribeMessage = (ids) => {
    return new Promise((resolve, reject) => {
        tt.requestSubscribeMessage({
            // 开放平台申请的模版id  支持最多3个同类型模版
            tmplIds: ids,
            success(res) {
                if (res.errMsg === 'requestSubscribeMessage:ok') {
                    resolve(res);
                }
            },
            fail(err) {
                reject(err);
            }
        });
    })
};

/**
 *  获取小程序订阅模版列表 需要后台提供接口
 */

const getSubscribeTemplate = () => {
    // 模拟返回值
    return ['MSG2267892823547503607920031205643']
}

/**
 *   判断用户是否订阅消息模版  需要后台提供接口
 */

const isSubscribe = () => {
    return false
}


/**
 *  提交订阅信息 需要后台提供接口
 */

const pushSubscribeInfo = (data) => {

}

