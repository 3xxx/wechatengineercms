// pages/searchdraw.js
var app = getApp();
var config = require('../../../config.js');
var imgUrls1 = []
var page = 1; //分页标识，第几次下拉，用户传给后台获取新的下拉数据

var searchpage = 1; // 当前页数-搜索页
var searchTitle = ""; // 搜索关键字
var msgListKey = ""; // 文章列表本地缓存key

Page({
  /**
   * 页面的初始数据
   */
  data: {
    current: [],

    // articles: [], //文章列表数组
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    toView: 'red',
    scrollTop: 100,
    author: '珠三角设代',
    // leassonList: [],//文章列表
    actIndex: 'draw', //这个为何无法赋值给页面呢？
    // apiUrl: config.url + '/wx/searchwxdrawings',
    apiUrl: config.url + '/wx/searchwxproducts',
    leassonId: '',

    msgList: [], //搜索结果列表
    searchLogList: [], // 存储搜索历史记录信息
    hidden: true, // 加载提示框是否显示
    scrollTop: 0, // 居顶部高度
    inputShowed: false, // 搜索输入框是否显示
    inputVal: "", // 搜索的内容
    searchLogShowed: false, // 是否显示搜索历史记录
    articleFocus: false, //是否是文章页
    drawFocus: true, //是否设计页
    standardFocus: false, //是否规范页
    otherFocus: false, //是否其他页
    searchshow: false, //页面是显示搜索（图纸、规范、其他）还是显示文章列表-首页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      id: options.id
    })

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
    if (app.globalData.projectConfig) {
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
    }
    // searchpage = 1; //分页标识归零
    // searchTitle="";
    this.clearCache();
    this.loadMsgData(1)
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
    this.loadMsgData(1)
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'packageA/pages/searchdraw/searchdraw'
    }
  },

  // 页面上拉触底事件（上拉加载更多）
  onReachBottom: function () {
    // if (!this.data.searchshow) {
      // console.log(searchpage);
      // if ("" != searchTitle) {
        this.loadMsgData(searchpage)
      // }
    // }
  },
  
  // 清缓存
  clearCache: function () {
    // 这里也要分清是文章列表页还是搜索页。
    searchpage = 1; //分页标识归零
    searchTitle="";
    // page = 1; //分页标识归零
    this.setData({
      imgUrls: [], //顶部轮播数组清空
      msgList: [], //文章列表数组清空
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
      app_version: 4, //当前版本，后台根据版本不同给出不同的数据格式
      keyword: searchTitle
    }

    wx.request({
      url: that.data.apiUrl +'?projectid='+that.data.id,
      data: postData,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.info == "SUCCESS") { //成功
          var tmpArr = that.data.msgList;
          // 这一步实现了上拉加载更多
          tmpArr.push.apply(tmpArr, res.data.searchers);
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
    if ("" != searchTitle) { //20190301修改此处 全局变量，不需要加that.data
      that.loadMsgData(1);
      // 搜索后将搜索记录缓存到本地
      // 循环保证不重复的才存进去——20190707
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
    // searchTitle = "";
    // searchpage = 1;
    that.clearCache();
    that.loadMsgData(1);
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

  //直接查看pdf文件
  downloadFile: function (e) {
    // console.log(e)
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
        const filePath = res.tempFilePath //返回的文件临时地址，用于后面打开本地预览所用
        wx.openDocument({
          filePath: filePath,
          fileType: e.currentTarget.dataset.type,
          success: function (res) {
            console.log('打开成功');
            wx.hideLoading()
          },
          fail: function (res) {
            // console.log(res);
            wx.showToast({
              title: res.data.info,
              icon: 'loading',
              duration: 1500
            })
          }
        })
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: res.data.info,
          icon: 'loading',
          duration: 1500
        })
      },
    })
  },

  //上传文件
  uploadPDF(e) {
    // console.log(e)
    var that = this
    that.setData({
      uploadurl: config.url + '/wx/addwxattachment?pid=' + that.data.id,
    });
    wx.chooseMessageFile({
      count: 10,
      type: 'file',
      success(res) {
        console.log(res)
        // tempFilePath可以作为img标签的src属性显示图片
        // let path = res.tempFilePaths[0].path
        const tempFilePaths = res.tempFiles
        // that.uploadFile(tempFilePaths)
        if (tempFilePaths.length > 0) {
          wx.showLoading({
            title: '上传中...',
          })
          //循环比较
          for (var i = 0; i < tempFilePaths.length; i++) {
            var imgUrl = tempFilePaths[i].path;
            var filename = tempFilePaths[i].name;
            var sessionId = wx.getStorageSync('sessionId')
            console.log(that.data.uploadurl)
            console.log(imgUrl)
            //发起网络请求
            wx.uploadFile({
              //上传图片的网路请求地址
              url: that.data.uploadurl + '&hotqinsessionid=' + sessionId,
              //选择
              filePath: imgUrl,
              name: 'file',
              formData: {
                'filename': filename
              },
              success: function (res) {
                wx.hideLoading();
                if (res.data.info != "err") {
                  wx.showToast({
                    title: "上传成功",
                    icon: "none",
                    duration: 1500
                  })
                  // 加跳转
                  // wx.navigateBack({
                  //   delta: 1,
                  //   success: function (e) {
                  //     var page = getCurrentPages().pop();
                  //     if (page == undefined || page == null) return;
                  //     page.onLoad();
                  that.onPullDownRefresh()
                  //   }
                  // })
                } else {
                  wx.showToast({
                    title: "上传失败",
                    icon: "none",
                    duration: 1500
                  })
                }
              },
              fail: function (res) {
                wx.hideLoading();
                wx.showToast({
                  title: "文件上传失败",
                  icon: "none"
                })
              }
            });
            // var imgname = tempFilePaths[i].split("")[1].substring(tempFilePaths[i].split("")[1].length - 20, tempFilePaths[i].split("_")[1].length);
            // var newupfilelist = that.data.allpath.concat(tempFilePaths[i]) + ', ';
            // var newfilename = that.data.allfilename.concat(imgname) + ', ' + '\n';
            // that.setData({
            //   allpath: newupfilelist, //将文件的路径保存在页面的变量上,方便 wx.uploadFile调用
            //   allfilename: newfilename //渲染到wxml方便用户知道自己选择了什么文件
            // })
          }
        }
      }
    })
  },

  //详情页面
  seeDetail: function (e) {
    // console.log(e)
    this.setData({
      leassonId: e.currentTarget.dataset.id
    })
    wx.navigateTo({
      url: '../../../pages/detail/detail?id=' + this.data.leassonId + '&articleprojid=' + this.data.id
    })
  },

  //发布文章
  addArticle: function (e) {
    // console.log(e)
    wx.navigateTo({
      url: '../addtopic/addtopic?articleprojid=' + this.data.id
    })
  },

})