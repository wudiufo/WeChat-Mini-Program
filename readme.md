### 小爱心是否点赞组件 `components/like`

![](./reademeimages/aixin.jpg)

思路：

like 默认为 false，显示空心小爱心

触摸执行`tap：onLike` 方法，因为 `this.setData({count:count,like:!like})`是异步的，先执行`count = like ? count - 1 : count + 1`,这时like还是false，执行count+1。然后在执行this.setData()方法，将like变为true，显示实心小爱心。

```js
let behavior = like ? 'like' : 'cancel'
        //自定义事件
      this.triggerEvent('like', {
        behavior: behavior
      }, {})
```

自定义事件like，当like为真时，behavior为like，在`models/like.js`中，`let url = behavior === 'like' ? 'like/cancel' : 'like'`,因为`behavior === 'like'`为真，就调用服务器接口'like/cancel'，相反就调用like接口。

刚开始实心就调用'like/cancel'接口，空心就调用'like'接口

---------------------

### 底部左右切换组件 ` components/navi`

![](./reademeimages/navi.jpg)

思路：

##### 在`navi/index.js`中: 

```js
先定义哪些数据是外部传来的数据，哪些数据是私有数据
properties: {//外部传来的数据
    title: String,
    first: Boolean, //如果是第一期向右的箭头就禁用，默认是false
    latest: Boolean //如果是最新的一期向左的箭头就禁用，默认是false
  },
 data: {//私有数据
    disLeftSrc: './images/triangle.dis@left.png',
    leftSrc: './images/triangle@left.png',
    disRightSrc: './images/triangle.dis@right.png',
    rightSrc: './images/triangle@right.png'
  },

```



#### 左箭头：

>在navi/index.wxml中`<image bind:tap="onLeft" class="icon" src="{{latest?disLeftSrc:leftSrc}}"/>`
>
>src显示图片规则：如果是最新的期刊，就显示向左禁用状态disLeftSrc箭头；如果不是最新一期的期刊，就显示向左可用状态leftSrc箭头
>
>为图片绑定触摸事件onLeft，在`navi/index.js`中：
>
>```js
>在 methods 中：如果不是最新的期刊，就继续绑定自定义事件left
>onLeft: function(event) { //不是最新一期
>      if (!this.properties.latest) {
>        this.triggerEvent('left', {}, {})
>      }
>
>    },
>```
>
>

#### 右箭头：

>在navi/index.wxml中`<image bind:tap="onRight" class="icon" src="{{first?disRightSrc:rightSrc}}"/>`
>
>src显示图片规则：如果是第一期的期刊，就显示向右禁用状态disRightSrc箭头；如果不是第一期的期刊，就显示向右可用状态rightSrc箭头
>
>为图片绑定触摸事件onRight，在`navi/index.js`中：
>
>```js
>在 methods 中：如果不是第一期的期刊，就继续绑定自定义事件right
>onRight: function(event) { //不是第一期
>      if (!this.properties.first) {
>        this.triggerEvent('right', {}, {})
>      }
>
>    }
>```

##### 在`pages/classic`中：

>
>
>```js
>1:在 classic.json 中，注册使用navi自定义组件
>{
>  "usingComponents": {
>    "v-like": "/components/like/index",
>    "v-movie": "/components/classic/movie/index",
>    "v-episode": "/components/episode/index",
>    "v-navi": "/components/navi/index"
>  }
>}
>2:在 classic.wxml 中：绑定自定义事件left， 获取当前一期的下一期；绑定自定义事件right，获取当前一期的上一期
><v-navi bind:left="onNext" bind:right="onPrevious" class="nav" title="{{classic.title}}" first="{{first}}" latest="{{latest}}"/>
>    
>3：在 classic.js 中：
>// 获取当前一期的下一期，左箭头
>onNext: function(evevt) {this._updateClassic('next')
>  },
>// 获取当前一期的上一期，右箭头
> onPrevious: function(evevt) { this._updateClassic('previous')
>  },
>// 重复代码过多，利用函数封装的思想，新建一个函数抽取公共代码
>// 发送请求，获取当前页的索引，更新数据
>  _updateClassic: function(nextOrPrevious) {
>    let index = this.data.classic.index
>    classicModel.getClassic(index, nextOrPrevious, (res) => {
>      // console.log(res)
>      this.setData({
>        classic: res,
>        latest: classicModel.isLatest(res.index),
>        first: classicModel.isFirst(res.index)
>      })
>    })
>  },
>      
> 4：在 models/classic.js 中：
> // 当前的期刊是否为第一期，first就变为true，右箭头就显示禁用
>  isFirst(index) {
>    return index === 1 ? true : false
>  }
>// 当前的期刊是否为最新的一期，latest就变为TRUE，左箭头就显示禁用
>// 由于服务器数据还会更新，确定不了最新期刊的索引，所以就要利用缓存机制，将最新期刊的索引存入到缓存中，如果外界传进来的索引和缓存的最新期刊的索一样，latest就变为TRUE，左箭头就显示禁用
>  isLatest(index) {
>    let latestIndex = this._getLatestIndex()
>    return latestIndex === index ? true : false
>  }
>// 将最新的期刊index存入缓存
>  _setLatestIndex(index) {
>    wx.setStorageSync('latest', index)
>  }
>
>  // 在缓存中获取最新期刊的index
>  _getLatestIndex() {
>    let index = wx.getStorageSync('latest')
>    return index
>  }
>```



### 优化缓存。解决每次触摸左右箭头都会频繁向服务器发送请求，这样非常耗性能，用户体验极差。解决方法，就是把第一次发送请求的数据都缓存到本地，再次触摸箭头时，会先查找本地缓存是否有数据，有就直接从缓存中读取数据，没有就在向服务器发送请求，这样利用缓存机制大大的提高了用户的体验。（但也有一部分是需要实时更新的，比如是否点赞的小爱心组件，需要每次都向服务器发送请求获取最新数据）

##### 在 models/classic.js 中：

