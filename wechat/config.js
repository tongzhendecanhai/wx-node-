'use strict'

var path = require('path')
var util = require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt')
var config = {
  wechat: {
    appID: 'wx7006fdefd0a1d63a',
    appSecret: '62dc9f5d669da95f22894e26b9547b50',
    token: 'wuyu',
    getAccessToken: function() {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: function(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    },
  }
}
module.exports = config