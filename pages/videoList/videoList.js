const app = getApp()
var config = require('../../config.js');
Page({
  /* 页面数据绑定 */
  data: {
    totalPage: 1, //总页数
    page: 1, // 当前页数
    videoList: [], // 展示的视频信息

    screenWidth: 350, // 视频显示宽度
    serverUrl: "", // 服务器路径地址
    coverurl:config.attachmenturl,//视频封面路径前缀
    faceUrl: "/images/noneface.png", // 默认头像
    coverPath: "/images/dsp3.jpg", // 默认视频封面
    searchContent: ""
  },

  /* 页面加载 */
  onLoad: function(params) {
    // console.log(params.search);
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    var searchContent = "";
    var isSaveRecord = "";
    if (params.search != null && params.search != '' && params.search != undefined){
      searchContent = params.search;
    }
    if (params.isSaveRecord != null && params.isSaveRecord != '' && params.isSaveRecord != undefined) {
      isSaveRecord = params.isSaveRecord;
    }

    me.setData({
      searchContent: searchContent
    });

    var page = me.data.page; // 获取当前的分页数
    me.getVideoData(page, isSaveRecord);
  },

  /* 下拉刷新：最新的视频 */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getVideoData(1, 0);
  },

  /* 上拉刷新 */
  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.page; //当前页数
    var totalPage = me.data.totalPage; //总页数页数
    // 判断是否为最后一页
    if (currentPage === totalPage) {
      wx.showToast({
        title: '已经没有视频啦...',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var page = currentPage + 1;
    me.getVideoData(page, 0);
    //console.log(me.data.videoList);
  },

  /* 视频展示 */
  showVideoInfo: function (e) {
    var me = this;
    var videoList = me.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);
    // console.log(videoInfo);
    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })
  },

  /* 获取视频信息:公用方法 */
  getVideoData: function(page, isSaveRecord) {
    var me = this;
    var serverUrl = config.url;
    var searchContent = me.data.searchContent;
    //console.log(searchContent);
    wx.showLoading({
      title: '正在加载视频...',
    });

    wx.request({
      // url: serverUrl + "/video/showAllVideos?page=" + page + "&isSaveRecord=" + isSaveRecord + "&searchText=" + searchContent,
      url: serverUrl + "/wx/getuservideo/26159?pageNo=" + page + "&isSaveRecord=" + isSaveRecord + "&searchText=" + searchContent,//170602
      method: "GET",
      success: function(res) {
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
          page: page,
          totalPage: res.data.total,
          serverUrl: serverUrl
        });
      }
    })
  }
})