// pages/calendar/Calendar.js
import initCalendar, {
  switchView,
  setSelectedDays,
  getTodoLabels,
  setTodoLabels,
  getSelectedDay
} from '../../../component/calendar/main.js';
// var uploadFn = require('../../utils/upload.js');
var config = require('../../../config.js');
var util = require('../../../utils/util.js');
var distance = require('../../../utils/getdistance.js');
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.js');
// var qqmapsdk;
//腾讯地图Key
var qqmapsdk = new QQMapWX({
  key: 'EADBZ-QCZ6Q-FDK54-GBQ4X-QY5B5-CVFFZ'
});
const app = getApp();
// var photo_check_url = null;
// var photo_check_res = false;
// var location_check_res = false;
// var location_res = "等待验证";
// var face_check_res = false;
var activity_lat = null;
var activity_lng = null;
var activity_id = null;
// 切换为周视图
// switchView('week');

// 切换为月视图
// switchView();
// 或者
// switchView('month');
// import { setSelectedDays } from '../../component/calendar/main.js';
// const toSet = [
//   {
//     year: '2019',
//     month: '3',
//     day: '15'
//   },
//   {
//     year: 2019,
//     month: 3,
//     day: 18
//   }
// ]
// setSelectedDays(toSet);
// import { getTodoLabels } from '../../component/calendar/main.js';

// getTodoLabels();
// import { setTodoLabels } from '../../component/calendar/main.js';

// 待办事项中若有 todoText 字段，则会在待办日期下面显示指定文字，如自定义节日等。

// import { getSelectedDay } from '../../component/calendar/main.js';

// console.log(getSelectedDay());
// import initCalendar from '../../component/calendar/main.js';

