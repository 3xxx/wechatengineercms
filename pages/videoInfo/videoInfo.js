const app = getApp()
var config = require('../../config.js');
import {
  getRandomColor
} from '../../utils/util'
Page({
  /* 页面数据绑定 */
  data: {
    objectFit: "fill", // 视频显示样式：cover,fill,contain
    videoId: "",
    src: "",
    serverUrl: app.serverUrl,
    faceUrl: "", // 默认头像
    videoInfo: {},
    userLikeVideo: false,

    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],
    placeholder: "说点什么..."
  },

  videoCtx: {},

  /* 页面加载 */
  onLoad: function (params) {
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);

    // 获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);
    // console.log(videoInfo);

    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var objectFit = "fill";
    if (width >= height) {
      objectFit = ""; // 若为横版视频，则不使用样式
    }

    me.setData({
      videoId: videoInfo.id,
      // src: app.serverUrl + videoInfo.videoPath,
      src: config.attachmenturl + videoInfo.url,
      videoInfo: videoInfo,
      // faceUrl: videoInfo.faceImage,
      objectFit: objectFit
    });

    //console.log(videoInfo);
    var serverUrl = app.serverUrl;
    // var user = app.getGlobalUserInfo();
    var loginUserId = "";
    // if (user != null && user != undefined && user != '') {
    //   loginUserId = user.id;
    // }
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: 'GET',
      success: function (res) {
        //console.log(res.data);
        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;
        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        });
      }
    })

    me.getCommentsList(1);
  },

  onShow: function () {
    var that = this;
    that.videoCtx.play();
  },

  onHide: function () {
    var that = this;
    that.videoCtx.pause();
  },

  /* 显示视频发布者的信息 */
  showPublisher: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
  },

  /* 上传视频快捷键 */
  upload: function () {
    var me = this;
    // var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    // var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;

    // if (user == null || user == undefined || user == '') {
    //   wx.navigateTo({
    //     url: '../login/login?redirectUrl=' + realUrl,
    //   })
    // } else {

    // wx.chooseVideo({
    //   sourceType: ['album'], //指定视频来源为相册
    //   success: function(res) {
    //     var tmpDuration = res.duration;
    //     var tmpHeight = res.height;
    //     var tmpWidth = res.width;
    //     var tmpVideoUrl = res.tempFilePath;
    //     var tmpCoverUrl = res.thumbTempFilePath;
    //     if (res.size > 10485760) {
    //       wx.showToast({
    //         title: "上传视频大小不能超过10M",
    //         icon: 'none',
    //         duration: 2000
    //       });
    //     } else if (tmpDuration < 3) {
    //       wx.showToast({
    //         title: "请上传大于3秒的视频",
    //         icon: 'none',
    //         duration: 2000
    //       });
    //     } else {
    //       // 跳转到选择背景音乐界面
    //       wx.navigateTo({
    //         url: '../chooseBgm/chooseBgm?tmpDuration=' + tmpDuration +
    //           "&tmpHeight=" + tmpHeight +
    //           "&tmpWidth=" + tmpWidth +
    //           "&tmpVideoUrl=" + tmpVideoUrl +
    //           "&tmpCoverUrl=" + tmpCoverUrl
    //       });
    //     }
    //   }
    // })

    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        // console.log(res)
        // console.log(res.tempFiles[0].size)
        var tmpDuration = res.tempFiles[0].duration;
        var tmpHeight = res.tempFiles[0].height;
        var tmpWidth = res.tempFiles[0].width;
        var tmpVideoUrl = res.tempFiles[0].tempFilePath;
        var tmpCoverUrl = res.tempFiles[0].thumbTempFilePath;
        if (res.size > 2621440) {//25M=25*1024k*1024b
          wx.showToast({
            title: "上传视频大小不能超过25M",
            icon: 'none',
            duration: 2000
          });
        } else if (tmpDuration < 3) {
          wx.showToast({
            title: "请上传大于3秒的视频",
            icon: 'none',
            duration: 2000
          });
        }else if (tmpDuration > 180) {
          wx.showToast({
            title: "请上传小于180秒的视频",
            icon: 'none',
            duration: 3000
          });
        } else {
          // 跳转到选择背景音乐界面
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?tmpDuration=' + tmpDuration +
              "&tmpHeight=" + tmpHeight +
              "&tmpWidth=" + tmpWidth +
              "&tmpVideoUrl=" + tmpVideoUrl +
              "&tmpCoverUrl=" + tmpCoverUrl
          });
        }
      }
    })
    // }
  },

  /* 回到首页 */
  showIndex: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  /* 跳转到搜索视频页面 */
  showSearch: function () {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  /* 跳转到我的主页 */
  showMine: function () {
    var user = app.getGlobalUserInfo();
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  /* 收藏或取消收藏视频 */
  likeVideoOrNot: function () {
    var me = this;
    var videoInfo = me.data.videoInfo;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      var userLikeVideo = me.data.userLikeVideo;
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      if (userLikeVideo) {
        url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      }

      wx.showLoading({
        title: '正在连接...',
      })

      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function (res) {
          wx.hideLoading();
          if (userLikeVideo) {
            wx.showToast({
              title: "取消收藏",
              icon: 'success',
              duration: 1500
            });
          } else {
            wx.showToast({
              title: "收藏成功",
              icon: 'success',
              duration: 1500
            });
          }
          me.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })
    }
  },

  /* 更多操作 */
  shareMe: function () {
    var me = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function (res) {
        //console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function (res) {
              wx.hideLoading();
              // 只要服务器有响应数据，就会把响应内容写入文件并进入success回调
              if (res.statusCode === 200) {
                //console.log(res.tempFilePath);
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (res) {
                    //console.log(res.errMsg)
                    wx.hideLoading();
                    wx.showToast({
                      title: '视频下载成功',
                    })
                  }
                })
              } else {
                wx.showToast({
                  title: '视频下载失败',
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;

          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../login/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '暂未开放',
            icon: 'none'
          })
        }
      }
    })
  },

  onShareAppMessage: function (res) {
    var me = this;
    var videoInfo = me.data.videoInfo;
    return {
      title: '短视频内容分析',
      path: "pages/videoInfo/videoInfo?videoInfo=" + JSON.stringify(videoInfo)
    }
  },

  /* 离开留言 */
  leaveComment: function () {
    this.setData({
      commentFocus: true
    });
  },

  /* 回复留言焦点 */
  replyFocus: function (e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },

  /* 保存留言 */
  saveComment: function (e) {
    var me = this;
    var content = e.detail.value.trim();
    // console.log(content);

    // 有效性验证
    if (content.length == 0) {
      wx.showToast({
        title: '留言不能为空哦~',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: me.data.videoInfo.id,
          comment: content
        },
        success: function (res) {
          //console.log(res.data)
          wx.hideLoading();

          me.setData({
            contentValue: "",
            commentsList: []
          });

          me.getCommentsList(1);
        }
      })
    }
  },

  /* 获取留言 */
  getCommentsList: function (page) {
    var me = this;
    var videoId = me.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + "&page=" + page + "&pageSize=5",
      method: "POST",
      success: function (res) {
        // console.log(res.data);
        var commentsList = res.data.data.rows;
        var newCommentsList = me.data.commentsList;
        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        });
      }
    })
  },

  /* 上拉刷新 */
  onReachBottom: function () {
    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage) { // 如果为尾页，则不再查询留言
      return;
    }
    var page = currentPage + 1;
    me.getCommentsList(page);
  },


  // onShareAppMessage() {
  //   return {
  //     title: 'video',
  //     path: 'page/component/pages/video/video'
  //   }
  // },

  // onReady() {
  //   this.videoContext = wx.createVideoContext('myVideo')
  // },

  // onHide() {

  // },

  inputValue: '',
  data: {
    src: '',
    danmuList: [{
      text: '第 1s 出现的弹幕',
      color: '#ff0000',
      time: 1
    }, {
      text: '第 3s 出现的弹幕',
      color: '#ff00ff',
      time: 3
    }],
  },

  bindInputBlur(e) {
    this.inputValue = e.detail.value
  },

  // bindButtonTap() {
  //   const that = this
  //   wx.chooseVideo({
  //     sourceType: ['album', 'camera'],
  //     maxDuration: 60,
  //     camera: ['front', 'back'],
  //     success(res) {
  //       that.setData({
  //         src: res.tempFilePath
  //       })
  //     }
  //   })
  // },

  bindVideoEnterPictureInPicture() {
    console.log('进入小窗模式')
  },

  bindVideoLeavePictureInPicture() {
    console.log('退出小窗模式')
  },

  bindPlayVideo() {
    // console.log('1')
    this.videoCtx.play()
  },
  bindSendDanmu() {
    this.videoCtx.sendDanmu({
      text: this.inputValue,
      color: getRandomColor()
    })
  },

  videoErrorCallback(e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  }

})