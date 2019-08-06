`use strict`

var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var httphead = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
  access_token: httphead + 'token?grant_type=client_credential'
}

function Wechat(wxargument) {
  var _this = this
  this.appID = wxargument.appID
  this.appSecret = wxargument.appSecret
  this.getAccessToken = wxargument.getAccessToken
  this.saveAccessToken = wxargument.saveAccessToken

  this.getAccessToken()
    .then(function(data) {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return _this.updateAccessToken(data)
      }
      if (_this.isValidAccessToken(data)) {
        Promise.resolve(data)
      } else {
        return _this.updateAccessToken()
      }
    })
    .then(function(data) {
      _this.access_token = data.access_token
      _this.expires_in = data.expires_in

      _this.saveAccessToken(data)
    })
}
Wechat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }
  var access_token = data.access_token
  var expires_in = data.expires_in
  var now = (new Date().getTime())

  if (now < expires_in) {
    return true
  } else {
    return false
  }
}
Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID
  var appSecret = this.appSecret
  var url = api.access_token + '&appid=' + appID + '&secret=' + appSecret
  return new Promise(function(resolve, reject) {
    request({
      url: url,
      json: true
    }).then(function(res) {
      // console.log(res.body)

      var data = res.body //拿到票据和过期时间

      console.log(data)
      var now = (new Date().getTime())
      var newexpires_in = now + (data.expires_in - 20) * 1000

      data.expires_in = newexpires_in
      resolve(data)
    })

  })
}

module.exports = Wechat