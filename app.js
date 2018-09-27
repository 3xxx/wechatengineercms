//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //开发者在session_key失效时，可以通过重新执行登录流程获取有效的session_key。使用接口wx.checkSession()可以校验session_key是否有效，从而避免小程序反复执行登录流程。
    wx.checkSession({
      success: function () {
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail: function () {
        // session_key 已经失效，需要重新执行登录流程
        // wx.login() //重新登录

        // 登录
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            if (res.code) {
              //发起网络请求
              wx.request({
                url: 'https://zsj.itdos.com/wx/wxlogin',
                data: {
                  code: res.code
                },
                method: 'GET',
                header: {
                  'content-type': 'application/json'
                },
                //成功后从服务端取得3rd_session存在手机上？
                success: function (res) {
                  // wx.setStorage({
                  //   key: "key",
                  //   data: "value"
                  // })

                  //https://blog.csdn.net/qq_34827048/article/details/77990510
                  // that.setData({
                  //   nickName: res.data.nickName,
                  //   avatarUrl: res.data.avatarUrl,
                  // })
                  // wx.setStorageSync('openId', res.data.openId);
                }
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})