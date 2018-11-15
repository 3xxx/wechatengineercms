// detail js
//引入本地json数据，这里引入的就是第一步定义的json数据
const app = getApp()
var util = require('../../utils/util.js');
let wxparse = require("../../wxParse/wxParse.js");
Page({
  data: {
    dkheight: 300,
    dkcontent: "",
    leassonTilte: '',
    time: '',
    id: '',
    liked: true,
    inputVal: '',
    hidden: true,
    //画布
    canvasHidden: true, //设置画板的显示与隐藏，画板不隐藏会影响页面正常显示
    shareImgPath: '', //用于储存canvas生成的图片

    page: 2,
    page_size: 10,
    isShowLoadmore: false,
    isShowNoDatasTips: false,
    endloading: false,
    focus: false,

    open: true,
    
    shop: [],
    shop_item: {},
    shop_num: {},
    //  发表评论
    releaseFocus: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    this.setData({
      id: options.id
    })
    // 获得高度
    let winPage = this;
    wx.getSystemInfo({
      success: function(res) {
        let winHeight = res.windowHeight;
        // console.log(winHeight);
        winPage.setData({
          dkheight: winHeight - winHeight * 0.05 - 80
        })
      }
    });
    var that = this;
    //获取用户设备信息，屏幕宽度
    wx.getSystemInfo({
      success: res => {
        that.setData({
          screenWidth: res.screenWidth
        })
        // console.log(that.data.screenWidth)
      }
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          var getData = wx.request({
            url: 'https://zsj.itdos.com/v1/wx/getwxarticle/' + options.id,
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              code: res.code,
              app_version: 1.1,//阅览版用的
              // x: '',
              // y: ''
              // id: options.id
            },
            // header: {
            //   'content-type': 'application/json' // 默认值
            // },
            success: function(res) {
              // console.log(res.data)
              that.setData({
                dkcontent: res.data.html,
                leassonTilte: res.data.title,
                time: res.data.time,
                author: res.data.author,
                views: res.data.Views,
                likeNum: res.data.likeNum,
                liked: res.data.liked,
                comment: res.data.comment,
                commentNum: res.data.commentNum,
              })
              wxparse.wxParse('dkcontent', 'html', that.data.dkcontent, that, 5)

              // 生成画布
              let promise1 = new Promise(function(resolve, reject) {
                wx.getImageInfo({
                  src: res.data.imgUrl,
                  success: function(res1) {
                    // console.log(res1)
                    resolve(res1);
                  }
                })
              });
              let promise2 = new Promise(function(resolve, reject) {
                wx.getImageInfo({
                  src: '../../images/qrcode.jpg',
                  success: function(res1) {
                    // console.log(res1)
                    resolve(res1);
                  }
                })
              });
              Promise.all([
                promise1, promise2
              ]).then(res1 => {
                // console.log(res1)
                const ctx = wx.createCanvasContext('shareImg')
                //主要就是计算好各个图文的位置
                // var unit = that.data.screenWidth / 375
                ctx.setFillStyle('white');
                ctx.fillRect(0, 0, 600, 880);
                ctx.drawImage(res1[0].path, 50, 200, 400, 400)
                ctx.drawImage('../../' + res1[1].path, 350, 610, 160, 160)
                // ctx.drawImage(imgurl, 50, 200, 400, 400)
                // ctx.drawImage(bgImgPath, 350, 610, 160, 160)

                ctx.setFontSize(28)
                ctx.setFillStyle('#6F6F6F')
                ctx.fillText('来自小程序 - 珠三角设代', 30, 660)

                ctx.setFontSize(30)
                ctx.setFillStyle('#111111')
                ctx.fillText('快来围观和发布日志', 30, 710)

                ctx.setFontSize(22)
                ctx.fillText('长按扫码进入小程序查看', 30, 750)

                ctx.setFillStyle('#6F6F6F')
                ctx.fillText('Author:' + res.data.author, 545 / 2, 100)
                ctx.setTextAlign('center')
                ctx.setFontSize(24)
                ctx.setFillStyle('#111111')
                ctx.fillText(res.data.title, 545 / 2, 50)
                ctx.fillText(res.data.word, 545 / 2, 160)
                ctx.fillText('……', 60, 190)
                ctx.stroke()
                ctx.draw()
              })
            }
          })

        }
      }
    })
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              // console.log(res.userInfo)
            }
          })
        }
      }
    })
  },



  bindGetUserInfo(e) {
    console.log(e.detail.userInfo)
  },
  onShareAppMessage: function() {
    // console.log(this.data.id)
    return {
      title: '珠三角设代',
      path: 'pages/detail/detail?id=' + this.data.id
    }
  },

  //点赞切换
  onUpTap: function(event) {
    var that = this;
    var liked = that.data.liked;
    var likeNum = that.data.likeNum; //当前赞数
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: "https://zsj.itdos.com/v1/wx/addwxlike/" + that.data.id,
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              code: res.code,
              liked: liked,
              app_version: 1.2,
            },
            success: function(res) {
              if (!liked) {
                // views: ++this.data.views,
                likeNum++;
                liked = true;
              } else {
                --likeNum;
                liked = false;
              }
              // break;
              that.setData({
                liked: liked,
                likeNum: likeNum,
              })
              // console.log(that.data.views)
              wx.showToast({
                title: that.data.liked ? "点赞成功" : "点赞取消",
                duration: 1000,
                icon: "sucess",
                make: true
              })
            }
          })
        }
      },
    })
  },

  //收藏切换
  onCollectionTap: function(event) {
    //dbpost对象已在onLoad函数中被保存到了this变量中，无需再次实例化
    var newData = this.dbPost.collect();
    //重新绑定数据，注意，不要将整个newData全部作为setData的参数，应当有选择的更新部分数据
    this.setData({
      'post.collectionSataus': newData.collectionStatus,
      'post.collectionNum': newData.collectionNum
    })
    //交互反馈
    wx.showToast({
      title: newData.collectionStatus ? "收藏成功" : "收藏取消",
      duration: 1000,
      icon: "sucess",
      make: true
    })
  },

  // 评论分页加载
  reviewpage: function(e) {
    var that = this;
    var id = this.data.id;
    console.log('qqqqqq')
    console.log(id)
    console.log('-=-=-=')
    var page = this.data.page;
    wx.request({
      url: link.reviewpage,
      method: 'POST',
      data: {
        id: id,
        page: that.data.page,
        page_size: that.data.page_size
      },
      header: {
        'appid': 'fZ4wruPFDWZTEwD1gUhbkez0CUmeWGJx',
        'mbcore-access-token': wx.getStorageSync('access_token'),
        'mbcore-auth-token': wx.getStorageSync('auth_token')
      },
      success: function(res) {
        console.log(res)
        console.log('→')
        if (res.data.code == 1) {
          var datas = res.data.result.comments;
          if (res.data.result.more_data == 0) {
            that.setData({
              isShowLoadmore: true,
              isShowNoDatasTips: true,
              endloading: true,
            })

          } else {
            console.log('走到这了')
            that.setData({
              release: that.data.release.concat(datas)
            })
            if (datas.length < that.data.page_size) {
              console.log('已经加载完了')
              that.setData({
                isShowLoadmore: false,
                isShowNoDatasTips: false,
              })
            }
          }
          that.setData({
            page: page + 1
          })
        } else {
          console.log('code等于0啊！')
          that.setData({
            isShowLoadmore: false,
            isShowNoDatasTips: false,
          })
        }
      }
    })
  },

  // 发表评论显示/隐藏
  bindrelease: function(e) {
    // console.log(e)
    this.setData({
      releaseFocus: false,
      releaseValue: '', //清空输入框
      focus: true,
    })
    // console.log(this.data.releaseFocus)
  },

  catchhide: function() {
    this.setData({
      releaseFocus: true
    })
    // console.log(this.data.releaseFocus)
  },
  //删除评论
  binddelete1: function(e) {
    var that = this;
    if (wx.getStorageSync('auth_token')) {
      // 判断用户是否登录
      wx.showModal({
        title: '提示',
        content: '确定撤销吗',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.request({
              url: link.binddelete,
              method: 'POST',
              header: {
                'appid': 'fZ4wruPFDWZTEwD1gUhbkez0CUmeWGJx',
                'mbcore-access-token': wx.getStorageSync('access_token'),
                'mbcore-auth-token': wx.getStorageSync('auth_token')
              },
              data: {
                id: e.currentTarget.dataset.id
              },
              success: function(res) {
                console.log(res)
                var dataid = e.currentTarget.dataset.id;
                var index = e.currentTarget.dataset.index
                // 评论总数 
                var conment_length = res.data.result
                var release = that.data.release;
                release.splice(index, 1)
                that.setData({
                  release: release,
                  releaselength: conment_length
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      //去注册登录
      this.userInfoReadyCallback()
    }
  },

  // 登录后才可以发表评论
  // 点击发表评论
  formSubmit1: function(e) {
    console.log(wx.getStorageSync('auth_token'));
    var that = this;
    var id = this.data.id;
    var textareaValue = e.detail.value.input
    console.log(textareaValue)
    if (wx.getStorageSync('auth_token')) {
      if (e.detail.value.input == '') {
        wx.showToast({
          title: '请输入内容',
          icon: 'none'
        })
      } else {
        wx.request({
          url: link.formSubmit,
          data: {
            content: textareaValue,
            msgid: id,
          },
          method: 'POST',
          header: {
            'appid': 'fZ4wruPFDWZTEwD1gUhbkez0CUmeWGJx',
            'mbcore-access-token': wx.getStorageSync('access_token'),
            'mbcore-auth-token': wx.getStorageSync('auth_token')
          },
          success: function(res) {
            console.log(res)
            console.log('-----')
            console.log(res.data.code)
            if (res.data.code == 0) {
              wx.showToast({
                title: '请输入内容',
                icon: 'none'
              })
            } else {
              //var that = this;
              var textarea_item = {};
              var textareaValue = res.data.result.content;
              var name = res.data.result.username;
              var time = res.data.result.publish_time;
              var avatar = res.data.result.avatar;
              var id = res.data.result.id;
              var like = res.data.result.likes_count;
              var isme = res.data.result.is_me;
              var comments_count = res.data.result.comments_count
              //console.log(release);
              //console.log(that);
              var release = that.data.release;
              textarea_item.content = textareaValue;
              textarea_item.username = name;
              textarea_item.publish_time = time;
              textarea_item.avatar = avatar;
              textarea_item.id = id;
              textarea_item.likes_count = like;
              textarea_item.is_me = isme;
              release.push(textarea_item);
              that.setData({
                release: release,
                releaseFocus: true, //隐藏输入框
                releaseValue: '', //清空输入框内容
                releaselength: comments_count //更新页面发表评论总数
              })
            }
          }
        })
      }
    } else {
      this.userInfoReadyCallback()
    }
  },

  //获取用户信息后加上code 去请求auth- token
  userInfoReadyCallback: function(calback) {
    var that = this;
    //console.log(app.globalData.userInfo);
    util.login().then((res) => {
      //console.log("----------");
      return util.getUserAuthRequest(link.authtoken, {
        code: res.code
      })
    }).then(function(res) {
      //如果needBind 是true 则需要本地缓存paramBind验证手机号时用
      console.log(res.data.result.needBind);
      if (res.data.result.needBind) {
        //为新用户，提示去绑定手机号页面
        var paramBind = wx.getStorageSync('paramBind') || '';
        paramBind = res.data.result.paramBind;
        wx.setStorageSync('paramBind', paramBind);
        wx.showModal({
          title: '提示',
          content: '您尚未登录，点击确定去往手机登录页面,点击取消将无法购买',
          success: function(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/bindphone/bindphone'
              })
            } else if (res.cancel) {
              console.log("我点击了取消按钮");
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          }
        });
        // wx.navigateTo({
        //   url: '/pages/bindphone/bindphone'
        // })
      } else {
        //为老用户，可以正常登录，并本地存储auth_token
        var auth_token = wx.getStorageSync('auth_token') || '';
        auth_token = res.data.result.auth_token;
        wx.setStorageSync('auth_token', auth_token);
        //console.log(wx.getStorageSync('auth_token'));
        if (calback) {
          calback();
        }
      }
    })
  },

  // 添加留言
  formSubmit(e) {
    // console.log(e)
    // console.log(this.data.id)
    var that = this
    if (e.detail.value.input == '') {
      // if (this.data.releaseValue == '') {
      wx.showToast({
        title: '请留言',
      })
      return false;
    }
    var list = this.data.comment;
    // 必须是在用户已经授权的情况下调用
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          // wx.getUserInfo({
          // success: res => {
          wx.getUserInfo({
            success: function(res) {
              var userInfo = res.userInfo
              var nickName = userInfo.nickName
              var avatarUrl = userInfo.avatarUrl
              var gender = userInfo.gender //性别 0：未知、1：男、2：女
              var province = userInfo.province
              var city = userInfo.city
              var country = userInfo.country
              // console.log(e.detail.value.input)
              // console.log(this.data)
              var a = list ? list : []
              // 调用函数时，传入new Date()参数，返回值是日期和时间  
              var time = util.formatTime(new Date());

              // 登录
              wx.login({
                success: res => {
                  // 发送 res.code 到后台换取 openId, sessionKey, unionId
                  if (res.code) {
                    //发起网络请求
                    wx.request({
                      url: "https://zsj.itdos.com/v1/wx/addwxrelease/" + that.data.id,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded"
                      },
                      method: "POST",
                      data: {
                        code: res.code,
                        content: e.detail.value.input,
                        username: nickName,
                        publish_time: time,
                        avatar: avatarUrl,
                        app_version: 1.2,
                      },
                      // header: {
                      //   'appid': 'fZ4wruPFDWZTEwD1gUhbkez0CUmeWGJx',
                      //   'mbcore-access-token': wx.getStorageSync('access_token'),
                      //   'mbcore-auth-token': wx.getStorageSync('auth_token')
                      // },
                      success: function(res) {
                        // 再通过setData更改Page()里面的data，动态更新页面的数据  
                        a.push({
                          content: e.detail.value.input, //this.data.releaseValue
                          username: nickName,
                          is_me: true,
                          publish_time: time,
                          // likes_count: 5,
                          avatar: avatarUrl,
                        })
                        wx.setStorage({
                          key: 'info',
                          data: a,
                        })
                        that.setData({
                          comment: a,
                          releaseValue: '',
                          releaseFocus: true, //隐藏输入框
                          // releaselength: comments_count //更新页面发表评论总数
                        })
                        // console.log(avatarUrl)
                      }
                    })
                  }
                }
              })
            },
          })
        }
      }
    })
  },

  changeinputVal(e) {
    console.log(e.detail)
    this.setData({
      releaseValue: e.detail.value
    })
  },

  // 删除留言
  binddelete(e) {
    var that = this
    var index = e.currentTarget.dataset.index //e.target.dataset.id;
    // console.log(e)
    var comment = that.data.comment
    wx.showModal({
      title: '提示',
      content: '是否删除该条数据',
      success: function(res) {
        if (res.confirm) {

          //发起网络请求
          wx.request({
            url: "https://zsj.itdos.com/v1/wx/deletewxrelease/" + e.currentTarget.dataset.id,
            method: "POST",
            success: function(res) {
              comment.splice(index, 1);
              that.setData({
                comment: comment
              })
              // console.log(that.data.comment)
              wx.showToast({
                title: '删除成功',
              })
            }
          })
        }
      }
    })
  },

  /**
   * 生成分享图
   */
  share: function() {
    var that = this
    //获取用户设备信息设备像素比
    // wx.getSystemInfo({
    //   success: res => {
    //     that.setData({
    //       pixelRatio: res.pixelRatio
    //     })
    //     console.log(that.data.pixelRatio)
    //   }
    // })
    // 本质上就是生成一个更大的图片，因为手机的屏幕设备的像素比现在一般都是超过2的。实际上我们只需要在使用wx.canvasToTempFilePath的时候，设置参数destWidth和destHeight(输出的宽度和高度)为width和height的2倍以上即可。
    wx.showLoading({
      title: '努力生成中...'
    })
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 545,
      height: 771,
      destWidth: 545 * 2,
      destHeight: 771 * 2,
      canvasId: 'shareImg',
      success: function(res) {
        // console.log(res.tempFilePath);
        that.setData({
          prurl: res.tempFilePath,
          hidden: false
        })
        wx.hideLoading()
      },
      fail: function(res) {
        console.log(res)
      }
    })
  },

  /**
   * 保存到相册
   */
  save: function() {
    var that = this
    //生产环境时 记得这里要加入获取相册授权的代码
    wx.saveImageToPhotosAlbum({
      filePath: that.data.prurl,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: '#72B9C3',
          success: function(res) {
            if (res.confirm) {
              // console.log('用户点击确定');
              that.setData({
                hidden: true
              })
            }
          }
        })
      }
    })
  },
})