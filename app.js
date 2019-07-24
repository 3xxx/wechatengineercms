//app.js
var config = require('./config.js');
var QQMapWX = require('./libs/qqmap-wx-jssdk.js');
var qqmapsdk;
App({
  /**当小程序初始化完成时，会触发 onLaunch（全局只触发一次）*/
  globalData: {
    userInfo: null,
    hasUserInfo: false,
    user_id: null,
    isAdmin: false,
    nickName: null,
    avatarUrl: null,
    photo: null,//用户头像
    hasRegist: false,
    hasLocation: false,
    isLogin: false,
    activity_location: null,
    activity_lat: -1,
    activity_lng: -1,
  },
  data: {
    // haveLocation: false,
    // activity_lat: -1,
    // activity_lng: -1,
    // activity_lat: res.latitude,
    // activity_lng: res.longitude,
    // activity_location: "" //location为空
  },
  onLaunch: function () {
    var that = this;
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    //开发者在session_key失效时，可以通过重新执行登录流程获取有效的session_key。使用接口wx.checkSession()可以校验session_key是否有效，从而避免小程序反复执行登录流程。
    let loginFlag = wx.getStorageSync('sessionId');
    // console.log(loginFlag)
    // wx.getStorage({
    //   key: 'sessionId',
    //   success(res) {
    //     console.log(res.data)
    //   }
    // })
    if (loginFlag) {
      //   // 检查 session_key 是否过期
      //   wx.checkSession({
      //     // session_key 有效(未过期)
      //     success: function () {
      //       // 业务逻辑处理
      //     },
      //     // session_key 过期
      //     fail: function () {
      //       // session_key过期，重新登录
      //       doLogin();
      //     }
      //   })
      // } else {
      //   // 无sessionId，作为首次登录
      //   doLogin();
      // }
      wx.checkSession({
        success: function () {
          //session_key 未过期，并且在本生命周期一直有效
          //问题：小程序缓存有内容，session又有效，但是cms重启了，丢了session。
          //请求cms上session是否存在，如果不存在，需要doLogin
          var sessionId = wx.getStorageSync('sessionId')
          //发起网络请求
          wx.request({
            url: config.url + '/wx/wxhassession',
            method: 'GET',
            header: {
              'content-type': 'application/json',
            },
            data: {
              hotqinsessionid: sessionId
            },
            success: function (res) {
              if (res.data.errNo == 1) {
                // console.log(res.data.msg)
                // that.setData({//没这个方法**********
                //   isLogin: true
                // });
                that.globalData.isLogin = true
                // user_id = wx.getStorageSync('user_id')
                // hasRegist = wx.getStorageSync('hasRegist')
                // isAdmin = wx.getStorageSync('isAdmin')
                that.globalData.user_id = wx.getStorageSync('user_id')
                that.globalData.hasRegist = wx.getStorageSync('hasRegist')
                that.globalData.isAdmin = wx.getStorageSync('isAdmin')
                that.globalData.photo = wx.getStorageSync('photo')
                // console.log(that.globalData.user_id)
                // console.log(that.globalData.hasRegist)
                // console.log(that.globalData.isAdmin)
              } else {//ecms中session失效了
                // console.log(res.data.msg)
                that.doLogin()
              }
            }
          })
        },
        fail: function () {
          // session_key 已经失效，需要重新执行登录流程
          that.doLogin()
        }
      })
    } else {
      // 无sessionId，作为首次登录
      that.doLogin();
    }
    // 获取用户授权信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              that.globalData.userInfo = res.userInfo
              that.globalData.hasUserInfo = true
              that.globalData.nickName = res.userInfo.nickName
              that.globalData.avatarUrl = res.userInfo.avatarUrl
              // console.log(this.globalData.hasUserInfo)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              // if (that.userInfoReadyCallback) {
              //   that.userInfoReadyCallback(res)
              // }
              // if (this.userInfoReadyCallback) {
              //   //如果存在实例app中存在userInfoReadyCallback，则将返回的数据回掉给实例中
              //   this.userInfoReadyCallback(res)
              // }
            }
          })
        }
        //查询有无授权获取地理位置
        if (res.authSetting['scope.userLocation']) {
          that.globalData.hasLocation = true
          // console.log(that.globalData.hasLocation)
          // 获取位置
          wx.getLocation({
            type: 'wgs84',
            success: function (res) {
              //实例化腾通地图sdk
              qqmapsdk = new QQMapWX({
                key: 'EADBZ-QCZ6Q-FDK54-GBQ4X-QY5B5-CVFFZ' //这里自己的key秘钥进行填充
              });
              // console.log(res)
              // console.log(that.data.activity_lat);
              var latitude1 = res.latitude
              var longitude1 = res.longitude
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: latitude1,
                  longitude: longitude1
                },
                success: function (res) {
                  // console.log(res);
                  // console.log(res.result.location.lat);
                  // location:
                  //   lat:23.16667
                  //   lng:113.415359
                  // address:"广东省广州市天河区天府路1号"
                  // var add = res.result.address
                  // that.setData({
                  // wd: latitude1,
                  // jd: longitude1,
                  // address: add,
                  // that.setData({//没这个方法**********
                  //   activity_lat: res.result.location.lat,
                  //   activity_lng: res.result.location.lng,
                  //   activity_location : res.result.address,
                  // });
                  that.globalData.activity_lat = res.result.location.lat;//另一种赋值方式，保留***********
                  that.globalData.activity_lng = res.result.location.lng;
                  that.globalData.activity_location = res.result.address;
                  // that.globalData.activity_location = res.result.address
                  // console.log(that.data.activity_lat);
                },
                // success: function (res) {
                //   vm.setData({
                //     aroundPlaces: res.data,
                //     confirmAddress: res.data[0].address
                //   });
                // },
                fail: function (res) {
                  // console.log(res)
                }
              });
            },
          })
        } else {
          //没有授权，就静默了,用户打卡授权面板，也没有这个选项了。
        }
      }
    })

    // 获取位置_没必要在这里获取位置，需要的地方再获取
    // wx.getLocation({
    //   type: 'wgs84',
    //   success: function (res) {
    //     that.globalData.hasLocation = true
    //   },
    //   fail: function (res) {
    //     // console.log(res)
    //   }
    // })
  },

  doLogin: function () {
    var that = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: config.url + '/wx/wxlogin/4',//珠三角设代plus 1
            data: {
              code: res.code
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            //成功后从服务端取得3rd_session(sessionId)存在手机上？
            // cookie: hotqinsessionid = f7c24d6d0818158772041c11438ad650
            success: function (res) {
              // console.log(res.data)
              wx.setStorage({
                key: "sessionId",
                data: res.data.sessionId//"hotqinsessionid =" +
              })
              // wx.setStorageSync("UserInfos3rdSession_Token", res)
              //https://blog.csdn.net/qq_34827048/article/details/77990510
              // that.setData({
              // nickName: res.data.nickName,
              // avatarUrl: res.data.avatarUrl,
              //   user_id: res.data.userId
              // })
              if (res.data.userId) {
                wx.setStorage({
                  key: "user_id",
                  data: res.data.userId
                })
                wx.setStorage({
                  key: "isAdmin",
                  data: res.data.isAdmin
                })
                wx.setStorage({
                  key: "hasRegist",
                  data: true
                })
                wx.setStorage({
                  key: "photo",
                  data: res.data.photo
                })
                that.globalData.user_id = res.data.userId
                // console.log(that.globalData.user_id)
                // console.log(wx.getStorageSync('isAdmin'))
                // console.log(wx.getStorage('isAdmin'))
                that.globalData.hasRegist = true
                that.globalData.isAdmin = res.data.isAdmin
                that.globalData.photo = res.data.photo
              } else {
                wx.showToast({
                  title: '未注册用户。',
                  icon: 'none',
                  duration: 2000
                });
              }
              // console.log(wx.getStorageSync('sessionId'))
              //console.log(that.globalData.hasRegist)
              //console.log(that.globalData.user_id)
              //console.log(that.globalData.isAdmin)
              // wx.setStorageSync('openId', res.data.openId);
            }
          })
        } else {
          console.log('获取code失败！' + res.errMsg)
        }
      },
      fail: res => {
        console.log('登录失败！' + res.errMsg)
      }
      // fail: function (res) { },
    })
  }
  // setGlobalUserInfo: function (user) {
  //   // wx.setStorageSync("userInfo", user);
  //   wx.setStorage({
  //     key: 'userInfo',
  //     data: user
  //   })
  // },
  // getGlobalUserInfo: function () {
  //   return wx.getStorageSync("userInfo");
  //   wx.getStorage({
  //     key: 'userInfo',
  //     success(res) {
  //       console.log(res.data)
  //     }
  //   })
  // }
})