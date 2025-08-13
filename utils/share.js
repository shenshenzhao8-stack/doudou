
//  分享
export const shareAppMessage = ()=> {
    console.log("开始分享");
    return {
        path: './newVideo/?www',
        title: "测试视频",
        desc: "测试描述",
        extra: {
            videoTopics: ["hello", "hi"],
            withVideoId: true,
        },
        success(res) {
            /* res结构：{errMsg: string, videoId: string } */
            console.log(res.videoId);
        },
    };
};