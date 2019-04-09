import {
  BookModel
} from '../../models/book'

import {
  LikeModel
} from '../../models/like'

const bookModel = new BookModel()
const likeModel = new LikeModel()




// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comments: [],
    book: null,
    likeStatus: false,
    likeCount: 0,
    posting: false //默认不显示评论输入框
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 数据加载时显示loading效果
    wx.showLoading()
    const bid = options.bid
    console.log(bid)
      // 获取书籍详细信息
    const detail = bookModel.getDetail(bid)
      // 获取书籍点赞情况
    const likeStatus = bookModel.getLikeStatus(bid)
      // 获取书籍短评
    const comments = bookModel.getComments(bid)

    // 数据加载完成时取消显示loading效果
    Promise.all([detail, comments, likeStatus]).then(res => {
      console.log(res)
      this.setData({
        book: res[0],
        comments: res[1].comments,
        likeStatus: res[2].like_status,
        likeCount: res[2].fav_nums
      })
      wx.hideLoading()
    })

    // detail.then(res => {
    //   console.log(res)
    //   this.setData({
    //     book: res
    //   })
    // })

    // likeStatus.then(res => {
    //   console.log(res)
    //   this.setData({
    //     likeStatus: res.like_status,
    //     likeCount: res.fav_nums
    //   })
    // })

    // comments.then(res => {
    //   console.log(res)
    //   this.setData({
    //     comments: res.comments
    //   })
    // })
  },

  // 触摸点赞组件事件
  onLike(event) {
    const like_or_cancel = event.detail.behavior
    likeModel.like(like_or_cancel, this.data.book.id, 400)
  },

  // 触摸评论输入框弹出评论窗口
  onFakePost(enent) {
    this.setData({
      posting: true
    })
  },

  // 在弹出的评论窗口中点取消，让评论窗口消失
  onCancl(event) {
    this.setData({
      posting: false
    })
  },

  // 触摸tag组件会触发，input输入框也会触发事件onPost
  onPost(event) {
    // 获取触发tag里的内容或获取用户input输入的内容
    const comment = event.detail.text || event.detail.value
      // 获取用户input输入的内容
      // const commentInput = event.detail.value

    console.log('comment' + comment)
    console.log('commentInput' + comment)



    // 对tag里的内容或对用户输入的评论做校验
    if (comment.length > 12 || !comment) {
      wx.showToast({
        title: '短评最多12个字',
        icon: 'none'
      })
      return
    }

    // 调用新增短评接口并将最新的评论插到comments数组的第一位,并且把蒙层mask关闭
    bookModel.postComment(this.data.book.id, comment).then(res => {
      wx.showToast({
        title: '+1',
        icon: 'none'
      })
      this.data.comments.unshift({
        content: comment,
        nums: 1 //这是后面的数量显示
      })
      this.setData({
        comments: this.data.comments,
        posting: false
      })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
