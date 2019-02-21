const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
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
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    wechatChecked: false,
    openidData: {},
    type: 0,
    grade: [{
      id: "1",
      name: "一年级"
    }, {
      id: "2",
      name: "二年级"
    }, {
      id: "3",
      name: "三年级"
    }, {
      id: "4",
      name: "四年级"
    }, {
      id: "5",
      name: "五年级"
    }, {
      id: "6",
      name: "六年级"
    }], //年级
    index: 0
  },
  uploadImg: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: function(res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: app.globalData.url + '/index.php?s=/Admin/Interface/uploadImage',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            token: app.globalData.token
          },
          success: function(res) {
            var data = JSON.parse(res.data);
            if (data.status == 1) {
              that.setData({
                ['user.img']: data.data.path,
                ['user.imgid']: data.data.id
              })
            } else {
              wx.showToast({
                title: data.message,
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    })
  },
  bindMultiPickerChange: function(e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindColumnChange: function(e) {
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
  formSubmit: function(e) {
    console.log(e.detail.value);
    if (e.detail.value.name == '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      })
    } else {
      var formData = {};
      if (this.data.type == 0) {
        formData = {
          token: app.globalData.token,
          name: e.detail.value.name,
          portrait_id: this.data.user.imgid,
          team_id: this.data.multiArray[1][e.detail.value.team_id[1]].id,
          number: e.detail.value.number
        }
      } else {
        formData = {
          token: app.globalData.token,
          name: e.detail.value.name,
          portrait_id: this.data.user.imgid,
          grade: this.data.grade[e.detail.value.grade_id].id
        }
      }
      if (this.data.wechatChecked) {
        var obj = Object.assign(formData, this.data.openidData);
      }
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/updateUser',
        data: formData,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
          if (res.data.status == 1) {
            app.globalData.userInfo = res.data.data.user;
            console.log(res.data);
            setTimeout(function() {
              wx.switchTab({
                url: '/pages/personal/personal'
              })
            }, 1000) //延迟时间 
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
  bindGradeChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  getUserInfo: function(e) {
    if (!this.data.wechatChecked) {
      if (e.detail.userInfo) {
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
                      var openidData = {
                        code: code,
                        rawData: res.rawData,
                        signature: res.signature,
                        encryptedData: res.encryptedData,
                        iv: res.iv,
                      };
                      console.log(openidData);
                      that.setData({
                        openidData: openidData,
                        wechatChecked: true
                      });
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
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    this.setData({
      type: options.type
    });
    if (app.globalData.userInfo) {
      this.setData({
        ['user.img']: app.globalData.userInfo.portrait_path,
        ['user.name']: app.globalData.userInfo.name,
        ['user.imgid']: app.globalData.userInfo.portrait_id
      });
    }
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
        } else {
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
})