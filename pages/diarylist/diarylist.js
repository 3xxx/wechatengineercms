// pages/diarylist/diarylist.js
var app = getApp();
var config = require('../../config.js');
var imgUrls1 = []
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据
var limit = 12;
var searchpage = 1; // 当前页数-搜索页
var searchTitle = ""; // 搜索关键字
var msgListKey = ""; // 文章列表本地缓存key
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // apiUrl: config.url + "/wx/getwxdiaries",
    diaries: [], //文章列表数组
    leassonId: '',
    diaryProjId: '', //日志所对应的项目id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.projectConfig) {
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
      this.setData({
        diaryProjId: app.globalData.projectConfig.diaryprojid,
      })
    }
    this.clearCache(); //清本页缓存
    this.getDiaries(1);
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
    this.getDiaries(1); //第一次加载数据
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getDiaries(page); //后台获取新数据并追加渲染
  },

  // 清缓存
  clearCache: function () {
    // 这里也要分清是文章列表页还是搜索页。
    page = 1; //分页标识归零
    this.setData({
      imgUrls: [], //顶部轮播数组清空
      diaries: [], //文章列表数组清空
    });
  },

  /**
   * 获取文章列表
   * @param {int} pg  分页标识 默认0
   */
  getDiaries: function (pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    var apiUrl = config.url + '/wx/getwxdiaries'; //文章列表接口地址
    var postData = {
      projectid: that.data.diaryProjId,
      page: pg, //分页标识
      limit: 12,
      app_version: 1, //当前版本，后台根据版本不同给出不同的数据格式
    }
    wx.request({
      url: apiUrl,
      data: postData,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.info == "SUCCESS") { //成功
          var tmpArr = that.data.diaries;
          // 这一步实现了上拉加载更多
          tmpArr.push.apply(tmpArr, res.data.diaries);
          that.setData({
            diaries: tmpArr
          })
          // console.log(tmpArr);
          page++;
        } else { //失败
          console.log(res.data.info);
        }
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'pages/diarylist/diarylist'
    }
  },

  adddiary: function () {
    wx.navigateTo({
      url: '../../packageA/pages/diary/diary'
    })
  },

  //详情页面
  seeDetail: function (e) {
    // console.log(e)
    this.setData({
      leassonId: e.currentTarget.dataset.id
    })
    wx.navigateTo({
      url: '/packageA/pages/diarydetail/diarydetail?id=' + this.data.leassonId
    })
  },

})