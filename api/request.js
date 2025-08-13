import { login } from "../api/login";
import { baseRequest } from "./baseRequest"; // 正确导入baseRequest
export const getToken = () => {
    return tt.getStorageSync("TOKEN") ? tt.getStorageSync("TOKEN") : "";
};

let refreshTokenQueue = [];
let isRefreshing = false;

// 封装的业务请求方法（依赖登录状态）
export const request = (options) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = getToken();
            options.method = options.method ? options.method.toUpperCase() : 'GET';

            // 先正常请求
            const response = await baseRequest({
                ...options,
                header: {
                    ...options.header,
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.code === 200) {
                resolve(response.data);
                return;
            }

            // token 过期，需刷新
            if (response.data.code === 100406 || response.data.code === 401) {
                // 防止死循环
                if (options.__isRetryRequest) {
                    reject(response.data);
                    return;
                }

                // 已有刷新在进行，排队等待
                if (isRefreshing) {
                    refreshTokenQueue.push({ resolve, reject, options });
                    return;
                }

                // 开始刷新
                isRefreshing = true;
                options.__isRetryRequest = true;

                try {
                    const newToken = await login();

                    // 重新请求当前接口
                    const retryResponse = await baseRequest({
                        ...options,
                        header: {
                            ...options.header,
                            Authorization: `Bearer ${newToken}`
                        }
                    });

                    resolve(retryResponse.data);

                    // 队列里等待的请求也用新 token 重试
                    refreshTokenQueue.forEach(async ({ resolve: queuedResolve, reject: queuedReject, options: queuedOptions }) => {
                        try {
                            const queuedResponse = await baseRequest({
                                ...queuedOptions,
                                header: {
                                    ...queuedOptions.header,
                                    Authorization: `Bearer ${newToken}`
                                }
                            });

                            queuedResolve(queuedResponse.data);
                        } catch (err) {
                            queuedReject(err);
                        }
                    });
                } catch (err) {
                    // 刷新失败，所有等待的请求都 reject
                    refreshTokenQueue.forEach(({ reject: queuedReject }) => queuedReject(err));

                    reject(err);
                } finally {
                    isRefreshing = false;
                    refreshTokenQueue = [];
                }
                return;
            }

            // 其他错误
            reject(response.data);
        } catch (error) {
            reject(error);
        }
    });
};