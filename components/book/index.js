// components/book/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    book: Object,
    showLike: { //每本书下面有个喜欢字样
      type: Boolean,
      value: true
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
    onTap(event) {
      const bid = this.properties.book.id
        // 尽量不要在组件的内部写业务逻辑，会降低组件的通用性，他只服务于当前的项目，属于项目组件
      wx.navigateTo({
        url: `/pages/detail/detail?bid=${bid}`
      })
    }
  }
})
