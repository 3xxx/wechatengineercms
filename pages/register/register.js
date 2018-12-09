var util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    showTopTips: false,
    errorMsg: ""
  },
  onLoad: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    });
  },

  formSubmit: function(e) {
    console.log(e);
    // form 表单取值，格式 e.detail.value.name(name为input中自定义name值) ；使用条件：需通过<form bindsubmit="formSubmit">与<button formType="submit">一起使用
    var account = e.detail.value.account;
    var password = e.detail.value.password;
    var subPassword = e.detail.value.subPassword;
    var that = this;
    var acountt = util.formatTime(new Date());
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
    // 判断密码是否为空
    if ("" == util.trim(password)) {
      util.isError("密码不能为空", that);
      return;
    } else {
      util.clearError(that);
    }
    // 两个密码必须一致
    // if (subPassword != password) {
    //   util.isError("输入密码不一致", that);
    //   return;
    // } else {
    //   util.clearError(that);
    // }
    // 验证都通过了执行注册方法
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://zsj.itdos.com/v1/wx/wxregist',
            data: {
              code: res.code,
              uname: account,
              password: password,
              app_version: 3,
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function(res) {
              if (res.data.info == "SUCCESS") { //成功
                // app.ajax.req('/itdragon/register', {
                //   "account": account,
                //   "password": password
                // }, function (res) {
                //   if (true == res) {
                // 显示模态弹窗
                wx.showModal({
                  title: '注册状态',
                  content: '注册成功，可以根据权限访问资源了',
                  duration: 2000,
                  success(res) {
                    if (res.confirm) {
                      // 点击确定后跳转登录页面并关闭当前页面
                      // wx.redirectTo({//redirect不能跳转到tabar
                      //   url: '../index/index'
                      // })
                      wx.switchTab({
                        url: '../index/index'
                      })
                    } 
                  }
                  // success: function(res) {//错误代码
                  //   if (res.confirm) {
                  //     // 点击确定后跳转登录页面并关闭当前页面
                  //     wx.redirectTo({
                  //       url: '../index/index'
                  //     })
                  //   }
                  // }
                })
              } else {
                // 显示消息提示框
                wx.showToast({
                  title: '注册失败',
                  icon: 'error',
                  content: res.data.info,
                  duration: 2000
                })
              }
            }
          });
        }
      }
    })
  }
})