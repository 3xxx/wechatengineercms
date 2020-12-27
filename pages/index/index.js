//获取应用实例
//var util = require('../../utils/util.js');
var app = getApp();
var config = require('../../config.js');
// var imgUrls1 = []
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据

var searchpage = 1; // 当前页数-搜索页
var searchTitle = ""; // 搜索关键字
var msgListKey = ""; // 文章列表本地缓存key

Page({
  data: {
    projectid: '', //项目id
    articleprojid: '', //文章对应的projectid
    collapse: '', //资料页面树状目录
    current: [], //手风琴默认打开的部分
    activeNames: ['1'],
    value: '',
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
    // apiUrl: config.url + "/wx/getwxarticles",
    apiUrl: '',
    leassonId: '',

    msgList: [], //搜索结果列表
    searchLogList: [], // 存储搜索历史记录信息
    hidden: true, // 加载提示框是否显示
    scrollTop: 0, // 居顶部高度
    inputShowed: false, // 搜索输入框是否显示
    inputVal: "", // 搜索的内容
    searchLogShowed: false, // 是否显示搜索历史记录
    articleFocus: true, //是否是文章页
    drawingFocus: false, //是否图纸页
    videoFocus: false, //是否是视频页
    // searchFocus: true, //是否搜索框页

    standardFocus: false, //是否规范页
    otherFocus: false, //是否其他页
    searchshow: false, //页面是显示搜索（图纸、规范、其他）还是显示文章列表-首页
    searchdrawshow: true, //页面显示顺德分部-南沙分部……

    //视频
    totalPage: 1, //总页数
    videopage: 1, // 当前页数
    videoList: [], // 展示的视频信息

    screenWidth: 350, // 视频显示宽度
    // serverUrl: "", // 服务器路径地址
    coverUrl: config.attachmenturl, //视频封面（附件）路径前缀
    faceUrl: "/images/noneface.png", // 默认头像
    coverPath: "/images/dsp3.jpg", // 默认视频封面
    searchContent: ""
  },
  // 页面加载
  onLoad: function (params) {
    var that = this
    that.key = String(Math.floor(Math.random() * 3))
    if (params.projectid) {
      that.setData({
        projectid: params.projectid
      })
    }

    if (that.data.projectid != '') {
      that.getprojectconfig(that.data.projectid)
      that.setData({
        projectid:''
      })
    } else if (app.globalData.projectConfig) {
      that.setData({
        apiUrl: config.url + "/wx/getwxarticless/" + app.globalData.projectConfig.articleprojid,
        collapse: app.globalData.projectConfig.collapse,
        articleprojid: app.globalData.projectConfig.articleprojid
      })
      that.clearCache();
      that.getArticles(1);
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '未选定项目，是否前去选择？',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateTo({
              url: '/pages/projectlist/projectlist',
              events: {
                // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                acceptDataFromOpenedPage: function (data) {
                  console.log(data)
                },
                someEvent: function (data) {
                  console.log(data)
                }
              },
              success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromOpenerPage', {
                  data: 'test'
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
            wx.showToast({
              title: '未选择项目！',
              icon: 'none',
              duration: 2000
            });
          }
        }
      })
    }

    // 视频console.log(params.search);
    // var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    that.setData({
      screenWidth: screenWidth,
    });

    var searchContent = "";
    var isSaveRecord = "";
    if (params.search != null && params.search != '' && params.search != undefined) {
      searchContent = params.search;
    }
    if (params.isSaveRecord != null && params.isSaveRecord != '' && params.isSaveRecord != undefined) {
      isSaveRecord = params.isSaveRecord;
    }

    that.setData({
      searchContent: searchContent
    });
    // var page = that.data.page; // 获取当前的分页数
    that.getVideoData(1, isSaveRecord);
  },

  getprojectconfig(projectid2) {
    // console.log(projectid2)
    var that = this;
    var apiUrl = config.url + '/admin/getwxprojectconfig';
    var postData = {
      projectid: projectid2,
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
        console.log("resdata:" + res.data)
        wx.setStorageSync({
          key: 'projectConfig',
          data: res.data
        })
        app.globalData.projectConfig = res.data
        // console.log("zhe:"+app.globalData.projectConfig)
        // that.setData({
        //   apiUrl: config.url + "/wx/getwxarticless/" + app.globalData.projectConfig.articleprojid,
        //   collapse: app.globalData.projectConfig.collapse,
          // projectid: app.globalData.projectConfig.projectid
        // })
        // that.clearCache();
        // that.getArticles(1);
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '获取项目配置数据失败',
          icon: 'error',
          duration: 2000
        });
      },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var that=this
    // if (that.data.projectid != '') {
    //   that.getprojectconfig(that.data.projectid)
    //   that.setData({
    //     projectid:''
    //   })
    // } else if (app.globalData.projectConfig) {
    //   this.setData({
    //     apiUrl: config.url + "/wx/getwxarticless/" + app.globalData.projectConfig.articleprojid,
    //     collapse: app.globalData.projectConfig.collapse,
    //     articleprojid: app.globalData.projectConfig.articleprojid
    //   })
    //   this.clearCache();
    //   this.getArticles(1);
    //   wx.setNavigationBarTitle({
    //     title: app.globalData.projectConfig.projecttitle,
    //   });
    // } else {
    //   wx.showModal({
    //     title: '提示',
    //     content: '未选定项目，是否前去选择？',
    //     success(res) {
    //       if (res.confirm) {
    //         console.log('用户点击确定')
    //         wx.navigateTo({
    //           url: '/pages/projectlist/projectlist',
    //           events: {
    //             // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
    //             acceptDataFromOpenedPage: function (data) {
    //               console.log(data)
    //             },
    //             someEvent: function (data) {
    //               console.log(data)
    //             }
    //           },
    //           success: function (res) {
    //             // 通过eventChannel向被打开页面传送数据
    //             res.eventChannel.emit('acceptDataFromOpenerPage', {
    //               data: 'test'
    //             })
    //           }
    //         })
    //       } else if (res.cancel) {
    //         console.log('用户点击取消')
    //         wx.showToast({
    //           title: '未选择项目！',
    //           icon: 'none',
    //           duration: 2000
    //         });
    //       }
    //     }
    //   })
    // }


    // var that = this;
    // this.clearCache(); //清本页缓存
    //顶部轮播图片
    // that.carousel();
    // this.getArticles(1); //第一次加载数据:绘画
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
  onPullDownRefresh: function () {
    if (this.data.articleFocus) {
      this.clearCache();
      this.getArticles(1); //第一次加载数据
    } else if (this.data.videoFocus) {
      this.setData({
        videoList:[]//清空视频列表数组
      });
      wx.showNavigationBarLoading();
      this.getVideoData(1, 0);
    }
    wx.stopPullDownRefresh();
  },

  // 页面上拉触底事件（上拉加载更多）
  onReachBottom: function () {
    if (this.data.articleFocus) {
      this.getArticles(page); //后台获取新数据并追加渲染
    } else if (this.data.videoFocus) {
      // var me = this;
      var currentPage = this.data.videopage; //当前页数
      console.log(currentPage)
      var totalPage = this.data.totalPage; //总页数页数
      // 判断是否为最后一页
      // 这个totalpage要计算出来！！！！
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      var videopage1 = currentPage + 1;
      console.log(videopage1)
      this.getVideoData(videopage1, 0);
      //console.log(me.data.videoList);
    }
    // console.log(this.data.searchshow)
    if (this.data.searchshow) {
      // 搜索页的加载
      // if ("" != searchTitle) {
      this.loadMsgData(searchpage)
      // }
    }
  },
  // 清缓存
  clearCache: function () {
    // 这里也要分清是文章列表页还是搜索页。
    page = 1; //分页标识归零
    this.setData({
      imgUrls: [], //顶部轮播数组清空
      articles: [], //文章列表数组清空
      msgList: []
    });
  },
  /**************** 界面点击 *****************/
  // 文章点击跳转详情页
  onArticle: function () {
    // 业务逻辑
  },

  /**************** 网络请求 *****************/
  /**
   * post 请求加载文章列表数据 
   * "page" ：页数
   * "pageSize" ：每页数量
   * "keyword" ：以文章标题模糊查询 ，格式为 "search_LIKE_实体类属性"
   */
  loadMsgData: function (pg) {
    pg = pg ? pg : 1;
    var that = this;
    msgListKey = "msgList" + pg;
    // 显示加载的icon
    wx.showLoading({
      title: '加载中...',
    })
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
      success: function (res) {
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
      fail: function (e) {
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
  getArticles: function (pg) {
    //设置默认值
    pg = pg ? pg : 1;
    var that = this;
    var apiUrl = that.data.apiUrl; //config.url + '/wx/getwxarticles'; //文章列表接口地址
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
      success: function (res) {
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
          page++;
        } else { //失败
          console.log(res.data.info);
        }
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },

  tap: function (e) {
    for (var i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1]
        })
        break
      }
    }
  },

  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
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

  // van tab切换事件
  onClick(e) {
    switch (e.detail.title) {
      case "新闻":
        this.setData({
          articleFocus: true,
          drawingFocus: false,
          standardFocus: false,
          otherFocus: false,
          searchshow: false,
          // searchdrawshow: false
        })
        break;
      case "视频":
        this.setData({
          articleFocus: false,
          videoFocus: true,
          drawingFocus: false,
          standardFocus: false,
          otherFocus: false,
          searchshow: false,
          // searchdrawshow: false
        })
        break;
      case "图纸":
        searchpage = 1;
        this.setData({
          msgList: [],
          scrollTop: 0,
          articleFocus: false,
          videoFocus: false,
          drawingFocus: true,
          standardFocus: false,
          otherFocus: false,
          searchshow: true,
          // searchdrawshow: true,
          // actIndex: 'drawing',
          // apiUrl: config.url + '/wx/searchwxdrawings?projectid=25002' //搜索图纸列表接口地址
        })
        break;
      case "标准":
        //清理缓存的作用
        searchpage = 1;
        this.setData({
          msgList: [],
          scrollTop: 0,
          articleFocus: false,
          videoFocus: false,
          drawingFocus: false,
          standardFocus: true,
          otherFocus: false,
          searchshow: true,
          // searchdrawshow: false,
          // actIndex: 'standard',
          apiUrl: config.url + '/wx/searchwxstandards' //搜索规范列表接口地址
        })
        break;
      case "其他":
        searchpage = 1;
        this.setData({
          msgList: [],
          scrollTop: 0,
          articleFocus: false,
          videoFocus: false,
          drawingFocus: false,
          standardFocus: false,
          otherFocus: true,
          searchshow: true,
          // searchdrawshow: false,
          // actIndex: 'other',
          // apiUrl: config.url + '/wx/searchwxdrawings?projectid=25004' //搜索其他文件列表接口地址（监理）
        })
        break;
    }
    // console.log(e.detail)
    // wx.showToast({
    //   title: `点击标签 ${e.detail.title}`,
    //   icon: 'none'
    // });
  },

  //详情页面
  seeDetail: function (e) {
    // console.log(e)
    this.setData({
      leassonId: e.currentTarget.dataset.id
    })
    wx.navigateTo({
      url: '../detail/detail?id=' + this.data.leassonId + '&articleprojid=' + this.data.articleprojid
    })
  },

  //用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'pages/index/index?projectid=' + app.globalData.projectConfig.projectid
    }
  },

  // 搜索框
  // 显示搜索输入框和搜索历史记录
  showInput: function () {
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
  searchLogShowed: function () {
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
  searchData: function () {
    var that = this;
    that.setData({
      msgList: [],
      scrollTop: 0,
      searchLogShowed: false
    });
    // pageNum = 1;
    if ("" != searchTitle) { //20190301修改此处
      searchpage = 1;
      that.setData({
        msgList: [],
        apiUrl: config.url + '/wx/searchwxstandards' //搜索规范列表接口地址
      })
      that.loadMsgData(1);
      // 搜索后将搜索记录缓存到本地
      var searchLogData = that.data.searchLogList;
      searchLogData.push(searchTitle);
      wx.setStorageSync('searchLog', searchLogData);
    } else {
      wx.showToast({
        title: '缺少关键字！',
        icon: 'none',
        duration: 2000
      })
    }
  },
  // 点击叉叉icon 清除输入内容，同时清空关键字，并加载数据——没有关键字，就是加载所有数据。
  clearInput: function () {
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
  inputTyping: function (e) {
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
  searchDataByLog: function (e) {
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
  clearSearchLog: function () {
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
  scroll: function (event) {
    var that = this;
    that.setData({
      scrollTop: event.detail.scrollTop
    });
  },

  //直接查看pdf文件
  downloadFile: function (e) {
    // 显示加载的icon
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    if (that.data.standardFocus) {
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
        // console.log(res)
        wx.hideLoading();
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
    } else if (this.data.drawingFocus && !this.data.otherFocus) {
      this.setData({
        searchId: e.currentTarget.dataset.id2
      })
    }
    wx.navigateTo({
      url: '../searchdraw/searchdraw?id=' + this.data.searchId
    })
  },

  /* 视频展示 */
  showVideoInfo: function (e) {
    var me = this;
    var videoList = me.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);
    console.log(videoInfo);

    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })
  },

  /* 获取视频信息:公用方法 */
  getVideoData: function (pageparameter, isSaveRecord) {
    var me = this;
    // var serverUrl = app.serverUrl;
    var serverUrl = config.url;
    var searchContent = me.data.searchContent;
    //console.log(searchContent);
    wx.showLoading({
      title: '正在加载视频...',
    });

    wx.request({
      // url: serverUrl + "/video/showAllVideos?page=" + page + "&isSaveRecord=" + isSaveRecord + "&searchText=" + searchContent,
      url: serverUrl + "/wx/getuservideo/26159?pageNo=" + pageparameter + "&isSaveRecord=" + isSaveRecord + "&searchText=" + searchContent, //170602
      method: "GET",
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        // console.log(res.data);
        // 判断当前页是否是第一页，若为第一个则清空videoList
        if (page === 1) {
          me.setData({
            videoList: []
          });
        }

        var videoList = res.data.rows; // 新的视频信息
        var newVideoList = me.data.videoList; // 旧的视频信息
        me.setData({
          videoList: newVideoList.concat(videoList), //将新旧的视频信息拼接在一起
          videopage1: pageparameter,
          totalPage: res.data.total,
          serverUrl: serverUrl
        });
      }
    })
  }

})