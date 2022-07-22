// components/myCamera/myCamera.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 控制相机页面显示隐藏
    cameraShow:false,
    // 控制拍摄完成图片页面显示隐藏
    pictureShow:false,
    // 成功的回调函数
    success:false,
    // 最终需要执行的回调函数 某一些textarea等原生组件可能会在camera之上 需要在使用之前对其进行隐藏操作 在之后进行还原操作(组件之内难以解决)
    complete:false,

    // 当前时间
    currentTime: '暂无数据～',
    // 当前项目
    projectName: '暂无数据～',
    // 定时器一秒钟更新一次当前时间
    timer: false,
    // 时间戳 为了保持canvas id唯一
    timestamp: '-1',
    // 控制是否可以使用图片
    // canUse: true,
    // 临时相机拍下的照片所存的路径
    tempPicturePath: '',

    // 横屏竖屏相关参数
    // 竖屏幕
    // portrait:true,
    portrait:false,
    // 横屏幕
    landscape:true,
    // landscape:false,

    // 屏幕右偏还是左偏
    // 是否右偏
    Gamma:true,
    
    district:'暂无地址信息',

    // 更新设备方向 节流变量
    motionTimer: false
  },
  // 组件生命周期
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      var that = this
      // 创建相机
      that.ctx = wx.createCameraContext()
      // 拿到项目名称
      wx.getSystemInfo({
        success: (result) => {
          console.log('getSystemInfo',result.system.indexOf('iOS'))
          if(!~result.system.indexOf('iOS')){
            this.setData({
              system:'Android'
            })
          }else{
            this.setData({
              system:'iOS'
            })
          }
        },
      })
      console.log('水印相机加载....')
      wx.getStorageSync('project_name') && this.setData({
        projectName: wx.getStorageSync('project_name')
      })

    },
    moved:function(){
      console.log('水印相机moved')
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
      // 取消
      console.log('水印相机卸载....')
      var that = this
      that.stopTimer(that)
      that.stopDeviceListening()
    },
  },
  // 组件页面生命周期
  pageLifetimes:{
    show: () => {
      console.log('组件相机页面show')
    },
    hide: () => {
      console.log('组件相机页面hide')
    },
    resize:() => {
      console.log('组件相机页面resize')
    }
  },
  observers:{
    'cameraShow':async function(cameraShow){
      var that = this
      // 初始化相机权限
      var hasPermission = false
      cameraShow && await that.getPermission(that,'camera')
      .then(r => {
        // 获取相机权限结果
        hasPermission = r
        //  授权成功也需要重新进入
      })
      .catch( r => {
        console.log('获取权限失败')
        that.cancel(null,that)
      })
      
      
      // 获取位置权限
      var hasLocationPermission = false
      hasPermission && await that.getPermission(that,'userLocation')
      .then(r => {
        // 获取相机权限结果
        hasLocationPermission = r
      })
      .catch( r => {
        console.log('获取权限失败')
        that.cancel(null,that)
      })
      
      console.log('获取相机定位权限',cameraShow,hasPermission,hasLocationPermission)

      // 获取地址
      hasLocationPermission && await that.getLocation()
      console.log('获取完地址',this.data.district)

      // 如果有权限则开启设备监听
      if(cameraShow && hasPermission && hasLocationPermission){
        // 开启定时器
        that.beginTimer(that)
        // 开始监听设备方向
        that.startDeviceListening(that)

        // 尝试选择页面上的text原生组件
        // const query = wx.createSelectorQuery().in(that)
        // query.selectAll('.myTextarea')
        // .fields({node:true,properties:['placeholder']})
        // .exec((res) => {
        //   console.log('尝试选择页面上的text原生组件',res,res[0][0].placeholder)
        //   res[0][0].placeholder = ''
        // })

      }else {
        // 关闭定时器
        that.stopTimer(that)
        // 关闭监听设备方向
        that.stopDeviceListening()
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 相机取消方法
     * @param {*} that 
     * @param event e 这个玩意为了在页面上直接写 而不把that覆盖掉
     */
    cancel: function ( e ,that = this) {
      console.log(that)
      console.log('cancel点击')
      // 重制数据
      that.setData({
        cameraShow: false,
        pictureShow:false,
        success:false,
        // canUse:false,
      })
      if (that.data.success) {
        that.data.success({
          success: false,
          picturePath: [],
        })
      }
      // 停用计时器
      that.stopTimer(that)
      // 停用监听设备方向
      that.stopDeviceListening()

      // 最终执行的effect方法
      that.data.complete && that.data.complete()
    },
    /**
     * 开始监听设备方向
     * @param that this
     *  */ 
    startDeviceListening:function(that = this){
      wx.startDeviceMotionListening({
        interval: 'normal',
        success:function(e){
          wx.onDeviceMotionChange((result) => {
            if(that.data.motionTimer) return 
            that.setData({
              motionTimer:setTimeout(() => {
                console.log('获取手机方向数据',result)
                if(result.beta > 45 || result.beta < -45){
                  // console.log('竖屏')
                  that.setData({
                    portrait:true,
                    landscape:false,
                  })
                }else{
                  that.setData({
                    portrait:false,
                    landscape:true,
                  })
                }
                if(result.gamma < 0 ){
                  // console.log('竖屏')
                  // 左偏为负数
                  that.setData({
                    Gamma:that.data.system == 'iOS' ? false : true,
                  })
                }else{
                  // 右偏为正数
                  that.setData({
                    Gamma:that.data.system == 'iOS' ? true : false,
                  })
                }
                that.setData({
                  motionTimer: false
                })
              },500)
            })

          })
        },
        fail:function(e){
          console.log('重新调用手机方向失败',e)
          wx.showToast({
            title: '获取方向失败',
            icon:'error'
          })
        }
      })
    },
    // 取消监听函数
    stopDeviceListening:function(){
        // 取消监听
        wx.offDeviceMotionChange()
        wx.stopDeviceMotionListening({
          success: (res) => {
            console.log('关闭手机方向监听',res)
          },
        })
    },
    /**
     * 点击拍照按钮
     * 
     */
    take: function () {
      wx.showLoading({
        title: '数据处理中...',
        mask: true
      })
      var that = this
      // // 创建相机
      // that.ctx = wx.createCameraContext()
      that.ctx.takePhoto({
        quality: 'high',
        success: async (res) => {
          // wx.setStorage({
          //   key: 'mycamera_originalImagePath',
          //   data: res.tempImagePath,
          // })
          await that.setData({
            tempPicturePath: res.tempImagePath,
            cameraShow: false,
            pictureShow: true
          })

          //停用监听 
          that.stopTimer(that)
          await that.stopDeviceListening()
          // 绘制的过程中最好不能有 监听进程存在
          // 生成canvas
          setTimeout(() => that.getCanvas(res.tempImagePath, that),500)
        }
      })
    },
    /**
     * 照片界面返回相机
     */
    reTake: function () {
      this.setData({
        cameraShow: true,
        pictureShow: false,
      })
      // this.beginTimer(this)
      // this.startDeviceListening(this)
    },
    /**
     * 使用照片点击函数
     * @param {*} func 
     */
    usePicture: function (func) {
      var that = this
      console.log('return2Picture返回数据')

      if (this.data.success) {
        that.data.success({
          success: true,
          picturePath: [this.data.result]
        })
      }

      // 执行退出入口
      that.cancel(null,that)

    },

    /**
     * 外界使用的方法 只需写一个回调函数
     * @param {object} params  brforeCreate:开始前需要执行的函数 success:成功接受数据的函数 complete:完成之后无论成功与否的函数
     * @returns 
     */
    takePhoto: function (params) {
      if (!params) { return }
      console.log('takePhoto', params)
      let { brforeCreate,success,complete } = params
      
      var func = () => {
        console.log('无默认方法传入')
      }
      // 生命周期之前执行的函数
      brforeCreate && brforeCreate()

      this.setData({
        cameraShow: true,
        brforeCreate:brforeCreate || func,
        success: success || func,
        complete:complete || func,
      })
    },

    /**
     * 获取canvas 并且绘制图片
     * @param {string} path 
     * @returns
     */
    getCanvas: function (path, that) {
      console.log('获取canvas 并且绘制功能', path, "image-canvas" + that.data.timestamp,)
      wx.getSystemInfo({
        success: async function (res) {
          var width = res.windowWidth
          var height = res.windowHeight
          var gap = 40
          await that.setData({
            width: width,
            height: height,
            gap: gap
          })
          wx.getImageInfo({
            src: path,
            success: function (res) {
              console.log('getImageInfo', res, that)
              // that.canvas = null
              // if (!that.canvas) {
              //   that.canvas = wx.createCanvasContext("image-canvas" + that.data.timestamp, that)
              // }
              that.canvas = wx.createCanvasContext("image-canvas", that)
              // that.canvas.save()
              that.canvas.beginPath()
              // that.canvas.arc(50, 50, 25, 0, 2*Math.PI)
              that.canvas.rect(0, 0, that.data.width, that.data.height * .8)
              that.canvas.clip()

              that.canvas.drawImage(path, 0, 0, that.data.width / 1, that.data.height  / 1)
              // 竖屏拍摄文字
              if(that.data.portrait) {
                that.canvas.setFillStyle('rgba(0, 0, 0,.3)')
                // that.canvas.fillRect(20, that.data.height - 235, 280, 60)
                that.canvas.fillRect(20, that.data.height * .8 - 70, 280, 60)

                that.canvas.setFontSize(16);
                that.canvas.setFillStyle('#fff');
                that.canvas.setFontSize(16);
                that.canvas.setFillStyle('#fff');
                // that.canvas.fillText(`拍摄地址：${that.data.district}`, 20, that.data.height - 220)
                // that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, 20, that.data.height - 200)
                // that.canvas.fillText(`项目名称：${that.data.projectName}`, 20, that.data.height - 180)
                that.canvas.fillText(`拍摄地址：${that.data.district}`, 20, that.data.height * .8 - 70 + 15)
                that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, 20, that.data.height * .8 - 70 + 35)
                that.canvas.fillText(`项目名称：${that.data.projectName}`, 20, that.data.height * .8 - 70 + 55)

              }else{
                // if(that.data.landscape)
                // 横屏拍摄文字
                if(!that.data.Gamma){
                  that.canvas.setFillStyle('rgba(0, 0, 0,.3)')
                  that.canvas.fillRect(6, 15, 60, 280)
  
                  that.canvas.setFontSize(16);
                  that.canvas.setFillStyle('#fff');
                  that.canvas.setFontSize(16);
                  that.canvas.setFillStyle('#fff');
  
                  that.canvas.rotate(Math.PI * 180 / 360)
                  that.canvas.fillText(`拍摄地址：${that.data.district}`, 20, -50)
                  that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, 20, -30)
                  that.canvas.fillText(`项目名称：${that.data.projectName}`, 20, -10)
                }else{
                  that.canvas.setFillStyle('rgba(0, 0, 0,.3)')
                  console.log('debugger',that.data.height,that.data.width - 80)
                  that.canvas.fillRect(that.data.width - 80, 15, 70, 280)

                  that.canvas.setFontSize(16);
                  that.canvas.setFillStyle('#fff');
                  that.canvas.setFontSize(16);
                  that.canvas.setFillStyle('#fff');
                  // 转换原点 
                  that.canvas.translate(that.data.width-20, 290)
                  that.canvas.rotate(Math.PI * -180 / 360)
                  // that.canvas.fillText(`拍摄地址：${that.data.district}`, -(that.data.width - 120 ), that.data.height - 454)
                  // that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, -(that.data.width - 120 ), that.data.height - 434)
                  // that.canvas.fillText(`项目名称：${that.data.projectName}`, -(that.data.width - 120 ), that.data.height - 414)
                  that.canvas.fillText(`拍摄地址：${that.data.district}`, 0, -40)
                  that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, 0, -20)
                  that.canvas.fillText(`项目名称：${that.data.projectName}`, 0, 0)
                }
              }

              // 绘制画布
              // setTimeout 写在draw 里面是没用的 暂时只能靠增加时间
              that.canvas.draw(false,
                () => setTimeout(function () {
                  var id = "image-canvas"
                  console.log('id', id)
                  wx.canvasToTempFilePath({ //裁剪对参数
                    canvasId: id,
                    x: 0, //画布x轴起点
                    y: 0, //画布y轴起点
                    width: that.data.width, //画布宽度
                    height: that.data.height * .8, //画布高度
                    destWidth: that.data.width, //输出图片宽度
                    destHeight: that.data.height * .8, //输出图片高度
                    success: function (res) {
                      that.filePath = res.tempFilePath
                      //清除画布上在该矩形区域内的内容。
                      console.log(res.tempFilePath)
                      that.setData({
                        result: res.tempFilePath
                      })
                      wx.hideLoading()
                      wx.showToast({
                        title: '生成图片完成',
                        icon:'success',
                        duration:1000
                      })
                      //在此可进行网络请求
                    },
                    fail: function (e) {
                      console.log('保存图片出错', e)
                      
                      wx.hideLoading()
                      wx.showToast({
                        title: '请重新拍照',
                        icon:'error',
                        duration:2000,
                        success:()=>{
                          that.reTake()
                        }
                      })

                    }
                  }, that);
                }, 500)      
              )
              // wx.showLoading({
              //   title:'数据处理中2..'
              // })
              // 这个地方setTimeout 不一定能保证绘制成功

            }
          })
        }
      })
    },
    /**
     * 是否拥有摄像头权限
     * @param {*} that this
     * @param {string} type 需要获取权限的类型
     * @returns Promise
     */
    getPermission: function(that,type='camera'){
      var typeMap = {
        camera:'摄像头',
        userLocation:'位置'
      }
      // var res = false
      return new Promise((resolve,reject) => {
        wx.getSetting({
          success:(res)=> {
            console.log('获取权限',res)
            if (!res.authSetting[`scope.${type}`]) {
              wx.authorize({
                scope: `scope.${type}`,
                success :() => {
                  console.log(`拥有${type}权限`)
                  // res = true
                  resolve(true)
                },
                fail:()=>{
                  console.log(`认证${type}权限失败`)
                  wx.showModal({
                    title: `请求授权您的${typeMap[type]}`,
                    content: '如需正常使用此小程序功能，请您按确定并在设置页面授权用户信息',
                    confirmText: '确定',
                    success: res => {
                      if (res.confirm) {
                        wx.openSetting({
                          success: function (res) {
                            console.log('成功');
                            console.log(res);
                            if (res.authSetting[`scope.${type}`]) { //设置允许获取摄像头
                              wx.showToast({
                                title: '授权成功',
                                icon: 'success',
                                duration: 1000
                              })
                              console.log('拥有摄像头权限')
                              resolve(false)

                              wx.showToast({
                                title: '请重新进入相机',
                              })
                              that.cancel(null,that)
                              // res = true
  
                            } else { //不允许
                              wx.showToast({
                                title: '授权失败',
                                icon: 'none',
                                duration: 1000
                              })

                              that.setData({
                                cameraShow: false,
                              })
                              console.log('无摄像头权限')
                              reject(false)
                            }
                          }
                        })
                      } else { //取消
                        wx.showToast({
                          title: '授权失败',
                          icon: 'none',
                          duration: 1000
                        })
                        that.setData({
                          cameraShow: false,
                        })
                        console.log('无摄像头权限')
                        reject(false)
                      }
                    }
                  })
                }
              })
            }else{
              console.log('拥有摄像头权限')
              // res = true
              resolve(true)
            }
          }
        })
      })
      
    },
    /**
     * 暂停计时器函数
     * @param that this
     */
    stopTimer: function (that) {
      clearTimeout(that.data.timer)
    },
    /**
     * 创建计时器函数
     * @param that this
     */
    beginTimer: function (that = this) {
      that.setData({
        timer: setInterval(function () {
          // console.log('获取当前时间',that.formatDateTime(new Date()) )
          // const _currentTime = moment().format("YYYY年MM月DD日 HH:mm:ss", util.formatTime(new Date()).split(" ")[1]);
          that.setData({
            currentTime: that.formatDateTime(new Date()),
            timestamp: +new Date(),
            // canUse: true,
          });
        }, 1000)
      })
    },
    /**
     * 时间格式化函数
     * @param {Date} date 
     * @returns string
     */
    formatDateTime: function (date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      var h = date.getHours();
      h = h < 10 ? ('0' + h) : h;
      var minute = date.getMinutes();
      minute = minute < 10 ? ('0' + minute) : minute;
      var second = date.getSeconds();
      second = second < 10 ? ('0' + second) : second;
      return y + '年' + m + '月' + d + '日 ' + h + ':' + minute + ':' + second;
    },
    /**
     * 获取定位横纵坐标
     */
    async getLocation() {
      var that = this;
      return new Promise((resolve,reject) => {
        wx.getLocation({
          type: "wgs84",
          success: function(res) {
            that.setData({
              gps: {
                latitude: res.latitude,
                longitude: res.longitude,
              },
            });
            //获取当前时间
            var currentTime =  new Date().getTime();
            //获取上次保存的位置信息
            wx.setStorageSync('mycamera_gps',{
              latitude: res.latitude,
              longitude: res.longitude,
            });
            //缓存当前执行的时间
            wx.setStorageSync('mycamera_oldTime',currentTime);
            resolve({latitude:res.latitude,longitude:res.longitude})
          },
          fail:(res) => {
            console.log('获取用户地址失败',res)
            //获取当前时间
            var currentTime =  new Date().getTime();
            //获取上次保存的位置信息
            var gps = wx.getStorageSync('mycamera_gps');
            //获取上次执行的时间
            var oldTime = wx.getStorageSync('mycamera_oldTime');

            // 30秒之内连续调用则自动会失败
            if(currentTime-oldTime > 30000) {
              reject('获取用户地址失败')
            }else {
              resolve(gps)
            }
          }
        });
      }).then(res => {
        return that.getDistrict(res.latitude, res.longitude,"UUJBZ-XVZC3-US53H-3DEXZ-2JAQS-PVBDY",that);
      }).catch(res => {
        // 这个地方暂时先这样写 实现功能
        wx.showToast({
          title: '获取定位失败',
          icon:'error'
        })

        that.setData({
          district:'获取定位失败'
        })


        that.cancel(null,that)
      })
  
    },
    /**
     * 通过经纬坐标获取地址
     * @param {*} latitude 
     * @param {*} longitude 
     * @param {*} keys  这个是腾讯地图的key 如果有一天不能用了 请更换
     * @param {*} that  
     */
    async getDistrict(latitude, longitude,keys = 'UUJBZ-XVZC3-US53H-3DEXZ-2JAQS-PVBDY',that) {
      return new Promise((resolve,reject) => {
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${keys}`,
          header: {
            'Content-Type': 'application/json'
          },
          success: async function (res) {
            if(res.data.result){
              // 省
              let province = res.data.result.address_component.province;
              // 市
              let city = res.data.result.address_component.city;
              // 区
              let district = res.data.result.address_component.district;
              that.setData({
                district: res.data.result.address,
                region: [province, city, district]
              })

              //缓存当前最新位置街道
              wx.setStorageSync('mycamera_district',res.data.result.address);

              resolve(district)
            }else{
              reject(res.message)
            }

          },
          fail:(res) => {
            reject(res)
          }
        })
      })
    },
  }
})
