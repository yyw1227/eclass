const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  formSubmit(e) {
    if (e.detail.value.name == '') {
      wx.showToast({
        title: '请输入学生身份证号',
        icon: 'none',
        duration: 2000
      })
    } else if (e.detail.value.password == '') {
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 2000
      })
    } else if (e.detail.value.password != e.detail.value.comfirm) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/register',
        data: {
          type: e.detail.value.type,
          name: e.detail.value.name,
          password: e.detail.value.password
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          console.log(res.data);
          if (res.data.status == 1) {
            app.globalData.token = res.data.data.token;
            wx.navigateTo({
              url: './personalInfo/personalInfo?type=' + e.detail.value.type
            })
          } else { //返回错误提示信息
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 2000
            })
          }
        },
        error: function(e) {
          wx.showToast({
            title: '网络请求出错',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  }
})