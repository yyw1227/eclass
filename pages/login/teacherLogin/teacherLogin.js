const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  formSubmit:function(e){
    console.log(e.detail.value);
    if (e.detail.value.name == '') {
      wx.showToast({
        title: '请输入账号',
        icon: 'none',
        duration: 2000
      })
    } else if (e.detail.value.password == '') {
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/login',
        data: {
          type: 'user',
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
            app.globalData.userInfo = res.data.data.user;
            wx.setStorageSync('type', res.data.data.type);
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 1000,
              success: function() {
                setTimeout(function() {
                  wx.navigateBack({
                    delta: 2
                  }) 
                }, 1000) //延迟时间 
              }
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})