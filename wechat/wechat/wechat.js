`use strict`

var Promise = require('bluebird')
var fs = require('fs')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
var util = require('./util')
var httphead = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
  access_token: httphead + 'token?grant_type=client_credential',
  temporary: {
    upload: httphead + 'media/upload?',
    get: httphead + 'media/get?'
  },
  permanent: {
    upload: httphead + 'material/add_material?',
    uploadNews: httphead + 'material/add_news?',
    uploadNewsImg: httphead + 'media/uploadimg?',
    get: httphead + 'material/get_material?',
    del: httphead + 'material/del_material?',
    update: httphead + 'material/update_news?',
    get_count: httphead + 'material/get_materialcount?',
    get_list: httphead + 'material/batchget_material?',
  }
}

function Wechat(wxargument) {
  var _this = this
  this.appID = wxargument.appID
  this.appSecret = wxargument.appSecret
  this.getAccessToken = wxargument.getAccessToken
  this.saveAccessToken = wxargument.saveAccessToken

  this.fetchAccessToken()
}

//获取Access_Token
Wechat.prototype.fetchAccessToken = function(data) {

  var _this = this

  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this)
    }
  }

  this.getAccessToken()
    .then(function(data) {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return _this.updateAccessToken(data)
      }
      if (_this.isValidAccessToken(data)) {
        return Promise.resolve(data)
      } else {
        return _this.updateAccessToken()
      }
    })
    .then(function(data) {
      _this.access_token = data.access_token
      _this.expires_in = data.expires_in

      _this.saveAccessToken(data)

      return Promise.resolve(data)
    })
}

//判断Access_Token是否过期
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

//更新Access_Token
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

      // console.log(data)
      var now = (new Date().getTime())
      var newexpires_in = now + (data.expires_in - 20) * 1000

      data.expires_in = newexpires_in
      resolve(data)
    })
  })
}

//新增临时或永久素材
Wechat.prototype.uploadMaterial = function(type, material, permanent) {
  var _this = this
  var form = {}
  var uploadUrl = api.temporary.upload

  if (permanent) {
    uploadUrl = api.permanent.upload
    _.extend(form, permanent)
  }
  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsImg
  }
  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews
    form = material
  } else {
    form.media = fs.createReadStream(material)
  }

  return new Promise(function(resolve, reject) {
    _this.fetchAccessToken()
      .then(function(data) {
        var url = uploadUrl + 'access_token=' + data.access_token
        if (!permanent) {
          url += '&type=' + type
        } else {
          form.access_token = data.access_token
        }
        var options = {
          method: 'POST',
          url: url,
          json: true
        }
        if (type === 'news') {
          options.body = form
        } else {
          options.formData = form
        }
        request(options).then(function(res) {
            // console.log(res.body)
            var _data = res.body //拿到票据和过期时间
            // console.log('小老弟' + _data)
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('uploadMaterial is fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })
  })
}

//获取临时或永久素材
Wechat.prototype.getMaterial = function(media_id, type, permanent) {
  var _this = this
  var getUrl = api.temporary.get

  if (permanent) {
    getUrl = api.permanent.get
  }


  return new Promise(function(resolve, reject) {
    _this.fetchAccessToken()
      .then(function(data) {
        var url = getUrl + 'access_token=' + data.access_token

        var form = {}
        var options = {
          method: 'POST',
          url: url,
          json: true
        }
        if (permanent) {
          form.media_id = media_id
          form.access_token = data.access_token
          options.body = form
        } else {
          if (type === 'video') {
            url = replace('https://', 'http://')
          }
          url += '&media_id=' + media_id
        }
        if (type === 'news' || type === 'video') {
          request(options).then(function(res) {
              var _data = res.body
              if (_data) {
                resolve(_data)
              } else {
                throw new Error('get Material is fails')
              }
            })
            .catch(function(err) {
              reject(err)
            })
        } else {
          resolve(url)
        }

        // if (!permanent && type === 'video') {
        //   url = url.replace('https://', 'http://')
        // }
        // resolve(url)
      })
  })
}

//删除永久素材
Wechat.prototype.delMaterial = function(media_id) {
  var _this = this
  var form = {
    media_id: media_id
  }

  return new Promise(function(resolve, reject) {
    _this.fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + media_id

        request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          }).then(function(res) {
            // console.log(res.body)
            var _data = res.body //拿到票据和过期时间
            // console.log('小老弟' + _data)
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('del Material is fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })
  })
}

//修改永久图文素材
Wechat.prototype.updateMaterial = function(media_id, news) {
  var _this = this
  var form = {
    media_id: media_id
  }
  _.extend(form, news)
  return new Promise(function(resolve, reject) {
    _this.fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + media_id

        request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          }).then(function(res) {
            // console.log(res.body)
            var _data = res.body //拿到票据和过期时间
            // console.log('小老弟' + _data)
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('update Material is fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
      })
  })
}

//获取素材总数
Wechat.prototype.get_countMaterial = function() {
  var _this = this

  return new Promise(function(resolve, reject) {
    _this.fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.get_count + 'access_token=' + data.access_token + '&media_id=' + media_id

        request({
          method: 'GET',
          url: url,
          json: true
        }).then(function(res) {
          // console.log(res.body)
          var _data = res.body //拿到票据和过期时间
          // console.log('小老弟' + _data)
          if (_data) {
            resolve(_data)
          } else {
            throw new Error('get_count Material is fails')
          }
        })
      })
  })
}

//获取素材列表
Wechat.prototype.get_listMaterial = function(options) {
  var _this = this

  options.type = options.type || 'image'
  options.offset = options.offset || '0'
  options.count = options.count || '1'

  return new Promise(function(resolve, reject) {
    _this.fetchAccessToken()
      .then(function(data) {
        var url = api.permanent.get_list + 'access_token=' + data.access_token + '&media_id=' + media_id

        request({
          method: 'POST',
          url: url,
          body: options,
          json: true
        }).then(function(res) {
          // console.log(res.body)
          var _data = res.body //拿到票据和过期时间
          // console.log('小老弟' + _data)
          if (_data) {
            resolve(_data)
          } else {
            throw new Error('get_list Material is fails')
          }
        })
      })
  })
}
//增加reply回复方法
Wechat.prototype.reply = function() {
  // console.log("-------------------reply--------------------")
  var content = this.body
  var message = this.weixin
  console.log(message)

  var xml = util.tpl(content, message)

  this.status = 200
  this.type = 'application/xml'
  this.body = xml
}

module.exports = Wechat