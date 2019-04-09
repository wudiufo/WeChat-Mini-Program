// components/navi/navi.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    first: Boolean, //如果是第一期向右的箭头就禁用
    latest: Boolean //如果是最新一期向左的箭头就禁用
  },

  /**
   * 组件的初始数据
   */
  data: {
    disLeftSrc: './images/triangle.dis@left.png',
    leftSrc: './images/triangle@left.png',
    disRightSrc: './images/triangle.dis@right.png',
    rightSrc: './images/triangle@right.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLeft: function(event) { //不是最新一期
      if (!this.properties.latest) {
        this.triggerEvent('left', {}, {})
      }

    },
    onRight: function(event) { //不是第一期
      if (!this.properties.first) {
        this.triggerEvent('right', {}, {})
      }

    }
  }
})
