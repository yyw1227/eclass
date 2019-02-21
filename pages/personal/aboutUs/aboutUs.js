const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取分类
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getAbout',
      data: {},
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            data:res.data.data
          });
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})