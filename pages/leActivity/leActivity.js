var sliderWidth = 64; // 需要设置slider的宽度，用于计算中间位置
const app = getApp();
const date = new Date();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity: [],
    history: [],
    data: {},
    comments: [],
    tabs: ["活动报名", "观看直播"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    tabs2: ["往期回顾", "直播简介", "资料下载", "留言评论"],
    activeIndex2: 1,
    sliderOffset2: 0,
    sliderLeft2: 0,
    disabled: false,
    scroll_height: 0,
    commentVal: '',
    imgList: []
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });

    if (e.currentTarget.id == 1) {
      var liveData = wx.getStorageSync('liveData');
      console.log(liveData);
      if (liveData&&liveData.length!=0) {
        if (liveData[0].id != this.data.data.id) {
          this.setData({
            data: liveData[0]
          });
          if (liveData.length > 1) {
            let history = liveData.concat();
            history.splice(0, 1);
            this.setData({
              history: history
            });
          }
          this.getComments(liveData[0].id);
        }
      } else {
        this.getLives(0);
      }
    }
    if (e.currentTarget.id == 0 && this.data.activeIndex2 == 3) {
      wx.showTabBar({
        animation: true
      })
    } else if (e.currentTarget.id == 1 && this.data.activeIndex2 == 3) {
      wx.hideTabBar({
        animation: true
      })
    }
  },
  getLives: function (refresh) {
    //获取直播
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getLives',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.status == 1) {
          if(res.data.data.length!=0){
            wx.setStorageSync('liveData', res.data.data);
            that.setData({
              data: res.data.data[0]
            });
            if (res.data.data.length > 1) {
              let history = res.data.data.concat();
              history.splice(0, 1);
              that.setData({
                history: history
              });
            }
            that.getComments(res.data.data[0].id);
          }else{
            that.setData({
              data: {}
            });
            wx.removeStorageSync('liveData');
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
  tabClick2: function (e) {
    this.setData({
      sliderOffset2: e.currentTarget.offsetLeft,
      activeIndex2: e.currentTarget.id
    });
    if (e.currentTarget.id == 3) {
      wx.hideTabBar({
        animation: true
      })
    } else {
      wx.showTabBar({
        animation: true
      })
    }
  },
  addEnroll: function (e) {
    //报名
    var that = this;
    let index = e.currentTarget.dataset.index;
    let enroll_region = this.data.activity[index].enroll_region;
    let enroll_time = enroll_region.split(',');
    let time = date.getTime() / 1000;
    if (!app.globalData.token) {
      wx.showToast({
        title: '请登陆后报名',
        icon: 'none',
        duration: 2000
      })
    } else if (time < enroll_time[0] || time > enroll_time[1]) {
      let start_time = app.dateFormat("yyyy.MM.dd", enroll_time[0]);
      let end_time = app.dateFormat("yyyy.MM.dd", enroll_time[1]);
      wx.showToast({
        title: "报名时间段为\r\n" + start_time + "-" + end_time,
        icon: 'none',
        duration: 1000
      })
    } else {
      let id = e.currentTarget.dataset.id;
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/addEnroll',
        data: {
          type: 'document',
          value: id,
          token: app.globalData.token
        },
        success: function (res) {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
          if(res.data.status==1){
            var str = 'activity['+index+'].my_enroll'
            that.setData({
              [str] : 1
            });
          }
        }
      })
    }
  },
  //乐活动点赞
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
  //获取评论
  getComments: function (id) {
    var that = this;
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getComments',
      data: {
        type: 'document',
        value: id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            comments: res.data.data
          });
        }
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
          })
          if (res.data.status) {
            that.setData({
              commentVal: '',
              imgList:[]
            });
          }
        }
      })
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
  //往期直播
  otherLiveClick: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //获取直播
    var that = this;
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getLives',
      data: {
        id: e.currentTarget.dataset.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            data: res.data.data[0]
          });

          let history = res.data.data.concat();
          history.splice(0, 1);
          that.setData({
            history: history
          });

          that.getComments(res.data.data[0].id);
          that.ReachBottomStatus = 0;
        }
        wx.hideLoading();
      }
    })
  },
  getActivities: function (refresh) {
    //获取乐活动列表
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getActivities',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            activity: res.data.data
          });
        }
        if (refresh == 1) {
          console.log('下拉刷新');
          wx.stopPullDownRefresh(); //停止下拉刷新
        }
        wx.hideLoading();
      }
    })
  },
  statechange(e) {
    console.log('live-player code:', e.detail.code)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
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
  previewImg:function(e){
    var index = e.currentTarget.dataset.index;
    var list = e.currentTarget.dataset.list;
    wx.previewImage({
      current: list[index], // 当前显示图片的http链接
      urls: list // 需要预览的图片http链接列表
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
          sliderLeft2: (res.windowWidth / that.data.tabs2.length - sliderWidth) / 2,
          sliderOffset2: res.windowWidth / that.data.tabs2.length * that.data.activeIndex2,
          scroll_height: res.windowHeight * 750 / res.windowWidth - 580
        });
      }
    });
    this.getActivities(0);
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
    if (this.data.activeIndex == 1) {
      this.getLives(1);
    } else if (this.data.activeIndex == 0) {
      this.getActivities(1);
    }
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