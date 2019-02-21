const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {}
  },
  uploadImg: function() {
    if (this.data.user.openid) {
      wx.showToast({
        title: '已绑定微信,采用微信头像',
        icon: 'none',
        duration: 2000
      })
    } else {
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
    }
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
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/updateUser',
        data: {
          token: app.globalData.token,
          name: e.detail.value.name,
          portrait_id: this.data.user.imgid
        },
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
            console.log(res.data);
            app.globalData.userInfo = res.data.data.user;
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        ['user.img']: app.globalData.userInfo.portrait_path,
        ['user.name']: app.globalData.userInfo.name,
        ['user.imgid']: app.globalData.userInfo.portrait_id,
        ['user.openid']: app.globalData.userInfo.openid
      });
    }
  }
})