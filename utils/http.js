import {
  config
} from '../config.js'

// 错误码提示
const tips = {
  1: '抱歉出现了一个错误', //默认错误
  0: 'OK, 成功',
  1000: '	输入参数错误',
  1001: '	输入的json格式不正确',
  1002: '	找不到资源',
  1003: '	未知错误',
  1004: '	禁止访问',
  1005: '	不正确的开发者key',
  1006: '	服务器内部错误',
  1007: '请求地址错误',
  2000: '你已经点过赞了',
  2001: '你还没点过赞',
  3000: '该期内容不存在'

}

class HTTP {
  //http 请求类, 当noRefech为true时，不做未授权重试机制
  request(params) {
    if (!params.method) { //没传方法默认为get，容错处理
      params.method = 'GET'
    }
    wx.request({
      url: config.api_base_url + params.url,
      data: params.data,
      method: params.method,
      header: {
        'content-type': 'application/json',
        'appkey': config.appkey
      },
      success: (res) => {
        // 判断以2（2xx)开头的状态码为正确
        // 异常不要返回到回调中，就在request中处理，记录日志并showToast一个统一的错误即可
        let code = res.statusCode.toString()
        if (code.startsWith('2')) {
          params.success && params.success(res.data)
        } else { //服务器错误
          let error_code = res.data.error_code
          this._show_error(error_code)
        }
      },
      fail: (err) => { //请求接口失败
        this._show_error(1)
      }
    })
  }

  // 错误弹窗处理
  _show_error(error_code) {
    if (!error_code) {
      error_code = 1
    }
    const tip = tips[error_code]
    wx.showToast({
      title: tip ? tip : tips[1],
      icon: 'none',
      duration: 2000
    })
  }
}

export {
  HTTP
}
