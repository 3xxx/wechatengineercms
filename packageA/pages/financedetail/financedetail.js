// pages/financedetail/financedetail.js
const app = getApp()
var util = require('../../../utils/util.js');
let wxparse = require("../../../wxParse/wxParse.js");
var config = require('../../../config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdmin: false,
    isArticleMe: false,//文章作者本人可以编辑
    id: '',
    financecontent:'',
    leassonTitle: '',
    amount:0,
    consider:false,
    // time:'',
    // author:'',
    // financedate:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.id,
      isAdmin: app.globalData.isAdmin
    })
    // console.log(this.data.isAdmin)
    var that = this
    var sessionId = wx.getStorageSync('sessionId')
    var getData = wx.request({
      url: config.url + '/wx/getwxfinance/' + options.id,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        hotqinsessionid: sessionId
      },
      success: function(res) {
        // console.log(res.data)
        that.setData({
          dkcontent: res.data.html,
          financecontent: res.data.html,//给编辑日志用
          financedate: res.data.Financedate,
          // leassonTitle: res.data.Title,
          time: res.data.Updated,
          isArticleMe: res.data.isArticleMe,
          author: res.data.UserId,
          views: res.data.Views,
          amount:res.data.amount,
          consider:res.data.consider
        })
        wxparse.wxParse('dkcontent', 'html', that.data.dkcontent, that, 5)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  // 编辑文章
  editor(e) {
    var that = this
    // console.log(that.data.articlecontent)
    wx.navigateTo({
      url: '../financeeditor/financeeditor?id=' + e.currentTarget.dataset.id// + '&title=' + that.data.leassonTilte + '&content=' + that.data.articlecontent
    })
  },

  // 删除文章
  delete(e) {
    // console.log(e.currentTarget.dataset.id)
    var sessionId = wx.getStorageSync('sessionId')
    wx.showModal({
      title: '提示',
      content: '确定要删除这个财务记录吗？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //发起网络请求
          wx.request({
            url: config.url + "/wx/deletewxfinance",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              id: e.currentTarget.dataset.id,
              hotqinsessionid: sessionId
            },
            success: function (res) {
              if (res.data == "ok") {
                wx.showToast({
                  title: "删除成功！",
                  duration: 1000,
                  icon: "sucess",
                })
              } else {
                wx.showToast({
                  title: "删除失败！",
                  duration: 1000,
                  icon: "err",
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '珠三角设代plus',
      path: '/packageA/pages/financedetail/financedetail?id=' + this.data.id
    }
  }
})