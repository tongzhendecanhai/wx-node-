`use strict`

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')



module.exports = function(wxargument, handler) {
  var wechat = new Wechat(wxargument)

  return function*(next) {
    var _this = this
    // console.log(this.query)
    var signature = this.query.signature //微信服务器发来的签名

    var token = wxargument.token //自己设置的token值
    var timestamp = this.query.timestamp //微信服务器发来的时间戳
    var nonce = this.query.nonce //微信服务器发来的随机数
    var echostr = this.query.echostr //微信服务器发来的数据

    var list = [token, timestamp, nonce].sort().join('') //字典排序token,时间戳，随机数
    var sha = sha1(list) //加密排序后的对象list
    if (this.method === 'GET') {
      //比较微信服务器发的签名与加密后的sha是否相等
      if (sha == signature) {
        this.body = echostr + ''
      } else {
        this.body = '请求失败了，爱你😙'
      }
    } else if (this.method === 'POST') {
      if (sha !== signature) {
        this.body = '请求失败了，爱你😙'
        return false
      }

      var data = yield getRawBody(this.req, {
        length: this.length,
        limit: '1mb',
        encoding: this.charset
      })
      // console.log(data.toString())

      var content = yield util.parseXMLAsnyc(data)
      // console.log(content)
      // console.log('---------------------没有处理过的xml')
      // console.log(content.xml)
      var message = util.formatMessage(content.xml)
      console.log('-------------------------处理后的xml')
      console.log(message)
      this.weixin = message
      // console.log('000000000—--___---—000000000')
      // console.log(this.weixin)
      yield handler.call(this, next)

      wechat.reply.call(this)
    }
  }
}