```js
1:
// 设置缓存中的key 的样式，classic-1这种样式
  _getKey(index) {
    let key = `classic-${index}`
    return key
  }
2:
  // 因为getPrevious，getNext实现代码相似，所以为了简化代码可以合并为一个函数
  // 缓存思路：在缓存中寻找key，找不到就发送请求 API，将key写入到缓存中。解决每次都调用Api向服务器发请求，耗费性能
  // 在缓存中，确定key
  getClassic(index, nextOrPrevious, sCallback) {
    //0: 是next，触摸向左箭头获取下一期，触摸向右箭头否则获取上一期
    let key = nextOrPrevious === 'next' ? this._getKey(index + 1) : this._getKey(index - 1)
    //1:在缓存中寻找key
    let classic = wx.getStorageSync(key)
    //2:如果缓存中找不到key,就调用服务器API发送请求获取数据
    if (!classic) {
      this.request({
        url: `classic/${index}/${nextOrPrevious}`,
        success: (res) => {
            //将获取到的数据设置到缓存中
          wx.setStorageSync(this._getKey(res.index), res)
            //再把获取到的数据返回，供用户调取使用
          sCallback(res)
        }
      })
    } else { //3：如果在缓存中有找到key，将缓存中key对应的value值，返回给用户，供用户调取使用
      sCallback(classic)
    }

  }
--------------------------------------------------------------------------------

// 获取最新的期刊利用缓存机制进一步优化
 //获取最新的期刊
  getLatest(cb) {
    this.request({
      url: 'classic/latest',
      success: (res) => {
//将最新的期刊index存入缓存,防止触摸向左箭头时，没有设置latest的值，左箭头会一直触发发送请求找不到最新的期刊报错
        this._setLatestIndex(res.index)
          //再把获取到的数据返回，供用户调取使用
        cb(res)
        // 将最新的期刊设置到缓存中，先调取 this._getKey() 方法，为最新获取的期刊设置key值，调用微信设置缓存方法将key，和对应的value值res存进去
        let key = this._getKey(res.index)
        wx.setStorageSync(key, res)
		
      }
    })
  }
```

处理是否点赞小爱心组件的缓存问题：他不需要缓存，需要实时获取最新数据

##### 在 models/like.js 中：

```js
//编写一个获取点赞信息的方法，从服务器获取最新点赞信息的数据
  // 获取点赞信息
  getClassicLikeStatus(artID, category, cb) {
    this.request({
      url: `classic/${category}/${artID}/favor`,
      success: cb
    })
  }

```

##### 在 pages/classic/classic.js 中：

```js
//设置私有数据初始值
data: {
    classic: null,
    latest: true,
    first: false,
    likeCount: 0,//点赞的数量
    likeStatus: false //点赞的状态

  },
      
 // 在classic.wxml中： <v-like class="like" bind:like="onLike" like="{{likeStatus}}" count="{{likeCount}}"/>
      
 // 编写一个私有方法获取点赞信息
  // 获取点赞信息
  _getLikeStatus: function(artID, category) {
    likeModel.getClassicLikeStatus(artID, category, (res) => {
      this.setData({
        likeCount: res.fav_nums,
        likeStatus: res.like_status
      })
    })
  },
      
  //生命周期函数--监听页面加载
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
```

-----------------------------------

##### 在 classic/music/index.js 中：

解决切换期刊时，其他期刊也都是播放状态的问题。应该是，切换期刊时音乐就停止播放，回到默认不播放状态

利用组件事件的通信机制，小程序中只有父子组件

 在 components/classic/music/inddex.js 中：

##### 方案一：

```js

//利用组件生命周期，只有 wx:if 才可以从头掉起组件生命周期
// 组件卸载的生命周期函数
  // 组件卸载音乐停止播放，但这时不生效是因为，在classic.wxml中用的是hidden，应改为if
  detached: function(event) {
    mMgr.stop()
  },
 // 在 pages/classic/classic.wxml 中
 //     <v-music wx:if="{{classic.type===200}}" img="{{classic.image}}" content="{{classic.content}}" src="{{classic.url}}" title="{{classic.title}}"/>
      
```

#### 知识点补充：

> wx:if vs hidden，和Vue框架的v-if和v-show 指令一样：
> wx:if 》他是惰性的，如果初始值为false框架什么也不做，如果初始值为true框架才会局部渲染。true或false的切换就是从页面中局部加入或移除的过程。wx:if 有更高的切换消耗，如果在运行时条件不大可能改变则 wx:if 较好。生命周期会重新执行。
> hidden 》组件始终会被渲染，只是简单的控制显示与隐藏。hidden 有更高的初始渲染消耗。如果需要频繁切换的情景下，用 hidden 更好。生命周期不会重新执行。

##### 方案二：（推荐使用）

解决切换期刊时音乐可以当做背景音乐一直播放，而其他的期刊是默认是不播放状态

##### 在 components/classic/music/inddex.js 中：

```js
//为了保证期刊在切换时，背景音乐可以一直播放，就要去除掉 mMgr.stop() 事件方法
detached: function(event) {
    // mMgr.stop() //为了保证背景音乐的持续播放就不能加stop
  },
      
// 监听音乐的播放状态，如果当前页面没有播放的音乐，就设置playing为false。如果当前页面的音乐地址classic.url和当前正在播放的音乐的地址一样，就让播放状态为true
_recoverStatus: function() {
      if (mMgr.paused) {
        this.setData({
          playing: false
        })
        return
      }
      if (mMgr.src === this.properties.src) {
        
          this.setData({
            playing: true
          })
        
        
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
    },
        
  //调用生命周期函数，每次切换都会触发attached生命周期
        // 在组件实例进入页面节点树时执行
  // hidden，ready，created都触发不了生命周期函数
  attached: function(event) {
    console.log('attach实例进入页面', '触发1')
    this._monitorSwitch()
    this._recoverStatus()


  },
```



### 播放动画旋转效果制作：

##### ##### 在 components/classic/music/index.wxss 中：

```js
//定义帧动画用CSS3
.rotation {
  -webkit-transform: rotate(360deg);
  animation: rotation 12s linear infinite;
  -moz-animation: rotation 12s linear infinite;
  -webkit-animation: rotation 12s linear infinite;
  -o-animation: rotation 12s linear infinite;
}

@-webkit-keyframes rotation {
  from {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}

```

### 补充css3知识点：

