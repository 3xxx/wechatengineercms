// pages/updatepass/updatepass.js
var app = getApp();
var util = require('../../utils/util.js');
var config = require('../../config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    errorMsg: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    });
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
      title: '青少儿书画',
      path: 'pages/updatepass/updatepass'
    }
  },

  formSubmit: function (e) {
    // console.log(e);
    // form 表单取值，格式 e.detail.value.name(name为input中自定义name值) ；使用条件：需通过<form bindsubmit="formSubmit">与<button formType="submit">一起使用
    // var account = e.detail.value.account;
    var password = e.detail.value.password;
    var subPassword = e.detail.value.subPassword;
    var that = this;
    // var acountt = util.formatTime(new Date());
    // 判断账号是否为空和判断该账号名是否被注册
    // if ("" == util.trim(account)) {
    //   util.isError("账号不能为空", that);
    //   return;
    // } else {
    //   util.clearError(that);
    // }
    // 判断密码是否为空
    if ("" == util.trim(password)) {
      util.isError("密码不能为空", that);
      return;
    } else {
      util.clearError(that);
    }
    // 两个密码必须一致
    if (subPassword != password) {
      util.isError("输入密码不一致", that);
      return;
    } else {
      util.clearError(that);
    }
    // 验证都通过了执行修改密码方法
    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //     if (res.code) {
    var sessionId = wx.getStorageSync('sessionId')
    //发起网络请求
    wx.request({
      url: config.url + '/wx/updatewxpassword',
      data: {
        hotqinsessionid: sessionId,
        oldpass: password,
        newpass: subPassword,
        uid: app.globalData.user_id,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.data == "ok") { //成功
          // 显示模态弹窗
          wx.showModal({
            title: '修改状态',
            content: '密码修改成功！',
            duration: 2000,
            success(res) {
              if (res.confirm) {
                // 应该返回到上一页
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        } else {
          // 显示消息提示框
          wx.showToast({
            title: '修改失败',
            icon: 'error',
            content: res.data.data,
            duration: 2000
          })
        }
      }
    });
    //     }
    //   }
    // })
  }
})