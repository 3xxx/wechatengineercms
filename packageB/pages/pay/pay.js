// pages/pay/pay.js

//index.js
//获取应用实例
var app = getApp()
var MD5Util = require('../../../utils/md5.js');


Page({
  data: {
    motto: 'Hello World',
    todos: [],
    allCompleted: false,
    leftCount: 0,
    logs: [],
    price: 0.01
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

  //保存本地数据
  save: function () {
    //将data保存到本地指定的key中。或覆盖掉该key对应的内容,同步线程推送数据到服务器
    wx.setStorageSync('todo_list', this.data.todos)
    wx.setStorageSync('todo_logs', this.data.logs)
  },
  load: function () {
    var todos = wx.getStorageInfoSync('todo_list')
    if (todos) {
      var leftCount = todos.filter(function (item) {
        return !item.completed
      }).length
      this.setData({ todos: todos, leftCount: leftCount })
    }

    var logs = wx.getStorageSync('todo_logs')
    if (logs) {
      this.setData({ logs: logs })
    }
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../../../packageA/logs/logs'
    })
  },
  onLoad: function () {
    this.load();
  },
  //输入待办事项信息
  inputChangeHandle: function (e) {
    this.setData({
      input: e.detail.value
    })
  },
  //添加之前在this指针中保存的data变量
  addTodoHandle: function () {
    if (!this.data.input || !this.data.input.trim()) return
    var todos = this.data.todos
    todos.push({ name: this.data.input, completed: false })
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: 'Add', name: this.data.input })
    this.setData({
      input: '',
      todos: todos,
      leftCount: this.data.leftCount + 1,
      logs: logs
    })
    this.save()
  },
  //显示未完成事件
  toggleTodoHandle: function (e) {
    var Index = e.currentTarget.dataset.index;
    var todos = this.data.todos
    todos[Index].completed = !todos[Index].completed
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: todos[Index].completed ? '支付成功' : '支付未成功',
      name: todos[Index].name
    })
    //推送剩余未完成事件的信息
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount + (todos[Index].completed ? -1 : 1),
      logs: logs
    })
    this.save();
  },

  toggleAllHandle: function () {
    //标记未完成，记录已经完成的事件数
    this.data.allCompleted = !this.data.allCompleted
    var todos = this.data.todos
    for (var i = todos.length - 1; i >= 0; i--) {
      todos[i].completed = this.data.allCompleted
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: this.data.allCompleted ? '支付成功' : '支付未成功',
      name: '全部任务'
    })
    this.save()

  },
  wxPay: function () {
    var code = '' //传给服务器获得openid
    var timestamp = String(Date.parse(new Date())) //时间戳
    var nonceStr = ''//随机字符串，后台返回
    var prepayId = '' //订单详情,预支付id，后台返回
    var paySign = ''//签名算法

    wx.login({
      success: function (res) {
        if (res.code) {
          code = res.code //发起网络请求，发起https请求,向服务器端请求支付
          wx.request({
            url: 'https://www.yuluoxinsheng.cn/wxPay/JsApiPay',
            data: { code: res.code },

            success: function (res) {
              if (res.data.result == true) {
                //调用签名算法
                nonceStr = res.data.nonceStr
                prepayId = res.data.prepayId
                //按照字段的首字母排序组成新的字符串

                var payDataA = 'appId=' + app.globalData.appId + '&nonceStr=' + res.data.nonceStr + '&packeage=' + prepayId + '&signType=MD5&timestamp=' + timestamp;
                //使用MD5，key为商户注册的密钥
                var payDataB = payDataA + "&key=" + app.globalData.key;
                paySign = MD5Util.MD5(payDataB).toUpperCase();
                //发起微信支付
                wx.requestPayment({
                  'timestamp': timestamp,
                  'nonceStr': nonceStr,
                  'packeage': 'prepayId=' + prepayId,
                  'signType': 'MD5',
                  'paySign': paySign,
                  'success': function (res) {
                    //保存当前页面,跳转到某个应用内页面
                    wx.navigateTo({
                      url: '../pay/pay',
                    })
                  },
                  'fail': function (res) {
                    console.log(res.errMsg);
                  }
                })
              } else {
                console.log('请求失败' + res.data.info)
              }
            }
          })

        }
        else {
          console.log('动态请求登录失败', res.erMsg)
        }
      }
    });

  }

})

// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {

//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {

//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })