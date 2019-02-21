const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: null,
    userInfo: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  jumpto: function (e) {
    let url = app.globalData.token ? e.currentTarget.dataset.url : '/pages/login/login';
    wx.navigateTo({
      url: url
    })
  },
  logout: function () {
    if (app.globalData.token) {
      app.globalData.token = null;
      app.globalData.userInfo = null;
      wx.showToast({
        title: '退出登陆成功',
        icon: 'none',
        duration: 1000,
        success: function () {
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }, 1000) //延迟时间 
        }
      })
    }
  },
  editUserinfo: function () {
    wx.navigateTo({
      url: './editInfo/editInfo'
    })
  },
  getUser: function (e) {
    var that = this;
    if (e.detail.userInfo) {
      if (app.globalData.userInfo.openid) {
        wx.showModal({
          title: '提示',
          content: '您已经绑定微信，确认重新绑定？',
          success(res) {
            if (res.confirm) {
              that.bindWechat(e);
            }
          }
        })
      } else {
        this.bindWechat(e);
      }
    } else {
      wx.showToast({
        title: '请授权后绑定',
        icon: 'none',
        duration: 1000
      })
    }
  },
  bindWechat: function (e) {
    if (e.detail.userInfo) {
      // 登录
      wx.login({
        success: res => {
          var code = res.code;
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    wx.request({
                      url: app.globalData.url + '/index.php?s=/Admin/Interface/updateUser',
                      data: {
                        name: this.data.userInfo.name,
                        token: app.globalData.token,
                        code: code,
                        rawData: res.rawData,
                        signature: res.signature,
                        encryptedData: res.encryptedData,
                        iv: res.iv
                      },
                      method: 'POST',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded'
                      },
                      success: function (res) {
                        wx.showToast({
                          title: res.data.message,
                          icon: 'none',
                          duration: 2000
                        })
                        if (res.data.status == 1) {
                          app.globalData.token = res.data.data.token;
                          app.globalData.userInfo.openid = res.data.data.user.openid;
                        }
                      },
                      error: function (e) {
                        wx.showToast({
                          title: '网络请求出错',
                          icon: 'none',
                          duration: 2000
                        })
                      }
                    })
                  }
                })
              }
            }
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!app.globalData.token || !app.globalData.userInfo) {
      app.loginCallback = (token, userInfo) => {
        console.log('回调触发');
        this.setData({
          token: token,
          userInfo: userInfo
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      token: app.globalData.token,
      userInfo: app.globalData.userInfo
    });
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