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
    hasRegist: false,//是否注册
  },

  onLoad(options) {
    $init(this)
    if (app.globalData.hasRegist) {
      this.setData({
        hasRegist: true
      })
    }
  },
  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    this.setData({
      hasRegist: app.globalData.hasRegist//naviback返回此页不会触发onload，但是会触发onshow
    })
  },
  handleTitleInput(e) {
    const value = e.detail.value
    this.data.title = value
    this.data.titleCount = value.length
    $digest(this)
  },

  handleContentInput(e) {
    const value = e.detail.value
    this.data.content = value
    this.data.contentCount = value.length
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
    const title = this.data.title
    const content = this.data.content
    if (title && content) {
      const arr = []
      for (let path of this.data.images) {
        arr.push(wxUploadFile({
          // url: config.urls.question + '/image/upload',
          url: 'https://zsj.itdos.com/v1/wx/uploadwximg',
          filePath: path,
          name: 'file',
        }))
      }
      wx.showLoading({
        title: '正在创建...',
        mask: true
      })

      Promise.all(arr).then(res => {
        return res.map(item => JSON.parse(item.data).link)
      }).catch(err => {
        console.log(">>>> upload images error:", err)
      }).then(urls => {
        // return createQuestion({
        //   title: title,
        //   content: content,
        //   images: urls
        // })
        // 登录
        var sessionId = wx.getStorageSync('sessionId')
        //发起网络请求
        wx.request({
          url: 'https://zsj.itdos.com/v1/wx/addwxarticle',
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          data: {
            hotqinsessionid: sessionId,
            title: title,
            content: content,
            images: urls
            // mobile: e.detail.value.mobile,
            // password: e.detail.value.password
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
                title: res.data.info, //这里打印出登录成功
                icon: 'success',
                duration: 1000
              })
              wx.navigateTo({
                url: `../detail/detail?id=` + res.data.id
              })
            }
          }
        })

        // wx.request({
        //   url: 'https://zsj.itdos.com/wx/addwxarticle',
        //   header: {
        //     "Content-Type": "application/x-www-form-urlencoded"
        //   },
        //   method: "POST",
        //   data: {
        //     title: title,
        //     content: content,
        //     images: urls
        //     // mobile: e.detail.value.mobile,
        //     // password: e.detail.value.password
        //   },
        //   success: function (res) {
        //     if (res.data.status == 0) {
        //       wx.showToast({
        //         title: res.data.info,
        //         icon: 'loading',
        //         duration: 1500
        //       })
        //     } else {
        //       wx.showToast({
        //         title: res.data.info, //这里打印出登录成功
        //         icon: 'success',
        //         duration: 1000
        //       })
        //       wx.navigateTo({
        //         url: `../detail/detail?id=` + res.data.id
        //       })
        //     }
        //   }
        // })
      }).then(res => {

      }).catch(err => {
        console.log(">>>> create question error:", err)
      }).then(() => {
        wx.hideLoading()
      })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'pages/index/index'
    }
  }
})