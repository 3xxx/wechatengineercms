
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
    radio:'draw',
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
    ]
  },

  onLoad(options) {
    $init(this);
    var that = this;
    that.clearCache(); //清本页缓存
  },
  // 清缓存
  clearCache: function () {
    this.setData({
      content: '',
      title: ''
    })
  },

  //单选按钮
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    const value = e.detail.value
    this.data.radioo = value
    this.data.radiooCount = value.length
    $digest(this)
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
    const radioo = this.data.radioo
    var that=this
    // console.log(radioo)
    switch (radioo) {
      case "draw":
        var url1 ="26175";
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
    if (title && content) {
      const arr = []
      for (let path of this.data.images) {
        arr.push(wxUploadFile({
          url: "https://zsj.itdos.com/v1/wx/uploadwximgs/"+url1,
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
        // 登录
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            if (res.code) {
              //发起网络请求
              wx.request({
                url: "https://zsj.itdos.com/v1/wx/addwxarticles/"+url1,
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  code: res.code,
                  title: title,
                  content: content,
                  images: urls,
                  app_version: 3,
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
                      title: res.data.info, //这里打印出登录成功
                      icon: 'success',
                      duration: 1000
                    })
                    // this.setData({
                    //   content: '',
                    //   title:''
                    // })
                    that.clearCache(); //清本页缓存
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

      }).then(res => {

      }).catch(err => {
        console.log(">>>> create question error:", err)
      }).then(() => {
        wx.hideLoading()
      })
    }
  },

  onShareAppMessage: function() {
    return {
      title: '青少儿书画+●发布',
      path: 'pages/index/index'
    }
  }
})