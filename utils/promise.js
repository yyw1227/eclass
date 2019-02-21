// 封装post请求
const post = (url, data) => {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: url,
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {//服务器返回数据
        if (res.data.status == 1) {
          resolve(res.data.data);
        } else {//返回错误提示信息
          reject(res.data.message);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}
// 封装get请求
const get = (url, data) => {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: url,
      data: data,
      success: function (res) {//服务器返回数据
        if (res.data.status == 1) {
          resolve(res.data.data);
        } else {//返回错误提示信息
          reject(res.data.message);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}
module.exports = {
  post:post,
  get:get
}