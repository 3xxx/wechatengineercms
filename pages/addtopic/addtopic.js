import {
  promisify
} from '../../utils/promise.util'
import {
  $init,
  $digest
} from '../../utils/common.util'

const wxUploadFile = promisify(wx.uploadFile)
Page({
  data: {
    titleCount: 0,
    contentCount: 0,
    title: '',
    content: '',
    images: []
  },

  onLoad(options) {
    $init(this)
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
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            if (res.code) {
              //发起网络请求
              wx.request({
                url: 'https://zsj.itdos.com/v1/wx/addwxarticle',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  code: res.code,
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

            } else {
              console.log('登录失败！' + res.errMsg)
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
        // const pages = getCurrentPages();
        // const currPage = pages[pages.length - 1];
        // const prevPage = pages[pages.length - 2];

        // prevPage.data.questions.unshift(res)
        // $digest(prevPage)

        // wx.navigateBack()
      }).catch(err => {
        console.log(">>>> create question error:", err)
      }).then(() => {
        wx.hideLoading()
      })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '珠三角设代',
      path: 'pages/index/index'
    }
  }
})