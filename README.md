## 项目名称
微信公众号开发
## 项目介绍
本项目采用node来对当下火热的微信公众号进行开发
## 项目准备
### 1.进入微信公众平台官网[https://mp.weixin.qq.com]

​	用QQ号或邮箱注册订阅号（即公众号）

![1](C:\Users\童真的残骸\OneDrive\桌面\Github\wx公众号\wx-node-\readme配图\1.png)

​	注册完后登录，在左侧菜单栏里找到设置>公众号设置,填写相应内容如下：

![1](C:\Users\童真的残骸\OneDrive\桌面\Github\wx公众号\wx-node-\readme配图\2.png)

​	在[功能配置]下:

​	图中的js安全域名设置到自己的域名下的mp文件下；

​	注意：点击设置时需下载一个验证文件MP_verify_wtaRuDM3HTZJfW1d.txt，将其放在mp文件目录下

![img](C:\Users\童真的残骸\OneDrive\桌面\Github\wx公众号\wx-node-\readme配图\3.png)

### 2.用测试号来进行接口配置

​	测试号在开发者工具中，左侧边栏最下部分找到开发者工具，点击平台测试号，登录后，进行接口配置；

接口验证逻辑图如下（下图是微信公众平台中开发文档里的）：

​	![1](C:\Users\童真的残骸\OneDrive\桌面\Github\wx公众号\wx-node-\readme配图\4.jpg)

#### 	2.1在本地新建一个文件夹wechat（文件名自取），里面建立app.js



#### 	2.2在app.js中编写接口验证代码

```js
//app.js
`use strict`
  var Koa = require('koa')
  var sha1 = require('sha1')
  var port = 1234 //本地运行我用的1234端口
  var config = {
    wechat: {
      appID: 'wx7006fdefd0a1d63a',
      appSecret: '62dc9f5d669da95f22894e26b9547b50',
      token: 'wuyu'
    }
  }
  var app = new Koa()
  app.use(function*(next) {
    console.log(this.query)

    var token = config.wechat.token
    var signature = this.query.signature
    var timestamp = this.query.timestamp
    var nonce = this.query.nonce
    var echostr = this.query.echostr
    var list = [token, timestamp, nonce].sort().join('')
    var sha = sha1(list)
    if (sha == signature) {
      this.body = echostr + ''
    } else {
      this.body = '请求失败😙'
    }
  })
  app.listen(port)
  console.log('给我高高飞起来啊：' + port)
```

​	利用命令行工具或git工具运行app.js：

​	`node app`

#### 	2.3在本地开起服务器（我这里的花生壳版本为5.0，不同版本请参照百度）

​	这里采用花生壳内网映射工具，在软件管理（我的是电脑管家里面的，根据自己需求自行下载）中下载，下载完安装后，根据提示去注册一个账号，注册好后不要买域名，软件送了一个，返回应用登录，点击“+”添加你的电脑ip（不知道的本机ip的按下win+r打开运行输入cmd进入命令行工具输入ipconfig按下回车，出来的ipv4后的数字即为本机ip）和端口号（本地开端口号随意，我这里开的是1234）。

![img](C:\Users\童真的残骸\OneDrive\桌面\Github\wx公众号\wx-node-\readme配图\5.png)

​	点击保存后，生成的内网映射应用里的访问地址就是赠送给你的域名加端口号

![img](C:\Users\童真的残骸\OneDrive\桌面\Github\wx公众号\wx-node-\readme配图\6.png)

​	开启后映射出来的那个域名就是接口配置中要填写的url（注意加上http://）点击提交就可以了，如果弹出配置失败请自行检查代码！！！

![1](C:\Users\童真的残骸\OneDrive\桌面\Github\wx公众号\wx-node-\readme配图\7.png)

​

## 最后相关网站参考如下：

微信开发技术文档：[https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1433401084](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421137025)；
