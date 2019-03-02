//detail.js
//获取应用实例
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
    inputMarBot: false, //评论框聚焦时，让评论框距离底部的距离为50rpx

    open: true,

    shop: [],
    shop_item: {},
    shop_num: {},
    //  发表评论
    releaseValue: '',
    releaseFocus: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    emojiChar: "☺-😌-😍-😓-😏-😜-😪-😭-😁-😃-😏-😖-😡-😳-😷-👍-👌-✌-✊-☝-☀-☁-⛅-⚡-💖-💔-🕙-🌹-🍉-🎂-🎁-🍚-☕-🍺-👄-🐞-⚽-🏀-👧-👦-💊",
    //0x1f---
    emoji: ["00", "1F60C", "1F60D", "1F613", "1F60F", "1F61C",
      "1F62A", "1F62D", "1F601", "1F603",
      "1F60F", "1F616", "1F621",
      "1F633", "1F637", "1F44D", "1F44C", "270C",
      "270A", "261D", "2600", "2601", "26C5", "26A1", "1F496", "1F494", "1F559", "1F339", "1F349", "1F382", "1F381", "1F35A", "2615", "1F37A", "1F444", "1F41E", "26BD", "1F3C0", "1F467", "1F466", "1F48A"
    ],
    emojis: [], //qq、微信原始表情
    alipayEmoji: [], //支付宝表情
    openSettingBtnHidden:true,
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
              app_version: 3, //plus用的
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
                //画布上的图片和文字，文字要控制字数
                // photo:res.data.imgUrl,
                // word:res.data.word
                views: res.data.Views,
                likeNum: res.data.likeNum,
                liked: res.data.liked,
                comment: res.data.comment,
                commentNum: res.data.commentNum,
              })
              wxparse.wxParse('dkcontent', 'html', that.data.dkcontent, that, 5)
              // console.log(that.data.comment)
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
                ctx.drawImage(res1[0].path, 30, 200, 480, 400)
                ctx.drawImage('../../' + res1[1].path, 350, 610, 160, 160)
                // ctx.drawImage(imgurl, 50, 200, 400, 400)
                // ctx.drawImage(bgImgPath, 350, 610, 160, 160)

                ctx.setFontSize(28)
                ctx.setFillStyle('#6F6F6F')
                ctx.fillText('来自小程序 - 青少儿书画', 30, 660)

                ctx.setFontSize(30)
                ctx.setFillStyle('#111111')
                ctx.fillText('快来围观和发布作品', 30, 710)

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

    var em = {},
      emChar = that.data.emojiChar.split("-");
    that.data.emoji.forEach(function(v, i) {
      em = {
        char: emChar[i],
        emoji: v, //"0x1f" + 
      };
      that.data.emojis.push(em)
    });
    that.setData({
      emojis: that.data.emojis
    })
    // console.log(that.data.emojis)
  },

  bindGetUserInfo(e) {
    console.log(e.detail.userInfo)
  },

  onShareAppMessage: function() {
    // console.log(this.data.id)
    return {
      title: '青少儿书画+●内容',
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
              app_version: 3,
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
        'appid': '??????',
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
                'appid': '????',
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
            'appid': '??????',
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
    //console.log(that.data.releaseValue)
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
                        app_version: 3,
                      },
                      // header: {
                      //   'appid': '????',
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
        console.log(res);
        wx.hideLoading()
      },
      complete: () => {
        wx.hideLoading()
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
      },
      fail: function(err) {
        if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
          // this.openSettingBtnHidden = false
          that.setData({
            openSettingBtnHidden: false
          })
          wx.showToast({
            title: '缺少授权，请点击授权',
            icon: 'none',
            duration: 2000
          })
          // this.$apply()
        } else if (err.errMsg === 'saveImageToPhotosAlbum:fail cancel') {
          // this.openSettingBtnHidden = false
          that.setData({
            openSettingBtnHidden: true
          })
          wx.showToast({
            title: '取消保存',
            icon: 'none',
            duration: 2000
          })
          // this.$apply()
        }
        // console.log(err);
        // if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
        // console.log("用户一开始拒绝了，我们想再次发起授权")
        // wx.authorize({
        //   scope: 'scope.writePhotosAlbum',
        //   success(successdata) {
        //     console.log('授权成功')
        //   },
        //   fail(faildata) {
        //     console.log('授权失败')
        //     console.log(faildata)
        //   }
        // })
        // console.log('打开设置窗口')
        // wx.openSetting({
        //   success(settingdata) {
        //     console.log(settingdata)
        //     if (settingdata.authSetting['scope.writePhotosAlbum']) {
        //       console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
        //     } else {
        //       console.log('获取权限失败，给出不给权限就无法正常使用的提示')
        //     }
        //   }
        // })
        // }
      }
      // fail: (res) => {
      //   console.log(res)
      // },
      // complete: () => {
      //   wx.hideLoading()
      // }
    })
  },
  // 手动授权
  handleSetting(e) {
    var that = this
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存在相册中！',
        showCancel: false
      })
      that.setData({
        openSettingBtnHidden: true
      })
      // this.openSettingBtnHidden = true
    } else {
      wx.showModal({
        title: '提示',
        content: '您已授权，赶紧将图片保存在相册中吧！',
        showCancel: false
      })
      that.setData({
        openSettingBtnHidden: true
      })
      // this.openSettingBtnHidden = true
    }
    // this.$apply()
  },

  //解决滑动穿透问题
  emojiScroll: function(e) {
    console.log(e)
  },
  //文本域失去焦点时 事件处理
  textAreaBlur: function(e) {
    //获取此时文本域值
    // console.log(e.detail.value)
    this.setData({
      releaseValue: e.detail.value,
      // inputMarBot: false
    })

  },
  //文本域获得焦点事件处理
  textAreaFocus: function() {
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('#contain').boundingClientRect()
    query.exec(function (res) {
      //res就是 所有标签为myText的元素的信息 的数组
      console.log(res);
      //取高度
      console.log(res[0].height);
            // 使页面滚动到底部  
      wx.pageScrollTo({
        scrollTop: res[0].bottom, //rect.height
        duration: 300 //设置滚动时间
      });
      //   scrollTop: 0,
    })
      //功能代码
      this.setData({
        isShow: false,
        cfBg: false,
        // inputMarBot: true //
      })
    // })
  },
  //点击表情显示隐藏表情盒子
  emojiShowHide: function() {
    this.setData({
      isShow: !this.data.isShow,
      isLoad: false,
      cfBg: !this.data.false
    })
  },
  //表情选择
  emojiChoose: function(e) {
    //当前输入内容和表情合并
    this.setData({
      releaseValue: this.data.releaseValue + e.currentTarget.dataset.emoji
    })
    // wxparse.wxParse('content', 'html', this.data.content, this, 5)
  },
  //点击emoji背景遮罩隐藏emoji盒子
  cemojiCfBg: function() {
    this.setData({
      isShow: false,
      cfBg: false
    })
  },

  //发送评论评论 事件处理
  send: function() {
    var that = this
    console.log(that.data.releaseValue)
    if (that.data.releaseValue == '') {
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
                        content: that.data.releaseValue,
                        username: nickName,
                        publish_time: time,
                        avatar: avatarUrl,
                        app_version: 3,
                      },
                      success: function(res) {
                        // 再通过setData更改Page()里面的data，动态更新页面的数据  
                        a.push({
                          content: that.data.releaseValue, //this.data.releaseValue
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

    // var that = this,
    //   conArr = [];
    // //此处延迟的原因是 在点发送时 先执行失去文本焦点 再执行的send 事件 此时获取数据不正确 故手动延迟100毫秒
    // console.log(that.data.releaseValue)
    // setTimeout(function () {
    //   if (that.data.releaseValue.trim().length > 0) {
    //     conArr.push({
    //       avatar: util.ossAliyuncs + "/images/banner5.jpg",
    //       uName: "雨碎江南",
    //       time: util.formatTime(new Date()),
    //       releaseValue: that.data.releaseValue
    //     })
    //     that.setData({
    //       comments: that.data.comments.concat(conArr),
    //       releaseValue: "", //清空文本域值
    //       isShow: false,
    //       cfBg: false
    //     })
    //     wxparse.wxParse('comments', 'html', that.data.comments, that, 5)
    //   } else {
    //     that.setData({
    //       releaseValue: "" //清空文本域值
    //     })
    //   }
    // }, 100)
  },

  //获取容器高度，使页面滚动到容器底部
  pageScrollToBottom: function() {
    wx.createSelectorQuery().select('#j_page').boundingClientRect(function(rect) {
      //使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: rect.bottom, //rect.height
        duration: 10 //设置滚动时间
      })
    }).exec()
  }

})