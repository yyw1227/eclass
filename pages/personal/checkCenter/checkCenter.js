const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment_count: '0',
    creation_count: '0',
    data: [],
    activeTab: 0
  },
  tabClick: function (e) {
    let that = this;
    let cid = e.currentTarget.dataset.cid;
    var permitData = wx.getStorageSync('permitData' + cid);
    this.setData({
      activeTab: cid
    }, function () {
      if (permitData) {
        that.setData(permitData);
      } else {
        that.loadData(0, 1);
      }
    });
  },
  loadData: function (lastId = 0, refresh = 0) {
    var that = this;
    var oldData = this.data.data;//原来数据
    var url = this.data.activeTab == 0 ? 'getPermitComments' : 'getPermitCreations'
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/' + url,
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
          var data = refresh == 1 ? res.data.data : oldData.concat(res.data.data);
          that.setData({
            data: data
          });
          //缓存
          wx.setStorageSync('permitData' + that.data.activeTab, {
            data: data
          });
          if (res.data.data.length < 10) {
            var str = 'ReachBottomStatus' + that.data.activeTab;
            that[str] = 1;//已经是最后一个数据
            console.log('已经是最后一个数据');
          }
          if (refresh == 1) {
            console.log('下拉刷新');
            wx.stopPullDownRefresh(); //停止下拉刷新
          }
          if (lastId == 0) {
            that.setData({
              comment_count: res.data.comment_count,
              creation_count: res.data.creation_count
            });
          }
        }
        wx.hideLoading();
      }
    })
  },
  check: function (e) {
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let url = '';
    switch (type) {
      case 'media':
        url = '/pages/index/video/video?id=' + id;
        break;
      case 'live':
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '直播页不支持跳转，请手动进入直播评论页'
        })
        break;
      case 'creation':
        url = '/pages/showProduct/productDetail/productDetail?id=' + id;
        break;
    }
    if (url != '') {
      wx.navigateTo({
        url: url
      })
    }
  },
  creationCheck:function(e){
    wx.navigateTo({
      url: '/pages/showProduct/productDetail/productDetail?id=' + e.currentTarget.dataset.id+'&check=1'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData();
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
    this.loadData(0, 1);
    var str = 'ReachBottomStatus' + this.data.activeTab;//下拉状态初始，允许下拉
    this[str] = 0;
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var str = 'ReachBottomStatus' + this.data.activeTab;//获取下拉状态，判断是否还有数据
    if (this[str] != 1) {
      var lastId = this.data.data[this.data.data.length - 1].id
      this.loadData(lastId, 0);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})