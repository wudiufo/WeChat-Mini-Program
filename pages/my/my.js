import {
  ClassicModel
} from '../../models/classic'

import {
  BookModel
} from '../../models/book'

const classicModel = new ClassicModel()
const bookModel = new BookModel()




Page({
  data: {
    authorized: false, //切换用户头像显示
    userInfo: null, //用户信息
    bookCount: 0, //喜欢的书
    classics: null //获取我喜欢期刊的所有信息
  },
  onLoad() {
    // 查看是否授权
    this.userAuthorized()
      // 获取喜欢的书的数量
    this.getMyBookCount()
      // 获取我喜欢期刊的所有信息
    this.getMyFavor()
  },

  // 从服务器获取喜欢的书的数量
  getMyBookCount() {
    bookModel.getMyBookCount().then(res => {
      this.setData({
        bookCount: res.count
      })
    })
  },

  // 获取我喜欢期刊的所有信息
  getMyFavor() {
    classicModel.getMyFavor(res => {
      this.setData({
        classics: res
      })
    })
  },

  // 查看是否授权, 已经授权，可以直接调用 getUserInfo 获取头像昵称
  userAuthorized() {
    wx.getSetting({
      success: data => {
        if (data.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: data => {
              console.log(data)
              this.setData({
                authorized: true,
                userInfo: data.userInfo
              })
            }
          })
        } else {
          console.log('err')
        }
      }
    })
  },


  onGetUserInfo(e) {
    const userInfo = e.detail.userInfo
    console.log(userInfo)
    if (userInfo) {
      this.setData({
        userInfo,
        authorized: true
      })
    }

  },

  // 触摸跳转到另一个页面
  onJumpToAbout(event) {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  onStudy(event) {
    wx.navigateTo({
      url: '/pages/course/course'
    })
  }





})
