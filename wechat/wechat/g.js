`use strict`

var sha1 = require('sha1')

module.exports = function(wxargument) {
  return function*(next) {
    console.log(this.query)
    var signature = this.query.signature //微信服务器发来的签名

    var token = wxargument.token //自己设置的token值
    var timestamp = this.query.timestamp //微信服务器发来的时间戳
    var nonce = this.query.nonce //微信服务器发来的随机数
    var echostr = this.query.echostr //微信服务器发来的数据

    var list = [token, timestamp, nonce].sort().join('') //字典排序token,时间戳，随机数
    var sha = sha1(list) //加密排序后的对象list
    //比较微信服务器发的签名与加密后的sha是否相等
    if (sha == signature) {
      this.body = echostr + ''
    } else {
      this.body = '请求失败了，爱你😙'
    }
  }
}