// packageB/pages/adduser/adduser.js
//管理员添加用户
var app = getApp();
var util = require('../../../utils/util.js');
var config = require('../../../config.js');
Page({
  data: {
    account: "",
    password: "",
    subpassword: ""
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          // account: options.account,
          // password: options.password
        })
      }
    });
  },

  onShow: function () {
    // Do something when page show.
      if (app.globalData.projectConfig){
        wx.setNavigationBarTitle({
          title: app.globalData.projectConfig.projecttitle,
        });
      }
  },

  formSubmit: function (e) {
    // console.log(e);
    // form 表单取值，格式 e.detail.value.name(name为input中自定义name值) ；使用条件：需通过<form bindsubmit="formSubmit">与<button formType="submit">一起使用
    var account = e.detail.value.account;
    var nickname = e.detail.value.nickname;
    var password = e.detail.value.password;
    var subPassword = e.detail.value.subPassword;
    var that = this;
    // var acountt = util.formatTime(new Date());
    // 判断账号是否为空和判断该账号名是否被注册
    if ("" == util.trim(account)) {
      util.isError("账号不能为空", that);
      return;
    } else {
      util.clearError(that);
      // app.ajax.req('/register/checkLoginName', {
      //   "loginName": account
      // }, function (res) {
      //   if (!res) {
      //     util.isError("账号已经被注册过", that);
      //     return;
      //   }
      // });
    }
    if ("" == util.trim(nickname)) {
      util.isError("昵称不能为空", that);
      return;
    } else {
      util.clearError(that);
    }
    // 判断密码是否为空
    if ("" == util.trim(password)) {
      util.isError("密码不能为空", that);
      return;
    } else {
      util.clearError(that);
    }
    if ("" == util.trim(subPassword)) {
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
    // 验证都通过了执行添加用户方法
    // 登录
    var sessionId = wx.getStorageSync('sessionId')
    // wx.login({
    // success: res => {
    // 发送 res.code 到后台换取 openId, sessionKey, unionId
    // if (res.code) {
    //发起网络请求
    wx.request({
      url: config.url + '/wx/addwxuser',
      data: {
        hotqinsessionid: sessionId,
        // code: res.code,
        uname: account,
        nickname: nickname,
        password: password,
        app_version: 4, //珠三角阅览版4
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.info == "success") { //成功
          // 显示模态弹窗
          wx.showModal({
            title: '添加用户状态',
            content: '添加成功',
            duration: 2000,
            success(res) {
              if (res.confirm) {
                // 点击确定后跳转登录页面并关闭当前页面
                // wx.redirectTo({//redirect不能跳转到tabar
                //   url: '../index/index'
                // })
                // wx.switchTab({
                //   url: '../index/index'
                // })
                //console.log(app.globalData.hasRegist)
                // 应该返回到上一页
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'none',
            content: res.data.info,
            duration: 2000
          })
        }
      }
    });
    // }
    // }
    // })
  },

  formReset: function (e) {},

  onShareAppMessage: function () {
    return {
      title: '珠三角设代阅览版',
      path: 'packageB/pages/adduser/adduser'
    }
  }
})