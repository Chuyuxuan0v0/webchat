/* 
  启动聊天的服务端程序
*/
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
// 记录所有已经登录过的用户
const users = []

server.listen(4000, () => {
  console.log('服务器启动成功了')
})

// express处理静态资源
// 把public目录设置为静态资源目录
app.use(require('express').static('public'))
var time=new Date().toLocaleTimeString()


app.get('/', function(req, res) {
  res.redirect('/index.html')
})

io.on('connection', function(socket) {
  socket.on('login', data => {
    // 判断，如果data在users中存在，说明该用户已经登录了，不允许登录
    // 如果data在users中不存在，说明该用户没有登录，允许用户登录
    let user = users.find(item => item.username === data.username)
    if (user) {
      // 表示用户存在， 登录失败. 服务器需要给当前用户响应，告诉登录失败
      socket.emit('loginError', { msg: '登录失败' })
      // console.log('登录失败')
    } else {
      // 表示用户不存在, 登录成功
      users.push(data)
      // 告诉用户，登录成功
      socket.emit('loginSuccess', data)
      // console.log('登录成功')

      // 告诉所有的用户，有用户加入到了聊天室，广播消息
      // socket.emit: 告诉当前用户
      // io.emit : 广播事件
      io.emit('addUser', data)

      // 告诉所有的用户，目前聊天室中有多少人
      io.emit('userList', users)

      // 把登录成功的用户名和头像存储起来
      socket.username = data.username
      socket.avatar = data.avatar
    }
  })

  // 用户断开连接的功能
  // 监听用户断开连接
  socket.on('disconnect', () => {
    // 把当前用户的信息从users中删除掉
    let idx = users.findIndex(item => item.username === socket.username)
    // 删除掉断开连接的这个人
    users.splice(idx, 1)
    // 1. 告诉所有人，有人离开了聊天室
    io.emit('delUser', {
      username: socket.username,
      avatar: socket.avatar,
      times:time
    })
    // 2. 告诉所有人，userList发生更新
    io.emit('userList', users)
  })

  // 监听聊天的消息
  socket.on('sendMessage', data => {
    console.log(data)
    // 广播给所有用户
    io.emit('receiveMessage', data)
  })

  // 接收图片信息
  socket.on('sendImage', data => {
    // 广播给所有用户
    io.emit('receiveImage', data)
  })
})
