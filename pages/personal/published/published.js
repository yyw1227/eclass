const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: []
  },
  itemClick: function (e) {
    if (e.currentTarget.dataset.status != 2) {
      wx.showToast({
        title: '未通过审核，无法查看',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: '/pages/showProduct/productDetail/productDetail?id=' + e.currentTarget.dataset.id
      })
    }
  },
  editCreation: function (e) {
    wx.navigateTo({
      url: '../publish/publish?id=' + e.currentTarget.dataset.id
    })
  },
  deleteCreation: function (e) {
    let index = e.currentTarget.dataset.index;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + '/index.php?s=/Admin/Interface/deleteCreation',
            data: {
              id: e.currentTarget.dataset.id,
              token: app.globalData.token
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
                that.data.data.splice(index, 1);
                that.setData({
                  data: that.data.data
                });
              }
            }
          })
        }
      }
    })
  },
  getMyCreations: function (lastId = 0) {
    var that = this;
    var oldData = this.data.data;//原来数据
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getMyCreations',
      data: {
        id: lastId,
        token: app.globalData.token
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status == 1) {
          var data = oldData.concat(res.data.data);
          that.setData({
            data: data
          });
          if (res.data.data.length < 10) {
            that.ReachBottomStatus = 1;//已经是最后一个数据
            console.log('已经是最后一个数据');
          }
        }
        wx.hideLoading();
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyCreations();
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
    if (this.ReachBottomStatus != 1) {
      var lastId = this.data.data[this.data.data.length - 1].id;
      this.getMyCreations(lastId);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})