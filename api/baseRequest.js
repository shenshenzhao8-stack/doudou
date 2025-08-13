import crypto from "crypto-js";

export const baseRequest = (options) => {
  const appKey = "doudou";
  const appSecret = "yfI++3E/gYyxJzkKf3Jf/NeNO/OTXg/rsp4pov4UxEo=";
  // const baseUrl = "https://shangxin.branddppartner.com";
  const baseUrl = "http://115.190.155.178:7777";

  // 构建排序参数字符串，并去除所有空格
  const buildSortedParamString = (params) => {
    if (!params || typeof params !== "object") return '';
    const keys = Object.keys(params).sort();
    return keys.map((key) => `${key}=${params[key]}`).join("&").replace(/\s+/g, "");
  };

  // HMAC-SHA256签名
  const hmac = (input, secret) => {
    return crypto.HmacSHA256(input, secret).toString(crypto.enc.Hex);
  };

  // 生成签名
  const sign = (method, timestamp, paramJson) => {
    // paramJson 已经在 buildSortedParamString 里去掉空格，这里不再处理
    const paramPattern = `app_key${appKey}method${method}params${paramJson}timestamp${timestamp}`;
    const signPattern = appSecret + paramPattern + appSecret;
    return hmac(signPattern, appSecret);
  };

  return new Promise((resolve, reject) => {
    const method = options.method.toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000);
    let paramJson = "";

    // 处理GET和POST参数
    if (method === "GET") {
      let paramStr = buildSortedParamString(options.data || {});
      paramJson = encodeURIComponent(paramStr);
    } else {
      if (!options.data) {
        options.data = {};
      }
      let paramObj = { param_json: JSON.stringify(options.data || {}) };
      let paramStr = buildSortedParamString(paramObj);
      paramJson = encodeURIComponent(paramStr);
    }
    // 如果 options.data 是字符串或数组，单独去空格
    if (typeof options.data === 'string') {
      options.data = options.data.replace(/\s+/g, '');
    } else if (Array.isArray(options.data)) {
      options.data = JSON.parse(JSON.stringify(options.data).replace(/\s+/g, ''));
    }

    // 生成签名
    const signature = sign(method, timestamp, paramJson);

    // 请求头
    const headers = {
      "content-type": "application/json",
      ...options.header, // 保留原有header
      app: appKey,
      appSecret,
      method,
      timestamp: timestamp.toString(),
      sign: signature,
    };

    // 添加Authorization头（如果提供了）
    if (options.header?.Authorization) {
      headers.Authorization = options.header.Authorization;
    }

    console.log("基础请求:", options.url, "参数:", options.data);

    // 发送请求
    tt.request({
      url: baseUrl + options.url,
      method: method,
      data: options.data,
      header: headers,
      success: (res) => {
        console.log("基础请求响应:", options.url, res.data);
        resolve(res);
      },
      fail: (err) => {
        console.error("基础请求失败:", options.url, err);
        reject(err);
      },
    });
  });
};
