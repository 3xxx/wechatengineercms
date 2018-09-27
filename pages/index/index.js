var imgUrls1 = []

var page = 1;//分页标识，第几次下拉，用户传给后台获取新的下拉数据
Page({
  data: {
    articles: [],//文章列表数组
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    toView: 'red',
    scrollTop: 100,
    author: '珠三角设代',
    // leassonList: [],//文章列表
    actIndex: 'first',
    leassonId: ''
  },
  // 页面加载
  onLoad: function () {
    this.clearCache();//清本页缓存
    this.getArticles(1);//第一次加载数据

    //首页顶部轮播图片
    var postData = {
      page: 1,//分页标识
      app_version: 1.2,//当前版本，后台根据版本不同给出不同的数据格式
    };
    var that = this;
    wx.request({
      url: 'https://zsj.itdos.com/v1/wx/getwxarticles',
      data: postData,
      method: 'GET',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.info == "SUCCESS") {//成功
          for (var i = 0; i < res.data.articles.length; i++) {
            imgUrls1.push(res.data.articles[i].imgUrl)
          }
          //提供数据给页面顶端轮播图片
          that.setData({
            imgUrls: imgUrls1
          })
        } else {//失败
          console.log(res.data.info);
        }
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    this.clearCache();
    this.getArticles(0);//第一次加载数据
  },
  // 页面上拉触底事件（上拉加载更多）
  onReachBottom: function () {
    this.getArticles(page);//后台获取新数据并追加渲染
  },
  // 清缓存
  clearCache: function () {
    page = 1;//分页标识归零
    this.setData({
      articles: [] //文章列表数组清空
    });
  },
  /**************** 界面点击 *****************/
  // 文章点击跳转详情页
  onArticle: function () {
    // 业务逻辑
  },

  /**************** 网络请求 *****************/
  /**
   * 获取文章列表
   * @param {int} pg  分页标识 默认0
   */
  getArticles: function (pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    var apiUrl = 'https://zsj.itdos.com/v1/wx/getwxarticles';//文章列表接口地址
    var postData = {
      page: pg,//分页标识
      app_version: 1.2,//当前版本，后台根据版本不同给出不同的数据格式
    }
    wx.request({
      url: apiUrl,
      data: postData,
      method: 'GET',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.info == "SUCCESS") {//成功
          var tmpArr = that.data.articles;
          // 这一步实现了上拉加载更多
          tmpArr.push.apply(tmpArr, res.data.articles);
          that.setData({
            articles: tmpArr
          })
          // console.log(tmpArr);
          page++;
        } else {//失败
          console.log(res.data.info);
        }
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },

  // tab切换事件
  changeMenu: function (e) {
    this.setData({
      actIndex: e.currentTarget.id
    })
    if (this.data.actIndex == 'first') {
      var arr = []
      for (var i = 0; i < this.data.articles.length; i++) {
        // console.log(this.data.articles[i].leassonType)
        arr.push({
          imgUrl: this.data.articles[i].imgUrl,
        })
      }
      this.setData({
        // imgUrls: this.data.arr,
        articles: this.data.articles
      })
    } else if (this.data.actIndex == 'second') {
      wx.navigateTo({
        url: '../addtopic/addtopic'
      })

    }
  },

  //详情页面
  seeDetail: function (e) {
    // console.log(e)
    this.setData({
      leassonId: e.currentTarget.dataset.id
    })
    wx.navigateTo({
      url: '../detail/detail?id=' + this.data.leassonId
    })
  },

  //用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '珠三角设代',
      path: 'pages/index/index'
    }
  }
})