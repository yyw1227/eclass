const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},//编辑作品时原本的作品数据
    cateGroup: [],
    imgList: [],
    type: 0,//分类id
    templates: [],//模版
    videoUpload: {},//上传的视频
    videoTemp: {},//选择视频后的本地路径
    disabled: false,
    fullScreen: false,
    user: '',
    allGrade: {},
    allStudents: {},
    multiArray: [
      [{
        title: '一年级',
        id: 1
      }, {
        title: '二年级',
        id: 2
      }, {
        title: '三年级',
        id: 3
      }, {
        title: '四年级',
        id: 4
      }, {
        title: '五年级',
        id: 5
      }, {
        title: '六年级',
        id: 6
      }],
      [],
      []
    ],
    multiIndex: [0, 0, 0],
  },
  typeChange: function (e) {
    this.setData({
      type: e.detail.value
    });
  },
  addImg: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        console.log(res);
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
              console.log(data);
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
  uploadVideo: function () {
    var that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      success(res) {
        console.log(res);
        wx.showLoading({
          title: '视频上传中',
          mask: true
        })
        var videoTemp = res;
        var tempFilePath = res.tempFilePath;
        // var thumbTempFilePath = res.thumbTempFilePath;
        wx.uploadFile({
          url: app.globalData.url + '/index.php?s=/Admin/Interface/uploadVideo',
          filePath: tempFilePath,
          name: 'file',
          formData: {
            token: app.globalData.token
          },
          success: function (res) {
            var data = JSON.parse(res.data);
            if (data.status == 1) {
              console.log(data);
              that.setData({
                videoUpload: data.data,
                videoTemp: videoTemp
              });
              wx.hideLoading();
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
  },
  playVideo: function () {
    if (!this.videoContext) {
      this.videoContext = wx.createVideoContext('myVideo');
    }
    this.videoContext.play();
  },
  delVideo: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      success: function (res) {
        if (res.confirm) {
          that.setData({
            videoUpload: {},
            videoTemp: {}
          });
        }
      },
    })
  },
  bindplay: function (e) {
    console.log('开始播放');
    this.videoContext.requestFullScreen();
  },
  bindfullscreenchange: function (e) {
    console.log('全屏切换');
    this.setData({
      fullScreen: e.detail.fullScreen
    });
    //如果是退出全屏，暂停播放
    if (!e.detail.fullScreen) {
      this.videoContext.pause();
    }
  },
  formSubmit: function (e) {
    var that = this;
    console.log(e);
    var template_id = 0;
    if (e.detail.value.type == 0) {
      template_id = e.detail.value.template_id;
    }
    if (e.detail.value.title == '') {
      wx.showToast({
        title: '请输入作品标题',
        icon: 'none',
        duration: 2000
      })
    } else if (this.data.imgList.length == 0) {
      wx.showToast({
        title: '请添加作品图片',
        icon: 'none',
        duration: 2000
      })
    } else if (this.data.user == "user" && this.data.multiArray[2].length == 0) {
      wx.showToast({
        title: '请选择代发学生',
        icon: 'none',
        duration: 2000
      })
    } else {
      this.setData({
        disabled: true
      });
      let pictures = [];
      this.data.imgList.forEach(function (v) {
        pictures.push(v.id);
      });
      pictures = pictures.join(',');
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/updateCreation',
        data: {
          id: this.data.data.id ? this.data.data.id : 0,
          title: e.detail.value.title,
          type: e.detail.value.type,
          template_id: template_id,
          pictures: pictures,
          video_id: this.data.videoUpload.id,
          content: e.detail.value.content,
          token: app.globalData.token,
          create_id: e.detail.value.create_id ? this.data.multiArray[2][e.detail.value.create_id[2]].id : 0
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
            setTimeout(function () {
              wx.switchTab({
                url: '/pages/personal/personal',
              })
            }, 1000) //延迟时间 
          }
          that.setData({
            disabled: false
          });
        }
      })
    }
  },
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindGradeChange(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[e.detail.column] = e.detail.value
    if (e.detail.column == 0) {
      var grade = this.data.multiArray[0][data.multiIndex[0]];
      data.multiArray[1] = this.data.allGrade[grade.id].teams
      data.multiIndex[1] = 0;
      var classes = data.multiArray[1][0];
      let arr = this.data.allStudents[classes.id] ? this.data.allStudents[classes.id] : [];
      data.multiArray[2] = arr
      data.multiIndex[2] = 0
    } else if (e.detail.column == 1) {
      var classes = this.data.multiArray[1][data.multiIndex[1]];
      let arr = this.data.allStudents[classes.id] ? this.data.allStudents[classes.id] : [];
      data.multiArray[2] = arr
      data.multiIndex[2] = 0
    }
    this.setData(data);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var type = wx.getStorageSync('type') || 'student';
    this.setData({
      user: type
    });
    //获取分类
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getDictionaries',
      data: {
        type: 'creation_type'
      },
      success: function (res) {
        if (res.data.status == 1) {
          var arr = res.data.data;
          var cateGroup = [];
          for (var i = 0; i < arr.length; i++) {
            cateGroup.push({
              value: i,
              name: arr[i]
            });
          }
          that.setData({
            cateGroup: cateGroup
          });
        }
      }
    })
    //模版
    wx.request({
      url: app.globalData.url + '/index.php?s=/Admin/Interface/getTemplates',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        console.log(res.data);
        that.setData({
          templates: res.data.data
        })
      }
    })
    //作品旧数据(编辑时调用)
    if (options.id != 0) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      wx.request({
        url: app.globalData.url + '/index.php?s=/Admin/Interface/getMyCreation',
        data: {
          id: options.id,
          token: app.globalData.token
        },
        success: function (res) {
          let creationInfo = res.data.data;
          console.log(res.data);
          if (res.data.status == 1) {
            that.setData({
              data: res.data.data,
              type: res.data.data.type,
              imgList: res.data.data.pictures,
              videoUpload: res.data.data.video.length != 0 ? res.data.data.video[0] : {}
            });
            if (type == 'user') {
              let allGrade = {};
              let allStudents = {};
              //班级
              wx.request({
                url: app.globalData.url + '/index.php?s=/Admin/Interface/getTeams',
                data: {},
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  if (res.data.status == 1) {
                    allGrade = res.data.data;
                    //学生 allStudents
                    wx.request({
                      url: app.globalData.url + '/index.php?s=/Admin/Interface/getStudents',
                      data: {
                        token: app.globalData.token
                      },
                      method: 'POST',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded'
                      },
                      success: function (res) {
                        if (res.data.status == 1) {
                          allStudents = res.data.data
                          var class_index = 0;
                          var student_index = 0;
                          for (let i in allGrade[creationInfo.grade].teams) {
                            if(allGrade[creationInfo.grade].teams[i].id == creationInfo.team_id ){
                              class_index = i;
                            }
                          }
                          for (let i in allStudents[creationInfo.team_id]) {
                            if(allStudents[creationInfo.team_id][i].id == creationInfo.create_id ){
                              student_index = i;
                            }
                          }
                          that.setData({
                            ['multiArray[1]']: allGrade[creationInfo.grade].teams,
                            ['multiArray[2]']: allStudents[creationInfo.team_id],
                            multiIndex: [creationInfo.grade - 1, class_index, student_index],
                            allGrade: allGrade,
                            allStudents: allStudents
                          });
                        }
                      }
                    })
                  }
                }
              })
            }
          }
          wx.hideLoading();
        }
      })
    } else {
      if (type == 'user') {
        //班级
        wx.request({
          url: app.globalData.url + '/index.php?s=/Admin/Interface/getTeams',
          data: {},
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            if (res.data.status == 1) {
              console.log(res.data)
              that.setData({
                ['multiArray[1]']: res.data.data[1].teams,
                allGrade: res.data.data
              });
              let classes_id = res.data.data[1].teams[0].id;
              //学生 allStudents
              wx.request({
                url: app.globalData.url + '/index.php?s=/Admin/Interface/getStudents',
                data: {
                  token: app.globalData.token
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  if (res.data.status == 1) {
                    console.log(res.data)
                    that.setData({
                      ['multiArray[2]']: res.data.data[classes_id],
                      allStudents: res.data.data
                    });
                  }
                }
              })
            }
          }
        })
      }
    }
  }
})