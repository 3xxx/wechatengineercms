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
    radio: 'draw',
    title: '',
    content: '',
    images: [],
    items: [{
      name: 'draw',
      value: '绘画',
      checked: 'true'
    },
    {
      name: 'calligraphy',
      value: '书法'
    },
    {
      name: 'writing',
      value: '文章'
    },
    {
      name: 'other',
      value: '其他'
    }
    ],
    hasRegist: false, //是否注册
    formats: {},
    bottom: 0,
    readOnly: false,
    placeholder: '请输入正文...',
    _focus: false,
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  onLoad(options) {
    $init(this)
    if (app.globalData.hasRegist) {
      this.setData({
        hasRegist: true
      })
    }
  },

  //单选按钮
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    const value = e.detail.value
    this.data.radioo = value
    this.data.radiooCount = value.length
    $digest(this)
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      hasRegist: app.globalData.hasRegist //naviback返回此页不会触发onload，但是会触发onshow
    })
  },

  handleTitleInput(e) {
    const value = e.detail.value
    this.data.title = value
    this.data.titleCount = value.length
    $digest(this)
  },

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
    var that = this
    const title = this.data.title
    const content = this.data.content
    const radioo = this.data.radioo
    // console.log(radioo)
    switch (radioo) {
      case "draw":
        var url1 = "26175";
        break;
      case "calligraphy":
        var url1 = "26174";
        break;
      case "writing":
        var url1 = "26173";
        break;
      case "other":
        var url1 = "26172";
        break;
      default:
        var url1 = "26175";
    }

    // console.log(content)
    if (title && content) {
      // 登录
      var sessionId = wx.getStorageSync('sessionId')
      //发起网络请求
      wx.request({
        url: config.url + '/wx/addwxarticles/' + url1,
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
              url: `../detail/detail?id=` + res.data.id
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: "标题或正文不能为空！",
        icon: 'loading',
        duration: 1500
      })
    }
  },

  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
    }).exec()
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
        for (let path of that.data.images) {
          arr.push(wxUploadFile({
            url: config.url + '/wx/uploadwxeditorimg',
            filePath: path,
            name: 'file',
          }))
        }
        Promise.all(arr).then(res => {
          return res.map(item => JSON.parse(item.data).link)
        }).catch(err => {
          console.log(">>>> upload images error:", err)
        }).then(urls => {
          for (let i = 0; i < urls.length; ++i) {
            that.editorCtx.insertImage({
              src: config.attachmenturl + urls[i],
              success: function () {
                console.log('insert image success')
                that.setData({
                  images: [] //这里清0，否则总是将上次的图片带上
                })
              }
            })
          }
        })
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '青少儿书画+●发布',
      path: 'pages/addtopic/addtopic'
    }
  }
})