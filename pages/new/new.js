// pages/new/new.js
//引用腾讯地图API
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var location = "";
var config = require('../../config.js');
var util = require('../../utils/util.js');
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    start_date: "2019-05-01",
    end_date: "2019-05-02",
    checkboxItems: [
      { name: '拍照打卡', value: '1' },
      { name: '地点打卡', value: '2', checked: true },
      { name: '人脸打卡', value: '3' }
    ],
    activity_location: "",//address
    activity_lat: "",
    activity_lng: "",
    // address: "",
    isAdmin: false,
    hasLocation: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that= this
    if (!app.globalData.hasLocation) {
      // 获取位置
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          app.globalData.hasLocation = true
          that.setData({
            hasLocation: true
          })
        },
        fail: function (res) {
          // console.log(res)
        }
      })
    } else {
      that.setData({
        hasLocation: true,
        activity_location:app.globalData.activity_location
      })
    };

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
    if (!app.globalData.hasLocation) {
      // 获取位置
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {//实例化腾通地图sdk
          qqmapsdk = new QQMapWX({
            key: '?????' //这里自己的key秘钥进行填充
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
                // activity_location: res.result.address
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
        // activity_location: app.globalData.activity_location
      })
      // console.log(that.data.hasLocation)
      // console.log(that.data.activity_location)
      //}
      // that.setData({
      //   hasLocation: true,
      //   activity_location: app.data.activity_location
      // })
    };
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
      title: '珠三角设代plus',
      path: 'pages/new/new'
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
    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
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
        wx.navigateBack({
          delta: 1
        });
        //console.log(that.data.activity_location);
        // }
        //选择地点之后返回到原来页面
        // wx.navigateTo({
        //   url: "/pages/new/new?address=" + res.name
        // });
      },
      fail: function (err) {
        console.log(err)
      }
    });
  },

  formSubmit: function (e) {
    var ifPhoto = 0;
    var ifLocation = 0;
    var ifFace = 0;
    var value = e.detail.value
    var that = this;
    // 判断是否为空
    if ("" == util.trim(value.activity_name)) {
      // util.isError("活动名称不能为空", that);
      wx.showToast({
        title: "活动名称不能为空",
        icon: 'err',
        duration: 1500
      })
      return;
    } else {
      util.clearError(that);
    }
    // 判断内容是否为空
    if ("" == util.trim(value.activity_desc)) {
      // util.isError("内容不能为空", that);
      wx.showToast({
        title: "活动内容不能为空",
        icon: 'err',
        duration: 1500
      })
      return;
    } else {
      util.clearError(that);
    }
    // 判断定位是否为空
    if ("" == util.trim(value.activity_location)) {
      // util.isError("定位不能为空", that);
      wx.showToast({
        title: "定位不能为空",
        icon: 'err',
        duration: 1500
      })
      return;
    } else {
      util.clearError(that);
    }

    var types = value.checkin_types;
    // console.log(types.l);
    for (var i = 0; i < types.length; i++) {
      if (types[i] == 1) {
        ifPhoto = 1;
      }
      if (types[i] == 2) {
        ifLocation = 1;
      }
      if (types[i] == 3) {
        ifFace = 1;
      }
    }
    wx.request({
      url: config.url + '/checkin/activity/create',
      // url: 'http://localhost/v1/checkin/activity/create',
      // 这里增加允许打卡距离：不限制、数值
      data: {
        'createrId': app.globalData.user_id,
        'activity_name': value.activity_name,
        'activity_desc': value.activity_desc,
        'location': value.activity_location,
        'lat': app.data.activity_lat,
        'lng': app.data.activity_lng,
        'startDate': value.start_date,
        'endDate': value.end_date,
        'ifFace': ifFace,
        'ifPhoto': ifPhoto,
        'ifLocation': ifLocation
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({
          title: "新建活动成功",
          icon: 'success',
          duration: 1500
        })
        // console.log(res.data);
        // 点击确定后跳转登录页面并关闭当前页面
        // wx.redirectTo({//redirect不能跳转到tabar,没有返回按钮
        //   url: '../search/search'
        // })
        // wx.switchTab({
        //   // url: '/pages/manage/manage'
        //   url: '/pages/mine/mine'
        // })
      }
    })
  }
})