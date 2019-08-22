'use strict'

var config = require('./config')
var Wechat = require('./wechat/wechat')

var wechatApi = new Wechat(config.wechat)

exports.reply = function*(next) {
  var message = this.weixin

  if (message.MsgType === 'event') {
    //关注事件
    if (message.Event === 'subscribe') {
      if (message.Eventkey) {
        console.log('扫二维码进来：' + message.Eventkey + ' ' + message.Ticket)
      }
      console.log('----------又有靓仔关注你了！！')
      this.body = 'The wind up , \n only trying to survive . \n🙇感谢您的关注‍。\n输入1：查看名言金句\n输入2：还是查看名言金句\n输入3：查看一片图文\n输入help或者“帮助”：查看所有操作'
    }
    //取消关注事件
    else if (message.Event === 'unsubscribe') {
      console.log('------------又是一个白嫖狗')
      this.body = ''
    }
    //点击事件
    else if (message.Event === 'CLICK') {
      if (message.Eventkey) {
        console.log('扫二维码进来：' + message.Eventkey + ' ' + message.Ticket)
      }
      this.body = 'http://www.tongzhendecanhai.top/wxcontent/music/thz.mp3'
    }
    //事件推送
    else if (message.Event === 'SCAN') {
      this.body = ''
    }
    //上报地理位置事件
    else if (message.Event === 'LOCATION') {
      this.body = '您上报的地址是:' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
    }
    //菜单链接事件
    else if (message.Event === 'VIEW') {
      this.body = '您点击了菜单的链接：'
    }
  } else if (message.MsgType === 'text') {
    var content = message.Content
    var reply = '不好意思，' + '我不太懂你说的' + content + '的意思' + '\n' + '难搞哦！'
    if (content === '1') {
      reply = '剑未佩妥,出门已是江湖。'
    } else if (content === '2') {
      reply = '我年华虚度，空有一身疲倦。'
    } else if (content === '3') {
      reply = [{
        title: '再找前端工作的阿黄',
        description: '你快看，那个人好像条狗🐕',
        picurl: 'http://www.tongzhendecanhai.top/wxcontent/img/1.jpg',
        url: 'http://www.tongzhendecanhai.top/wxcontent/html/1.html'
      }]
    }
    //-------------------------临时素材
    else if (content === '4') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.jpg')
      reply = {
        type: 'image',
        media_id: data.media_id
      }
      console.log(reply)
    } else if (content === '5') {
      var data = yield wechatApi.uploadMaterial('music', __dirname + '/1.mp3')
      reply = [{
        type: 'music',
        title: '童话镇',
        description: '陈一发儿',
        musicURL: 'http://www.tongzhendecanhai.top/wxcontent/music/thz.mp3',
        hqmusicUrl: 'http://www.tongzhendecanhai.top/wxcontent/music/thz.mp3',
        media_id: data.media_id
      }]
    } else if (content === '6') {
      var data = yield wechatApi.uploadMaterial('video', __dirname + '/1.mp4')
      reply = {
        type: 'video',
        media_id: data.media_id,
        title: '不露声色',
        description: 'Jam'
      }
    }
    //------------------------------------永久素材
    else if (content === '7') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.jpg', {
        type: 'image'
      })
      reply = {
        type: 'image',
        media_id: data.media_id
      }
    } else if (content === '8') {
      var data = yield wechatApi.uploadMaterial('video', __dirname + '/1.mp4', {
        type: 'video',
        description: '{"title":"我喜欢你","introduction":"幸好我们之间存在距离，害怕靠近你，因为那样，会让我失去追你的理由。"}'
      })
      console.log(data)
      reply = {
        type: 'video',
        media_id: data.media_id,
        title: '我喜欢你',
        description: '幸好我们之间存在距离，害怕靠近你，因为那样，会让我失去追你的理由'
      }
    } else if (content === '9') {
      var data = yield wechatApi.uploadMaterial('music', __dirname + '/1.mp3')
      reply = [{
        type: 'music',
        title: '童话镇',
        description: '陈一发儿',
        musicURL: 'http://www.tongzhendecanhai.top/wxcontent/music/thz.mp3',
        hqmusicUrl: 'http://www.tongzhendecanhai.top/wxcontent/music/thz.mp3',
        media_id: data.media_id
      }]
    } else if (content === '10') {
      var picData = yield wechatApi.uploadMaterial('image', __dirname + '/1.jpg', {})
      var media = {
        articles: [{
          title: 'huahua',
          thumb_media_id: picData.media_id,
          author: 'huang',
          digest: '无',
          show_cover_pic: 1,
          content: '无',
          content_source_url: 'http://www.tongzhendecanhai.top/wxcontent/img/1.jpg',
          need_open_comment: 1,
          only_fans_can_comment: 1
        }]
      }
      data = yield wechatApi.uploadMaterial('news', media, {})
      data = yield wechatApi.getMaterial(data.media_id, 'news', {})

      // console.log(data)

      var items = data.news_item
      var news = []
      items.forEach(function(item) {
        news.push({
          title: item.title,
          description: item.digest,
          picurl: picData.url,
          url: item.url
        })
      })
      reply = news
    } else if (content === '11') {
      var counts = yield wechatApi.get_countMaterial()
      // console.log(JSON.stringify(counts))
      var results = yield [
        wechatApi.get_listMaterial({
          type: 'image',
          offset: 0,
          count: 10
        }),

        wechatApi.get_listMaterial({
          type: 'video',
          offset: 0,
          count: 10
        }),

        wechatApi.get_listMaterial({
          type: 'voice',
          offset: 0,
          count: 10
        }),

        wechatApi.get_listMaterial({
          type: 'news',
          offset: 0,
          count: 10
        })
      ]
      console.log(JSON.stringify(results))
      reply = '1'
    }
    this.body = reply
  }
  yield next
}