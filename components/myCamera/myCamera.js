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
      this.setData({
        cameraShow:true,
        pictureShow:false
      })
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
    takePhoto:function(params){
      if(!params){return}
      console.log('takePhoto',params)
      let { show,success } = params
      var that = this
      this.setData({
        cameraShow:show,
        success:success,
        timer:setInterval(function () {
        console.log('获取当前时间',that.formatDateTime(new Date()) )
          // const _currentTime = moment().format("YYYY年MM月DD日 HH:mm:ss", util.formatTime(new Date()).split(" ")[1]);
          that.setData({
            currentTime: that.formatDateTime(new Date()) ,
          });
        }, 1000)
      })


    },
    noneEnoughPeople:function(){
      return
    },
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
    }
  }
})
