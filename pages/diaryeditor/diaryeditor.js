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

    this.setData({
      id: options.id, //文章的id
      isAdmin: app.globalData.isAdmin,
      // isMe:true,//作者本人？
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      hasRegist: app.globalData.hasRegist //naviback返回此页不会触发onload，但是会触发onshow
    })
  },

  handleContentInput(e) {
    const value = e.detail.html
    //要将图片的头http://*.*.*.去掉/at/g
    var reg = new RegExp(config.attachmenturl, "g")
    this.data.content = value.replace(reg, '');
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
    var that = this
    const title = this.data.title
    // console.log(title)
    const content = this.data.content
    // console.log(content)
    if (content) {
      // 登录
      var sessionId = wx.getStorageSync('sessionId')
      //发起网络请求
      wx.request({
        url: config.url + '/wx/updatewxdiary?id=' + that.data.id,
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
        success: function (res) {
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
              url: `../diarydetail/diarydetail?id=` + that.data.id
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: "正文为空！",
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
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
      that.editorCtx.setContents({
        html: prevPage.data.diarycontent,
        success: (res) => {
          console.log(res)
        },
        fail: (res) => {
          console.log(res)
        }
      })
    }).exec()
    that.setData({
      content: prevPage.data.diarycontent,//假如用户没有点击内容，则用这个内容
      title: prevPage.data.leassonTitle,//假如用户没有点击标题，则用这个标题
      titleCount: prevPage.data.leassonTitle.length
    })
    console.log(that.data.title)
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
      success: function () {
        console.log('insert divider success')
      }
    })
  },

  clear() {
    this.editorCtx.clear({
      success: function (res) {
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
              success: function () {
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

   onChange1(e) {
    // console.log('onChange1', e)
    this.setData({
      title: e.detail.value,
      titleCount: e.detail.value.length,
    })
    $digest(this)
  },

  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'pages/diaryeditor/diaryeditor'
    }
  }
})