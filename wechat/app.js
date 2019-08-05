`use strict`
var Koa = require('koa')
var wechat = require('./wechat/g')
var port = 1234

var config = {
  wechat: {
    appID: 'wx7006fdefd0a1d63a',
    appSecret: '62dc9f5d669da95f22894e26b9547b50',
    token: 'wuyu'
  }
}
var app = new Koa()

app.use(wechat(config.wechat))
app.listen(port)
console.log('给我高高飞起来啊：(☆▽☆)--------------------------' + port)