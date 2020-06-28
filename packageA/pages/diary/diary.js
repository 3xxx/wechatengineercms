// pages/diary/diary.js添加设代日记页面
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
    diaryProjId:'',
    titleCount: 0,
    contentCount: 0,
    title: '',
    content: '',
    images: [],
    hasRegist: false, //是否注册
    formats: {},
    bottom: 0,
    readOnly: false,
    placeholder: '请输入设代日志，推荐语音输入...',
    _focus: false,

    value2: [year, month, day],
    displayValue2: year + '-' + month1 + '-' + day,
    multiArray: [
      ['顺德部', '南沙部', '东莞部', '罗田部'],
      ['晴', '阴', '雨', '风']
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
    //   ],
    //   [{
    //       id: 0,
    //       name: '晴'
    //     },
    //     {
    //       id: 1,
    //       name: '阴'
    //     },
    //     {
    //       id: 2,
    //       name: '雨'
    //     },
    //     {
    //       id: 3,
    //       name: '风'
    //     }
    //   ]
    // ],
    multiIndex: [1, 0],
    lang: 'zh_CN',
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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      hasRegist: app.globalData.hasRegist //naviback返回此页不会触发onload，但是会触发onshow
    })
    if (app.globalData.projectConfig){
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
      this.setData({
        diaryProjId: app.globalData.projectConfig.diaryprojid,
      })
    }
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
    const diarydate = this.data.displayValue2
    // console.log(diarydate)
    const diaryactivity = this.data.multiArray[0][that.data.multiIndex[0]]
    // console.log(diaryactivity)
    const diaryweather = this.data.multiArray[1][that.data.multiIndex[1]]
    // console.log(diaryweather)
    const content = this.data.content
    // console.log(content)
    if (content) {
      // 登录
      var sessionId = wx.getStorageSync('sessionId')
      //发起网络请求
      wx.request({
        url: config.url + '/wx/addwxdiary',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          hotqinsessionid: sessionId,
          projectid:that.data.diaryProjId,
          title: title,
          diarydate: diarydate,
          diaryactivity: diaryactivity,
          diaryweather: diaryweather,
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
          } else if(res.data.status == 1){
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
              url: `../diarydetail/diarydetail?id=` + res.data.id
            })
          }else{
            wx.showToast({
              title: "调用接口出错",
              icon: 'wrong',
              duration: 1500
            })
          }
        },
        fail: function(res) {
          wx.showToast({
            title: "小程序调用出错",
            icon: 'wrong',
            duration: 1500
          })
        }
      })
    } else {
      wx.showToast({
        title: "正文不能为空！",
        icon: 'loading',
        duration: 1500
      })
    }
  },

  // style='text-indent: 2em;'
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function(res) {
      that.editorCtx = res.context
      that.editorCtx.setContents({
        html: "<p>填写人签名：</p><hr><p>气温：</p><hr><p>现场设代人员：</p><hr><p>工程形象：</p><p><br></p><hr><p>会议情况：</p><p><br></p><hr><p style='text-align: center;'>设代工作记录</p><p><br><br></p><hr>",
        // html:"<table border='1'><tr><td>现场设代人员：</td><td>现场设代人员2：</td></tr></table>",
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
        // console.log(res.tempFilePaths)
        that.data.images = images.length <= 6 ? images : images.slice(0, 6)
        $digest(that)
        const arr = []
        // console.log(that.data.images)
        for (let path of that.data.images) {
          arr.push(wxUploadFile({
            // url: config.urls.question + '/image/upload',
            url: config.url + '/wx/uploadwxeditorimg?projectid='+that.data.diaryProjId,
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

  //输入标题
  onChange1(e) {
    // console.log('onChange1', e)
    this.setData({
      title: e.detail.value,
      titleCount: e.detail.value.length,
    })
    $digest(this)
  },


  handler(e) {

  },

  //多选分部和天气
  bindMultiPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    console.log(this.data.multiIndex)
    console.log(this.data.multiIndex[0])
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

  onShareAppMessage: function() {
    return {
      title: '珠三角设代plus',
      path: 'packageA/pages/diary/diary'
    }
  }
})
// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {

//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {

//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })