// pages/projetlist/projectlist.js
var app = getApp();
var config = require('../../config.js');
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据

Page({

  /**
   * 页面的初始数据
   */
  data: {
    projects: [], //项目列表数组
    radio: '1',
    projectid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.clearCache(); //清本页缓存
    this.getProjects(1);
    //读取存储，获得项目id
    if (app.globalData.projectConfig){
      this.setData({
        radio:app.globalData.projectConfig.projectcode
      });
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    if (this.data.articleFocus) {
      this.clearCache();
      this.getProjects(1); //第一次加载数据
      wx.stopPullDownRefresh();
    }
  },

  // 页面上拉触底事件（上拉加载更多）
  onReachBottom: function () {
    this.getProjects(page); //后台获取新数据并追加渲染
  },

  // 清缓存
  clearCache: function () {
    // 这里也要分清是文章列表页还是搜索页。
    page = 1; //分页标识归零
    this.setData({
      projects: [], //项目列表数组清空
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
    if (app.globalData.projectConfig){
      this.setData({
        radio:app.globalData.projectConfig.projectcode
      });
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
    }
  },

  /**
   * 获取文章列表
   * @param {int} pg  分页标识 默认0
   */
  getProjects: function (pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    var apiUrl = config.url + '/project/getprojects'; //文章列表接口地址
    var postData = {
      page: pg, //分页标识
      app_version: 1, //当前版本，后台根据版本不同给出不同的数据格式
      // projectid:26892
    }
    wx.request({
      url: apiUrl,
      data: postData,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // if (res.data.code == 1) {
        var tmpArr = that.data.projects;
        // 这一步实现了上拉加载更多
        tmpArr.push.apply(tmpArr, res.data.rows);
        that.setData({
          projects: tmpArr
        })
        // console.log(tmpArr);
        page++;
        // } else {
        //   wx.showToast({
        //     title: '出错！', //在前端处理？，不用后端处理
        //     icon: 'error',
        //     duration: 2000
        //   });
        // }
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
      },
    })
  },

  onChange(event) {
    this.setData({
      radio: event.detail
    });
    console.log(event)
  },

  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      radio: name,
      projectid: event.currentTarget.dataset.id
    });
    console.log(event.currentTarget.dataset.id)
    wx.showToast({
      title: '请点按钮确认！',
      duration: 3000
    });
  },

  getprojectconfig() {
    var that = this;
    if (that.data.projectid) {
      var apiUrl = config.url + '/admin/getwxprojectconfig'; 
      var postData = {
        projectid: that.data.projectid, 
        app_version: 1, 
      }
      wx.request({
        url: apiUrl,
        data: postData,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorage({
            key: 'projectConfig',
            data: res.data
          })
          app.globalData.projectConfig=res.data
          wx.showToast({
            title: '保存成功',
            duration: 2000
          });
          wx.navigateBack({
            delta: 1,
            success: function (e) {
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
              page.onLoad();
            }
          })
        },
        fail: function (res) {
          // console.log(res);
          wx.showToast({
            title: '获取数据失败',
            icon: 'error',
            duration: 2000
          });
        },
      })
    } else {
      wx.showToast({
        title: "请先选择项目",
        icon: 'loading',
        duration: 1500
      })
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

  }
})