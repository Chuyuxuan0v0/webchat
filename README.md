# webchat
一款基于`Javascript+express+socket.io`构成的网络在线聊天应用

具体效果可以访问[http://chat.chuyuxuan.xyz:4400](http://chat.chuyuxuan.xyz:4400)   
+ **2020年10月10日前该链接有效，别问为啥，问就是服务器过期我负担不起😭，所以不错的话请给个star吧**


## 项目讲解：[BV1B54y1D7dA](https://www.bilibili.com/video/BV1B54y1D7dA/)


---

# 下载

        git clone https://github.com/Chuyuxuan0v0/webchat.git

# 使用

+ 你需要安装`node.js`,接下来才能进行一下操作，否则会报错误。

        
⭐ 下载后进入根目录
        
        cd ...  \webchat\

⭐ 下载安装`node.js`
        
[点我下载](https://nodejs.org/en/download/)

⭐ 安装`express` ~~项目包里已经集成，安装好node之后可以跳过~~

        npm install express --save

⭐ 安装`socket.io` ~~项目包里已经集成，安装好node之后可以跳过~~

        npm install --save socket.io

        npm install --save socket.io-client


⭐ 安装`mysql` ~~项目包里已经集成，安装好node之后可以跳过~~

        npm install mysql
        
⭐ 在MySQL中导入相关表

        所有要建立的表我都放在express.sql里了，可以根据里面的sql语言自行建立，
        或者借用数据库管理工具例如 navicat 导入该文件进行表的创建。
**注意。我是依赖于mysql 8.0的版本而创建的表格，如果你的sql文件导入不成功，请手动创建表**
表格目录如下:

||||user_info||||
|:-|:-|:-|:-|:-|:-|:-|
|名|类型|长度|小数点|不是null|主键|注释|
|id|int|5|0|√|🔑|注册用户数，注意，要选择自增|
|name|varchar|15|0|√||用户名|
|avatar|varchar|100|0|√||头像路径|
|date|varchar|20|0|√||日期|

||||user_msg||||
|:-|:-|:-|:-|:-|:-|:-|
|名|类型|长度|小数点|不是null|主键|注释|
|id|int|5|0|√|🔑|注意，要选择自增|
|user|varchar|15|0|√||用户名|
|avatar|varchar|100|0|√||头像路径|
|msg|varchar|255|0|√||用户消息|
|date|varchar|20|0|√||日期|


*数据表会不定时更新，详情请看代码里的链接*


⭐ 启动项目

        node app.js

⭐ 在浏览器中输入以下网址 ~~这个端口可以自己更改的~~

        localhost:4400 

# 部分功能展示
+ 1.可以实现在线聊天，发送图片
+ 2.可以是使用`ctrl+Enter`发送消息
+ 3.进入退出有提示
+ 4.适应手机，有响应式布局
+ 5.查看历史聊天记录
+ 6.。。。。。

# 待优化
- 优化UI界面，降低耦合性
- 优化界面响应速度
- 能够私聊个人，一对一聊天
- 。。。。。

# 部分预览

![](cover1.jpg)
![](cover2.jpg)
![](cover3.jpg)
