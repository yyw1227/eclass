const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: []
  },
  itemClick: function (e) {
    let id = e.currentTarget.dataset.id;
    let url = '/pages/index/video/video'; 
    wx.navigateTo({
      url: url + '?id=' + id
    })
  },
  loadData:function(lastId=0){
    var that = this;
    var oldData = this.data.data;//原来数据
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getMyMedias',
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
   this.loadData();
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
      this.loadData(lastId);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})