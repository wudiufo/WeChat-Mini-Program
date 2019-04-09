import {
  classicBeh
} from '../classic-beh'

// 获取小程序音乐管理对象
const mMgr = wx.getBackgroundAudioManager()

Component({
  behaviors: [classicBeh], // 组件的属性列表
  /**
   * 组件的属性列表,动画API CSS3
   */
  properties: {
    // img: String,
    // content: String
    src: String,
    title: String

  },

  /**
   * 组件的初始数据
   */
  data: {
    pauseSrc: 'images/player@pause.png',
    playSrc: 'images/player@play.png',
    playing: false, //当前的音乐默认是不播放的
  },

  // 在组件实例进入页面节点树时执行
  // hidden，ready，created都触发不了生命周期函数
  attached: function(event) {
    console.log('attach实例进入页面', '触发1')
    this._monitorSwitch()
    this._recoverStatus()


  },

  // hidden 不会触发完整生命周期, 适用于频繁切换; wx:if 会触发完整生命周期, 不大可能改变
  // 组件卸载的生命周期函数,微信生命周期, 组件退出界面节点树时执行
  // 组件卸载音乐停止播放，但这时不生效是因为，在classic.wxml中用的是hidden，应改为if
  detached: function(event) {
    // mMgr.stop() //为了保证背景音乐的持续播放就不能加stop
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 为图片绑定触摸播放事件
    onPlay: function(evevt) {
      console.log('onPlay为图片绑定触摸', '触发4')
        //如果没有播放就改为播放，如果播放就改为暂停
      if (!this.data.playing) {
        console.log('onPlay为图片绑定触摸!this.data.playing', '触发5', this.data.playing)
          //图片切换
        this.setData({
            playing: true
          })
          // 如果当前播放的地址和当前的组件的地址一样，就播放
          // 如果当前播放的地址和当前的组件的地址不一样，就把当前组件地址赋值给要播放的地址

        //播放音乐
        // mMgr.play()
        mMgr.src = this.properties.src
        mMgr.title = this.properties.title
      } else {
        console.log('onPlay为图片绑定触摸', '触发4', this.data.playing)
        this.setData({
          playing: false
        })
        mMgr.pause() //音乐暂停
      }

    },

    // 监听音乐的播放状态，如果当前组件没有播放的音乐，就设置playing为false。如果播放的地址和当前正在播放的音乐的地址一样，就让播放状态为true
    _recoverStatus: function() {
      console.log('recoverStatus播放状态', '触发2', this.data.playing)
      if (mMgr.paused) {
        this.setData({
          playing: false
        })
        console.log('recoverStatus播放状态mMgr.paused', '触发6', this.data.playing)
        return

      }
      if (this.properties.src === mMgr.src) {

        this.setData({
          playing: true
        })

        console.log('recoverStatus播放状态mMgr.src === this.properties.src', '触发5', this.data.playing)
      }
    },

    // 监听播放状态，总控开关就可以控制播放状态，结局总控开关和页面不同步问题
    _monitorSwitch: function() {
      console.log('monitorSwitch背景音频', '触发3')
        // 监听背景音频播放事件
      mMgr.onPlay(() => {
          this._recoverStatus()
          console.log('onPlay ' + this.data.playing)
        })
        // 监听背景音频暂停事件
      mMgr.onPause(() => {
          this._recoverStatus()
          console.log('onPause ' + this.data.playing)
        })
        // 关闭音乐控制台，监听背景音频停止事件
      mMgr.onStop(() => {
          this._recoverStatus()
          console.log('onStop ' + this.data.playing)
        })
        // 监听背景音频自然播放结束事件
      mMgr.onEnded(() => {
        this._recoverStatus()
        console.log('onEnded ' + this.data.playing)
      })
    }



  }
})
