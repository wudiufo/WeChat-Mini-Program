import {
  HTTP
} from '../utils/http-promise'

class KeywordModel extends HTTP {
  constructor() {
    super()
      // 把key属性挂载到当前实例上，供实例调取使用
    this.key = 'q',
      this.maxLength = 10 //搜索关键字的数组最大长度为10
  }

  //从缓存中，获取历史搜索关键字，如果缓存中没有直接返回什么也不做
  getHistory() {
    const words = wx.getStorageSync(this.key)
    if (!words) {
      return []
    }
    return words
  }

  // 将历史搜索关键字写入缓存中。先从缓存中获取历史关键字的数组，判断是否已经有此关键字。如果没有，获取数组的长度大于最大长度，就将数组最后一项删除。获取数组的长度小于最大长度就将此次输入的关键字加到数组第一位，并且设置到缓存中；
  addToHistory(keyword) {
    let words = this.getHistory()
    const has = words.includes(keyword)
    if (!has && keyword.trim() !== '') {
      const length = words.length
      if (length >= this.maxLength) {
        words.pop()
      }
      words.unshift(keyword)
      wx.setStorageSync(this.key, words)
    }

  }

  // 获取热门搜素搜关键字
  getHot() {
    return this.request({
      url: '/book/hot_keyword'
    })
  }
}

export {
  KeywordModel
}
