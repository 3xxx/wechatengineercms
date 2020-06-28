// pages/editortopic/editortopic.js
import {
  promisify
} from '../../utils/promise.util'
import {
  $init,
  $digest
} from '../../utils/common.util'
var config = require('../../config.js');
var app = getApp();

const wxUploadFile = promisify(wx.uploadFile)
Page({
  data: {
    titleCount: 0,
    contentCount: 0,
    title: '',
    content: '',
    images: [],
    hasRegist: false, //是否注册
    formats: {},
    bottom: 0,
    readOnly: false,
    placeholder: '请输入正文...',
    _focus: false,
    // contract_info1: "",
    // dkcontent:"",
  },

  readOnlyChange() {
    this.setData({
      readOnly: this.data.readOnly //这个有无影响？
    })
  },

  onLoad(options) {
    $init(this) //这个干啥？
    if (app.globalData.hasRegist) {
      this.setData({
        hasRegist: true
      })
    }
    // wx.loadFontFace({
    //   family: 'Pacifico',
    //   source: 'url("https://sungd.github.io/Pacifico.ttf")',
    //   success: console.log
    // })

    this.setData({
      id: options.id, //文章的id
      // title: options.title,
      // content: options.content,
      isAdmin: app.globalData.isAdmin,
      // contract_info1: options.title,
      // titleCount: options.title.length
      // isMe:true,//作者本人？
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      hasRegist: app.globalData.hasRegist //naviback返回此页不会触发onload，但是会触发onshow
    })
  },

  // handleTitleInput(e) {
  //   const value = e.detail.value
  //   this.data.title = value
  //   this.data.titleCount = value.length
  //   $digest(this)
  // },

  handleContentInput(e) {
    // console.log(e)
    // const value = e.detail.value
    const value = e.detail.html
    //要将图片的头http://*.*.*.去掉/at/g
    var reg = new RegExp(config.attachmenturl, "g")
    this.data.content = value.replace(reg, '');
    // this.data.contentCount = value.length
    $digest(this)
  },

  chooseImage(e) {
    wx.chooseImage({
      count: 6,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        this.data.images = images.length <= 6 ? images : images.slice(0, 6)
        $digest(this)
      }
    })
  },

  removeImage(e) {
    const idx = e.target.dataset.idx
    this.data.images.splice(idx, 1)
    $digest(this)
  },

  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images
    wx.previewImage({
      current: images[idx],
      urls: images,
    })
  },

  submitForm(e) {
    // this.editorCtx.getContents({
    //   html:this.data.editor_msg,
    //   success:(res)=>{
    //     console.log('succ:'+res)
    //   },
    //   fail:(res)=>{
    //     console.log('fail:'+res)
    //   }
    // })
    var that = this
    const title = this.data.title
    // console.log(title)
    const content = this.data.content
    // console.log(content)
    if (title && content) {
      // 登录
      var sessionId = wx.getStorageSync('sessionId')
      //发起网络请求
      wx.request({
        url: config.url + '/wx/updatewxeditorarticle?id=' + that.data.id,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          hotqinsessionid: sessionId,
          title: title,
          content: content
          // images: urls
        },
        success: function(res) {
          if (res.data.status == 0) {
            wx.showToast({
              title: res.data.info,
              icon: 'loading',
              duration: 1500
            })
          } else {
            wx.showToast({
              title: res.data.info, //这里打印出成功
              icon: 'success',
              duration: 1000
            })
            //进行清理
            that.editorCtx.clear({
              success: (res) => {
                console.log('succ:' + res)
              },
              fail: (res) => {
                console.log('fail:' + res)
              }
            })
            wx.navigateTo({
              url: `../detail/detail?id=` + that.data.id
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: "标题或正文为空！",
        icon: 'loading',
        duration: 1500
      })
    }
  },

  onEditorReady() {
    // 没必要再去服务端请求数据
    var that = this
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    // console.log(prevPage.data)
    // prevPage.setData({//给上一页面（details)赋值，保留
    //   user: 'LaternKiwis'
    // })

    // var getData = wx.request({//没必要再去服务端请求
    //   url: config.url + '/wx/getwxarticle/' + that.data.id,
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
    //   data: {
    //     hotqinsessionid: sessionId
    //   },
    // success: function (res1) {
    wx.createSelectorQuery().select('#editor').context(function(res) {
      that.editorCtx = res.context
      that.editorCtx.setContents({
        html: prevPage.data.articlecontent,//that.data.content, //res1.data.html,
        success: (res) => {
          console.log(res)
        },
        fail: (res) => {
          console.log(res)
        }
      })
    }).exec()
    that.setData({
      content: prevPage.data.articlecontent,//假如用户没有点击内容，则用这个内容
      title: prevPage.data.leassonTitle,//假如用户没有点击标题，则用这个标题
      titleCount: prevPage.data.leassonTitle.length
    })
    // },
    // })
  },

  undo() {
    this.editorCtx.undo()
  },

  redo() {
    this.editorCtx.redo()
  },

  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)
  },

  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
  },

  insertDivider() {
    this.editorCtx.insertDivider({
      success: function() {
        console.log('insert divider success')
      }
    })
  },

  clear() {
    this.editorCtx.clear({
      success: function(res) {
        console.log("clear success")
      }
    })
  },

  removeFormat() {
    this.editorCtx.removeFormat()
  },

  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },

  insertImage() {
    const that = this
    wx.chooseImage({
      count: 6,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = that.data.images.concat(res.tempFilePaths)
        console.log(res.tempFilePaths)
        that.data.images = images.length <= 6 ? images : images.slice(0, 6)
        $digest(that)
        const arr = []
        // console.log(that.data.images)
        for (let path of that.data.images) {
          arr.push(wxUploadFile({
            // url: config.urls.question + '/image/upload',
            url: config.url + '/wx/uploadwxeditorimg',
            filePath: path,
            name: 'file',
          }))
        }
        // console.log(arr)
        Promise.all(arr).then(res => {
          return res.map(item => JSON.parse(item.data).link)
        }).catch(err => {
          console.log(">>>> upload images error:", err)
        }).then(urls => {
          // console.log(urls)
          for (let i = 0; i < urls.length; ++i) {
            that.editorCtx.insertImage({
              src: config.attachmenturl + urls[i],
              // data: {
              //   id: 'abcd',
              //   role: 'god'
              // },
              success: function() {
                console.log('insert image success')
                that.setData({
                  images: [] //这里清0，否则总是将上次的图片带上
                })
                // console.log(that.data.images)
              }
            })
          }
        })
      }
    })
  },

  // 点击图片将图片插入富文本编辑器里面
  //https://blog.csdn.net/qq_29789057/article/details/90108048
  // insertImage() {
  //   const that = this;
  //   wx.chooseImage({
  //     count: 1,
  //     sizeType: ['original', 'compressed'],
  //     sourceType: ['album', 'camera'],
  //     success: function (res) {
  //       console.log(res.tempFilePaths, '上传图片')
  //       wx.uploadFile({
  //         url: '自己的图片上传地址',
  //         filePath: res.tempFilePaths[0],
  //         name: 'file',
  //         formData: {
  //           app_token: app.data.userInfo.app_token,
  //         },
  //         success: function (res) {
  //           console.log(res.data, '图片上传之后的数据')
  //           var data = JSON.parse(res.data)
  //           console.log(data.data.url)
  //           that.editorCtx.insertImage({
  //             src: data.data.url,
  //             success: function () {
  //               console.log('insert image success')
  //             }
  //           })
  //         }
  //       })
  //     }
  //   })
  // },
  onChange1(e) {
    // console.log('onChange1', e)
    this.setData({
      // addtell: {
      //   contract_info1: e.detail.value,
      //   addtellHidden: false,
      // },
      // error: isTel(e.detail.value),
      // value: e.detail.value,
      title: e.detail.value,
      titleCount: e.detail.value.length,
    })
    $digest(this)
  },

  onShareAppMessage: function() {
    return {
      title: '珠三角设代plus',
      path: 'pages/editortopic/editortopic'
    }
  }
})