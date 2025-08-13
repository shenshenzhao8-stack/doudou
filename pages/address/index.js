import { setAddress } from "../../api/doudou";
Page({
  data: {
    addressInfo: '',
    addAddressObj: {
      city_name: "",
      country_name: "",
      detail_info: "",
      province_name: "",
      tel_number: "",
      user_name: ""
    },
    record_id: "",  
  },
  onLoad: function (option) {
    if (option.id) {
      this.setData({
        record_id: option.id
      })
    }
  },
  // 确认
  confirmBtn() {
    const that = this;
    if (this.data.addAddressObj.province_name === "" || this.data.addAddressObj.city_name === "" || this.data.addAddressObj.detail_info === "" || this.data.addAddressObj.tel_number === "" || this.data.addAddressObj.user_name === "") {
      tt.showToast({
        title: "请先选择地址信息",
      });
      return
    }
    tt.showModal({
      content: "确认选择该地址，选择后将无法修改",
      confirmText: "确定选择",
      cancelText: "重新选择",
      success(res) {
        if (res.confirm) {
          let addAddressTit = that.data.addAddressObj.province_name + that.data.addAddressObj.city_name + that.data.addAddressObj.detail_info
          console.log('addAddressTit', addAddressTit);
          const obj = {
            recipient_address: addAddressTit,
            recipient_name: that.data.addAddressObj.user_name,
            recipient_phone: that.data.addAddressObj.tel_number,
            record_id: that.data.record_id || ''
          };
          setAddress(obj).then(res => {
            if (res.code === 200) {
              tt.navigateBack({
                delta: 1,
              });
            } else {
              tt.showToast({ title: '请稍后重试', icon: "none" });
            }
          }).catch(err => {
            console.error('请求异常:', err);
          });
        }
        if (res.cancel) {
          console.log('用户选择重新填写地址');
        }
      },
      fail(err) {
        console.error('弹窗调用失败:', err);
      }
    });
  },
  // 取消
  clearBtn() {

  },

  addressAuthHandler(event) {
    // 授权弹窗展现时触发，建议开发者可在此进行授权前处理
  },
  addressChangeHandler(e) {
    const { value } = e.detail
    this.data.addAddressObj.province_name = value.provinceName
    this.data.addAddressObj.city_name = value.cityName
    this.data.addAddressObj.country_name = value.districtName
    this.data.addAddressObj.tel_number = value.concatPhone
    this.data.addAddressObj.user_name = value.concatName
    this.data.addAddressObj.detail_info = value.locationAddress + value.locationName + value.doorNum
  },
  cancelHandler(event) {
    // 关闭地址弹窗时触发
  },
  addressErrorHandler(event) {
    const { errNo, errMsg } = event.detail
  },

})