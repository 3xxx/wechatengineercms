var config = require('../../config.js');
const app = getApp()
Page({
  data: {
    isAdmin: false,
    input: '',
    todos: [],
    leftCount: 0,
    allCompleted: false,
    logs: []
  },

  save: function () {
    wx.setStorageSync('todo_list', this.data.todos)
    wx.setStorageSync('todo_logs', this.data.logs)
  },

  load: function () {
    var that = this;
    wx.request({
      url: config.url + '/todo/gettodo',
      method: 'GET',
      success: function (res) {
        // that.setData({
        //   todos: res.data
        // });
        // console.log(that.data.processing)
        if (res.data) {
          var leftCount = res.data.filter(function (item) {
            return !item.completed
          }).length
          that.setData({ todos: res.data, leftCount: leftCount })
        }
        var logs = wx.getStorageSync('todo_logs')
        if (logs) {
          that.setData({ logs: logs })
        }
      }
    })

    // var todos = wx.getStorageSync('todo_list')
    // if (todos) {
    //   var leftCount = todos.filter(function (item) {
    //     return !item.completed
    //   }).length
    //   this.setData({ todos: todos, leftCount: leftCount })
    // }
    // var logs = wx.getStorageSync('todo_logs')
    // if (logs) {
    //   this.setData({ logs: logs })
    // }
  },

  onLoad: function () {
    this.setData({
      isAdmin: app.globalData.isAdmin
    })
    this.load()
  },

  inputChangeHandle: function (e) {
    this.setData({ input: e.detail.value })
  },

  addTodoHandle: function (e) {
    if (!this.data.input || !this.data.input.trim()) return
    var value = this.data.input
    // 登录——才能添加待办事项
    var sessionId = wx.getStorageSync('sessionId')

    var that = this;
    wx.request({
      url: config.url + '/todo/create',
      data: {
        'name': value,
        'hotqinsessionid': sessionId,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({
          title: "新建待办成功",
          icon: 'success',
          duration: 1500
        });
        var todos = that.data.todos
        console.log(res)
        todos.push({ todoname: that.data.input, completed: false, todoid: res.data.todoid })
        var logs = that.data.logs
        logs.push({ timestamp: new Date(), action: 'Add', name: that.data.input })
        that.setData({
          input: '',
          todos: todos,
          leftCount: that.data.leftCount + 1,
          logs: logs
        })
        that.save()
      }
    })

  },

  toggleTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    console.log(e)
    // 登录——才能修改待办事项
    var sessionId = wx.getStorageSync('sessionId')
    wx.request({
      url: config.url + '/todo/updatetodo',
      data: {
        'todoid': e.currentTarget.dataset.id,
        'hotqinsessionid': sessionId,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({
          title: "修改待办成功",
          icon: 'success',
          duration: 1500
        })
      }
    })
    var todos = this.data.todos
    todos[index].completed = !todos[index].completed
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: todos[index].completed ? 'Finish' : 'Restart',
      name: todos[index].name
    })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount + (todos[index].completed ? -1 : 1),
      logs: logs
    })
    this.save()
  },

  //管理员删除待办
  removeTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    // 登录——才能修改待办事项
    var sessionId = wx.getStorageSync('sessionId')
    wx.request({
      url: config.url + '/todo/deletetodo',
      data: {
        'todoid': e.currentTarget.dataset.id,
        'hotqinsessionid': sessionId,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({
          title: "删除待办成功",
          icon: 'success',
          duration: 1500
        })
      }
    })
    var todos = this.data.todos
    var remove = todos.splice(index, 1)[0]
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: 'Remove', name: remove.name })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount - (remove.completed ? 0 : 1),
      logs: logs
    })
    this.save()
  },

  toggleAllHandle: function (e) {
    this.data.allCompleted = !this.data.allCompleted
    var todos = this.data.todos
    for (var i = todos.length - 1; i >= 0; i--) {
      todos[i].completed = this.data.allCompleted
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: this.data.allCompleted ? 'Finish' : 'Restart',
      name: 'All todos'
    })
    this.setData({
      todos: todos,
      leftCount: this.data.allCompleted ? 0 : todos.length,
      logs: logs
    })
    this.save()
  },

  clearCompletedHandle: function (e) {
    var todos = this.data.todos
    var remains = []
    for (var i = 0; i < todos.length; i++) {
      todos[i].completed || remains.push(todos[i])
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: 'Clear',
      name: 'Completed todo'
    })
    this.setData({ todos: remains, logs: logs })
    this.save()
  },

  finished: function () {
    // 点击确定后跳转登录页面并关闭当前页面
    // wx.redirectTo({//redirect不能跳转到tabar,没有返回按钮
    //   url: '../register/register'
    // })
    wx.navigateTo({
      url: '../logs/logs'
    })
    // wx.switchTab({
    //   url: '../register/register',
    //   url: '../index/index'
    // })
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'pages/todo/todo'
    }
  },
})