const conf = {
  /**
   * 页面的初始数据
   */
  data: {
    calendarConfig: {
      // multi: true,
      // inverse: 1, // 单选模式下是否可以取消选择
      // defaultDay: '2019-5-19'
      onlyShowCurrentMonth: 1,
      // firstDayOfWeek: 'Mon'
      // disablePastDay: 1
    },
    // activity_title: "",
    activity_caption: "",
    photo: "../../../image/avator.jpg",
    location_res: "等待验证",
    // face_res: "等待验证",
    // face_disabled: false,
    // location_disabled: false,
    latitude: 0,//地图初次加载时的纬度坐标
    longitude: 0, //地图初次加载时的经度坐标
    activityId: "",
    // latitude: 23.099994,
    // longitude: 113.324520,
    // markers: [{
    //   id: 1,
    //   latitude: 23.099994,
    //   longitude: 113.324520,
    //   name: 'T.I.T 创意园'
    // }],
    // covers: [{
    //   latitude: 23.099994,
    //   longitude: 113.344520,
    //   iconPath: '/image/location.png'
    // }, {
    //   latitude: 23.099994,
    //   longitude: 113.304520,
    //   iconPath: '/image/location.png'
    // }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    var that = this
    // activity_id = options.activity_id;
    that.setData({
      activity_id: options.activity_id,
      activity_caption: options.activity_caption,
      latitude: app.globalData.activity_lat,
      longitude: app.globalData.activity_lng,
      markers: [{
        id: "1",
        latitude: app.globalData.activity_lat,
        longitude: app.globalData.activity_lng,
        width: 20,
        height: 20,
        iconPath: "/image/location.png"
      }],
    });
    if (app.globalData.photo) {
      that.setData({
        photo: app.globalData.photo,
      });
    }
    wx.request({
      url: config.url + '/checkin/activity/actInfo',
      // url: 'http://localhost/v1/checkin/activity/actInfo',
      data: {
        'id': that.data.activity_id//具体一个活动的id
      },
      method: 'POST',
      success: function (res) {
        activity_lng = res.data.infos[0].F_Lng;//数据库里的活动的经纬度
        activity_lat = res.data.infos[0].F_Lat;
      }
    });
  },

  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {
    // 为什么不在app.js里获取用户地址？为什么不在这个页面这里将地址固定？——如果用户在车上打开，移动到其他地方呢，所以，打卡前获取地址是对的。
    var that = this
    wx.getLocation({
      type: 'gcj02',//wgs84',
      success: function (res) {
        //实例化腾通地图sdk
        // qqmapsdk = new QQMapWX({
        //   key: 'EADBZ-QCZ6Q-FDK54-GBQ4X-QY5B5-CVFFZ' //这里自己的key秘钥进行填充
        // });
        // console.log(res)
        var latitude1 = res.latitude
        // console.log(res.latitude)同样代码，显示的坐标不同
        var longitude1 = res.longitude
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude1,
            longitude: longitude1
          },
          success: function (res) {
            // console.log(res.result.location.lat)这里和上面差不多
            // console.log(res)
            // console.log(res.location.lat)
            that.setData({
              latitude: res.result.location.lat,
              longitude: res.result.location.lng,
              markers: [{
                id: "1",
                latitude: res.result.location.lat,
                longitude: res.result.location.lng,
                width: 20,
                height: 20,
                iconPath: "/image/location.png"
              }],
            });
          },
          fail: function (res) {
            console.log(res)
          }
        });
      },
    })
    this.mapCtx = wx.createMapContext('myMap')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    // 这里取出当月个人用户打卡记录
    // var time = util.formatTime(new Date());
    // console.log(that.data.activity_id)
    var nowyear = util.formatYear(new Date());
    var nowmonth = util.formatMonth(new Date());
    // console.log(nowyear)
    // console.log(nowmonth)
    wx.request({
      url: config.url + '/checkin/checkgetcheck',
      method: 'GET',
      data: {
        userId: app.globalData.user_id,
        activityId: that.data.activity_id,
        year: nowyear,
        month: nowmonth,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (check_res) {
        if (check_res.data.code == 1) {
          // location_check_res = false;
          const data = check_res.data.data;
          // 异步请求
          setTimeout(() => {
            setTodoLabels({
              circle: true,
              days: data
            });
          }, 1000);
        } else {
          wx.showToast({
            title: '查询打卡记录出错！',
            icon: 'success',
            duration: 2000
          });
        }
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '查询失败！',
          icon: 'none',
          duration: 2000
        });
      },
    })
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
    // console.log(this.data.activity_id)
    return {
      title: '珠三角设代plus',
      path: 'packageA/pages/calendar/calendar?activity_id=' + this.data.activity_id + '&activity_caption=' + this.data.activity_caption
    }
  },

  /**
 * 点击上传打卡照片时，进行图片签到
 */
  photoCheck: function () {
    var that = this;
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var filePath = res.tempFilePaths[0];
        // var fileName = filePath.match(/http.{7}(.*)/);
        // fileName = fileName[1];
        // var fileName = Date.parse(new Date()) + '.jpg';
        var sessionId = wx.getStorageSync('sessionId');
        wx.uploadFile({
          url: config.url + '/wx/uploadwxavatar',
          filePath: filePath,
          name: 'file',
          header: {
            'content-type': 'application/json'
          },
          formData: {
            hotqinsessionid: sessionId,
          },
          success: function (res) {
            // var obj = JSON.parse(res.data);坑：返回是string，如果要变成json，就用这句！！！
            that.setData({
              photo: res.data
            })
            // console.log(res.data)
            wx.setStorage({
              key: "photo",
              data: res.data
            })
            app.globalData.photo = res.data
          },
          fail: function (e) {
            console.log('e', e)
          }
        })
      },
    })
  },
  /**
 * 点击人脸验证，进行人脸签到
 * api_key face++的人脸对比接口key
 * api_secret face++的人脸对比接口secret
 * image_url2 第二张人脸的照片
 */
  faceCheck: function () {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var avator_url = app.globalData.avator_url;
        console.log('本地照片地址', avator_url);
        if (avator_url == '') {
          wx.showToast({
            title: '请绑定照片',
            duration: 1000
          })
        } else {
          var tempFilePaths = res.tempFilePaths
          wx.uploadFile({
            // url: 'https://api-cn.faceplusplus.com/facepp/v3/compare', //仅为示例，非真实的接口地址
            url: 'http://localhost/v1/checkin/check/compare',
            filePath: tempFilePaths[0],
            name: 'image_file1',
            formData: {
              'api_key': '',
              'api_secret': '',
              'image_url2': avator_url
            },
            success: function (res) {
              console.log(res.data);
              var obj = JSON.parse(res.data);
              console.log(obj.confidence);
              if (obj.confidence >= 50) {
                face_check_res = true;
                that.setData({
                  face_res: '上传成功'
                })
              } else if (obj.confidence < 50) {
                that.setData({
                  face_res: '上传失败'
                })
              } else {
                wx.showToast({
                  title: 'API并发控制',
                  duration: 1000
                })
              }
            }
          })
        }

      }
    })
  },

  afterTapDay(e) {
    var that = this;
    //获取点击的day有无打卡记录
    // console.log(getTodoLabels());
    // var checkinbool = false
    // for (let i = 0; i < getTodoLabels().length; ++i) {
    //   if (getTodoLabels()[i].year == currentSelect.year && getTodoLabels()[i].month == currentSelect.month && getTodoLabels()[i].day == currentSelect.day) {
    //     wx.showToast({
    //       title: '您已打过卡~',
    //       icon: 'error',
    //       duration: 2000
    //     });
    //     checkinbool = true
    //   }
    // }
    var nowyear = util.formatYear(new Date());
    var nowmonth = util.formatMonth(new Date());
    var nowday = util.formatDay(new Date());

    if (nowday != '28') {
      // console.log(currentSelect.day)
      if (nowyear != e.detail.year || nowmonth != e.detail.month || nowday != e.detail.day) {
        wx.showToast({
          title: '只能打开当天！',
          icon: 'success',
          duration: 2000
        });
        return;
      }
    }
    // 点击日期进行位置打卡，来自checkin.js
    // if (!checkinbool) {
    if (!e.detail.hasTodo) {
      wx.getLocation({
        success: function (res) {
          // console.log(res.latitude)
          var p1 = {
            lat: res.latitude,
            lng: res.longitude
          };
          var p2 = {
            lat: activity_lat,//数据库里的活动的经纬度
            lng: activity_lng
          };
          // console.log(p1, p2);
          qqmapsdk.calculateDistance({
            to: [{
              latitude: p1.lat,
              longitude: p1.lng
            }],
            from: {
              latitude: p2.lat,
              longitude: p2.lng
            },
            success: function (res) {
              var dis = res.result.elements[0].distance;
              // console.log(app.globalData.user_id)
              // 设置打卡距离
              if (dis >= 1000 || dis <= 1000) {
                // location_check_res = true;
                // that.setData({
                //   location_res: "验证成功"
                // });
                // 存入数据库打卡信息，距离，目标位置（没必要），实际用户位置。
                var sessionId = wx.getStorageSync('sessionId')
                wx.request({
                  url: config.url + '/checkin/check',
                  method: 'POST',
                  data: {
                    hotqinsessionid: sessionId,
                    userId: app.globalData.user_id,
                    activityId: that.data.activity_id,
                    // 打卡地址
                    lat: p1.lat,
                    lng: p1.lng,
                    year: e.detail.year,
                    month: e.detail.month,
                    day: e.detail.day,
                    // 'photoUrl': photo_check_url
                  },
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function (check_res) {
                    if (check_res.data.code == 1) {
                      // wx.navigateBack({
                      // delta: 2
                      // });
                      // photo_check_res = false;
                      // face_check_res = false;
                      // location_check_res = false;
                      // location_res="打卡成功";
                      wx.showToast({
                        title: '打卡成功！',
                        icon: 'success',
                        duration: 2000
                      });
                      //这里更新本月打卡记录
                      const data = []//check_res.data.data;
                      data.push({ // 获取返回结果，放到mks数组中
                        year: e.detail.year,
                        month: e.detail.month,
                        day: e.detail.day,
                      })

                      // 异步请求
                      setTimeout(() => {
                        setTodoLabels({
                          circle: true,
                          days: data
                        });
                      }, 1000);
                    } else {
                      wx.showToast({
                        title: '您已经打过卡！',//在前端处理？，不用后端处理
                        icon: 'error',
                        duration: 2000
                      });
                    }
                  },
                  fail: function (res) {
                    // console.log(res);
                    wx.showToast({
                      title: '打卡写入失败',
                      icon: 'error',
                      duration: 2000
                    });
                  },
                })
              } else {
                // location_check_res = false;
                // that.setData({
                //   location_res: "验证失败"
                // });
                // that.data.location_res= "验证失败"
                wx.showToast({
                  title: '距离超出打卡范围',
                  icon: 'error',
                  duration: 2000
                })
              }
              // console.log(res.result.elements[0].distance);
              // console.log(res);
            },
            fail: function (res) {
              // console.log(res);
              wx.showToast({
                title: '计算打卡距离失败',
                icon: 'error',
                duration: 2000
              })
            },
          })
        },
        fail: function (res) {
          // console.log(res);
          wx.showToast({
            title: '获取位置失败',
            icon: 'none',
            duration: 2000
          })
        },
      })
    } else {
      wx.showToast({
        title: '您已打过卡~',
        icon: 'error',
        duration: 2000
      });
    }
  },
  /**
   * 当改变月份时触发
   * @param { object } current 当前年月
   * @param { object } next 切换后的年月
   */
  whenChangeMonth(e) {
    var that = this
    // console.log('当前年月', current);
    // console.log('切换后的年月', next);
    // 这里取出切换后当月的打卡记录
    wx.request({
      url: config.url + '/checkin/checkgetcheck',
      method: 'GET',
      data: {
        userId: app.globalData.user_id,
        activityId: that.data.activity_id,
        year: e.detail.next.year,
        month: e.detail.next.month,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (check_res) {
        if (check_res.data.code == 1) {
          // location_check_res = false;
          const data = check_res.data.data;
          // 异步请求
          setTimeout(() => {
            setTodoLabels({
              circle: true,
              days: data
            });
          }, 1000);
        } else {
          wx.showToast({
            title: '查询打卡记录出错！',
            icon: 'success',
            duration: 2000
          });
        }
      },
      fail: function (res) {
        // console.log(res);
        wx.showToast({
          title: '查询失败！',
          icon: 'none',
          duration: 2000
        });
      },
    })
    // getget()这里面无法调用方法
    // that.getget()
  },

  /**
   * 日历初次渲染完成后触发事件，如设置事件标记
   * @param { object } ctx 当前页面实例
   */
  afterCalendarRender(ctx) {
    // 这里接受onload里的options参数来不及，获取不到！！！
  }
};
// initCalendar(conf);
Page(conf);