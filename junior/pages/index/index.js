//引入本地json数据，这里引入的就是第一步定义的json数据
// var getData = require('../../data/data.js');
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据
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
    // leassonList: [],//文章列表
    actIndex: 'draw',
    apiUrl: "https://zsj.itdos.com/v1/wx/getwxarticless/26175",
    leassonId: ''
  },

  // 页面加载
  onLoad: function() {
    var that = this;
    that.clearCache(); //清本页缓存
    //顶部轮播图片
    // that.carousel();
    that.getArticles(1); //第一次加载数据:绘画
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.clearCache();
    this.getArticles(1); //第一次加载数据
  },
  // 页面上拉触底事件（上拉加载更多）
  onReachBottom: function() {
    this.getArticles(page); //后台获取新数据并追加渲染
  },
  // 清缓存
  clearCache: function() {
    page = 1; //分页标识归零
    this.setData({
      imgUrls: [], //顶部轮播数组清空
      articles: [], //文章列表数组清空
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
    // var imgUrls1 = [];
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    var apiUrl = this.data.apiUrl
    var postData = {
      page: pg, //分页标识
      app_version: 3, //当前版本，后台根据版本不同给出不同的数据格式
    }
    wx.request({
      url: apiUrl,
      data: postData,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.data.info == "SUCCESS") { //成功
        if (pg==1){
          var tmpimgUrls = that.data.imgUrls;
          for (var i = 0; i < res.data.articles.length && i < 5; i++) {
            tmpimgUrls.push(res.data.articles[i].imgUrl)
          }
          that.setData({
            imgUrls: tmpimgUrls, //提供数据给页面顶端轮播图片
            // articles: tmpArr,
          })
        }
          //console.log(tmpimgUrls)
          var tmpArr = that.data.articles;
          // 这一步实现了上拉加载更多
          tmpArr.push.apply(tmpArr, res.data.articles);
          // console.log(tmpArr)
          that.setData({
            // imgUrls: tmpimgUrls, //提供数据给页面顶端轮播图片
            articles: tmpArr,
          })
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

  //顶部轮播图片
  carousel: function() {
    var that = this;
    var imgUrls1 = [];
    var apiUrl = this.data.apiUrl
    var postData = {
      app_version: 3, //当前版本，后台根据版本不同给出不同的数据格式
    }
    wx.request({
      url: apiUrl,
      data: postData,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.data.info == "SUCCESS") { //成功
          for (var i = 0; i < res.data.articles.length; i++) {
            imgUrls1.push(res.data.articles[i].imgUrl)
          }
          console.log(imgUrls1)
          that.setData({
            imgUrls: imgUrls1 //提供数据给页面顶端轮播图片
          })
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

  scroll: function(e) {
    // console.log(e)
  },
  lower: function(e) {
    // console.log(e)
    // let name = e.detail.value;
    // this.setData({
    //   usernameNew: name
    // })
  },
  upper: function(e) {

  },

  // tab切换事件
  changeMenu: function(e) {
    // const radioo = this.data.actIndex
    // console.log(e.currentTarget.id)
    switch (e.currentTarget.id) {
      case "draw":
        var url1 = "26175";
        break;
      case "calligraphy":
        var url1 = "26174";
        break;
      case "writing":
        var url1 = "26173";
        break;
      case "other":
        var url1 = "26172";
        break;
      default:
        var url1 = "26175";
    }
    var apiUrl = 'https://zsj.itdos.com/v1/wx/getwxarticless/' + url1; //文章列表接口地址
    this.setData({
      apiUrl: apiUrl,
      actIndex: e.currentTarget.id
    })
    // console.log(this.data.actIndex)
    // var imgUrls1 = [];
    var that = this;
    that.clearCache(); //清本页缓存
    //顶部轮播图片
    // that.carousel();
    //加载文章列表
    that.getArticles(1);
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
      title: '青少儿书画+●绘画',
      path: 'pages/index/index'
    }
  }
})