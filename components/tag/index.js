// components/tag/index.js
Component({

  // 启用slot
  options: {
    multipleSlots: true
  },

  // 外部传进来的css,样式
  externalClasses: ['tag-class'],


  /**
   * 组件的属性列表
   */
  properties: {
    text: String
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
    // 触摸短评小标签时，触发的事件，触发一个自定义事件
    onTap(event) {
      this.triggerEvent('tapping', {
        text: this.properties.text
      })
    }
  }
})
