// 我的钱包
// pages/mymoney/mymoney.js
var app = getApp();
var config = require('../../../config.js');
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mymoney: [],
    balance:0,//账户余额
    user_id:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取账户余额
    var that = this;
    var sessionId = wx.getStorageSync('sessionId')
    //发起网络请求
    wx.request({
      url: config.url + "/wx/getwxusermoney",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "GET",
      data: {
        app_version: 4,
        hotqinsessionid: sessionId
      },
      success: function (res) {
        that.setData({ balance: res.data.amount });
      }
    })
    if (app.globalData.user_id){
      that.setData({ user_id: app.globalData.user_id });
    }

    that.getMyMoney(1); //第一次加载数据
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
    this.clearCache();
    this.getMyMoney(1); //第一次加载数据
    wx.stopPullDownRefresh();
  },

  // 清缓存
  clearCache: function () {
    // 这里也要分清是文章列表页还是搜索页。
    page = 1; //分页标识归零
    this.setData({
      // imgUrls: [], //顶部轮播数组清空
      mymoney: [], //文章列表数组清空
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getMyMoney(page); //后台获取新数据并追加渲染
  },

  /**
 * 获取支付列表
 * @param {int} pg  分页标识 默认0
 */
  getMyMoney: function (pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    //获取账户余额
    var sessionId = wx.getStorageSync('sessionId')
    //发起网络请求
    wx.request({
      url: config.url + "/wx/getwxuserpays",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "GET",
      data: {
        app_version: 4,
        hotqinsessionid: sessionId,
        page: pg, //分页标识
      },
      success: function (res) {
        var tmpArr = that.data.mymoney;
        // 这一步实现了上拉加载更多
        tmpArr.push.apply(tmpArr, res.data.mymoney);
        that.setData({
          mymoney: tmpArr
        })
        page++;
      }
    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '湾区防腐蚀●钱包',
      path: 'packageB/pages/mymoney/mymoney'
    }
  }
})