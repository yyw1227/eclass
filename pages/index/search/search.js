const promise = require('../../../utils/promise.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: [],
    subjects: [], //学科
    grade: [{
      id: "",
      name: "全部"
    }, {
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
    term: [{
      id: "",
      name: "全部"
    }, {
      id: "0",
      name: "上学期"
    }, {
      id: "1",
      name: "下学期"
    }], //学期
    activechoose: [0, 0, 0], //默认选择全部
    type: 0, //页面类型：0：分类选择 1：内容显示
    val: '',
    searchType:0//选择类型：0：分类选择 1：搜索
  },
  choose: function(e) {
    var cate = e.currentTarget.dataset.cate;
    var index = e.currentTarget.dataset.index;
    var obj = 'activechoose[' + cate + ']';
    this.setData({
      [obj]: index
    });
  },
  complete: function() {
    var that = this;
    var choose = this.data.activechoose;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //获取学堂列表
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getMedias',
      data: {
        subject: this.data.subjects[choose[0]].id,
        grade: this.data.grade[choose[1]].id,
        term: this.data.term[choose[2]].id
      },
      success: function(res) {
        if (res.data.status == 1) {
          that.setData({
            data: res.data.data,
            type: 1,
            searchType:0
          });
        }
        wx.hideLoading();
      }
    })
  },
  reset: function() {
    this.setData({
      activechoose: [0, 0, 0]
    });
  },
  itemClick: function(e) {
    console.log(e);
    wx.navigateTo({
      url: '../video/video?id=' + e.currentTarget.dataset.id,
    })
  },
  searchConfirm: function(e) {
    var val = e.detail.value;
    var that = this;
    //获取学堂列表
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getMedias',
      data: {
        key: val
      },
      success: function(res) {
        console.log(res.data);
        if (res.data.status == 1) {
          that.setData({
            data: res.data.data,
            type: 1,
            val: val,
            searchType:1
          });
        }
        wx.hideLoading();
      }
    })
  },
  cateBtn: function() {
    this.setData({
      type: 0
    });
  },
  getMoreMedias:function(data) {
    var that = this;
    var oldData = this.data.data;//原来数据
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getMedias',
      data: data,
      success: function(res) {
        if (res.data.status == 1) {
          var data = oldData.concat(res.data.data);
          that.setData({
            data: data
          });
        }
        wx.hideLoading();
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取学科
    var subjects = app.globalData.subjects.slice(0);
    subjects.unshift({
      id: "",
      name: "全部",
      nickname: "全部"
    });
    this.setData({
      type: options.type,
      val: options.val,
      subjects: subjects,
      searchType:options.type
    });
    if (options.type = 1) {
      var that = this;
      //获取学堂列表
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/getMedias',
        data: {
          key: options.val
        },
        success: function(res) {
          if (res.data.status == 1) {
            that.setData({
              data: res.data.data
            });
          }
          wx.hideLoading();
        }
      })
    }
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
    var data = {};
    var lastId = this.data.data[this.data.data.length - 1].id
    if(this.data.searchType==1){//搜索
      data = {
        id:lastId,
        key: this.data.val
      }
    }else{
      var choose = this.data.activechoose;
      data = {
        id:lastId,
        subject: this.data.subjects[choose[0]].id,
        grade: this.data.grade[choose[1]].id,
        term: this.data.term[choose[2]].id
      }
    }
    this.getMoreMedias(data);
  }
})