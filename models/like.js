import {
  HTTP
} from '../utils/http'

// 点赞组件
class LikeModel extends HTTP {
  // 发送取消点赞，点赞API
  like(behavior, artID, category) {
    let url = behavior === 'like' ? 'like/cancel' : 'like'
    this.request({
      url: url,
      method: 'POST',
      data: {
        art_id: artID,
        type: category
      }
    })
  }

  // 获取点赞信息
  getClassicLikeStatus(artID, category, cb) {
    this.request({
      url: `classic/${category}/${artID}/favor`,
      success: cb
    })
  }


















}
export {
  LikeModel
}
