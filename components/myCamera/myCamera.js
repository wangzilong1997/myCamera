// components/myCamera/myCamera.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cameraShow:{
      type:Boolean,
      value:false
    },
    pictureShow:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentTime:'暂无数据～',
    projectName:'暂无数据～',
    timer:false,
    timestamp:'-1',
  },
  lifetimes: {
    attached: function() {
      // var that = this
      // that.ctx = wx.createCameraContext()
      // ctx 绑定到相机实例
      this.ctx = wx.createCameraContext()
      // 在组件实例进入页面节点树时执行
      console.log('在组件实例进入页面节点树时执行',this)


    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 相机取消方法
    cancel:function(){
      console.log('cancel点击')
      this.setData({
        cameraShow:false
      })
      if(this.data.success) {
        this.data.success({
          success:false,
          picturePath:[]
        })
      }
      clearTimeout(this.data.timer)
    },
    /**
     * 点击拍照按钮
     * 
     */
    take:function(){
      var that = this
      that.ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          wx.setStorage({
            key: 'originalImagePath',
            data: res.tempImagePath,
          })
          that.setData({
            tempPicturePath:res.tempImagePath,
            cameraShow:false,
            pictureShow:true
          })
          clearTimeout(this.data.timer)
          that.getCanvas(res.tempImagePath)

          // wx.navigateTo({
          //   url: 'upload?path=' + res.tempImagePath + '&char=0'
          // })
        }
      })
    },
    reTake:function(){
      this.setData({
        cameraShow:true,
        pictureShow:false
      })
    },
    pic2Camera:function(){
      var that = this
      this.setData({
        cameraShow:true,
        pictureShow:false,
        timer:setInterval(function () {
          // console.log('获取当前时间',that.formatDateTime(new Date()) )
            // const _currentTime = moment().format("YYYY年MM月DD日 HH:mm:ss", util.formatTime(new Date()).split(" ")[1]);
            that.setData({
              currentTime: that.formatDateTime(new Date()) ,
              timestamp: +new Date()
            });
          }, 1000)
      })
      this.canvas.clearRect(0, 0, this.data.width, this.data.height)
    },
    return2Picture:function(func){
      console.log('return2Picture返回数据')
      this.setData({
        cameraShow:false,
        pictureShow:false
      })
      this.triggerEvent('return2Picture', this.data.tempPicturePath)
      if(this.data.success) {
        // this.data.success(this.data.tempPicturePath)
        this.data.success({
          success:true,
          picturePath:[this.data.tempPicturePath]
        })
      }
      // func(this.data.tempPicturePath)
      clearTimeout(this.data.timer)
    },
    /**
     * 
     * @param {object} params 
     * @returns 
     */
    takePhoto:function(params){
      if(!params){return}
      console.log('takePhoto',params)
      let { show,success } = params
      var that = this
      this.setData({
        cameraShow:show,
        success:success,
        timer:setInterval(function () {
        // console.log('获取当前时间',that.formatDateTime(new Date()) )
          // const _currentTime = moment().format("YYYY年MM月DD日 HH:mm:ss", util.formatTime(new Date()).split(" ")[1]);
          that.setData({
            currentTime: that.formatDateTime(new Date()) ,
            timestamp: +new Date()
          });
        }, 1000)
      })


    },
    noneEnoughPeople:function(){
      return
    },
    /**
     * 时间格式化函数
     * @param {Date} date 
     * @returns string
     */
    formatDateTime:function(date) {  
      var y = date.getFullYear();  
      var m = date.getMonth() + 1;  
      m = m < 10 ? ('0' + m) : m;  
      var d = date.getDate();  
      d = d < 10 ? ('0' + d) : d;  
      var h = date.getHours();  
      h=h < 10 ? ('0' + h) : h;  
      var minute = date.getMinutes();  
      minute = minute < 10 ? ('0' + minute) : minute;  
      var second=date.getSeconds();  
      second=second < 10 ? ('0' + second) : second;  
      return y + '年' + m + '月' + d+'日 '+h+':'+minute+':'+second;  
    },
    /**
     * 获取canvas 并且绘制功能
     * @param {string} path 
     * @returns
     */
    getCanvas:function(path){
      console.log('获取canvas 并且绘制功能',path,"image-canvas" + this.data.timestamp,)
      var that = this
      that.path = path
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
          wx.getImageInfo({
            src: that.path,
            success: function (res) {
              that.canvas = null
              if(!that.canvas){
                that.canvas = wx.createCanvasContext("image-canvas" + that.data.timestamp, that)
              }
              // that.canvas.save()
              that.canvas.beginPath()
              // that.canvas.arc(50, 50, 25, 0, 2*Math.PI)
              that.canvas.rect(0, 0, that.data.width, that.data.height - 170)
              that.canvas.clip()

              that.canvas.drawImage(that.path, 0, 0, that.data.width/1, that.data.height/1)
   
              that.canvas.setFontSize(16);
              that.canvas.setFillStyle('#fff');
              that.canvas.fillText(`拍摄时间：${that.data.currentTime}`, 20, 520)
              that.canvas.setFontSize(16);
              that.canvas.setFillStyle('#fff');
              that.canvas.fillText(`项目名称：${that.data.projectName}`, 20, 540)
             
              // that.canvas.setFontSize(16)
              // that.canvas.setFillStyle('#fff')
              // that.canvas.fillText('经度：'+ that.data.gps.longitude + ' 纬度：' + that.data.gps.latitude, 50, 475)
  
              // that.canvas.setFontSize(16)
              // that.canvas.setFillStyle('#fff')
              // that.canvas.fillText( that.data.district+ '附近', 50, 500)
  
              // wx.showLoading({
              //   title: '数据处理中',
              //   mask: true
              // })

              that.canvas.setStrokeStyle('red')
              // 这里有一些很神奇的操作,总结就是MD拍出来的照片规格居然不是统一的
              //过渡页面中，对裁剪框的设定
              that.canvas.draw()
              // setTimeout(function () {
              //   wx.canvasToTempFilePath({ //裁剪对参数
              //     canvasId: "image-canvas",
              //     x: that.data.gap, //画布x轴起点
              //     y: that.data.gap, //画布y轴起点
              //     width: that.data.width - 2 * that.data.gap, //画布宽度
              //     height: 500, //画布高度
              //     destWidth: that.data.width - 2 * that.data.gap, //输出图片宽度
              //     destHeight: 500, //输出图片高度
              //     canvasId: 'image-canvas',
              //     success: function (res) {
              //       that.filePath = res.tempFilePath
              //       //清除画布上在该矩形区域内的内容。
              //       that.canvas.clearRect(0, 0, that.data.width, that.data.height)
              //       that.canvas.drawImage(that.filePath, that.data.gap, that.data.gap, that.data.width - that.data.gap * 2, 500)
              //       that.canvas.draw() 
              //       wx.hideLoading()
              //       //在此可进行网络请求
  
              //     },
              //     fail: function (e) {
              //       wx.hideLoading()
              //       wx.showToast({
              //         title: '出错啦...',
              //         icon: 'loading'
              //       })
              //     }
              //   });
              // }, 1000);
            }
          })
        }
      })
    }
  }
})
