var sliderWidth = 64;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    comments: [],
    tabs: ["课程简介", "资料下载", "评论留言"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    disabled: false,
    scroll_height: 0,//scroll-view高度
    commentVal: '',
    imgList: []
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  dowload: function (e) {
    //下载文件
    console.log(e);
    let path = e.currentTarget.dataset.path;
    wx.showLoading({
      title: '正在下载中',
      mask: true
    })
    wx.downloadFile({
      url: path,
      success(res) {
        console.log(res);
        wx.hideLoading();
        let filePath = res.tempFilePath;
        wx.openDocument({
          filePath,
          success(res) {
            console.log('打开文档成功');
          }
        })
      }
    })
  },
  //评论上传图片
  commentImg: function (e) {
    var that = this;
    if (!app.globalData.token) {
      wx.showToast({
        title: '请登陆后评论',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.chooseImage({
        count: 1,
        success: function (res) {
          var tempFilePaths = res.tempFilePaths
          wx.uploadFile({
            url: app.globalData.url + '/index.php?s=/Admin/Interface/uploadImage',
            filePath: tempFilePaths[0],
            name: 'file',
            formData: {
              token: app.globalData.token
            },
            success: function (res) {
              var data = JSON.parse(res.data);
              if (data.status == 1) {
                var list = that.data.imgList;
                list.push(data.data);
                that.setData({
                  imgList: list
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
  deleteImg: function (e) {
    if (this.data.imgList.length != 0) {
      let index = e.currentTarget.dataset.index;
      let list = this.data.imgList;
      list.splice(index, 1);
      this.setData({
        imgList: list
      });
    }
  },
  commentSub: function (e) {
    if (e.detail.value.comment == '') {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none',
        duration: 2000
      })
    } else if (!app.globalData.token) {
      wx.showToast({
        title: '请登陆后评论',
        icon: 'none',
        duration: 2000
      })
    } else {
      var that = this;
      let pictures = [];
      this.data.imgList.forEach(function (v) {
        pictures.push(v.id);
      });
      pictures = pictures.join(',');
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/addComment',
        data: {
          type: 'document',
          value: this.data.data.id,
          token: app.globalData.token,
          content: e.detail.value.comment,
          pictures: pictures
        },
        success: function (res) {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          });
          if (res.data.status == 1) {
            that.setData({
              ['data.my_comment']: 1,
              commentVal: '',
              imgList: []
            });
          }
        }
      })
    }
  },
  //课程点赞操作
  praiseDocument: function (e) {
    if (!app.globalData.token) {
      wx.showToast({
        title: '请先登陆',
        icon: 'none',
        duration: 2000
      })
    } else if (!this.data.disabled) {
      this.data.disabled = true;
      var that = this;
      if (this.data.data.my_praise != 1) {
        //点赞
        wx.request({
          url: app.globalData.url + '/index.php?s=/Admin/Interface/addPraise',
          data: {
            type: 'document',
            value: this.data.data.id,
            token: app.globalData.token
          },
          success: function (res) {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 1000
            })
            if (res.data.status == 1) {
              that.setData({
                ['data.my_praise']: !that.data.data.my_praise,
                ['data.praise_count']: ++that.data.data.praise_count
              });
              that.data.disabled = false;
            }
          }
        })
      } else {
        //取消点赞
        wx.request({
          url: app.globalData.url + '/index.php?s=/Admin/Interface/cancelPraise',
          data: {
            type: 'document',
            value: this.data.data.id,
            token: app.globalData.token
          },
          success: function (res) {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 1000
            })
            if (res.data.status == 1) {
              that.setData({
                ['data.my_praise']: !that.data.data.my_praise,
                ['data.praise_count']: --that.data.data.praise_count
              });
              that.data.disabled = false;
            }
          }
        })
      }
    }
  },
  //评论点赞操作
  praiseComment: function (e) {
    if (!app.globalData.token) {
      wx.showToast({
        title: '请先登陆',
        icon: 'none',
        duration: 2000
      })
    } else if (!this.data.disabled) {
      this.data.disabled = true;
      var that = this;
      var commentid = e.currentTarget.dataset.commentid;
      var index = e.currentTarget.dataset.index;
      if (this.data.comments[index].my_praise != 1) {
        //点赞
        wx.request({
          url: app.globalData.url + '/index.php?s=/Admin/Interface/addPraise',
          data: {
            type: 'comment',
            value: commentid,
            token: app.globalData.token
          },
          success: function (res) {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 1000
            })
            if (res.data.status == 1) {
              let praise = 'comments[' + index + '].my_praise';
              let count = 'comments[' + index + '].praise_count';
              that.setData({
                [praise]: !that.data.comments[index].my_praise,
                [count]: ++that.data.comments[index].praise_count
              });
              that.data.disabled = false;
            }
          }
        })
      } else {
        //取消点赞
        wx.request({
          url: app.globalData.url + '/index.php?s=/Admin/Interface/cancelPraise',
          data: {
            type: 'comment',
            value: commentid,
            token: app.globalData.token
          },
          success: function (res) {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 1000
            })
            if (res.data.status == 1) {
              let praise = 'comments[' + index + '].my_praise';
              let count = 'comments[' + index + '].praise_count';
              that.setData({
                [praise]: !that.data.comments[index].my_praise,
                [count]: --that.data.comments[index].praise_count
              });
              that.data.disabled = false;
            }
          }
        })
      }
    }
  },
  moreComments: function () {
    if (this.ReachBottomStatus != 1) {
      //获取更多评论
      var that = this;
      var oldData = this.data.comments;//原来数据
      var lastId = this.data.comments[this.data.comments.length - 1].id
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/getComments',
        data: {
          id: lastId,
          type: 'document',
          value: this.data.data.id,
          token: app.globalData.token
        },
        success: function (res) {
          if (res.data.status == 1) {
            var data = oldData.concat(res.data.data);
            that.setData({
              comments: data
            });
            if (res.data.data.length < 10) {
              that.ReachBottomStatus = 1;//已经是最后一个数据
              console.log('已经是最后一个数据');
            }
          }
          wx.hideLoading();
        }
      })
    } else {
      console.log('已经最后');
    }
  },
  //图片预览
  previewImg: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = e.currentTarget.dataset.list;
    wx.previewImage({
      current: list[index], // 当前显示图片的http链接
      urls: list // 需要预览的图片http链接列表
    })
  },
  //评论审核
  checkComment: function (e) {
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.commentid;
    var that = this;
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/permitComment',
      data: {
        token: app.globalData.token,
        ids: id,
        reply: '',
        status: 1
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
        if (res.data.status == 1) {
          let status = 'comments[' + index + '].status';
          that.setData({
            [status]: 2
          });
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          scroll_height: res.windowHeight * 750 / res.windowWidth - 600
        });
      }
    });
    console.log(options);
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getMedia',
      data: {
        id: options.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            data: res.data.data
          });
          wx.request({
            url: app.globalData.url + '/index.php?s=/Admin/Interface/getComments',
            data: {
              type: 'document',
              value: that.data.data.id,
              token: app.globalData.token
            },
            success: function (res) {
              if (res.data.status == 1) {
                console.log(res.data);
                that.setData({
                  comments: res.data.data
                });
              }
            }
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
        wx.hideLoading();
      }
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})