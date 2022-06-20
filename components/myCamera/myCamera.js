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
            data:res.tempImagePath,
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
    }
  }
})
