import {
  ClassicModel
} from '../../models/classic.js'
import {
  LikeModel
} from '../../models/like.js'

let classicModel = new ClassicModel()
let likeModel = new LikeModel()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classic: null,
    latest: true,
    first: false,
    likeCount: 0,
    likeStatus: false

  },
  // 监听是否点赞
  onLike: function(event) {
    console.log(event)
      // 获取点赞还是取消的行为
    let behavior = event.detail.behavior
    likeModel.like(behavior, this.data.classic.id, this.data.classic.type)
  },

  // 自定义事件
  // 获取当前一期的下一期
  onNext: function(evevt) {
    // let index = this.data.classic.index
    // classicModel.getNext(index, (res) => {
    //   // console.log(res)
    //   this.setData({
    //     classic: res,
    //     latest: classicModel.isLatest(res.index),
    //     first: classicModel.isFirst(res.index)
    //   })
    // })

    this._updateClassic('next')
  },
  // 获取当前一期的上一期
  onPrevious: function(evevt) {
    // let index = this.data.classic.index
    // classicModel.getPrevious(index, (res) => {
    //   // console.log(res)
    //   this.setData({
    //     classic: res,
    //     latest: classicModel.isLatest(res.index),
    //     first: classicModel.isFirst(res.index)
    //   })
    // })

    this._updateClassic('previous')

  },

  // 重复代码过多，利用函数封装的思想，新建一个函数抽取公共代码
  _updateClassic: function(nextOrPrevious) {
    let index = this.data.classic.index
    classicModel.getClassic(index, nextOrPrevious, (res) => {
      // console.log(res)
      this._getLikeStatus(res.id, res.type)
      this.setData({
        classic: res,
        latest: classicModel.isLatest(res.index),
        first: classicModel.isFirst(res.index)
      })
    })
  },

  // 获取点赞信息
  _getLikeStatus: function(artID, category) {
    likeModel.getClassicLikeStatus(artID, category, (res) => {
      this.setData({
        likeCount: res.fav_nums,
        likeStatus: res.like_status
      })
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    classicModel.getLatest((res) => {
      console.log(res)
        // this._getLikeStatus(res.id, res.type) //不能这样写，会多发一次favor请求，消耗性能
      this.setData({
        classic: res,
        likeCount: res.fav_nums,
        likeStatus: res.like_status
      })
    })



    // http.request({
    //     url: 'classic/latest',
    //     success: (res) => {
    //       console.log(res)
    //     }
    //   })
    // wx.request({//比较麻烦的做法，不用
    //   url: 'http://bl.7yue.pro/v1/classic/latest',
    //   header: {
    //     appkey: "RdshydjBvcYZhMZC"
    //   }
    // })
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
