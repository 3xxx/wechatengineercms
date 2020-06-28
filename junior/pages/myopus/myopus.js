//引入本地json数据，这里引入的就是第一步定义的json数据
// var getData = require('../../data/data.js');
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据
const app = getApp();
var config = require('../../config.js');
Page({
  data: {
    articles: [], //文章列表数组
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    toView: 'red',
    scrollTop: 100,
    author: '青少儿书画',
    actIndex: 'first',
    leassonId: '',
    radioo:'',
  },
  // 页面加载
  onLoad: function(options) {
    var that = this;
    that.clearCache(); //清本页缓存
    that.setData({
      radioo : options.id
    });
    that.getArticles(1); //第一次加载数据:绘画
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.clearCache();
    this.getArticles(1); //第一次加载数据
    wx.stopPullDownRefresh();
  },
  // 页面上拉触底事件（上拉加载更多）
  onReachBottom: function() {
    this.getArticles(page); //后台获取新数据并追加渲染
  },
  // 清缓存
  clearCache: function() {
    page = 1; //分页标识归零
    this.setData({
      articles: [] //文章列表数组清空
    });
  },
  /**************** 界面点击 *****************/
  // 文章点击跳转详情页
  onArticle: function() {
    // 业务逻辑
  },

  /**************** 网络请求 *****************/
  /**
   * 获取文章列表
   * @param {int} pg  分页标识 默认0
   */
  getArticles: function(pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    switch (that.data.radioo) {
      case "draw":
        var url1 = config.url + "/wx/getwxarticless/26175";
        break;
      case "calligraphy":
        var url1 = config.url + "/wx/getwxarticless/26174";
        break;
      case "writing":
        var url1 = config.url + "/wx/getwxarticless/26173";
        break;
      case "other":
        var url1 = config.url + "/wx/getwxarticless/26172";
        break;
      default:
        var url1 = config.url + "/wx/getwxarticless/26175";
    };
    var sessionId = wx.getStorageSync('sessionId')
    var getData = wx.request({
      url: url1,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      // url: url1,
      // data: postData,
      method: 'GET',
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded'
      // },
      data: {
        hotqinsessionid: sessionId,
              page: pg, //分页标识
              app_version: 2, //当前版本，后台根据版本不同给出不同的数据格式
            },
            success: function(res) {
              if (res.data.info == "SUCCESS") { //成功
                var tmpArr = that.data.articles;
                // 这一步实现了上拉加载更多
                tmpArr.push.apply(tmpArr, res.data.articles);
                that.setData({
                  articles: tmpArr
                })
                // console.log(tmpArr);
                // console.log(that.data.articles.length);
                page++;
              } else { //失败
                console.log(res.data.info);
              }
            },
            fail: function(e) {
              console.log(e);
      }
    })
  },

  tap: function(e) {
    for (var i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1]
        })
        break
      }
    }
  },
  tapMove: function(e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },

  scroll: function (e) {
    // console.log(e)
  },
  lower: function (e) {
    // console.log(e)
    // let name = e.detail.value;
    // this.setData({
    //   usernameNew: name
    // })
  },
  upper: function (e) {

  },

  //详情页面
  seeDetail: function(e) {
    // console.log(e)
    this.setData({
      leassonId: e.currentTarget.dataset.id
    })
    wx.navigateTo({
      url: '../detail/detail?id=' + this.data.leassonId
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '青少儿书画',
      path: 'pages/myopus/myopus'
    }
  }
})