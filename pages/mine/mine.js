// pages/mine/mine.js
const app = getApp()
var config = require('../../config.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasRegist: false, //是否注册
    hasUserInfo: false, //是否授权
    userInfo: null,
    hasLocation: false,
    isAdmin: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (!app.globalData.hasRegist) {
      // 登录——才能查询是否注册
      var sessionId = wx.getStorageSync('sessionId')
      //发起网络请求
      wx.request({
        url: config.url + '/wx/wxlogin/1', //珠三角设代plus版1
        data: {
          hotqinsessionid: sessionId,
          // uname: account,
          // password: password,
          // app_version: 4,
        },
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.userId) {
            console.log(res.data.userId)
            app.globalData.user_id = res.data.userId
            app.globalData.hasRegist = true
            app.globalData.isAdmin = res.data.isAdmin
            that.setData({
              hasRegist: true
            })
          }
          // if (res.data.msg == "success") {
          //   // console.log(res.data.userId)
          //   if (res.data.userId) {
          // app.globalData.user_id = res.data.userId
          // app.globalData.hasRegist = true
          //     that.data.hasRegist = true
          //     console.log(that.data.hasRegist)
          //   }
          // }
        }
      });

      // if (app.globalData.hasRegist) {
      //   that.setData({
      //     hasRegist: true
      //   })
    } else {
      // app.userRegistReadyCallback = res => {
      //   that.setData({
      //     hasRegist: true
      //   })
      // }
      that.setData({
        hasRegist: true
      })
    };
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // else {    // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          app.globalData.nickName = res.userInfo.nickName
          app.globalData.avatarUrl = res.userInfo.avatarUrl
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    if (!app.globalData.hasLocation) {
      // 获取位置
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          app.globalData.hasLocation = true
          that.setData({
            hasLocation: true
          })
        },
        fail: function (res) {
          // console.log(res)
        }
      })
    } else {
      that.setData({
        hasLocation: true
      })
    };

    if (app.globalData.isAdmin) {
      that.setData({
        isAdmin: true
      })
    }
  },
  // 用户点击按钮授权
  getUserInfo: function (res) {
    // console.log(res)
    app.globalData.userInfo = res.detail.userInfo
    app.globalData.nickName = res.detail.userInfo.nickName
    app.globalData.avatarUrl = res.detail.userInfo.avatarUrl
    this.setData({
      userInfo: res.detail.userInfo,
      hasUserInfo: true
    })
  },

  // 用户点击授权设置按钮授权
  // wx.getLocation({
  //   type: '',
  //   altitude: true,
  //   success: function(res) {},
  //   fail: function(res) {},
  //   complete: function(res) {},
  // })
  // getLocation: function (res) {
  //   console.log(res)
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      hasRegist: app.globalData.hasRegist //naviback返回此页不会触发onload，但是会触发onshow
    });
    if (app.globalData.projectConfig) {
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
    }
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
    return {
      title: '珠三角设代plus',
      path: 'pages/mine/mine'
    }
  },
  toOrder: function (e) {
    // console.log(e)
    if (e.target.id == "second")
      wx.switchTab({
        url: '../../pages/index/index'
      })
  },

  //详情页面
  seeDetail: function (e) {
    // console.log(e)
    // this.setData({
    var id = e.currentTarget.dataset.id
    // })
    wx.navigateTo({
      url: '../../packageB/pages/myopus/myopus?id=' + id
    })
  },

  //详情页面
  seeMyMoney: function (e) {
    // console.log(e)
    // this.setData({
    // var id = e.currentTarget.dataset.id
    // })
    wx.navigateTo({
      url: '../../packageB/pages/mymoney/mymoney'
    })
  },

  //打卡
  checkin: function (e) {
    var that = this
    // console.log(that.data.hasLocation)
    if (!that.data.hasRegist) {
      // 显示模态弹窗
      wx.showModal({
        title: '未注册用户！',
        content: '请点击确定后进行注册。',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../packageB/pages/register/register'
            })
          }
        }
      })
    } else if (!that.data.hasLocation) {
      // 显示模态弹窗
      wx.showModal({
        title: '未授权获取用户地理位置！',
        content: '请点击上部的打开授权信息面板按钮进行授权。',
        success(res) {
          // console.log(res)
        }
      })
    } else {
      wx.navigateTo({
        url: '../../packageA/pages/search/search'
      })
    }
  },

  // 项目切换
  selectproj: function () {
    wx.navigateTo({
      url: '/pages/projectlist/projectlist',
    })
  },

  //财务登记
  finance: function (e) {
    var that = this
    if (!that.data.hasRegist) {
      wx.showModal({ // 显示模态弹窗
        title: '未注册用户！',
        content: '请点击确定后进行注册。',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../packageB/pages/register/register'
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../../packageA/pages/financelist/financelist'
      })
    }
  },

  //设代日记列表页
  diarylist: function (e) {
    wx.navigateTo({
      url: '../../packageA/pages/diarylist/diarylist'
    })
  },

  // 用户打开权限设置页，选择权限后返回值
  callback: function (res) {
    if (res.detail.authSetting['scope.userLocation']) {
      this.setData({
        hasLocation: true
      })
    }
  },

  //微信赞赏弹框，不支持包里的图片
  showCustomDialogWx() {
    wx.previewImage({
      urls: ['https://zsj.itdos.com/attachment/wiki/2019November/1573984804727723800.jpg'],
    });
    // this.setData({ wxpayshow: true });
  },

  // 上传短视频
  uploadVideo: function () {
    var me = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',

      success(res) {
        // console.log(res);
        var duration = res.tempFiles[0].duration;
        var tmpHeight = res.tempFiles[0].height;
        var tmpWidth = res.tempFiles[0].width;
        var tmpVideoUrl = res.tempFiles[0].tempFilePath;
        var tmpCoverUrl = res.tempFiles[0].thumbTempFilePath;

        if (duration > 60) {
          wx.showToast({
            title: '视频长度不能超过60秒...',
            icon: "none",
            duration: 2500
          })
        } else if (duration < 3) {
          wx.showToast({
            title: '视频长度不能小于3秒...',
            icon: "none",
            duration: 2500
          })
        } else {
          //TODO 打开选择bgm的页面
          //打开选择bgm的页面
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration +
              "&tmpHeight=" + tmpHeight +
              "&tmpWidth=" + tmpWidth +
              "&tmpVideoUrl=" + tmpVideoUrl +
              "&tmpCoverUrl=" + tmpCoverUrl,
          })
        }

      }
    })
  },

  // 短视频列表
  videoIndex: function () {
    wx.navigateTo({
      url: '../videoList/videoList'
    })
  },

  // 待办事项页面
  todo: function () {
    wx.navigateTo({
      url: '../todo/todo'
    })
  },

  // 出差登记
  business: function () {
    wx.navigateTo({
      url: '../../packageC/pages/business/business'
    })
  },
  // 出差打卡
  busycheckin: function () {
    wx.navigateTo({
      url: '../../packageC/pages/busycheckin/busycheckin'
    })
  }

})