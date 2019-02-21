App({
  onLaunch: function () {
    //获取上次登录缓存信息
    var type = wx.getStorageSync('type') || 'student';
    var that = this;
    wx.login({
      success: res => {
        var code = res.code;
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  wx.request({
                    url: that.globalData.url + '/index.php?s=/Admin/Interface/login',
                    data: {
                      type: type,
                      code: code,
                      rawData: res.rawData,
                      signature: res.signature,
                      encryptedData: res.encryptedData,
                      iv: res.iv
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      if (res.data.status == 1) {
                        that.globalData.token = res.data.data.token;
                        that.globalData.userInfo = res.data.data.user;
                        wx.setStorageSync('type', res.data.data.type);
                        if (that.loginCallback) {
                          //防止异步请求前进入个人中心
                          that.loginCallback(res.data.data.token, res.data.data.user);
                        }
                      }
                      console.log(res.data.message);
                    }
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  dateFormat: function (fmt, date) {
    date = new Date(date * 1000);
    var o = {
      "M+": date.getMonth() + 1,                 //月份   
      "d+": date.getDate(),                    //日   
      "h+": date.getHours(),                   //小时   
      "m+": date.getMinutes(),                 //分   
      "s+": date.getSeconds(),                 //秒   
      "q+": Math.floor((date.getMonth() + 3) / 3),
      "S": date.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },
  globalData: {
    userInfo: null,
    url: 'https://school.yunshan66.com.cn',
    token: null,
    subjects: null
  }
})