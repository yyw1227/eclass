const app = getApp();
var sliderWidth = 48;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["校内", "校外"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    allGrade: {},
    multiArray: [
      [{
        title: '一年级',
        id: 1
      }, {
        title: '二年级',
        id: 2
      }, {
        title: '三年级',
        id: 3
      }, {
        title: '四年级',
        id: 4
      }, {
        title: '五年级',
        id: 5
      }, {
        title: '六年级',
        id: 6
      }],
      []
    ],
    multiIndex: [0, 0],
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  register: function() {
    wx.navigateTo({
      url: '../register/register'
    })
  },
  bindMultiPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindGradeChange(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[e.detail.column] = e.detail.value
    if (e.detail.column == 0) {
      var grade = this.data.multiArray[0][data.multiIndex[0]];
      data.multiArray[1] = this.data.allGrade[grade.id].teams
      data.multiIndex[1] = 0
    }
    this.setData(data);
  },
  //手动登陆
  formSubmit(e) {
    var team_id = this.data.activeIndex == 0 ? this.data.multiArray[1][e.detail.value.team_id[1]].id : 0;
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
          type: 'student',
          team: team_id,
          name: e.detail.value.name,
          password: e.detail.value.password
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
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
                  if (res.data.data.user.grade == "0") {
                    wx.reLaunch({
                      url: '../register/personalInfo/personalInfo?type=' + res.data.data.user.type
                    })
                  } else {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
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
  //微信登陆
  wechatLogin: function(e) {
    if (e.detail.userInfo) {
      var type = wx.getStorageSync('type') || 'student';
      var that = this;
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
                      url: app.globalData.url + '/index.php?s=/Admin/Interface/login',
                      data: {
                        type: type,
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
                      success: function(res) {
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
                                if (res.data.data.user.grade == "0") {
                                  wx.reLaunch({
                                    url: '../register/personalInfo/personalInfo'
                                  })
                                } else {
                                  wx.navigateBack({
                                    delta: 1
                                  })
                                }
                              }, 1000) //延迟时间 
                            }
                          })
                        } else {
                          wx.showToast({
                            title: res.data.message,
                            icon: 'none',
                            duration: 1000
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
                })
              }
            }
          })
        }
      })
    } else {
      wx.showToast({
        title: '用户取消授权',
        icon: 'none',
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        let width = res.windowWidth / 2;
        that.setData({
          sliderLeft: (width / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: width / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getTeams',
      data: {},
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.data.status == 1) {
          console.log(res.data)
          that.setData({
            ['multiArray[1]']: res.data.data[1].teams,
            allGrade: res.data.data
          });
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})