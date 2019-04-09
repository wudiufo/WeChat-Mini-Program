const paginationBev = Behavior({
  data: {
    dataArray: [], //请求返回的数组
    total: null, //数据的总数
    noneResult: false, //没有得到想要的搜索结果
    loading: false, //表示是否正在发送请求，默认是没有发送请求
  },

  methods: {
    // 加载更多拼接更多数据到数组中
    setMoreData(dataArray) {
      const tempArray = this.data.dataArray.concat(dataArray)
      this.setData({
        dataArray: tempArray
      })
    },

    // 获取得到的数据的数组的长度
    getCurrentStart() {
      return this.data.dataArray.length
    },

    // 获取设置数据的 总长度
    // 如果返回的结果为0，就说明没有得到搜索结果
    setTotal(total) {
      this.data.total = total
      if (total === 0) {
        this.setData({
          noneResult: true
        })
      }
    },

    // 如果得到数据的长度大于服务器返回的总长度，代表没有更多数据了，就停止发请求
    hasMore() {
      if (this.data.dataArray.length >= this.data.total) {
        return false
      } else {
        return true
      }
    },

    // 清空数据，设置初始值
    initialize() {
      this.setData({
        dataArray: [],
        noneResult: false,
        loading: false,
      })
      this.data.total = null
    },

    // 事件节流机制，判断是否加锁
    isLocked() {
      return this.data.loading ? true : false
    },

    // 加锁
    addLocked() {
      this.setData({
        loading: true
      })

    },

    // 解锁
    unLocked() {
      this.setData({
        loading: false
      })
    },
  }

})

export {
  paginationBev
}
