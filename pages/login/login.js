// 这个不是登录界面，是register
var app = getApp();
var util = require('../../utils/util.js');
Page({
  data: {
    account:"",
    password:""
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          account: options.account,
          password: options.password
        })
      }
    });
  },

  formSubmit: function (e) {
    var accountVal = e.detail.value.account;
    var passwordVal = e.detail.value.password;
    var vcode = e.detail.value.vcode;
    var that = this;
    if ("" == util.trim(accountVal) || "" == util.trim(passwordVal)) {
      util.isError("请输入账号密码", that);
      return;
    } else {
      util.clearError(that);
    }
    app.ajax.req('/itdragon/login', {
      "account": accountVal,
      "password": passwordVal
    }, function (res) {
      console.log(res);
    });
  },
  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'pages/login/login'
    }
  }
})
