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
