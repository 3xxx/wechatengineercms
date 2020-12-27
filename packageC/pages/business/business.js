// packageC/pages/business/business.js
import {
  promisify
} from '../../../utils/promise.util'
import {
  $init,
  $digest
} from '../../../utils/common.util'

//引用腾讯地图API
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var location = "";
var config = require('../../../config.js');
var util = require('../../../utils/util.js');
var app = getApp();
var tagindex = 0; //名字序号

function getDateString(date = new Date) {
  return {
    year: date.getFullYear(),
    year2: date.getFullYear() + 10,
    month: date.getMonth(),
    month2: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  }
}

const {
  year,
  year2,
  month,
  month2,
  day,
  hour,
  minute
} = getDateString()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    start_date: year + '-' + month2 + '-' + day,
    end_date: year + '-' + month2 + '-' + day,
    value2: [year, month2, day],
    displayValue2: year + '-' + month2 + '-' + day,
    displayValue3: year2 + '-' + month2 + '-' + day,
    checkboxItems: [{
        name: '拍照打卡',
        value: '1'
      },
      {
        name: '地点打卡',
        value: '2',
        checked: true
      },
      {
        name: '人脸打卡',
        value: '3'
      }
    ],
    activity_location: "", //address
    activity_lat: "",
    activity_lng: "",
    // address: "",
    isAdmin: false,
    hasLocation: false,
    // 选择日期区间
    date: '',
    show: false,
    showtag: {
      primary: true,
      success: true,
    },
    articleshow: false, //显示文章添加
    // 添加姓名标签
    newNameTag: '',
    nameTag: [],
    // nameTag: [{
    //   id: '1',
    //   index: '1',
    //   name: '标签1',
    //   showtag: true,
    // }, {
    //   id: '2',
    //   index: '2',
    //   name: '标签2',
    //   showtag: true,
    // }]
    // ***富文本
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    // ***富文本结束
    subsidy: 180,

  },

  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (!app.globalData.hasLocation) {
      // 获取位置
      wx.getLocation({
        type: 'wgs84',
        success: function (res) { //实例化腾通地图sdk
          qqmapsdk = new QQMapWX({
            key: 'EADBZ-QCZ6Q-FDK54-GBQ4X-QY5B5-CVFFZ' //这里自己的key秘钥进行填充
          });
          var latitude1 = res.latitude
          var longitude1 = res.longitude
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: latitude1,
              longitude: longitude1
            },
            success: function (res) {
              app.globalData.activity_lat = res.result.location.lat;
              app.globalData.activity_lng = res.result.location.lng;
              app.globalData.activity_location = res.result.address;
              that.setData({
                hasLocation: true,
                activity_lat: res.result.location.lat,
                activity_lng: res.result.location.lng,
                activity_location: res.result.address
              })
            }
          })
        },
        fail: function (res) {
          // console.log(res)
        }
      })
    } else {
      //app.userLocatioCallback = res => {
      that.setData({
        hasLocation: true,
        activity_lat: app.globalData.activity_lat,
        activity_lng: app.globalData.activity_lng,
        activity_location: app.globalData.activity_location
      })
    };

    // if (!app.globalData.hasLocation) {
    //   // 获取位置
    //   wx.getLocation({
    //     type: 'wgs84',
    //     success: function (res) {
    //       app.globalData.hasLocation = true
    //       that.setData({
    //         hasLocation: true
    //       })
    //     },
    //     fail: function (res) {
    //       // console.log(res)
    //     }
    //   })
    // } else {
    //   that.setData({
    //     hasLocation: true,
    //     activity_location: app.globalData.activity_location
    //   })
    // };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.setData({
      isAdmin: app.globalData.isAdmin
    })
    if (app.globalData.projectConfig) {
      wx.setNavigationBarTitle({
        title: app.globalData.projectConfig.projecttitle,
      });
      that.setData({
        projectid: app.globalData.projectConfig.projectid
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '未选定项目，是否前去选择？',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateTo({
              url: '../../../pages/projectlist/projectlist',
              events: {
                // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                acceptDataFromOpenedPage: function (data) {
                  console.log(data)
                },
                someEvent: function (data) {
                  console.log(data)
                }
              },
              success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromOpenerPage', {
                  data: 'test'
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
            wx.showToast({
              title: '未选择项目！',
              icon: 'none',
              duration: 2000
            });
          }
        }
      })
    }

    // console.log(getApp().data.activity_location);//从position跳转过来，可以
    // console.log(this.data.address);
    // location = getApp().data.activity_location;
    //console.log(app.globalData.isAdmin)
    // 这个地方必须要有isAdmin赋值，比如用户注册前先打开了这个页面
    // 然后去注册，成功后再回来这个页面，不会触发onload
    // if (location != "") {
    //   that.setData({
    //     activity_location: location
    //     // activity_location: this.data.address//这个没用，可能onshow最先获取不到onLoad值
    //   });
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '湾区防腐蚀',
      path: '../../../packageA/pages/new/new'
    }
  },
  /**
   * 选择日期并获取日期
   */
  bindStartDateChange: function (e) {
    this.setData({
      start_date: e.detail.value
    });
    // console.log()
  },
  bindEndDateChange: function (e) {
    this.setData({
      end_date: e.detail.value
    })
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var checkboxItems = this.data.checkboxItems,
      values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      checkboxItems: checkboxItems
    });
  },

  getLocation: function () {
    // var that = this
    if (!this.data.hasLocation) {
      // 显示模态弹窗
      wx.showModal({
        title: '未授权获取用户地理位置！',
        content: '请点击上部的打开授权信息面板按钮进行授权。',
        success(res) {
          // console.log(res)
        }
      })
    } else {
      this.moveToLocation();
    }
  },

  //移动选点
  moveToLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        // console.log(res);
        // address:"广东省广州市天河区天府路1号"
        // errMsg:"chooseLocation:ok"
        // latitude:23.12463
        // longitude:113.36199
        // name:"广州市天河区人民政府"
        /**确定地点并返回*/
        // submit_location: function () {
        that.setData({
          activity_lat: res.latitude,
          activity_lng: res.longitude,
          activity_location: res.name,
        });
        // app.data.activity_lat = res.latitude;
        // app.data.activity_lng = res.longitude;
        // app.data.activity_location = res.name;
        // wx.navigateBack({
        //   delta: 1//这个在这里无效
        // });
        //console.log(that.data.activity_location);
        // }
        //选择地点之后返回到原来页面
        // wx.navigateTo({
        //   url: "/pages/new/new"//?address=" + res.name
        // });
      },
      fail: function (err) {
        console.log(err)
      }
    });
  },

  formSubmit: function (e) {
    var value = e.detail.value
    var that = this;
    // 判断项目名称是否为空
    if ("" == util.trim(value.projecttitle)) {
      wx.showToast({
        title: "项目名称不能为空",
        icon: 'err',
        duration: 1500
      })
      return;
    } else {
      util.clearError(that);
    }
    // 判断地点是否为空
    if ("" == util.trim(value.activity_location)) {
      wx.showToast({
        title: "地点不能为空",
        icon: 'err',
        duration: 1500
      })
      return;
    } else {
      util.clearError(that);
    }
    // 判断时间区间是否为空
    if ("" == util.trim(value.date)) {
      wx.showToast({
        title: "时间不能为空",
        icon: 'err',
        duration: 1500
      })
      return;
    } else {
      util.clearError(that);
    }
    var sessionId = wx.getStorageSync('sessionId')
    wx.request({
      url: config.url + '/wx/addbusiness/' + that.data.projectid,
      data: {
        'hotqinsessionid': sessionId,
        'location': value.activity_location,
        'lat': that.data.activity_lat,
        'lng': that.data.activity_lng,
        'startDate': that.data.start_date,
        'endDate': that.data.end_date,
        'projecttitle': value.projecttitle,
        'drivername': value.drivername,
        'subsidy': value.subsidy,
        'carfare': value.carfare,
        'hotelfee': value.hotelfee,
        'projectid': that.data.projectid,
        'users': JSON.stringify(that.data.nameTag),
        'articleshow': this.data.articleshow,
        'app_version': 1,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.info == "SUCCESS") {
          wx.showToast({
            title: "新建活动成功",
            icon: 'success',
            duration: 1500
          })
          // wx.navigateBack({
          //   delta: 1
          // })
        } else {
          wx.showModal({
            title: '新建活动失败！',
            content: res.data.data,
          })
        }
        // console.log(res.data);
        // 点击确定后跳转登录页面并关闭当前页面
        // wx.redirectTo({//redirect不能跳转到tabar,没有返回按钮
        //   url: '../search/search'
        // })
        // wx.switchTab({
        //   // url: '/pages/manage/manage'
        //   url: '/pages/mine/mine'
        // })
      },
      fail: function (err) {
        wx.showToast({
          title: '活动写入失败',
        })
      }
    })
  },

  // 打开文章输入显示
  onDisplayArticle() {
    this.setData({
      articleshow: !this.data.articleshow
    });
  },

  // 选择多个日期
  onDisplay() {
    this.setData({
      show: true
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },

  // 选择多个日期
  // onConfirm(event) {
  //   console.log(event.detail)
  //   this.setData({
  //     show: false,
  //     date: `选择了 ${event.detail.length} 个日期`,
  //   });
  // },
  // 选择日期区间
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  },
  onConfirm(event) {
    const [start, end] = event.detail;
    // console.log(start);
    this.setData({
      show: false,
      date: `${this.formatDate(start)} - ${this.formatDate(end)}`,
      start_date: `${this.formatDate(start)}`,
      end_date: `${this.formatDate(end)}`
    });
  },

  // 可关闭标签
  onCloseTag(event) {
    // console.log(event)
    // console.log(event.target)
    // console.log(event.detail)不存在
    // let arr = this.data.nameTag;
    // console.log(this.data.nameTag)
    // console.log(arr.length)
    // console.log(this.data.nameTag.indexOf(event.target.id))
    // let i = this.data.nameTag.find((i) => {
    //   return i.index === event.target.id
    // })
    // console.log(i)
    // i.showtag = false
    // console.log(i)
    // console.log(this.data.nameTag)//这里已经将数组修改了

    /* ****下面这个function和上面箭头函数一样效果
    let i1=this.data.nameTag.find(function(value, index, arr) {
      return value.id === event.target.id;
    })
    console.log(i1) */
    // console.log(this.data.nameTag)
    // console.log(event.target.id - 1)
    // console.log(event.target.name)
    // ****下面这个用findindex方法获取数组位置，也是可以的
    let i2 = this.data.nameTag.findIndex(function (value, index, arr) {
      // console.log(value.index)
      return value.index == event.target.id; //“=”、“==”和“===”运算符。你应当理解这些（赋值、相等、恒等）运算符之间的区别
    })
    // console.log(i2)
    // this.data.nameTag[i2].showtag = false
    // ******findindex结束 

    //通过`index`识别要删除第几条数据，第二个数据为要删除的项目数量，通常为1
    this.data.nameTag.splice(i2, 1);
    //渲染数据
    // this.setData({
    //     list:this.data.list
    // });

    this.setData({
      // [`showtag.${event.target.id}`]: false,
      nameTag: this.data.nameTag
    })
  },

  // 输入姓名
  onChangeName(event) {
    // console.log(event.detail)
    // console.log(event.target)
    this.setData({
      newNameTag: event.detail
    })
  },

  // 姓名转标签
  addName(event) {
    // 判断是否重复
    // console.log(this.data.newNameTag)
    let i = this.data.nameTag.find((i) => {
      return i.name === this.data.newNameTag
    })
    // console.log(i)
    if (i) {
      wx.showToast({
        title: '重复',
        icon: 'none',
        duration: 2000
      })
      return
    }

    tagindex++;
    //要增加的数组
    var newarray = [{
      index: tagindex,
      name: this.data.newNameTag,
      showtag: true,
    }];
    this.setData({
      nameTag: this.data.nameTag.concat(newarray)
    });
    // console.log(this.data.nameTag)
  },

  // 富文本
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const {
      windowHeight,
      platform
    } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({
      editorHeight,
      keyboardHeight
    })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const {
      statusBarHeight,
      platform
    } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
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
      count: 1,
      success: function (res) {
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            id: 'abcd',
            role: 'god'
          },
          width: '80%',
          success: function () {
            console.log('insert image success')
          }
        })
      }
    })
  },
  // ***富文本结束
  handleTitleInput(e) {
    this.data.articletitle = e.detail.value
    // this.data.titleCount = value.length
    $digest(this)
  },

})