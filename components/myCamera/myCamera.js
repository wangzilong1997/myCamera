// components/myCamera/myCamera.js
Component({
  // ready:function(){
  //   const ctx = wx.createCanvasContext("image-canvas", this /* 它很重要 */);

  //   ctx.setFontSize(20);
  //   ctx.fillText("Hello", 20, 20);
  //   ctx.fillText("MINA", 100, 100);

  //   ctx.draw();
  // },
  /**
   * 组件的属性列表
   */
  properties: {
    cameraShow: {
      type: Boolean,
      value: false
    },
    pictureShow: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 当前时间
    currentTime: '暂无数据～',
    // 当前项目
    projectName: '暂无数据～',
    // 定时器一秒钟更新一次当前时间
    timer: false,
    // 时间戳 为了保持canvas id唯一
    timestamp: '-1',
    // 控制是否可以使用图片
    canUse:true,
    // 临时相机拍下的照片所存的路径
    tempPicturePath:''
  },
  lifetimes: {
    attached: function () {
      console.log('thissssss',this)
      // 创建相机
      this.ctx = wx.createCameraContext()
      // 在组件实例进入页面节点树时执行
      wx.getStorageSync('project_name') && this.setData({
        projectName: wx.getStorageSync('project_name')
      })

      const ctx = wx.createCanvasContext("image-canvas", this /* 它很重要 */);

      ctx.setFillStyle('red')
      ctx.fillRect(10, 10, 150, 75)
  
      ctx.draw();

    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 相机取消方法
    cancel: function () {
      console.log('cancel点击')
      this.setData({
        cameraShow: false
      })
      if (this.data.success) {
        this.data.success({
          success: false,
          picturePath: []
        })
      }
      this.stopTimer()
    },
    /**
     * 点击拍照按钮
     * 
     */
    take: function () {
      // wx.showLoading({
      //   title: '数据处理中...',
      //   mask: true
      // })

      let that = this

      that.ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          wx.setStorage({
            key: 'originalImagePath',
            data: res.tempImagePath,
          })
          that.setData({
            tempPicturePath: res.tempImagePath,
            cameraShow: false,
            pictureShow: true
          })
          that.stopTimer()
          // 生成canvas
          that.getCanvas(res.tempImagePath,that)

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
      this.beginTimer(this)
    },
    /**
     * 使用照片点击函数
     * @param {*} func 
     */
    usePicture: function (func) {
      var that = this
      console.log('return2Picture返回数据')

      if (this.data.success && this.data.canUse) {
        that.data.success({
          success: true,
          picturePath: [this.data.result]
        })
      }
      this.setData({
        cameraShow: false,
        pictureShow: false,
        canUse:false
      })
      // func(this.data.tempPicturePath)
      this.stopTimer()
    },
    /**
     * 暂停计时器函数
     */
    stopTimer: function () {
      clearTimeout(this.data.timer)
    },
    /**
     * 创建计时器函数
     */
    beginTimer: function(that){
      that.setData({
        timer: setInterval(function () {
          // console.log('获取当前时间',that.formatDateTime(new Date()) )
          // const _currentTime = moment().format("YYYY年MM月DD日 HH:mm:ss", util.formatTime(new Date()).split(" ")[1]);
          that.setData({
            currentTime: that.formatDateTime(new Date()),
            timestamp: +new Date(),
            canUse:true,
          });
        }, 1000)
      })
    },
    /**
     * 
     * @param {object} params 
     * @returns 
     */
    takePhoto: function (params) {
      if (!params) { return }
      console.log('takePhoto', params)
      let { show, success,_that } = params
      var that = this
      this.setData({
        cameraShow: show,
        success: success,
        _that:_that
      })
      this.beginTimer(this)


    },
    noneEnoughPeople: function () {
      return
    },

    /**
     * 获取canvas 并且绘制图片
     * @param {string} path 
     * @returns
     */
    getCanvas: function (path,that) {
      console.log('获取canvas 并且绘制功能', path, "image-canvas" + that.data.timestamp,)
      wx.getSystemInfo({
        success: function (res) {
          var width = res.windowWidth
          var height = res.windowHeight
          var gap = 40
          that.setData({
            width: width,
            height: height,
            gap: gap
          })
          // that.canvas = wx.createCanvasContext("image-canvas", that)
          // console.log('that.canvas',that.canvas)

          // that.canvas.rect(0, 0, that.data.width, that.data.height - 170)
          // that.canvas.clip()
          
          // that.canvas.setFillStyle('red')
          // that.canvas.fillRect(10, 10, 150, 75)

          // that.canvas.drawImage(path, 0, 0, that.data.width / 1, that.data.height / 1)

          // that.canvas.setFontSize(16);
          // that.canvas.setFillStyle('#fff');
          // that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, 20, that.data.height - 200)
          // that.canvas.setFontSize(16);
          // that.canvas.setFillStyle('#fff');
          // that.canvas.fillText(`项目名称：${that.data.projectName}`, 20, that.data.height - 180)
          // var id = "image-canvas" + that.data.timestamp
          // setTimeout(() => {
          //   that.canvas.draw(true, setTimeout(() => {
          //   wx.canvasToTempFilePath({ //裁剪对参数
          //     canvasId: id,
          //     x: 0, //画布x轴起点
          //     y: 0, //画布y轴起点
          //     width: that.data.width, //画布宽度
          //     height: that.data.height - 170, //画布高度
          //     destWidth: that.data.width, //输出图片宽度
          //     destHeight: that.data.height - 170, //输出图片高度
          //     success: function (res) {
          //       that.filePath = res.tempFilePath
          //       //清除画布上在该矩形区域内的内容。
          //       console.log(res.tempFilePath)
          //       that.setData({
          //         result: res.tempFilePath
          //       })
          //       wx.hideLoading()
          //       //在此可进行网络请求
          //     },
          //     fail: function (e) {
          //       console.log('保存图片出错', e)
          //       wx.hideLoading()
          //     }
          //   }, that);
          //   },300))
          // }, 200)
          // that.canvas.draw()
          // wx.getImageInfo({
          //   src: path,
          //   success: function (res) {
          //     console.log('getImageInfo',res)
          //     that.canvas = null
          //     if (!that.canvas) {
          //       that.canvas = wx.createCanvasContext("image-canvas" + that.data.timestamp, that)
          //     }
          //     console.log('that.canvas',that.canvas)
          //     // that.canvas.save()
          //     // that.canvas.beginPath()
          //     // that.canvas.arc(50, 50, 25, 0, 2*Math.PI)
          //     that.canvas.rect(0, 0, that.data.width, that.data.height - 170)
          //     that.canvas.clip()

          //     that.canvas.drawImage(path, 0, 0, that.data.width / 1, that.data.height / 1)

          //     that.canvas.setFontSize(16);
          //     that.canvas.setFillStyle('#fff');
          //     that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, 20, that.data.height - 200)
          //     that.canvas.setFontSize(16);
          //     that.canvas.setFillStyle('#fff');
          //     that.canvas.fillText(`项目名称：${that.data.projectName}`, 20, that.data.height - 180)
          //     // var id = "image-canvas" + that.data.timestamp
          //     // setTimeout(() => {
          //     //   that.canvas.draw(true, setTimeout(() => {
          //     //   wx.canvasToTempFilePath({ //裁剪对参数
          //     //     canvasId: id,
          //     //     x: 0, //画布x轴起点
          //     //     y: 0, //画布y轴起点
          //     //     width: that.data.width, //画布宽度
          //     //     height: that.data.height - 170, //画布高度
          //     //     destWidth: that.data.width, //输出图片宽度
          //     //     destHeight: that.data.height - 170, //输出图片高度
          //     //     success: function (res) {
          //     //       that.filePath = res.tempFilePath
          //     //       //清除画布上在该矩形区域内的内容。
          //     //       console.log(res.tempFilePath)
          //     //       that.setData({
          //     //         result: res.tempFilePath
          //     //       })
          //     //       wx.hideLoading()
          //     //       //在此可进行网络请求
          //     //     },
          //     //     fail: function (e) {
          //     //       console.log('保存图片出错', e)
          //     //       wx.hideLoading()
          //     //     }
          //     //   }, that);
          //     //   },300))
          //     // }, 200)
          //     that.canvas.draw()

          //     // setTimeout(function () {
          //     //   var id = "image-canvas" + that.data.timestamp
          //     //   console.log('id', id)
          //     //   wx.canvasToTempFilePath({ //裁剪对参数
          //     //     canvasId: id,
          //     //     x: 0, //画布x轴起点
          //     //     y: 0, //画布y轴起点
          //     //     width: that.data.width, //画布宽度
          //     //     height: that.data.height - 170, //画布高度
          //     //     destWidth: that.data.width, //输出图片宽度
          //     //     destHeight: that.data.height - 170, //输出图片高度
          //     //     success: function (res) {
          //     //       that.filePath = res.tempFilePath
          //     //       //清除画布上在该矩形区域内的内容。
          //     //       console.log(res.tempFilePath)
          //     //       that.setData({
          //     //         result: res.tempFilePath
          //     //       })
          //     //       wx.hideLoading()
          //     //       //在此可进行网络请求
          //     //     },
          //     //     fail: function (e) {
          //     //       console.log('保存图片出错', e)
          //     //       wx.hideLoading()
          //     //     }
          //     //   }, that);
          //     // }, 100);
          //   }
          // })
        }
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
  }
})
