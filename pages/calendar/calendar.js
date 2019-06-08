// pages/calendar/Calendar.js
import initCalendar, {
  switchView,
  setSelectedDays,
  getTodoLabels,
  setTodoLabels,
  getSelectedDay
} from '../../component/calendar/main.js';

// var uploadFn = require('../../utils/upload.js');
var config = require('../../config.js');
var util = require('../../utils/util.js');
var distance = require('../../utils/getdistance.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
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
  // multi: true, // 是否开启多选,
  // disablePastDay: true, // 是否禁选过去的日期
  /**
   * 初始化日历时指定默认选中日期，如：'2018-3-6' 或 '2018-03-06'
   * 注意：若想初始化时不默认选中当天，则将该值配置为除 undefined 以外的其他非值即可，如：空字符串, 0 ,false等。
  */
  // defaultDay: '2018-3-6', // 初始化后是否默认选中指定日期
  noDefault: true, // 初始化后是否自动选中当天日期，优先级高于defaultDay配置，两者请勿一起配置
  /**
   * 选择日期后执行的事件
   * @param { object } currentSelect 当前点击的日期
   * @param { array } allSelectedDays 选择的所有日期（当mulit为true时，才有allSelectedDays参数）
   */
  afterTapDay: (currentSelect, allSelectedDays) => {
    // console.log('===============================');
    // console.log('当前点击的日期', currentSelect);
    // console.log(
    // '当前点击的日期是否有事件标记: ',
    // currentSelect.hasTodo || false
    // );
    // allSelectedDays && console.log('选择的所有日期', allSelectedDays);
    // console.log('getSelectedDay方法', getSelectedDay());
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
    console.log(nowyear)
    console.log(nowmonth)
    console.log(nowday)

    if (nowday != '28') {
      console.log(currentSelect.day)
      if (nowyear != currentSelect.year || nowmonth != currentSelect.month || nowday != currentSelect.day) {
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
    if (!currentSelect.hasTodo) {
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
                    activityId: activity_id,
                    // 打卡地址
                    lat: p1.lat,
                    lng: p1.lng,
                    year: currentSelect.year,
                    month: currentSelect.month,
                    day: currentSelect.day,
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
                        year: currentSelect.year,
                        month: currentSelect.month,
                        day: currentSelect.day,
                      })
                      
                      // 异步请求
                      setTimeout(() => {
                        setTodoLabels({
                          circle: true,
                          days: data
                        });
                      }, 1000);
                      // wx.request({
                      //   url: config.url + '/checkin/checkgetcheck',
                      //   method: 'GET',
                      //   data: {
                      //     userId: app.globalData.user_id,
                      //     activityId: activity_id,
                      //     year: currentSelect.year,
                      //     month: currentSelect.month,
                      //   },
                      //   header: {
                      //     'content-type': 'application/x-www-form-urlencoded'
                      //   },
                      //   success: function (check_res) {
                      //     if (check_res.data.code == 1) {
                      //       location_check_res = false;
                      //       const data = check_res.data.data;
                      //       // 异步请求
                      //       setTimeout(() => {
                      //         setTodoLabels({
                      //           circle: true,
                      //           days: data
                      //         });
                      //       }, 1000);
                      //     }
                      //   },
                      // })
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
  whenChangeMonth: (current, next) => {
    // console.log('当前年月', current);
    // console.log('切换后的年月', next);
    // 这里取出切换后当月的打卡记录
    wx.request({
      url: config.url + '/checkin/checkgetcheck',
      method: 'GET',
      data: {
        userId: app.globalData.user_id,
        activityId: activity_id,
        year: next.year,
        month: next.month,
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

  // getget() {
  //   console.log("conf里调用我")
  // },
  /**
   * 日期点击事件（此事件会完全接管点击事件）
   * @param { object } currentSelect 当前点击的日期
   * @param { object } event 日期点击事件对象
   */
  // onTapDay(currentSelect, event) { },
  /**
   * 日历初次渲染完成后触发事件，如设置事件标记
   * @param { object } ctx 当前页面实例
   */
  afterCalendarRender(ctx) {
    // 这里取出当月个人用户打卡记录
    // var time = util.formatTime(new Date());
    // console.log(time)
    var nowyear = util.formatYear(new Date());
    var nowmonth = util.formatMonth(new Date());
    // console.log(nowyear)
    // console.log(nowmonth)
    wx.request({
      url: config.url + '/checkin/checkgetcheck',
      method: 'GET',
      data: {
        userId: app.globalData.user_id,
        activityId: activity_id,
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
    // const data = [
    //   {
    //     year: '2019',
    //     month: '3',
    //     day: '15'
    //   },
    //   {
    //     year: 2019,
    //     month: 3,
    //     day: 18,
    //     todoText: '待办'
    //   }
    // ];
    // 异步请求
    // setTimeout(() => {
    //   setTodoLabels({
    //     circle: true,
    //     days: data
    //   });
    // }, 1000);
    // enableArea(['2018-10-7', '2018-10-28']);
  }
}

// initCalendar(conf);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // activity_title: "",
    activity_caption: "",
    photo: "../../image/avator.jpg",
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

    activity_id = options.activity_id;
    this.setData({
      activity_caption: options.activity_caption
    })
    // console.log(this.data.activity_caption);
    initCalendar(conf);
    // setTodoLabels({
    //   // 待办点标记设置
    //   pos: 'bottom', // 待办点标记位置 ['top', 'bottom']
    //   dotColor: '#40', // 待办点标记颜色
    //   // 待办圆圈标记设置（如圆圈标记已签到日期），该设置与点标记设置互斥
    //   circle: true, // 待办
    //   days: [{
    //     year: 2018,
    //     month: 1,
    //     day: 1,
    //     todoText: '待办'
    //   }, {
    //     year: 2018,
    //     month: 5,
    //     day: 15,
    //   }],
    // });
    // 实例化API核心类
    // qqmapsdk = new QQMapWX({
    //   key: 'EADBZ-QCZ6Q-FDK54-GBQ4X-QY5B5-CVFFZ'
    // });
    // this.moveToLocation();

    // var that = this;
    // wx.getLocation({
    //   type: 'wgs84',
    //   success: function (res) {
    //     //实例化腾通地图sdk
    //     qqmapsdk = new QQMapWX({
    //       key: 'EADBZ-QCZ6Q-FDK54-GBQ4X-QY5B5-CVFFZ' //这里自己的key秘钥进行填充
    //     });
    //     // console.log(res)
    //     var latitude1 = res.latitude
    //     var longitude1 = res.longitude

    //     qqmapsdk.reverseGeocoder({
    //       location: {
    //         latitude: latitude1,
    //         longitude: longitude1
    //       },
    //       success: function (res) {
    //         that.setData({
    //           latitude: res.result.location.lat,
    //           longitude: res.result.location.lng,
    //           markers: [{
    //             id: "1",
    //             latitude: res.result.location.lat,
    //             longitude: res.result.location.lng,
    //             width: 20,
    //             height: 20,
    //             iconPath: "/image/location.png"
    //           }],
    //         });
    //       },
    //       fail: function (res) {
    //         console.log(res)
    //       }
    //     });
    //   },
    // })
    // 保留，从app.js里获取位置，避免重复
    // console.log(app.globalData.activity_lat)
    this.setData({
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
    if (app.globalData.photo){
      this.setData({
        photo: app.globalData.photo,
      });
    }
    // console.log(app.data.activity_lat)
    // that.setData({
    //   latitude: res.latitude,
    //   longitude: res.longitude,
    //   markers: [{
    //     id: "1",
    //     latitude: res.latitude,
    //     longitude: res.longitude,
    //     width: 20,
    //     height: 20,
    //     iconPath: "/resources/img/ic_marker.png"
    //   }],
    // })

    // 页面接受上一个页面（search）传来的活动activityId
    // var that = this;
    // console.log('点击打卡', photo_check_res, location_check_res)
    // activity_lat = options.lat;
    // activity_lng = options.lng;

    // if (options.face == 0) {
    //   face_check_res = true;
    // }
    // if (options.location == 0) {
    //   location_check_res = true;
    // }
    // console.log(options.face, options.location);
    // that.setData({
    //   activity_title: options.title,
    //   face_disabled: options.face == 0 ? true : false,
    //   location_disabled: options.location == 0 ? true : false
    // });
    wx.request({
      url: config.url + '/checkin/activity/actInfo',
      // url: 'http://localhost/v1/checkin/activity/actInfo',
      data: {
        'id': activity_id//具体一个活动的id
      },
      method: 'POST',
      success: function (res) {
        // that.setData({
        //   activity_info: res.data
        // })
        // console.log(res.data.infos[0].F_Lng);
        activity_lng = res.data.infos[0].F_Lng;//数据库里的活动的经纬度
        activity_lat = res.data.infos[0].F_Lat;
        // face = res.data.infos[0].F_IfFace;
        // location = res.data.infos[0].F_IfLocation;
      }
    });
    // wx.request({
    //   url: config.url + '/checkin/checkgetcheck',
    //   method: 'GET',
    //   data: {
    //     userId: app.globalData.user_id,
    //     activityId: activity_id,
    //     year: next.year,
    //     month: next.month,
    //   },
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   success: function (check_res) {
    //     if (check_res.data.code == 1) {
    //       location_check_res = false;
    //       const data = check_res.data.data;
    //       // 异步请求
    //       setTimeout(() => {
    //         setTodoLabels({
    //           circle: true,
    //           days: data
    //         });
    //       }, 1000);
    //     } else {
    //       wx.showToast({
    //         title: '查询打卡记录出错！',
    //         icon: 'success',
    //         duration: 2000
    //       });
    //     }
    //   },
    //   fail: function (res) {
    //     console.log(res);
    //     wx.showToast({
    //       title: '查询失败！',
    //       icon: 'none',
    //       duration: 2000
    //     });
    //   },
    // })
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
            console.log(res.data)
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
})