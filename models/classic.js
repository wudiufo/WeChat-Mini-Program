import {
  HTTP
} from '../utils/http.js'

class ClassicModel extends HTTP {
  constructor() {
    super()
  }

  //获取最新的期刊
  getLatest(cb) {
    this.request({
      url: 'classic/latest',
      success: (res) => {

        this._setLatestIndex(res.index)
        cb(res)

        // 将最新的期刊设置到缓存中
        let key = this._getKey(res.index)
        wx.setStorageSync(key, res)
      }
    })
  }

  // // 获取当前一期的上一期
  // getPrevious(index, cb) {
  //   this.request({
  //     url: `classic/${index}/previous`,
  //     success: (res) => {
  //       cb(res)
  //     }
  //   })
  // }

  // // 获取当前一期的下一期
  // getNext() {
  //   this.request({
  //     url: `classic/${index}/next`,
  //     success: (res) => {
  //       cb(res)
  //     }
  //   })
  // }

  // 因为getPrevious，getNext实现代码相似，所以为了简化代码可以合并为一个函数
  // 缓存思路：在缓存中寻找key，找不到就发送请求 API，将key写入到缓存中。解决每次都调用Api向服务器发请求，耗费性能
  // 在缓存中，确定key
  getClassic(index, nextOrPrevious, sCallback) {
    // 是next，获取下一期，否则获取上一期
    let key = nextOrPrevious === 'next' ? this._getKey(index + 1) : this._getKey(index - 1)
    let classic = wx.getStorageSync(key)
    if (!classic) {
      this.request({
        url: `classic/${index}/${nextOrPrevious}`,
        success: (res) => {
          wx.setStorageSync(this._getKey(res.index), res)
          sCallback(res)
        }
      })
    } else { //如果在缓存中有找到key，将返回的内容res保存到缓存中
      sCallback(classic)
    }

  }



  // 当前的期刊是否为第一期
  isFirst(index) {
    return index === 1 ? true : false
  }

  // 当前的期刊是否为最新的一期
  isLatest(index) {
    // lastestIndex get from storage
    let latestIndex = this._getLatestIndex()
    return latestIndex === index ? true : false
  }

  // 将最新的期刊index存入缓存
  _setLatestIndex(index) {
    wx.setStorageSync('latest', index)
  }

  // 在缓存中获取最新期刊的index
  _getLatestIndex() {
    let index = wx.getStorageSync('latest')
    return index
  }

  // 设置缓存中的key
  _getKey(index) {
    let key = `classic-${index}`
    return key
  }

  // 获取我喜欢期刊的所有信息
  getMyFavor(success) {
    const params = {
      url: 'classic/favor',
      success: success
    }
    this.request(params)
  }






















}

export {
  ClassicModel
}
