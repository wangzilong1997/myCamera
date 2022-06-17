// components/myCamera/myCamera.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 相机取消方法
    cancel:function(){
      console.log('cancel点击')
      this.setData({
        show:false
      })
    }
  }
})
