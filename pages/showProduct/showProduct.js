const promise = require('../../utils/promise.js');
var sliderWidth = 32; // 需要设置slider的宽度，用于计算中间位置
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: [],
    tabs: [],
    activecid: 1,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },
  tabClick: function (e) {
    var showCreations = wx.getStorageSync('showCreations' + this.data.tabs[e.currentTarget.id].id);
    var that = this;
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    }, function () {
      if (showCreations) {
        that.setData({
          data: showCreations
        });
      } else {
        console.log('没有数据');
        that.getCreations(that.data.tabs[e.currentTarget.id].id, 1);
      }
    });
  },
  getCreations: function (type, refresh, lastId = 0) {
    var that = this;
    var oldData = this.data.data;//原来数据
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //获取秀作品列表
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getCreations',
      data: {
        id: lastId,
        type: type
      },
      success: function (res) {
        if (res.data.status == 1) {
          var data = refresh == 1 ? res.data.data : oldData.concat(res.data.data);
          that.setData({
            data: data
          });
          //缓存
          wx.setStorageSync('showCreations' + type, data);
          if (res.data.data.length < 10) {
            var str = 'ReachBottomStatus' + type;
            that[str] = 1;//已经是最后一个数据
            console.log('已经是最后一个数据');
          }
        }
        if (refresh == 1) {
          wx.stopPullDownRefresh(); //停止下拉刷新
        }
        wx.hideLoading();
      }
    })
  },
  cardClick: function (e) {
    wx.navigateTo({
      url: './productDetail/productDetail?id=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //分类
    let p1 = promise.get(app.globalData.url + '/index.php?s=/Admin/Interface/getDictionaries', {
      type: 'creation_type'
    });
    //秀作品列表
    let p2 = promise.get(app.globalData.url + '/index.php?s=/Admin/Interface/getCreations', { type: '' });
    Promise.all([p1, p2]).then((result) => {
      var arr = result[0];
      var tabs = [];
      for (var i = 0; i < arr.length; i++) {
        tabs.push({
          id: i,
          name: arr[i]
        });
      }
      tabs.unshift({
        id: "",
        name: "所有"
      });
      this.setData({
        tabs: tabs,
        data: result[1]
      }, function () {
        wx.getSystemInfo({
          success: function (res) {
            that.setData({
              sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
              sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
            });
          }
        });
        wx.setStorageSync('showCreations', result[1]);
      });
      wx.hideLoading();
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
    var type = this.data.tabs[this.data.activeIndex].id
    this.getCreations(type, 1);
    var str = 'ReachBottomStatus' + type;//下拉状态初始，允许下拉
    this[str] = 0;
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.data.length != 0) {
      var type = this.data.tabs[this.data.activeIndex].id
      var str = 'ReachBottomStatus' + type;//获取下拉状态，判断是否还有数据
      if (this[str] != 1) {
        var lastId = this.data.data[this.data.data.length - 1].id
        this.getCreations(type, 0, lastId);
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})