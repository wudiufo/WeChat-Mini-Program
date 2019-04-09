import {
  BookModel
} from '../../models/book'
import {
  random
} from '../../utils/common'

const bookModel = new BookModel()


// pages/book/book.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    books: [],
    searching: false, //控制搜索框组件search显隐，默认不显示
    more: '' //是否需要加载更多数据，默认是不加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取热门书籍
    const hotList = bookModel.getHotList()
    hotList.then(res => {
      console.log(res)
      this.setData({
        books: res
      })
    })
  },

  // 触摸搜索触发onSearching事件，改变搜索组件searing的显隐
  onSearching(event) {
    this.setData({
      searching: true
    })
  },

  // 调用子组件传递进来的自定义事件cancel，为其绑定事件onCancel，控制搜索组件searing的显隐
  onCancel(event) {
    this.setData({
      searching: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('到底了')
    this.setData({
      more: random(16)
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
