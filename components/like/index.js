// components/like/like-cmp.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    like: Boolean,
    count: Number,
    readOnly: Boolean
  },

  data: {
    yesSrc: 'images/like.png',
    noSrc: 'images/like@dis.png'
  },

  methods: {
    onLike(event) { //自定义事件
      if (this.properties.readOnly) { //如果是只读的就不会执行后面的操作
        return
      }
      let count = this.properties.count
      let like = this.properties.like
      count = like ? count - 1 : count + 1
      this.setData({ //是异步的，先执行count+1，在执行！like
        count: count,
        like: !like
      })
      let behavior = like ? 'like' : 'cancel'
        //自定义事件
      this.triggerEvent('like', {
        behavior: behavior
      }, {})
    }
  }
})
