// packageA/pages/financeeditor/financeeditor.js
import {
  promisify
} from '../../../utils/promise.util'
import {
  $init,
  $digest
} from '../../../utils/common.util'
var config = require('../../../config.js');
var app = getApp();

const wxUploadFile = promisify(wx.uploadFile)

function getDateString(date = new Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    month1: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  }
}

const {
  year,
  month,
  month1,
  day,
  hour,
  minute
} = getDateString()

Page({
  data: {
    financeProjId:'',//财务对应的项目id
    radio: '1',
    consider: false,
    radio2: '1',//统筹/报销
    titleCount: 0,
    contentCount: 0,
    amount: 0, //金额
    defaultamount: 0,
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

    value2: [year, month, day],
    displayValue2: year + '-' + month1 + '-' + day,
    multiArray: [
      ['顺德部', '南沙部', '东莞部', '罗田部']
    ],
    // objectMultiArray: [
    //   [{
    //       id: 0,
    //       name: '顺德部'
    //     },
    //     {
    //       id: 1,
    //       name: '南沙部'
    //     },
    //     {
    //       id: 1,
    //       name: '东莞部'
    //     },
    //     {
    //       id: 1,
    //       name: '罗田部'
    //     }
    //   ]
    // ],
    multiIndex: [0],
    lang: 'zh_CN',
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
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    this.setData({
      content: prevPage.data.financecontent,
      // title: prevPage.data.leassonTitle, 
      // titleCount: prevPage.data.leassonTitle.length,
      displayValue2: prevPage.data.financedate,

      // financeactivity : prevPage.data.multiArray[0][that.data.multiIndex[0]],
      // radio2 : prevPage.data.radio2,
      // displayValue2:prevPage.data.displayValue2,
      time: prevPage.data.time,

      // isArticleMe: prevPage.data.isArticleMe,
      // author: prevPage.data.UserId,
      // views: prevPage.data.Views,
      defaultamount: prevPage.data.amount,
      consider: prevPage.data.consider
    })
    if (this.data.defaultamount > 0) {
      this.setData({
        radio: '2'
      })
    } else {
      this.setData({
        defaultamount: 0 - this.data.defaultamount
      })
    }
    if (this.data.consider == true) {
      this.setData({
        radio2: '1'
      })
    } else {
      this.setData({
        radio2: '2'
      })
    }
    // console.log(that.data.financedate)
    // console.log(that.data.time)
    // console.log(this.data.defaultamount)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      hasRegist: app.globalData.hasRegist //naviback返回此页不会触发onload，但是会触发onshow
    })
    if (app.globalData.projectConfig) {
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
      this.setData({
        financeProjId: app.globalData.projectConfig.financeprojid,
      })
    }
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
    const amount = this.data.defaultamount
    const financedate = this.data.displayValue2
    // console.log(financedate)
    // const financeactivity = this.data.multiArray[0][that.data.multiIndex[0]]
    // console.log(financeactivity)
    // const financeweather = this.data.multiArray[1][that.data.multiIndex[1]]
    // console.log(financeweather)
    const content = this.data.content
    const radio = this.data.radio
    const radio2 = this.data.radio2
    if (content) {
      // 登录
      var sessionId = wx.getStorageSync('sessionId')
      //发起网络请求
      wx.request({
        url: config.url + '/wx/updatewxfinance',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          hotqinsessionid: sessionId,
          radio: radio,
          radio2: radio2,
          id: that.data.id,
          amount: amount,
          financedate: financedate,
          // financeactivity: financeactivity,
          content: content
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
              url: `../financedetail/financedetail?id=` + that.data.id
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
        html: prevPage.data.financecontent,
        success: (res) => {
          console.log(res)
        },
        fail: (res) => {
          console.log(res)
        }
      })
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
            url: config.url + '/wx/uploadwxeditorimg?projectid='+that.data.financeProjId,
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
    // console.log(e)
    this.setData({
      defaultamount: e.detail.value,
    })
  },

  //单选按钮
  onRadioChange(e) {
    this.setData({
      radio: e.detail.value
    })
    // console.log(this.data.radio)
  },
    //单选按钮
    onRadioChange2(e) {
      this.setData({
        radio2: e.detail.value
      })
      // console.log(this.data.radio)
    },

  //选择日期wux
  setValue(values, key, mode) {
    this.setData({
      [`value${key}`]: values.value,
      [`displayValue${key}`]: values.label,
      // [`displayValue${key}`]: values.displayValue.join(' '),
    })
    console.log(`value${key}`)
    console.log(`displayValue${key}`)
  },

  onConfirm(e) {
    const {
      index,
      mode
    } = e.currentTarget.dataset
    this.setValue(e.detail, index, mode)
    console.log(`onConfirm${index}`, e.detail)
  },

  onShareAppMessage: function () {
    return {
      title: '珠三角设代plus',
      path: 'pages/financeeditor/financeeditor'
    }
  }
})