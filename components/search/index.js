import {
  KeywordModel
} from '../../models/keyword'
import {
  BookModel
} from '../../models/book'
import {
  paginationBev
} from '../behaviors/pagination'

const Keywordmodel = new KeywordModel()
const bookmodel = new BookModel()

// components/search/index.js
Component({
  // 组件使用行为需加
  behaviors: [paginationBev],


  /**
   * 组件的属性列表
   */
  properties: {
    more: {
      type: String,
      observer: 'loadMore'
    } //从pages/book/book.js 传来的属性，监听滑到底步操作.只要外界传来的属性改变就会触发observer函数执行
  },

  /**
   * 组件的初始数据
   */
  data: {
    historyWords: [], //历史搜索关键字
    hotWords: [], //热门搜索关键字
    // dataArray: [], //搜索图书当summary=1,返回概要数据
    searching: false, //控制搜索到的图书数据的显隐，默认不显示
    q: '', //输入框中要显示的内容
    // loading: false, //表示是否正在发送请求，默认是没有发送请求
    loadingCenter: false //控制loading加载效果是否显示在中间
  },

  // 组件初始化时，小程序默认调用的生命周期函数
  attached() {
    // const historywords = Keywordmodel.getHistory()
    // const hotword = Keywordmodel.getHot()
    this.setData({
      historyWords: Keywordmodel.getHistory()
    })

    Keywordmodel.getHot().then(res => {
      this.setData({
        hotWords: res.hot
      })
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 只要外界传来的属性改变就会触发observer函数执行
    loadMore() {
      console.log('监听函数触发到底了')
        // 和onConfirm一样都需要调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
        // 先判断已得到的搜索数据的长度,在调用search方法将最新获取的数据和原来的数据拼接到一起更新数据然后呈现到页面中
      if (!this.data.q) {
        return
      }
      // 如果是正在发送请求就什么也不做
      if (this.isLocked()) {
        return
      }
      // const length = this.data.dataArray.length

      if (this.hasMore()) {
        this.addLocked()
        bookmodel.search(this.getCurrentStart(), this.data.q).then(res => {
          this.setMoreData(res.books)
          this.unLocked()
        }, () => {
          this.unLocked()
        })
      }


    },



    // 点击取消将搜索组件关掉，有两种方法：一是，在自己的内部创建一个变量控制显隐，不推荐，因为万一还有其他操作扩展性不好。二是，创建一个自定义事件，将自定义事件传给父级，让父级触发
    onCancel(event) {
      this.initialize()
      this.triggerEvent('cancel', {}, {})
    },

    // 触摸搜索图片里的x回到原来输入搜索的页面
    onDelete(event) {
      this.initialize()
      this._hideResult()
    },

    // 在input输入框输入完成将输入的内容加到缓存中
    onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this._showResult()
        // 显示loading效果
      this._showLoadingCenter()
        // 先清空上一次搜索的数据在加载
        // this.initialize()
        // 获取搜索的关键词q,调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value || event.detail.text
        // 不用等数据加载完，输入完成后就把输入的内容显示在输入框中。
      this.setData({
        q: q
      })

      bookmodel.search(0, q).then(res => {
        this.setMoreData(res.books)
        this.setTotal(res.total)


        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(q)

        // 数据加载完成，取消显示loading效果
        this._hideLoadingCenter()

      })

    },

    // 更新变量的状态,显示搜索框
    _showResult() {
      this.setData({
        searching: true
      })
    },

    // 更新变量的状态,隐藏搜索框
    _hideResult() {
      this.setData({
        searching: false,
        q: ''
      })
    },



    // 改变loadingCenter的值
    _showLoadingCenter() {
      this.setData({
        loadingCenter: true
      })
    },

    // 改变loadingCenter的值
    _hideLoadingCenter() {
      this.setData({
        loadingCenter: false
      })
    }



  }
})
