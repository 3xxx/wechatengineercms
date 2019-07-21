
var config = require('../../config.js');
var util = require('../../utils/util.js');
const app = getApp();
const conf = {
  data: {
    calendarConfig: {
      // multi: true,
      // inverse: 1, // 单选模式下是否可以取消选择
      // defaultDay: '2019-5-19'
      onlyShowCurrentMonth: 1
      // disablePastDay: 1
    },
    todoList: ['日', '一', '二', '三', '四', '五', '六'],
    addtell: {
      addtellHidden: true, //弹出框显示/隐藏
      datetime: '',
      contract_info1: '',
      contract_info2: '',
      contract_info3: '',
      contract_info4: '',
    },
    desc1: '',
    desc2: '',
    desc3: '',
    desc4: '',

  },
  onShow: function () {
    // initCalendar();
    this.setTodo();
  },

  setTodo() {
    //请求服务端，取得选定日期的信息
    var that = this
    var nowyear = util.formatYear(new Date());
    var nowmonth = util.formatMonth(new Date());
    wx.request({
      url: config.url + '/bbs/bbsgetbbs',
      method: 'GET',
      data: {
        year: nowyear,
        month: nowmonth,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (check_res) {
        // console.log(check_res.data.data[0])
        if (check_res.data.code == 1) {
          // location_check_res = false;
          const data = check_res.data.data;
          // 异步请求
          setTimeout(() => {
            that.calendar.setTodoLabels({
              // circle: true,
              pos: 'bottom', //top
              days: data
            });
          }, 1000);
        } else {
          wx.showToast({
            title: '出错！',//在前端处理？，不用后端处理
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
      },
    })
    // const data = [
    //   {
    //     year: '2019',
    //     month: '7',
    //     day: '15'
    //   },
    //   {
    //     year: 2019,
    //     month: 7,
    //     day: 18,
    //     todoText: '待办'
    //   }
    // ];

    // this.calendar.enableArea(['2019-7-7', '2019-7-28']);
  },
  afterTapDay(e) {
    // console.log('afterTapDay', e.detail);
    this.setData({
      currentSelectyear: e.detail.year,
      currentSelectmonth: e.detail.month,
      currentSelectday: e.detail.day,
    })
    //请求服务端，取得选定日期的信息
    var that = this
    wx.request({
      url: config.url + '/bbs/getbbs',
      method: 'GET',
      data: {
        year: that.data.currentSelectyear,
        month: that.data.currentSelectmonth,
        day: that.data.currentSelectday,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (check_res) {
        // console.log(check_res.data.data[0])
        // if (check_res.data.code == 1) {
        that.setData({
          addtell: {
            datetime: e.detail.year + '-' + e.detail.month + '-' + e.detail.day,
            contract_info1: check_res.data.data[0],
            contract_info2: check_res.data.data[1],
            contract_info3: check_res.data.data[2],
            contract_info4: check_res.data.data[3],
            addtellHidden: false,
          }
        })
        // console.log(check_res.data.data[0])
        // console.log(that.data.addtell.contract_info4)
        // 异步请求
        // setTimeout(() => {

        // }, 1000);
        // } else {
        //   wx.showToast({
        //     title: '出错！',//在前端处理？，不用后端处理
        //     icon: 'error',
        //     duration: 2000
        //   });
        // }
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
      },
    })

    // that.footAddtell(e.detail);
  },
  whenChangeMonth(e) {
    // console.log('whenChangeMonth', e.detail);
    //请求服务端，取得选定日期的信息
    var that = this

    wx.request({
      url: config.url + '/bbs/bbsgetbbs',
      method: 'GET',
      data: {
        year: e.detail.next.year,
        month: e.detail.next.month,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (check_res) {
        // console.log(check_res.data.data[0])
        if (check_res.data.code == 1) {
          // location_check_res = false;
          const data = check_res.data.data;
          // 异步请求
          setTimeout(() => {
            that.calendar.setTodoLabels({
              // circle: true,
              pos: 'bottom', //top
              days: data
            });
          }, 1000);
        } else {
          wx.showToast({
            title: '出错！',//在前端处理？，不用后端处理
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
      },
    })
  },
  onTapDay(e) {
    // console.log('onTapDay', e.detail);
  },
  afterCalendarRender(e) {
    // console.log('afterCalendarRender', e);
  },
  //打开弹出框
  footAddtell: function (e) {
    //请求服务端，取得选定日期的信息
    // var that = this
    // wx.request({
    //   url: config.url + '/bbs/getbbs',
    //   method: 'GET',
    //   data: {
    //     year: that.data.currentSelectyear,
    //     month: that.data.currentSelectmonth,
    //     day: that.data.currentSelectday,
    //   },
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   success: function (check_res) {
        // console.log(check_res.data.data[0])
        // if (check_res.data.code == 1) {
          this.setData({
            addtell: {
              datetime: e.year + '-' + e.month + '-' + e.day,
              // contract_info1: check_res.data.data[0],
              // contract_info2: check_res.data.data[1],
              // contract_info3: check_res.data.data[2],
              // contract_info4: check_res.data.data[3],
              addtellHidden: false,
            }
          })
          // console.log(check_res.data.data[0])
          // console.log(that.data.addtell.contract_info4)
          // 异步请求
          // setTimeout(() => {

          // }, 1000);
        // } else {
        //   wx.showToast({
        //     title: '出错！',//在前端处理？，不用后端处理
        //     icon: 'error',
        //     duration: 2000
        //   });
        // }
      // },
      // fail: function (res) {
      //   // console.log(res);
      //   wx.showToast({
      //     title: '获取数据失败',
      //     icon: 'error',
      //     duration: 2000
      //   });
      // },
    // })
  },
  //弹出框确认操作
  modalConfirm: function () {
    // 存入数据库。
    var sessionId = wx.getStorageSync('sessionId')
    var that = this
    wx.request({
      url: config.url + '/bbs/bbs',
      method: 'POST',
      data: {
        hotqinsessionid: sessionId,
        userId: app.globalData.user_id,

        year: that.data.currentSelectyear,
        month: that.data.currentSelectmonth,
        day: that.data.currentSelectday,
        desc1: that.data.desc1,
        desc2: that.data.desc2,
        desc3: that.data.desc3,
        desc4: that.data.desc4,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (check_res) {
        if (check_res.data.code == 1) {
          wx.showToast({
            title: '存入成功！',
            icon: 'success',
            duration: 2000
          });
          that.setData({
            addtell: {
              contract_info1: '',
              contract_info2: '',
              contract_info3: '',
              contract_info4: '',
              addtellHidden: true,
            }
          })
          //这里更新本月公告记录
          const data = []//check_res.data.data;
          data.push({ // 获取返回结果，放到mks数组中
            year: that.data.currentSelectyear,
            month: that.data.currentSelectmonth,
            day: that.data.currentSelectday,
          })

          // 异步请求
          setTimeout(() => {
            that.calendar.setTodoLabels({
              // circle: true,
              pos: 'bottom',
              days: data
            });
          }, 1000);

        } else {
          wx.showToast({
            title: '出错！',//在前端处理？，不用后端处理
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '公告写入失败',
          icon: 'error',
          duration: 2000
        });
      },
    })
  },
  //弹出框取消操作
  modalCancel: function () {
    this.setData({
      addtell: {
        contract_info1: '',
        contract_info2: '',
        contract_info3: '',
        contract_info4: '',
        addtellHidden: true,
      },
      error: true,
      value: '',
    })
    // this.setData({
    //   addtell: {
    //     addtellHidden: true,
    //   }
    // })
  },
  //保存input框的值
  // saveUsertell: function (e) {
  //   console.log(e.detail)
  //   this.setData({
  //     addtell: {
  //       contract_info1: e.detail.value,
  //       addtellHidden: false,
  //     }
  //   })
  // },
  onChange1(e) {
    // console.log('onChange1', e)
    this.setData({
      addtell: {
        contract_info1: e.detail.value,
        addtellHidden: false,
      },
      // error: isTel(e.detail.value),
      // value: e.detail.value,
      desc1: e.detail.value,
    })
  },
  onChange2(e) {
    // console.log('onChange2', e)
    this.setData({
      addtell: {
        contract_info2: e.detail.value,
        addtellHidden: false,
      },
      // error: isTel(e.detail.value),
      // value: e.detail.value,
      desc2: e.detail.value,
    })
  },
  onChange3(e) {
    // console.log('onChange3', e)
    this.setData({
      addtell: {
        contract_info3: e.detail.value,
        addtellHidden: false,
      },
      // error: isTel(e.detail.value),
      // value: e.detail.value,
      desc3: e.detail.value,
    })
  },
  onChange4(e) {
    // console.log('onChange4', e)
    this.setData({
      addtell: {
        contract_info4: e.detail.value,
        addtellHidden: false,
      },
      // error: isTel(e.detail.value),
      // value: e.detail.value,
      desc4: e.detail.value,
    })
  },
  onFocus(e) {
    // this.setData({
    //   error: isTel(e.detail.value),
    // })
    // console.log('onFocus', e)
  },
  onBlur(e) {
    // this.setData({
    //   error: isTel(e.detail.value),
    // })
    // console.log('onBlur', e)
  },
  onConfirm(e) {
    // console.log('onConfirm', e)
  },
  onClear(e) {
    // console.log('onClear', e)
    this.setData({
      addtell: {
        contract_info1: '',
        // addtellHidden: false,
      },
      error: true,
      value: '',
    })
  },
  onError() {
    wx.showModal({
      title: 'Please enter 11 digits',
      showCancel: !1,
    })
  },
  // form提交，未成功
  // formSubmit: function (e) {
  //   console.log('form发生了submit事件，携带数据为：', e.detail.value)
  // },
  // formReset: function () {
  //   console.log('form发生了reset事件')
  // }
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

  },
};
Page(conf);
