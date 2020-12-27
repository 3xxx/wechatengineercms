// packageC/pages/busycheckin/busycheckin.js
const app = getApp()
var config = require('../../../config.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    processing: [],
    isAdmin: false,
    projectid: '',
    activeNames: ['1'],
    value: ''
  },

  onChange(event) {
    console.log(event.detail)
    this.setData({
      activeNames: event.detail
    });
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
  onLoad: function (options) {

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
    var that = this;
    if (app.globalData.projectConfig) {
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
      var sessionId = wx.getStorageSync('sessionId')
      that.setData({
        projectid: app.globalData.projectConfig.projectid
      })

      wx.request({
        url: config.url + '/wx/getbusiness/' + that.data.projectid + '?hotqinsessionid=' + sessionId,
        method: 'GET',
        success: function (res) {
          that.setData({
            processing: res.data
          });
          // console.log(that.data)
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
    var that=this
    that.clearCache();
    var sessionId = wx.getStorageSync('sessionId')
    wx.request({
      url: config.url + '/wx/getbusiness/' + that.data.projectid + '?hotqinsessionid=' + sessionId,
      method: 'GET',
      success: function (res) {
        that.setData({
          processing: res.data
        });
        // console.log(that.data)
      }
    })
    wx.stopPullDownRefresh();
  },

    // 清缓存
    clearCache: function () {
      this.setData({
        processing: []
      });
    },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // 打卡
  checkin: function (e) {
    // console.log(e.currentTarget.id)
    // leassonId: e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../calendar/calendar?activity_id=' + e.currentTarget.id
    })
  },

    // 编辑出差登记信息
    editor(e) {
      var that = this
      // console.log(that.data.articlecontent)
      wx.navigateTo({
        url: '../businesseditor/businesseditor?id=' + e.currentTarget.id
      })
    },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})