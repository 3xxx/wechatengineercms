// 导入wxSearchView的JS文件
var WxSearch = require('../../wxSearchView/wxSearchView.js');
const app = getApp()
Page({
  /* 页面数据绑定 */
  data: {

  },

  /* 页面加载 */
  onLoad: function(params) {
    var that = this;

    // 从后台获取热搜词
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + "/video/getHotWords",
      method: "POST",
      success: function(res) {
        // console.log(res);
        var hotWordsList = res.data.data;

        // 初始化搜索栏
        WxSearch.init(
          that, // 本页面的引用
          hotWordsList, // 热搜词
          hotWordsList, //搜索匹配列表
          that.mySeatchFunction, // 提供一个搜索回调函数
          that.myGobackFunction, // 提供一个返回回调函数
        );
      }
    })
  },

  // 转发函数
  wxSearchInput: WxSearch.wxSearchInput, // 输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap, //点击提示或关键字，历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, //删除索引的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm, // 搜索函数
  wxSearchClear: WxSearch.wxSearchClear, // 清空函数

  // 搜索回调函数
  mySeatchFunction: function(value) {
    // 有效性验证
    if (value == 0 || value == undefined) {
      wx.showToast({
        title: '搜索条件不能为空哦~',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    var value = value.trim();
    // 跳转
    wx.redirectTo({
      url: '../index/index?isSaveRecord=1&search=' + value
    })
  },

  // 返回回调函数
  myGobackFunction: function() {
    wx.redirectTo({
      url: '../index/index'
    })
  }
})