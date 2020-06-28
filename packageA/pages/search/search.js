/**这个是打卡的活动列表，即activity列表
 * TODO:onload中加载所有正在进行的活动，在Typing中进行过滤，不用一遍一遍查询服务器
 */
const app = getApp()
var config = require('../../../config.js');
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    processing: [],
    isAdmin: false,
    projectid: ''
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    var that = this;
    that.setData({
      inputVal: e.detail.value
    });
    wx.request({
      url: config.url + '/checkin/activity/like',
      // url: 'http://localhost/v1/checkin/activity/like',
      method: 'POST',
      data: {
        'str': e.detail.value
      },
      success: function (res) {
        that.setData({
          processing: res.data.processing
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  onShow: function () {
    var that = this;
    if (app.globalData.projectConfig) {
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
      that.setData({
        projectid: app.globalData.projectConfig.projectid
      })
      wx.request({
        url: config.url + '/checkin/activity/getall?projectid=' + that.data.projectid,
        method: 'POST',
        success: function (res) {
          that.setData({
            processing: res.data.processing
          });
          // console.log(that.data.processing)
        }
      })
      if (app.globalData.isAdmin) {
        that.setData({
          isAdmin: true
        })
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'packageA/pages/search/search'
    }
  },

  //小程序订阅消息requestMsg()
  formSubmit: function (e) {
    // var that = this
    wx.requestSubscribeMessage({
      tmplIds: ['c8Dped7TztDiMJ2bzHMu4G3nikn-mSOHmQEh_7aTlLo'],
      success(res) {
        if (res['c8Dped7TztDiMJ2bzHMu4G3nikn-mSOHmQEh_7aTlLo'] === 'accept') {
          wx.showToast({
            title: '订阅成功'
          })
          // var sessionId = wx.getStorageSync('sessionId')
          // var postData = {
          //   hotqinsessionid: sessionId,
          //   tmplIds: 'c8Dped7TztDiMJ2bzHMu4G3nikn-mSOHmQEh_7aTlLo'
          // };
          // wx.request({
          //   url: config.url + '/checkin/subscribemessage',
          //   data: postData,
          //   method: 'POST',
          //   header: {
          //     'content-type': 'application/x-www-form-urlencoded'
          //   },
          //   success: function (res) {
          //     if (res.data.info == "SUCCESS") { //成功
          //       wx.showToast({
          //         title: '订阅OK！',
          //         duration: 1000,
          //         success(data) {
          //           //成功
          //         }
          //       })
          //     } else { //失败
          //       console.log(res.data.info);
          //       wx.showToast({
          //         title: '保存openid失败！',
          //         duration: 1500,
          //         success(data) {
          //         }
          //       })
          //     }
          //   },
          //   fail: function (e) {
          //     console.log(e);
          //   }
          // })
        } else if (res['c8Dped7TztDiMJ2bzHMu4G3nikn-mSOHmQEh_7aTlLo'] === 'reject') {
          wx.showModal({
            title: '订阅消息',
            content: '您已拒绝了订阅消息，如需重新订阅请前往设置打开。',
            confirmText: '去设置',
            //showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.openSetting({})
              }
            }
          })
          return
          // wx.showModal({
          //   title: '温馨提示',
          //   content: '您已取消授权，将无法在微信中收到打卡提醒！',
          //   showCancel: false,
          //   success: res => {
          //     if (res.confirm) {
          //       // 这里可以写自己的逻辑
          //     }
          //   }
          // })
        } else if (res['c8Dped7TztDiMJ2bzHMu4G3nikn-mSOHmQEh_7aTlLo'] === 'ban') {
          wx.showModal({
            title: '温馨提示',
            content: '被后台封禁！',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                // 这里可以写自己的逻辑
              }
            }
          })
        }
      },
      fail(err) {
        //失败
        wx.showModal({
          title: '订阅消息',
          content: '您关闭了“接收订阅信息”，请前往设置打开！',
          confirmText: '去设置',
          showCancel: false,
          success: res => {
            if (res.confirm) {
              wx.openSetting({})
            }
          }
        })
        // console.error(err);
      }

    })

    // wx.request({
    //   url: "https://zsj.itdos.com/v1/checkin/checksignature",
    //   data: {
    //     "form_id": e.detail.formId,
    //     // "customer_id": that.data.customer_id
    //   },
    //   method: 'GET',
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   success: function (res) {
    //     // util.showSuccess("设置成功")
    //     console.log(res.data)
    //   },
    //   fail: function (e) {
    //     // util.showError("设置失败".e)
    //   }
    // })
  },

  //收集用户点击按钮的订阅次数
  subscribeMessage: function (e) {
    wx.requestSubscribeMessage({
      tmplIds: ['c8Dped7TztDiMJ2bzHMu4G3nikn-mSOHmQEh_7aTlLo'],
      success(res) {}
    })
  },


  // 点击发送订阅消息
  sendMsg: function (e) {
    var postData = {
      app_version: '1'
    };
    wx.request({
      url: config.url + '/checkin/sendmessage',
      method: 'POST',
      data: postData,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      // header: {
      //   'content-type': 'application/json' // 默认值
      // },
      success(res) {
        console.log(res)
        if (res.data.info == "SUCCESS") {
          wx.showToast({
            title: '发送OK！',
            duration: 1500,
            success(data) {
              //成功

            }
          })
        } else if (res.data.info == "ERROR") {
          wx.showToast({
            title: res.data.data,
            duration: 1500,
            success(data) {
              //成功

            }
          })
        }
      }
    })
  }
});