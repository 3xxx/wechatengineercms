//获取应用实例
//var util = require('../../utils/util.js');
var app = getApp();
var config = require('../../config.js');
var imgUrls1 = []
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据

var searchpage = 1; // 当前页数-搜索页
var searchTitle = ""; // 搜索关键字
var msgListKey = ""; // 文章列表本地缓存key

Page({
  data: {
    current: [],//手风琴默认打开的部分

    articles: [], //文章列表数组
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    toView: 'red',
    scrollTop: 100,
    author: '珠三角设代',
    // leassonList: [],//文章列表
    actIndex: 'article',
    apiUrl: config.url + "/wx/getwxarticles",
    leassonId: '',

    msgList: [], //搜索结果列表
    searchLogList: [], // 存储搜索历史记录信息
    hidden: true, // 加载提示框是否显示
    scrollTop: 0, // 居顶部高度
    inputShowed: false, // 搜索输入框是否显示
    inputVal: "", // 搜索的内容
    searchLogShowed: false, // 是否显示搜索历史记录
    articleFocus: false, //是否是文章页
    // searchFocus: true, //是否搜索框页
    standardFocus: true, //是否规范页
    otherFocus: true, //是否其他页
    searchshow: true, //页面是显示搜索（图纸、规范、其他）还是显示文章列表-首页
    searchdrawshow: true,//页面显示顺德分部-南沙分部……
  },
  // 页面加载
  onLoad: function() {
    this.key = String(Math.floor(Math.random() * 3))

    var that = this;
    that.clearCache(); //清本页缓存
    //顶部轮播图片
    // that.carousel();
    that.getArticles(1); //第一次加载数据:绘画
  },

  // vant打开手风琴
  onChange(event) {
    // console.log(event.detail)
    this.setData({
      activeNames: event.detail
    });
  },

  // onChange(e) {//打开手风琴
  // console.log(e)
  // if (e.detail.key.indexOf(this.key) !== -1) {
  //   return wx.showModal({
  //     title: 'No switching is allowed',
  //     showCancel: !1,
  //   })
  // }
  // this.setData({
  //   current: e.detail.key,
  // })
  // },

  // 下拉刷新
  onPullDownRefresh: function() {
    if (!this.data.articleFocus) {
      this.clearCache();
      this.getArticles(1); //第一次加载数据
      wx.stopPullDownRefresh();
    }
    // if (!this.data.searchFocus) {
    //   //清理缓存的作用
    //   searchpage = 1;
    //   this.setData({
    //     msgList: [],
    //     scrollTop: 0
    //   });
    //   this.loadMsgData(1)
    // }
  },

  // 页面上拉触底事件（上拉加载更多）
  onReachBottom: function() {
    if (!this.data.articleFocus) {
      this.getArticles(page); //后台获取新数据并追加渲染
    }
    if (!this.data.searchshow) {
      // console.log(searchpage);
      if ("" != searchTitle) {
        this.loadMsgData(searchpage)
      }
    }
  },
  // 清缓存
  clearCache: function() {

    // 这里也要分清是文章列表页还是搜索页。

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
   * post 请求加载文章列表数据 
   * "page" ：页数
   * "pageSize" ：每页数量
   * "keyword" ：以文章标题模糊查询 ，格式为 "search_LIKE_实体类属性"
   */
  loadMsgData: function(pg) {
    pg = pg ? pg : 1;
    var that = this;
    // console.log(that)
    msgListKey = "msgList" + pg;
    // 显示加载的icon
    wx.showLoading({
      title: '加载中...',
    })
    // that.setData({
    //   hidden: false
    // });
    // 获取上一页数据
    var allMsg = that.data.msgList;
    var postData = {
      searchpage: pg, //分页标识
      app_version: 1, //当前版本plus，后台根据版本不同给出不同的数据格式
      keyword: searchTitle
    }
    // var sessionId = wx.getStorageSync('sessionId')
    // console.log(sessionId)
    wx.request({
      url: that.data.apiUrl,
      data: postData,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.data.info == "SUCCESS") { //成功
          var tmpArr = that.data.msgList;
          // console.log(tmpArr);
          // 这一步实现了上拉加载更多
          tmpArr.push.apply(tmpArr, res.data.searchers);
          // 赋值并隐藏加载的icon
          // for (var i = 0; i < res.data.searchers.length; i++) {
          // var goods_id_list = { 'Link': ''};//定义一个接受对象
          // goods_id_list.Link = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%3E%3Crect%20fill%3D%22%234CAF50%22%20x%3D%220%22%20y%3D%220%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3C%2Frect%3E%3Ctext%20fill%3D%22%23FFF%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20font-size%3D%2216%22%20font-family%3D%22Verdana%2C%20Geneva%2C%20sans-serif%22%20alignment-baseline%3D%22middle%22%3E%E6%A0%87%3C%2Ftext%3E%3C%2Fsvg%3E';
          // tmpArr.push(goods_id_list);//添加数组信息
          //根据第一个字符，生成图片
          // tmpArr[i].Link = goods_id_list.Link//util.setImg('s')
          // }
          // console.log(tmpArr);
          that.setData({
            msgList: tmpArr,
            hidden: true
          });
          // 缓存列表页面
          wx.setStorageSync(msgListKey, allMsg);
          searchpage++;
          // console.log(that.data.msgList);
        } else { //失败
          if (res.data == '') {
            wx.showToast({
              title: '没有更多数据！',
              icon: 'success',
              duration: 2000
            })
          }
          console.log(res.data); //.info
        }
      },
      fail: function(e) {
        console.log(e);
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 获取文章列表
   * @param {int} pg  分页标识 默认0
   */
  getArticles: function(pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    var apiUrl = this.data.apiUrl
    var postData = {
      page: pg, //分页标识
      app_version: 1, //当前版本，后台根据版本不同给出不同的数据格式
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
          if (pg == 1) {
            var tmpimgUrls = that.data.imgUrls;
            for (var i = 0; i < res.data.articles.length && i < 5; i++) {
              tmpimgUrls.push(res.data.articles[i].imgUrl)
            }
            that.setData({
              imgUrls: tmpimgUrls, //提供数据给页面顶端轮播图片
              // articles: tmpArr,
            })
          }
          var tmpArr = that.data.articles;
          // 这一步实现了上拉加载更多
          tmpArr.push.apply(tmpArr, res.data.articles);
          that.setData({
            articles: tmpArr
          })
          // console.log(tmpArr);
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
  onClick(e) {
    // const radioo = this.data.actIndex
    // console.log(e.currentTarget.id)
    switch (e.currentTarget.id) {
      case "article":
        this.setData({
          articleFocus: false,
          drawingFocus: true,
          standardFocus: true,
          otherFocus: true,
          searchshow: true,
          searchdrawshow: true
        })
        break;
      case "drawing":
        //清理缓存的作用
        searchpage = 1;
        this.setData({
          msgList: [],
          scrollTop: 0,
          articleFocus: true,
          drawingFocus: false,
          standardFocus: true,
          otherFocus: true,
          searchshow: true,
          searchdrawshow: false,
          actIndex: 'drawing',
          apiUrl: config.url + '/wx/searchwxdrawings?projectid=25002' //搜索图纸列表接口地址
        })
        break;
      case "standard":
        //清理缓存的作用
        searchpage = 1;
        this.setData({
          msgList: [],
          scrollTop: 0,
          articleFocus: true,
          drawingFocus: true,
          standardFocus: false,
          otherFocus: true,
          searchshow: false,
          searchdrawshow: true,
          actIndex: 'standard',
          apiUrl: config.url + '/wx/searchwxstandards' //搜索规范列表接口地址
        })
        break;
      case "other":
        //清理缓存的作用
        searchpage = 1;
        this.setData({
          msgList: [],
          scrollTop: 0,
          articleFocus: true,
          drawingFocus: true,
          standardFocus: true,
          otherFocus: false,
          searchshow: true,
          searchdrawshow: false,
          actIndex: 'other',
          apiUrl: config.url + '/wx/searchwxdrawings?projectid=25004' //搜索其他文件列表接口地址（监理）
        })
        break;
      default:
        var url1 = "26175";
    }
    this.setData({
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

  //用户点击右上角分享
  onShareAppMessage: function() {
    return {
      title: '珠三角设代plus',
      path: 'pages/index/index'
    }
  },

  // 搜索框
  // 显示搜索输入框和搜索历史记录
  showInput: function() {
    var that = this;
    if ("" != wx.getStorageSync('searchLog')) {
      that.setData({
        inputShowed: true,
        searchLogShowed: true,
        searchLogList: wx.getStorageSync('searchLog')
      });
    } else {
      that.setData({
        inputShowed: true,
        searchLogShowed: true
      });
    }
  },
  // 显示搜索历史记录
  searchLogShowed: function() {
    var that = this;
    if ("" != wx.getStorageSync('searchLog')) {
      that.setData({
        searchLogShowed: true,
        searchLogList: wx.getStorageSync('searchLog')
      });
    } else {
      that.setData({
        searchLogShowed: true
      });
    }
  },
  // 点击 搜索 按钮后 隐藏搜索记录，并加载数据
  searchData: function() {
    var that = this;
    that.setData({
      msgList: [],
      scrollTop: 0,
      searchLogShowed: false
    });
    // pageNum = 1;
    if ("" != searchTitle) { //20190301修改此处
      that.loadMsgData(1);
      // 搜索后将搜索记录缓存到本地
      var searchLogData = that.data.searchLogList;
      searchLogData.push(searchTitle);
      wx.setStorageSync('searchLog', searchLogData);
    }else{
      wx.showToast({
        title: '缺少关键字！',
        icon: 'none',
        duration: 2000
      })
    }
  },
  // 点击叉叉icon 清除输入内容，同时清空关键字，并加载数据——没有关键字，就是加载所有数据。
  clearInput: function() {
    var that = this;
    that.setData({
      msgList: [],
      scrollTop: 0,
      inputVal: ""
    });
    searchTitle = "";
    searchpage = 1;
    // that.loadMsgData(1);
  },
  // 输入内容时 把当前内容赋值给 查询的关键字，并显示搜索记录
  inputTyping: function(e) {
    var that = this;
    // 如果不做这个if判断，会导致 searchLogList 的数据类型由 list 变为 字符串
    if ("" != wx.getStorageSync('searchLog')) {
      that.setData({
        inputVal: e.detail.value,
        searchLogList: wx.getStorageSync('searchLog')
      });
    } else {
      that.setData({
        inputVal: e.detail.value,
        searchLogShowed: true
      });
    }
    searchTitle = e.detail.value;
  },
  // 通过搜索记录查询数据
  searchDataByLog: function(e) {
    // 从view中获取值，在view标签中定义data-name(name自定义，比如view中是data-log="123" ; 那么e.target.dataset.log=123)
    searchTitle = e.target.dataset.log;
    var that = this;
    that.setData({
      msgList: [],
      scrollTop: 0,
      searchLogShowed: false,
      inputVal: searchTitle
    });
    // pageNum = 1;
    that.loadMsgData(1);
  },

  // 清除搜索记录
  clearSearchLog: function() {
    var that = this;
    that.setData({
      hidden: false
    });
    wx.removeStorageSync("searchLog");
    that.setData({
      scrollTop: 0,
      searchLogShowed: false,
      hidden: true,
      searchLogList: []
    });
  },

  // 定位数据
  scroll: function(event) {
    var that = this;
    that.setData({
      scrollTop: event.detail.scrollTop
    });
  },

  //直接查看pdf文件
  downloadFile: function(e) {
    // console.log(e)
    // 显示加载的icon
    wx.showLoading({
      title: '加载中...',
    })

    var that = this;
    if (!that.data.standardFocus) {
      that.setData({
        downloadurl: config.url + '/wx/wxstandardpdf/' + e.currentTarget.dataset.id,
      });
    } else {
      that.setData({
        downloadurl: config.url + '/wx/wxpdf/' + e.currentTarget.dataset.id,
      });
    };
    var sessionId = wx.getStorageSync('sessionId')
    //发起网络请求
    wx.downloadFile({
      url: that.data.downloadurl + '?hotqinsessionid=' + sessionId, //'https://zsj.itdos.com/v1/wx/wxpdf/' + e.currentTarget.dataset.id,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      // method: "POST",
      // data: {//download不支持data参数******!!!!!!!!
      // code: res.code,
      // hotqinsessionid: sessionId
      // },
      success: function (res) {
        wx.hideLoading()
        // console.log(res)
        const filePath = res.tempFilePath //返回的文件临时地址，用于后面打开本地预览所用
        wx.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: function (res) {
            console.log('打开成功');
          },
          fail: function (res) {
            // console.log(res);
            wx.showToast({
              title: res.data.info,
              // icon: 'loading',
              duration: 1500
            })
          }
        })
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.data.info,
          // icon: 'loading',
          duration: 1500
        })
      },
    })
  },

  //搜索图纸页面
  searchDraw: function (e) {
    // console.log(e)
    if (!this.data.drawingFocus && this.data.otherFocus) {
      this.setData({
        searchId: e.currentTarget.dataset.id
      })
    } else if (this.data.drawingFocus && !this.data.otherFocus){
      this.setData({
        searchId: e.currentTarget.dataset.id2
      })
    }
    wx.navigateTo({
      url: '../searchdraw/searchdraw?id=' + this.data.searchId
    })
  }

})