> 》使用CSS3开启GPU硬件加速提升网站动画渲染性能：
> 为动画DOM元素添加CSS3样式-webkit-transform:transition3d(0,0,0)或-webkit-transform:translateZ(0);，这两个属性都会开启GPU硬件加速模式，从而让浏览器在渲染动画时从CPU转向GPU，其实说白了这是一个小伎俩，也可以算是一个Hack，-webkit-transform:transition3d和-webkit-transform:translateZ其实是为了渲染3D样式，但我们设置值为0后，并没有真正使用3D效果，但浏览器却因此开启了GPU硬件加速模式。
> 》这种GPU硬件加速在当今PC机及移动设备上都已普及，在移动端的性能提升是相当显著地，所以建议大家在做动画时可以尝试一下开启GPU硬件加速。
>
> 》适用情况
> 通过-webkit-transform:transition3d/translateZ开启GPU硬件加速的适用范围：
>
> 使用很多大尺寸图片(尤其是PNG24图)进行动画的页面。 
> 页面有很多大尺寸图片并且进行了css缩放处理，页面可以滚动时。 
> 使用background-size:cover设置大尺寸背景图，并且页面可以滚动时。(详见:https://coderwall.com/p/j5udlw) 
> 编写大量DOM元素进行CSS3动画时(transition/transform/keyframes/absTop&Left) 
> 使用很多PNG图片拼接成CSS Sprite时 
> 》总结
> 　　通过开启GPU硬件加速虽然可以提升动画渲染性能或解决一些棘手问题，但使用仍需谨慎，使用前一定要进行严谨的测试，否则它反而会大量占用浏览网页用户的系统资源，尤其是在移动端，肆无忌惮的开启GPU硬件加速会导致大量消耗设备电量，降低电池寿命等问题。

##### 在 components/classic/music/index.wxml 中：

```js
//为图片加上播放就旋转的类，不播放 就就为空字符串
<image class="classic-img {{playing?'rotation':''}}"  src="{{img}}"></image>

```

---------------------------------

用 slot 插槽，解决在公用组件中可以加入其他修饰内容问题。其实就是，在定义公用组件时，用 slot 命名插槽占位，在父组件调用时可以传递需要的内容补位。和Vue的指令 v-slot 相似。

##### 在 components/tag/index.js 中：

```js
//在 Component 中加入
// 启用slot
  options: {
    multipleSlots: true
  },
```



##### 在定义的公共组件 components/tag/index.wxml 中：

```html
//定义几个命名插槽，供父元素占位使用
<view class="container tag-class">
  <slot name="before"></slot>
  <text>{{text}}</text>
  <slot name="after"></slot>
</view>
```

##### 在 pages/detail/detail.json 中：

```json
//注册并使用组件
{
  "usingComponents": {
    "v-tag": "/components/tag/index"
  }
}
```

##### 在 pages/detail/detail.wxml 中：

```html
//使用组件v-tag，补位命名插槽
<v-tag tag-class="{{index===0?'ex-tag1':''||index===1?'ex-tag2':''}}" text="{{item.content}}">
     <text class="num" slot="after">{{'+'+item.nums}}</text>
</v-tag>
```





------------------------------------------

##### 在 `pages/detail/detail` 中，解决评论内容自定义组件 v-tag 评论前两条显示两种颜色的做法：

###### 第一种方法：（推荐使用）

##### 在  pages/detail/detail.wxss  中：

```css
/* v-tag是自定义组件，不能使用css3,在微信小程序中，只有内置组件才可以用css3 */
/*用CSS hack方式给自定义组件加样式*/
.comment-container>v-tag:nth-child(1)>view {
  background-color: #fffbdd;
}

.comment-container>v-tag:nth-child(2)>view {
  background-color: #eefbff;
}
```

###### 第二种方法：

定义外部样式方法，像父子组件传递属性一样，传递样式类

##### 在 detail.wxss 中：

```css
/* 定义外部样式 */

.ex-tag1 {
  background-color: #fffbdd !important;
}

.ex-tag2 {
  background-color: #eefbff !important;
}
```

##### 在 detail.wxml 中：

```html
/*将自定义的样式类通过属性传值的方式传递给自定义子组件v-tag */
<v-tag tag-class="{{index===0?'ex-tag1':''||index===1?'ex-tag2':''}}" text="{{item.content}}">
        <text class="num" slot="after">{{'+'+item.nums}}</text>
</v-tag>
```

##### 在 components/tag/index.js 中：

```js
//将外部传进来的样式写在Component中，声明一下
// 外部传进来的css,样式
  externalClasses: ['tag-class'],

```



##### 在 components/tag/index.wxml 中：

```html
// 把父组件传递过来的类 tag-calss 写在 class 类上
<view class="container tag-class">
  <slot name="before"></slot>
  <text>{{text}}</text>
  <slot name="after"></slot>
</view>
```

----------------------------------------

### 解决服务器返回的内容简介有 \n 换行符的问题：

原因：

> 是因为服务器返回的原始数据 是   `\\n` ,经过转义就变成  `\n` 
>
> 而 `\n` 在text文本标签中默认转义为换行

解决方法：

WXS：WXS（WeiXin Script）是小程序的一套脚本语言，结合 `WXML`，可以构建出页面的结构。和Vue 中的 Vue.filter(过滤器名，过滤器方法) 很相似。WXS 与 JavaScript 是不同的语言，有自己的语法，并不和 JavaScript 一致。由于运行环境的差异，在 iOS 设备上小程序内的 WXS 会比 JavaScript 代码快 2 ~ 20 倍。在 android 设备上二者运行效率无差异。

##### 在 utils/filter.wxs 中：

```js
// 定义过滤器函数，处理服务器返回的数据，将 \\n 变成 \n
// 会打印两次，undefined和请求得到的数据，因为第一次初始时text为null，发送请求得到数据后调用setData更新数据一次
var format = function(text) {
  console.log(text)
    
  if (!text) {
    return
  }
  var reg = getRegExp('\\\\n', 'g')
  return text.replace(reg, '\n')
}

module.exports.format = format
```

##### 在  pages/detail/detail.wxml 中：

```html
//引入
<wxs src="../../utils/filter.wxs" module="util"/>
//在需要过滤的数据中使用
<text class="content">{{util.format(book.summary)}}</text>
```

-----------------

### 解决解决服务器返回的内容简介首行缩进的问题：

##### 在  pages/detail/detail.wxss 中：

```css
//对需要缩进的段落前加以下的类，但这时只有第一段缩进
.content {
  text-indent: 58rpx;
  font-weight: 500;
}
```

##### 在 utils/filter.wxs 中：

```js
//用转义字符 &nbsp; 作为空格，但这时小程序会以&nbsp;样式输出，不是我们想要的效果
var format = function(text) { 
  if (!text) {
    return
  }
  var reg = getRegExp('\\\\n', 'g')
  return text.replace(reg, '\n&nbsp;&nbsp;&nbsp;&nbsp;')
}

module.exports.format = format
```

##### 在  pages/detail/detail.wxml 中：

```html
//加入属性  decode="{{true}}"，首行缩进问题解决
<text class="content" decode="{{true}}">{{util.format(book.summary)}}</text>
```

------------------------------------

### 解决短评过多让其只显示一部分的问题：

##### 在 utils/filter.wxs 中：

```js
//添加一个限制短评长度的过滤器，并导出
// 限制短评的长度的过滤器
var limit = function(array, length) {
  return array.slice(0, length)
}

module.exports = {
  format: format,
  limit: limit
};
```

##### 在  pages/detail/detail.wxml 中：

```html
<wxs src="../../utils/filter.wxs" module="util"/>

<view class="sub-container">
    <text class="headline">短评</text>
    <view class="comment-container">
      <block wx:for="{{util.limit(comments,10)}}" wx:key="content">
        <v-tag tag-class="{{index===0?'ex-tag1':''||index===1?'ex-tag2':''}}" text="{{item.content}}">
        <text class="num" slot="after">{{'+'+item.nums}}</text>
        </v-tag>
      </block>
    </view>
  </view>


```

##### 在  pages/detail/detail.wxml 中：进一步优化

```html
// 由于 <v-tag tag-class="{{index===0?'ex-tag1':''||index===1?'ex-tag2':''}}" text="{{item.content}}"> 过于乱，改写成wxs形式：
   
//先定义wxs过滤器
    <wxs module="tool">
  var highlight = function(index){
    if(index===0){
      return 'ex-tag1'
    }
    else if(index===1){
      return 'ex-tag2'
    }
    return ''
  }
  module.exports={
    highlight:highlight
  }
</wxs>
    
    //改写为：
    <v-tag tag-class="{{tool.highlight(index)}}" text="{{item.content}}">
    
```



---------------------------

## 详情最底部短评的实现：

用户提交评论内容：

点击标签向服务器提交评论内容：

##### 在 components\tag\index.wxml 中：

```html
//为短评组件绑定出没事件 onTap
<view bind:tap="onTap" class="container tag-class">
  <slot name="before"></slot>
  <text>{{text}}</text>
  <slot name="after"></slot>
</view>
```

##### 在 components\tag\index.js 中：

```js
// 当触摸短评小标签时，触发一个自定义事件，将短评内容传进去，公父组件调用自定义事件tapping
 methods: {
    // 触摸短评小标签时，触发的事件，触发一个自定义事件
    onTap(event) {
      this.triggerEvent('tapping', {
        text: this.properties.text
      })
    }
  }
```

##### 在 pages\detail\detail.wxml  中：

```html
//在父组件中调用子组件的自定义tapping事件，并且触发事件onPost
<v-tag bind:tapping="onPost" tag-class="{{tool.highlight(index)}}" text="{{item.content}}">
    <text class="num" slot="after">{{'+'+item.nums}}</text>
</v-tag>
```

##### 在 models\book.js 中：

```js
//调取新增短评的接口
// 新增短评
  postComment(bid, comment) {
    return this.request({
      url: '/book/add/short_comment',
      method: 'POST',
      data: {
        book_id: bid,
        content: comment
      }
    })
  }
```

##### 在 pages\detail\detail.js 中：

```js
// 触摸tag组件会触发，input输入框也会触发事件onPost
// 获取用户的输入内容或触发tag里的内容,并且对用户输入的评论做校验，如果评论的内容长度大于12就弹出警告不向服务器发送请求
//如果评论内容符合规范，就调用新增短评接口并将最新的评论插到comments数组的第一位，更新数据，并且把蒙层mask关闭
onPost(event) {
    // 获取触发tag里的内容
    const comment = event.detail.text
      // 对用户输入的评论做校验
    if (comment.length > 12) {
      wx.showToast({
        title: '短评最多12个字',
        icon: 'none'
      })
      return
    }

    // 调用新增短评接口并将最新的评论插到comments数组的第一位
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

```

##### 在 pages\detail\detail.wxml  中：

```html
// input有自己的绑定事件bindconfirm，会调用手机键盘完成按键
<input bindconfirm="onPost"  type="text" class="post" placeholder="短评最多12个字"/>
```

##### 在 pages\detail\detail.js 中：

点击标签向服务器提交评论内容完成：

```js
// 触摸tag组件会触发，input输入框也会触发事件onPost事件；然后获取触发tag里的内容或获取用户input输入的内容；对tag里的内容或对用户输入的评论做校验并且输入的内容不能为空；最后调用新增短评接口并将最新的评论插到comments数组的第一位,并且把蒙层mask关闭

 onPost(event) {
    const comment = event.detail.text||event.detail.value
    console.log('comment'+comment)
    console.log('commentInput'+comment)
    if (comment.length > 12|| !comment) {
      wx.showToast({
        title: '短评最多12个字',
        icon: 'none'
      })
      return
    }
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
```

### 细节处理：

如果没有短评显示问题：

##### 在 pages\detail\detail.wxml 中：

```html
//在短评后加上还没有短评标签，如果没有comments短评就不显示还没有短评标签
<text class="headline">短评</text>
<text class="shadow" wx:if="{{!comments.length}}">还没有短评</text>

//在尽可点击标签+1后加上暂无评论标签，如果没有comments短评就不显示暂无评论标签
<text wx:if="{{!comments.length}}">尽可点击标签+1</text>
<text wx:else>暂无短评</text>
```

-------------------------------------------------

由于需要加载的数据较多，为了提高用户体验，需要加一个loading提示数据正在加载中，数据加载完成后就消失；

由于都是利用promise异步加载数据，这时取消loading显示应该加到每个promise后，显然不符合需求。如果利用回调函数机制，先加载1在一的回调函数里在加载2依次顺序加载，在最后一个回调函数中写取消loading操作，这样的方式虽然可以实现，但非常耗时间，请求是串行的，假如一个请求需要花费2s中，发三个请求就要花费6秒，非常耗时，而且还会出现回调地狱的现象，不推荐使用。

解决方法：在Promise中，有一个Promise.all()方法就可以解决。

### 补充知识点：

> **Promise.all(iterable)** 方法返回一个 [`Promise`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 实例，此实例在 `iterable` 参数内所有的 `promise` 都“完成（resolved）”或参数中不包含 `promise` 时回调完成（resolve）；如果参数中  `promise` 有一个失败（rejected），此实例回调失败（reject），失败原因的是第一个失败 `promise` 的结果。简单来说就是：只要有一个数组里的promise获取失败就调用reject回调，只有全部数组里的promise都成功才调用resolve回调。
>
> **Promise.race(iterable)** 方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。`race` 函数返回一个 `Promise`，它将与第一个传递的 promise 相同的完成方式被完成。它可以是完成（ resolves），也可以是失败（rejects），这要取决于第一个完成的方式是两个中的哪个。如果传的迭代是空的，则返回的 promise 将永远等待。如果迭代包含一个或多个非承诺值和/或已解决/拒绝的承诺，则` Promise.race` 将解析为迭代中找到的第一个值。简单来说就是：不论成功还是失败的回调，哪一个快就执行哪个。



##### 在 pages\detail\detail.js 中：

```js
//用了 Promise.all(iterable) 方法就不用写三个Promise方法分别来更新数据了，可以简写成一个all方法再返回的成功的promise中调用setData(),更新请求回的数据
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

    
  },
```

------------------------------------

## 图书的搜索：

高阶组件：如果一个组件里面的内容比较复杂，包含大量的业务

### 知识点补充：

>工作中我们通常把业务处理逻辑写在models中：
>
>可以写在单个公用组件里，只供自己写业务逻辑调取使用；
>
>可以写在components中，只供components内的组件调取使用，如果想把components发布出去给其他项目用或者提供给其他开发者使用；
>
>可以写在项目根目录models下，供整个项目调取使用写业务逻辑，如果只是做个项目建议写在这里不会乱。
>
>

##### 在 components\search\index 中：

### 处理历史搜索和热门搜索:

> 历史搜索：将历史搜索关键字写入缓存中，在从缓存中获取历史搜索关键字。
>
> 热门搜索：调取服务器API         
>
>  GET      /book/hot_list

##### 将业务逻辑写在 models\keyword.js 中：

```js
//首先从缓存中获取历史搜索关键字数组，判断获取的数组是否为空，如果为空，为了防止报错就返回空数组；如果不为空就直接返回获取的数组。
//将搜索关键字写入缓存中，先从缓存中获取历史关键字的数组，判断是否包含此次输入的关键字，如果没有此关键字，如果获取的长度大于最大长度，就将数组的最后一项删除；如果获取数组的长度小于最大长度，就将此次输入的关键字加到数组的第一位，并且设置到缓存中。
class KeywordModel {
  constructor() {
    // 把key属性挂载到当前实例上，供实例调取使用
    this.key = 'q',
    this.maxLength = 10 //搜索关键字的数组最大长度为10
  }

  //从缓存中，获取历史搜索关键字数组，如果缓存中没有直接返回空数组
  getHistory() {
    const words = wx.getStorageSync(this.key)
    if (!words) {
      return []
    }
    return words
  }

  // 将历史搜索关键字写入缓存中。先从缓存中获取历史关键字的数组，判断数组中是否已经有此关键字。如果没有，并且获取数组的长度大于最大长度，就将数组最后一项删除。获取数组的长度小于最大长度就将此次输入的关键字加到数组第一位，并且设置到缓存中；
  addToHistory(keyword) {
    let words = this.getHistory()
    const has = words.includes(keyword)
    if (!has) {
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

  }
}

export {KeywordModel}
```

##### 在 components\search\index.wxml 中：

```html
//为input输入框绑定onConfirm事件
<input bind:confirm="onConfirm" type="text" class="bar" placeholder-class="in-bar" placeholder="书籍名" auto-focus="true"/>
```

##### 在 components\search\index.js 中：

```js
// onConfirm事件执行，调用将输入的内容添加到缓存中的方法Keywordmodel.addToHistory(word)，就可以将历史关键字添加到缓存中
methods: {
    // 点击取消将搜索组件关掉，有两种方法：一是，在自己的内部创建一个变量控制显隐，不推荐，因为万一还有其他操作扩展性不好。二是，创建一个自定义事件，将自定义事件传给父级，让父级触发
    onCancel(event) {
      this.triggerEvent('cancel', {}, {})
    },

    // 在input输入框输入完成将输入的内容加到缓存中
    onConfirm(event) {
      const word = event.detail.value
      Keywordmodel.addToHistory(word)
    }
  }
```

##### 在 components\search\index.js 中：

```js
//将历史搜索的内容从缓存中取出来
data: {
    historyWords: [] //历史搜索关键字
  },

  // 组件初始化时，小程序默认调用的生命周期函数
  attached() {
    const historywords = Keywordmodel.getHistory()
    this.setData({
      historyWords: historywords
    })
  },
```

##### 在 components\search\index.json 中：

```json
//注册引用小标签 tag 组件，组件中也可以引入其他组件
"usingComponents": {
    "v-tag": "/components/tag/index"
  }
```

##### 在 components\search\index.wxml 中：

```html
// 遍历historyWords数组中的每一项，呈现在页面中
     <view class="history">
      <view class="title">
        <view class="chunk"></view>
        <text>历史搜索</text>
      </view>
      <view class="tags">
        <block wx:for="{{historyWords}}" wx:key="item">
          <v-tag text='{{item}}'/>
        </block>
      </view>
    </view>
```

### 热门搜索：

##### 在 models\keyword.js 中：

```js 
// 引入自己封装的API请求方法
import {
  HTTP
} from '../utils/http-promise'

// 获取热门搜素搜关键字
  getHot() {
    return this.request({
      url: '/book/hot_keyword'
    })
  }
```

##### 在 components\search\index.js 中：

```js
//定义组件初始值，通过调用传进来的getHot方法获取热门搜索关键字，并更新到初始值hotWords中
data: {
    historyWords: [], //历史搜索关键字
    hotWords: [] //热门搜索关键字
  },
// 组件初始化时，小程序默认调用的生命周期函数
  attached() {
    const historywords = Keywordmodel.getHistory()
    const hotword = Keywordmodel.getHot()
    this.setData({
      historyWords: historywords
    })

    hotword.then(res => {
      this.setData({
        hotWords: res.hot
      })
    })
  },
```

##### 在 components\search\index.wxml 中：

```html
//将从服务器获取到的hotWords数组遍历，呈现到页面中
<view class="history hot-search">
      <view class="title">
        <view class="chunk"></view>
        <text>热门搜索</text>
      </view>
      <view class="tags">
        <block wx:for="{{hotWords}}" wx:key="item">
          <v-tag text='{{item}}'/>
        </block>
      </view>
    </view>
```

### 注意点：

>由于在  components\search\index.js 调用了 Keywordmodel.getHot()方法，这个方法是和服务器相关联的，这样做，会使组件复用性降低。
>
>如果要想让search组件复用性变高，应该在 components\search\index.js 的 properties 中开放一个属性，然后再引用search组件的pages页面里调用models里的方法，再把数据通过属性传递给search组件，然后再做数据绑定，这样就让search组件具备了复用性
>
>

##### 在 models\book.js 中：

```js
//定义search函数，封装向服务器发送请求功能
// 书籍搜索
  search(start, q) {
    return this.request({
      url: '/book/search?summary=1',
      data: {
        q: q,
        start: start
      }
    })
  }
```

##### 在 components\search\index.js 中：

```js
// 导入并实例化BookModel类，负责向服务器发送搜索图书的请求；在data中声明私有变量 dataArray 数组，为搜索图书当summary=1,返回概要数据。在用户输入完成点击完成时，调用bookmodel.search方法，并更新数据到dataArray中。
//注意点：不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
import {
  BookModel
} from '../../models/book'
const bookmodel = new BookModel()

data: {
    historyWords: [], //历史搜索关键字
    hotWords: [], //热门搜索关键字
    dataArray: [] //搜索图书当summary=1,返回概要数据
  },
      
       // 在input输入框输入完成将输入的内容加到缓存中
    onConfirm(event) {
      const word = event.detail.value

      // 获取搜索的关键词q,调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value
      bookmodel.search(0, q).then(res => {
        this.setData({
          dataArray: res.books
        })

        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(word)

      })

    }
```

##### 在 components\search\index.wxml 中：

解析得到的搜索数据，并遍历呈现到页面中：

```html
//搜索得到的数据和热门搜索，历史搜索是不能一起显示的，一个显示，另一个就得隐藏，搜索得到的结果页面是默认不显示的，需要定义searching一个变量来控制显隐
<view wx:if="{{searching}}" class="books-container">
    <block wx:for="{{dataArray}}" wx:key="{{item.id}}">
      <v-book book="{{item}}" class="book"></v-book>
    </block>
  </view>

```

##### 在 components\search\index.js 中：

```js
//在data私有属性中定义searching变量来控制显隐，默认为false；在触发onConfirm事件中， 为了用户体验好，应该点击完立即显示搜索页面，并将searching改为true，让其搜索的内容显示到页面上
data: {
    historyWords: [], //历史搜索关键字
    hotWords: [], //热门搜索关键字
    dataArray: [], //搜索图书当summary=1,返回概要数据
    searching: false //控制搜索到的图书数据的显隐，默认不显示
  },

    // 在input输入框输入完成将输入的内容加到缓存中
    onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this.setData({
        searching: true
      })

      // 获取搜索的关键词q,调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value
      bookmodel.search(0, q).then(res => {
        this.setData({
          dataArray: res.books
        })

        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(q)

      })

    }
```

### 实现 搜索框里的 x 按钮功能：

##### 在  components\search\index.js 中:

```js
// 在 components\search\index.wxml 中，为 x 图片绑定触摸时触发的 onDelete 事件<image bind:tap="onDelete" class="cancel-img" src="images/cancel.png"/>

// 触摸搜索图片里的x回到原来输入搜索的页面
onDelete(event){
      this.setData({
        searching: false
      })
    },


```

### 实现 用户点击历史搜索和热门搜索里的标签也能跳转到相应的搜索到的结果显示页面：只要监听到用户点击标签的事件就可以实现

##### 在 components\search\index.js 中:

```js
// 在 components\search\index.wxml 中：绑定v-tag组件自定事件tapping触发onConfirm事件：`<v-tag bind:tapping="onConfirm" text='{{item}}'/>`


  // 在input输入框输入完成将输入的内容加到缓存中
    onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this.setData({
        searching: true
      })

      // 获取搜索的关键词q:一种是用户输入的内容或是通过调用tag组件的自定义事件tapping，里面有携带的text文本；调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value || event.detail.text
      bookmodel.search(0, q).then(res => {
        this.setData({
          dataArray: res.books
        })

        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(q)

      })

    }
```

### 解决再点击tag标签搜索时应该在input输入框中显示书名的问题：

##### 在 components\search\index.js 中:

```js
//通过数据绑定给input输入框绑定value="{{q}}"
//`<input value="{{q}}" bind:confirm="onConfirm" type="text" class="bar" placeholder-class="in-bar" placeholder="书籍名" auto-focus="true"/>`

//先在data中定义私有数据 q: ''  代表输入框中要显示的内容，当数据请求完成后把点击标签的内容q赋值给私有数据q并更新
data: {
    historyWords: [], //历史搜索关键字
    hotWords: [], //热门搜索关键字
    dataArray: [], //搜索图书当summary=1,返回概要数据
    searching: false, //控制搜索到的图书数据的显隐，默认不显示
    q: '' //输入框中要显示的内容
  },
   // 在input输入框输入完成将输入的内容加到缓存中
    onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this.setData({
        searching: true
      })

      // 获取搜索的关键词q,调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value || event.detail.text
      bookmodel.search(0, q).then(res => {
        this.setData({
          dataArray: res.books,
          q: q
        })

        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(q)

      })

    }
```

### 实现数据分页加载功能：

第一种方法：用微信小程序提供的内置组件 `scroll-view`   。

第二种方法：用 pages 里的 页面上拉触底事件的处理函数 onReachBottom。：

##### 在 pages\book\book.js 中：

```js
//在 data里设置私有变量more为false，代表的是是否需要加载更多数据，默认是不加载
data: {
    books: [],
    searching: false, //控制搜索框组件search显隐，默认不显示
    more: false //是否需要加载更多数据，默认是不加载
  },
      
 //用pages里自带的 页面上拉触底事件的处理函数 onReachBottom 监听页面是否到底了，如果到底了就会就会将more改变为true，就可以实现加载更多数据方法    
  onReachBottom: function() {
    console.log('到底了')
    this.setData({
      more: true
    })
  },
      
 //由于 search 组件不是页面级组件，没有 onReachBottom 函数，就需要通过属性传值的方式将more私有变量控制是否加载更多数据传给子组件search
 // 在pages\book\book.wxml中： `<v-search more="{{more}}" bind:cancel="onCancel" wx:if="{{searching}}"/>`
      
 //然后在search组件里接收父级传递过来的属性more，并利用监听函数observer，只要外界传来的数据改变就会触发此函数执行
  properties: {
    more: {
      type: String,
      observer: '_load_more'
    } //从pages/book/book.js 传来的属性，监听滑到底步操作.只要外界传来的属性改变就会触发observer函数执行
  },
      
 methods: {
    // 只要外界传来的属性改变就会触发observer函数执行
    _load_more() {
      console.log('监听函数触发到底了')
    },
 }

```

> 但现在存在一个问题就是：
>
> observer只会触发一次，因为下拉到底会把more变为true，之后就都是true不会再发生变化了，就不会再触发监听函数observer执行。
>
> 解决方法：用随机字符串触发observer函数，因为observer函数的执行必须是监听的数据发生改变才会执行此函数。和Vue中的watch很相似。

##### 在  pages\book\book.js 中：

```js
//将私有数据data中的more改为空字符串
data: {
    books: [],
    searching: false, //控制搜索框组件search显隐，默认不显示
    more: '' //是否需要加载更多数据，默认是不加载
  },
      
//触发 页面上拉触底事件的处理函数，将more变为随机数，导入random自定义随机处理函数，问题解决
 onReachBottom: function() {
    console.log('到底了')
    this.setData({
      more: random(16)
    })
  },
      
// 在 utils\common.js 中：
// 定义随机生成字符串处理函数,n是生成随机字符串的位数
const charts = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

const random = function generateMixed(n) {
  var res = ''
  for (var i = 0; i < n; i++) {
    var id = Math.ceil(Math.random() * 35)
    res += charts[id]
  }
  return res
}

export {
  random
}

```

##### 在 components\search\index.js  中:

### 实现加载更多数据：

```js
// 和onConfirm一样都需要调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
// 先判断已得到的搜索数据的长度,在调用search方法将最新获取的数据和原来的数据拼接到一起更新数据然后呈现到页面中
 _load_more() {
      console.log('监听函数触发到底了')
      const length = this.data.dataArray.length
      bookmodel.search(length, this.data.q).then(res => {
        const tempArray = this.data.dataArray.concat(res.books)
        this.setData({
          dataArray: tempArray
        })
      })

    },


```

### 细节完善：

```js
//如果关键字q初始没有值就直接返回什么也不做
_load_more() {
      console.log('监听函数触发到底了')
    if (!this.data.q) {
        return
      }
      const length = this.data.dataArray.length
      bookmodel.search(length, this.data.q).then(res => {
        const tempArray = this.data.dataArray.concat(res.books)
        this.setData({
          dataArray: tempArray
        })
      })

    },

//问题：当下拉刷新没有更多数据时，还会继续向服务器发送请求非常耗性能；还有就是用户操作过快没等第一次请求的结果回来，就又发送一次相同的请求，会加载重复的数据，非常耗性能
        
//解决：使用锁的概念解决重复加载数据的问题
//其实就是事件节流操作，在data中定义一个loading：false，表示是否正在发送请求，默认是没有发送请求，在_load_more中，判断如果正在发送请求就什么也不做，如果没有正在发送请求就将loading变为true，调用search方法向服务器发送请求，待请求完毕并返回结果时将loading变为false。
        data:{
           loading: false //表示是否正在发送请求，默认是没有发送请求 
        },
        _load_more() {
      console.log('监听函数触发到底了')
    if (!this.data.q) {
        return
      }
    // 如果是正在发送请求就什么也不做
      if (this.data.loading) {
        return
      }
      const length = this.data.dataArray.length
      bookmodel.search(length, this.data.q).then(res => {
        const tempArray = this.data.dataArray.concat(res.books)
        this.setData({
          dataArray: tempArray,
            loading: false
        })
      })

    },
       
```

### 进一步封装优化，组件行为逻辑抽象分页行为，顺便解决 是否还有更多数据的问题：

在 components中，创建并封装一个公用行为和方法的组件pagination：

#####在 components\behaviors\pagination.js 中：

```js
//封装一个公用行为和方法的类paginationBev
const paginationBev = Behavior({
  data: {
    dataArray: [], //分页不断加载的数据
    total: 0 //数据的总数
  },

  methods: {
    // 加载更多拼接更多数据到数组中；新加载的数据合并到dataArray中
    setMoreData(dataArray) {
      const tempArray = this.data.dataArray.concat(dataArray)
      this.setData({
        dataArray: tempArray
      })
    },

    // 调用search方法时返回起始的记录数 
    getCurrentStart() {
      return this.data.dataArray.length
    },

    // 获取设置从服务器得到数据的 总长度
    setTotal(total) {
      this.data.total = total
    },

    // 是否还有更多的数据需要加载。如果得到数据的长度大于服务器返回的总长度，代表没有更多数据了，就停止发请求
    hasMore() {
      if (this.data.dataArray.length >= this.data.total) {
        return false
      } else {
        return true
      }
    }
  }

})

export {
  paginationBev
}

```

##### 在 components\search\index.js 中：

```js
// 先导入封装的公用行为方法，再进一步改写_load_more和onConfirm方法，将写好的公用方法用上
import {
  paginationBev
} from '../behaviors/pagination'

 _load_more() {
      console.log('监听函数触发到底了')
       
      if (!this.data.q) {
        return
      }
      // 如果是正在发送请求就什么也不做
      if (this.data.loading) {
        return
      }
     
     
      if (this.hasMore()) {
        this.data.loading = true//必须放在hasMore()里
        bookmodel.search(this.getCurrentStart(), this.data.q).then(res => {
          this.setMoreData(res.books)
          this.setData({
			loading: false
          })
        })
      }


    },
          onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this.setData({
        searching: true
      })

      // 获取搜索的关键词q,调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value || event.detail.text

      bookmodel.search(0, q).then(res => {
        this.setMoreData(res.books)
        this.setTotal(res.total)
        this.setData({

          q: q
        })

        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(q)

      })

    }
```

### 但这时又会出现一个小问题：就是每次点x回退到搜索页面时，再次搜索同样的书籍时，会存在以前请求的数据没有清空又会重新向服务器发送请求，就会出现更多的重复数据

解决方法：就是在每次点x时，清空本次搜索的数据也就是Behavior里面的数据状态 ，上一次搜索的数据才不会影响本次搜索

##### 在 components\behaviors\pagination.js 中：

```js
//加入清空数据，设置初始值的方法
initialize() {
      this.data.dataArray = []
      this.data.total = null
    }
```

##### 在 components\search\index.js 中：

```js
//在触发onConfirm函数时调用this.initialize()方法先清空上一次搜索的数据在加载
onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this.setData({
          searching: true
        })
        // 先清空上一次搜索的数据在加载
      this.initialize()
        // 获取搜索的关键词q,调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value || event.detail.text

      bookmodel.search(0, q).then(res => {
        this.setMoreData(res.books)
        this.setTotal(res.total)
        this.setData({

          q: q
        })

        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(q)

      })

    }
```

##### 搜索代码重构：增强代码可阅读性：

##### 在 components\search\index.js 中：

```js
//多封装一些小的函数
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
    loading: false //表示是否正在发送请求，默认是没有发送请求
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
      if (this._isLocked()) {
        return
      }
      // const length = this.data.dataArray.length

      if (this.hasMore()) {
        this._addLocked()
        bookmodel.search(this.getCurrentStart(), this.data.q).then(res => {
          this.setMoreData(res.books)
          this._unLocked()
        })
      }


    },



    // 点击取消将搜索组件关掉，有两种方法：一是，在自己的内部创建一个变量控制显隐，不推荐，因为万一还有其他操作扩展性不好。二是，创建一个自定义事件，将自定义事件传给父级，让父级触发
    onCancel(event) {
      this.triggerEvent('cancel', {}, {})
    },

    // 触摸搜索图片里的x回到原来输入搜索的页面
    onDelete(event) {
      this._hideResult()
    },

    // 在input输入框输入完成将输入的内容加到缓存中
    onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this._showResult()
        // 先清空上一次搜索的数据在加载
      this.initialize()
        // 获取搜索的关键词q,调取search方法返回当summary=1,返回概要数据:并更新数据到dataArray中
      const q = event.detail.value || event.detail.text

      bookmodel.search(0, q).then(res => {
        this.setMoreData(res.books)
        this.setTotal(res.total)
        this.setData({

          q: q
        })

        // 不能用户输入什么都保存在缓存中，只有用户搜索到有效的关键字时才保存到缓存中
        Keywordmodel.addToHistory(q)

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
        searching: false
      })
    },

    // 事件节流机制，判断是否加锁
    _isLocked() {
      return this.data.loading ? true : false
    },

    // 加锁
    _addLocked() {
      this.data.loading = true
    },

    // 解锁
    _unLocked() {
      this.data.loading = false
    },


  }
})

```

### 小问题：当加载的时候突然断网，数据还没加载完，等在恢复网络的时候，就不能继续向服务器发送请求了。问题存在的原因在于出现死锁，只有请求成功才会解锁继续发送请求，如果请求失败，就不会解锁什么也做不了。

解决方法：

##### 在 components\search\index.js 中：

```js
//只要在请求失败的回调函数里加上解锁就可以了

      if (this.hasMore()) {
        this._addLocked()
        bookmodel.search(this.getCurrentStart(), this.data.q).then(res => {
          this.setMoreData(res.books)
          this._unLocked()
        }, () => {
          this._unLocked()
        })
      }
```

### 加入loading效果，提升用户体验：

先创建一个loading公共组件，只需写简单的样式效果就行，在search组件中注册并使用。

##### 在 components\search\index.js 中：

```js
// 在 components\search\index.wxml 中：加入两个loading组件。 第一个在中间显示，获取搜获数据中；第二个在底部显示，数据加载更多时显示
//<v-loading class="loading-center" wx:if="{{loadingCenter}}"/>
//  <v-loading class="loading" wx:if="{{loading}}"/>

//在data中添加一个loadingCenter变量控制loading效果是否在中间显示，并且加两个私有函数控制loading的显隐。在onConfirm函数中调用this._showLoadingCenter()函数，显示loading效果，在 数据加载完成，调取this._hideLoadingCenter()，取消显示loading效果，
data: {loadingCenter: false},
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

onConfirm(event) {
      // 为了用户体验好，应该点击完立即显示搜索页面
      this._showResult()
        // 显示loading效果
      this._showLoadingCenter()
      this.initialize()   
      const q = event.detail.value || event.detail.text
      bookmodel.search(0, q).then(res => {
        this.setMoreData(res.books)
        this.setTotal(res.total)
        this.setData({
          q: q
        })
        Keywordmodel.addToHistory(q)
        // 数据加载完成，取消显示loading效果
        this._hideLoadingCenter()
      })

    },
```

### 知识点补充：

>特别注意setData与直接赋值的区别:
>
>setData:调用setData函数更新的数据会触发页面重新渲染，和REACT里的setState相似。
>
>而直接赋值，只是在内存中改变的状态，并没有更新到页面中
>
>

### 空搜索结果的处理：

##### 在 components\behaviors\pagination.js 中：

```js
//在公共行为中加入noneResult：false，控制是否显示没有得到想要的搜索结果，在setTotal方法中，如果返回的结果为0，就是没有得到想要的搜索结果。将noneResult：true显示出来。在initialize设置初始值并清空数据函数，再将noneResult：false，取消显示。

 data: {
    dataArray: [], //请求返回的数组
    total: null, //数据的总数
    noneResult: false //没有得到想要的搜索结果
  },
  
  // 获取设置数据的 总长度
    // 如果返回的结果为0，就说明没有得到搜索结果，将提示内容显示出来
    setTotal(total) {
      this.data.total = total
      if (total === 0) {
        this.setData({
          noneResult: true
        })
      }
    },
        
  // 清空数据，设置初始值，将提示隐藏
    initialize() {
      this.setData({
        dataArray: [],
        noneResult: false
      })
      this.data.total = null
    }
  
```

##### 在 components\search\index.wxml 中：

```html
//加入空搜索显示的结果结构
<text wx:if="{{ noneResult}}" class="empty-tip">没有搜索到书籍</text>
```

##### 在 components\search\index.js 中：

```js
// 触摸搜索图片里的x回到原来输入搜索的页面，先回到初始值，再将搜索组件隐藏。在onConfirm中，不用等数据加载完，输入完成后就把输入的内容显示在输入框中。
onDelete(event) {
      this.initialize()
      this._hideResult()
    },
        
    onConfirm(event) {
      this._showResult()
      this._showLoadingCenter()
      const q = event.detail.value || event.detail.text
        // 不用等数据加载完，输入完成后就把输入的内容显示在输入框中。
      this.setData({
        q: q
      })

      bookmodel.search(0, q).then(res => {
        this.setMoreData(res.books)
        this.setTotal(res.total)
        Keywordmodel.addToHistory(q)
        this._hideLoadingCenter()

      })

    },        
  
```

### 处理一个小问题：就是在热门搜索里搜索王小波，返回的搜索结果页面每本书里会显示有喜欢字样，去掉喜欢字样。

##### 在 components\book\index.js 中：

```js
//在 components\search\index.wxml 中:
//通过搜索组件搜索显示的书籍都不显示喜欢字样，通过属性传值的方式将喜欢字样去掉，把false传递给子组件，子组件通过showLike变量接收，通过数据控制显隐将喜欢字样去掉。
<v-book book="{{item}}" class="book" show-like="{{false}}"></v-book>

//添加一个showLike属性，代表每本书里面的喜欢字样是否显示
properties: {
    book: Object,
    showLike: { //控制每本书下面有个喜欢字样的显示与隐藏
      type: Boolean,
      value: true
    }
  },

//在 components\book\index.wxml 中：
//showLike属性的显示和隐藏控制喜欢字样的显示和隐藏
  <view class="foot" wx:if="{{showLike}}">
      <text class="footer">{{book.fav_nums}}  喜欢</text>
  </view>
```

### 对 search 组件进一步优化，将锁提取到分页行为中：

##### 在 components\behaviors\pagination.js 中：

```js
//把在components\search\index.js中的三个锁方法提取到公用行为方法中，在公用行为方法中，在data里添加loading：false属性。在initialize函数中，把loading：false也加进去即可

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
```

### 两种方法监听移动端触底的操作：

scroll-view 或 Pages 里的 onReachBottom。如果要想用scroll-view把view组件换成scroll-view就可以。

------

微信open-data显示用户信息：`https://developers.weixin.qq.com/miniprogram/dev/api/wx.getUserInfo.html`

用户授权，需要使用 button 来授权登录。

很多时候我们需要把得到信息保存到我们自己的服务器上去，需要通过js代码中操作用户头像等信息。封装一个image-button通用组件就可以，改变他的图片，并且可以在不同的方式中调用，只需要改变open-type属性就可以。

----------

分享的实现：自定义分享button：

---------------

小程序之间的跳转：这两个小程序都必须关联同一个公众号

------------------

==============================================================

------------------------



## bug解决

在`components/episode/index.js`中

报错`RangeError: Maximum call stack size exceeded`:

原因：

```js
//错误写法
properties: {
    index: { //默认显示为0
      type: String,
      observer: function(newVal, oldVal, changedPath) {
        let val = newVal < 10 ? '0' + newVal : newVal
        this.setData({
          index: val
        })
      }
    }
  },
//小程序的observer，相当于vue中的watch监听函数，只要监听的index数据改变，就会调用observer方法，会形成死循环，就会报错RangeError: Maximum call stack size exceeded
```



解决：

```js
  //第一种解决方法   
this.setData({
          _index: val
        })

  data: {
    year: 0,
    month: '',
    _index: ''
  },
```

```js
//第二种解决方法  （推荐）

```

-------------------------------------------

在`components/music/index.js`中:

报错：`setBackgroundAudioState:fail title is nil!;at pages/classic/classic onReady function;at api setBackgroundAudioState fail callback function`

`Error: setBackgroundAudioState:fail title is nil!`

原因：

少 title 外传属性

解决：

```js
//在`components/music/index.js`中：
properties: {
    src: String,
    title: String
  },
methods: {
    // 为图片绑定触摸播放事件
    onPlay: function() {
      //图片切换
      this.setData({
        playing: true
      })
      mMgr.src = this.properties.src
      mMgr.title = this.properties.title
    }
  }
-----------------------------------------------------------------------------
//在 app.json 中加上：
"requiredBackgroundModes": [
    "audio"
  ],
```

-------------

















--------------------------------------------------------------------------

============================================================================

--------------------------------------------------------------------------------------------------------------------------------

### 移动端增加用户体验优化

#### 在`components/navi`中：

> 点击的左右小三角要足够大，用户触摸时才能点击到。两种方法，第一种是再切图时，切得大一些；第二种是，自己编写代码控制操作区域





-----------------------

-------------------------------------------

完成效果展示：

