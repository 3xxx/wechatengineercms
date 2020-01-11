// 我获得的赞赏
// pages/myappreciation/myappreciation.js
var app = getApp();
var config = require('../../../config.js');
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据
Page({
  /**
   * 页面的初始数据
   */
  data: {
    myappreciation: [],
    balance: 0,//账户余额
    appreciationphoto: "../../../image/hotqin000.jpg",
    hasLogin: false, //是否登录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取账户余额
    var that = this;
    var sessionId = wx.getStorageSync('sessionId')
    if (wx.getStorageSync('isLogin')) {
      that.setData({ isLogin: wx.getStorageSync('isLogin') });
    }
    // if (app.globalData.isLogin) {
    //   that.setData({
    //     isLogin: app.globalData.isLogin,
    //   });
    // }
    //发起网络请求
    wx.request({
      url: config.url + "/wx/getwxusermoney",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "GET",
      data: {
        app_version: 6,
        hotqinsessionid: sessionId
      },
      success: function (res) {
        that.setData({ balance: res.data.amount });
      }
    })
    //获取用户赞赏码
    // console.log(app.globalData.appreciationphoto)
    if (app.globalData.appreciationphoto) {
      that.setData({
        appreciationphoto: app.globalData.appreciationphoto,
      });
    }

    that.getMyAppreciation(1); //第一次加载数据
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
    this.getMyAppreciation(1); //第一次加载数据
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getMyAppreciation(page); //后台获取新数据并追加渲染
  },

  // 清缓存
  clearCache: function () {
    // 这里也要分清是文章列表页还是搜索页。
    page = 1; //分页标识归零
    this.setData({
      // imgUrls: [], //顶部轮播数组清空
      myappreciation: [], //文章列表数组清空
    });
  },

  /**
 * 获取赞赏列表
 * @param {int} pg  分页标识 默认0
 */
  getMyAppreciation: function (pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    var sessionId = wx.getStorageSync('sessionId')
    //发起网络请求
    wx.request({
      url: config.url + "/wx/getwxusergetappreciations",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "GET",
      data: {
        app_version: 6,
        hotqinsessionid: sessionId,
        page: pg, //分页标识
      },
      success: function (res) {
        var tmpArr = that.data.myappreciation;
        // 这一步实现了上拉加载更多
        tmpArr.push.apply(tmpArr, res.data.mymoney);
        that.setData({
          myappreciation: tmpArr
        })
        page++;
      }
    })

  },

  /**
* 点击上传用户赞赏码
*/
  addAppreciationPhoto: function () {
    var that = this;
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var filePath = res.tempFilePaths[0];
        // var fileName = filePath.match(/http.{7}(.*)/);
        // fileName = fileName[1];
        // var fileName = Date.parse(new Date()) + '.jpg';
        var sessionId = wx.getStorageSync('sessionId');
        wx.uploadFile({
          url: config.url + '/wx/uploadappreciationphoto',
          filePath: filePath,
          name: 'file',
          header: {
            'content-type': 'application/json'
          },
          formData: {
            hotqinsessionid: sessionId,
          },
          success: function (res) {
            // var obj = JSON.parse(res.data);坑：返回是string，如果要变成json，就用这句！！！
            that.setData({
              appreciationphoto: res.data
            })
            // console.log(res.data)
            wx.setStorage({
              key: "appreciationphoto",
              data: res.data
            })
            app.globalData.appreciationphoto = res.data
          },
          fail: function (e) {
            console.log('e', e)
          }
        })
      },
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})