const promise = require('../../utils/promise.js');
const app = getApp();
var sliderWidth = 64; // 需要设置slider的宽度，用于计算中间位置
Page({
  /**
   * 页面的初始数据
   */
  data: {
    swipers: [],
    tabs: [],
    data: [],
    activecid: 0,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },
  tabClick: function (e) {
    var that = this;
    var indexShowData = wx.getStorageSync('indexShowData' + e.currentTarget.dataset.id);
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      activecid: e.currentTarget.dataset.id
    }, function () {
      if (indexShowData) {
        that.setData(indexShowData);
      } else {
        that.getMedias(0, 1);
      }
    });
  },
  itemClick: function (e) {
    console.log(e);
    wx.navigateTo({
      url: './video/video?id=' + e.currentTarget.dataset.id,
    })
  },
  searchConfirm: function (e) {
    var val = e.detail.value;
    wx.navigateTo({
      url: './search/search?type=1&val=' + val
    })
  },
  getMedias: function (lastId, refresh) {
    var that = this;
    var oldData = this.data.data;//原来数据
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //获取学堂列表
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getMedias',
      data: {
        id: lastId,
        subject: this.data.activecid
      },
      success: function (res) {
        if (res.data.status == 1) {
          var data = refresh == 1 ? res.data.data : oldData.concat(res.data.data);
          //缓存
          wx.setStorageSync('indexShowData' + that.data.activecid, {
            data: data
          });
          that.setData({
            data: data
          });
          if (res.data.data.length < 10) {
            var str = 'ReachBottomStatus' + that.data.activecid;
            that[str] = 1;//已经是最后一个数据
            console.log('已经是最后一个数据');
          }
        }
        if (refresh == 1) {
          console.log('下拉刷新');
          wx.stopPullDownRefresh(); //停止下拉刷新
        }
        wx.hideLoading();
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //轮播图
    let p1 = promise.get(app.globalData.url + '/index.php?s=/Admin/Interface/getPictures', {});
    //学科
    let p2 = promise.get(app.globalData.url + '/index.php?s=/Admin/Interface/getSubjects', {});
    Promise.all([p1, p2]).then((result) => {
      app.globalData.subjects = result[1];
      //成功
      this.setData({
        swipers: result[0],
        tabs: result[1],
        activecid: result[1][0].id
      }, function () {
        wx.getSystemInfo({
          success: function (res) {
            that.setData({
              sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
              sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
            });
          }
        });
      });
      //获取学堂列表
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/getMedias',
        data: {
          id: 0,
          subject: result[1][0].id
        },
        success: function (res) {
          if (res.data.status == 1) {
            wx.setStorageSync('indexShowData' + result[1][0].id, {
              data: res.data.data
            });
            that.setData({
              data: res.data.data
            });
          }
          wx.hideLoading();
        }
      })
    }).catch((error) => {
      //其中一个失败
      console.log(error);
      wx.showModal({
        title: '提示',
        content: error,
        showCancel: false
      })
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getMedias(0, 1);
    var str = 'ReachBottomStatus' + this.data.activecid;//下拉状态初始，允许下拉
    this[str] = 0;
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var str = 'ReachBottomStatus' + this.data.activecid;//获取下拉状态，判断是否还有数据
    if (this[str] != 1) {
      var lastId = this.data.data[this.data.data.length - 1].id
      this.getMedias(lastId, 0);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})