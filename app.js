/* 
  启动聊天的服务端程序
*/
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
// 记录所有已经登录过的用户
const users = []

server.listen(4400, () => {
  console.log('80服务器启动成功了')
})

// express处理静态资源
// 把public目录设置为静态资源目录
app.use(require('express').static('public'))
// var ti = new Date().toLocaleTimeString()
// var me = new Date().toLocaleDateString()
// var time = me + ti;


app.get('/', function (req, res) {
  res.redirect('/index.html')
})

io.on('connection', function (socket) {
  socket.on('login', data => {
    // 判断，如果data在users中存在，说明该用户已经登录了，不允许登录
    // 如果data在users中不存在，说明该用户没有登录，允许用户登录
    let user = users.find(item => item.username === data.username)
    if (user) {
      // 表示用户存在， 登录失败. 服务器需要给当前用户响应，告诉登录失败
      socket.emit('loginError', {
        msg: '登录失败'
      })
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
  
     
        console.log(socket.username+' 的IP地址是 '+socket.ip+socket.city)
    
      {
        //插入操作
        var add_user_info = 'INSERT INTO user_info(name,avatar,date,ip,city) VALUES(?,?,?,?,?)';
        var addSqlParams = [socket.username, socket.avatar,data.times,socket.ip,socket.city];
        //执行
        connection.query(add_user_info, addSqlParams, function (err, result) {
          if (err) {
            console.log(socket.username+" 的用户登录信息保存失败："+err.message);
            return;
          }
          //console.log('INSERT ID:',result.insertId);        
          console.log(socket.username+" 的用户登录信息保存成功。");
         
        });
      }
    }
  })

  socket.on('sendIP',data=>{
    socket.ip = data.ip;
    socket.city = data.name;
   
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
      times: socket.times
     
    })
     console.log(socket.username +'离开了聊天室')
    // 2. 告诉所有人，userList发生更新
    io.emit('userList', users)
  })

  // 监听聊天的消息
  socket.on('sendMessage', data => {
    console.log(data)
    {
      //插入操作
      var add_user_msg = 'INSERT INTO user_msg(user,avatar,msg,date) VALUES(?,?,?,?)';
      var addSqlParams = [data.username, data.avatar, data.msg,data.times];
      //执行
      connection.query(add_user_msg, addSqlParams, function (err, result) {
        if (err) {
          console.log(data.username+' 的聊天消息保存失败：'+ err.message);
          return;
        }
        console.log(data.username+' 的聊天消息保存成功。');
      
      });
    }


    // 广播给所有用户
    io.emit('receiveMessage', {
        msg: data.msg,
    username: data.username,
    avatar: data.avatar,
    times:data.times
    })
  })

  //监听历史记录查询

  socket.on('select_Message', data => {
    console.log(data.username + ' 进行了查看历史记录操作');

    //遍历数据库
    connection.query(data.select, function (err, result) {
      if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        return;
      }
      var dataString = JSON.stringify(result);
       var data = JSON.parse(dataString);
      //对数据进行字符串处理
     //console.log(data)
     
      //发送给客户端数据
   socket.emit('show_Message',data)

    })

  })

  // 接收图片信息d
  socket.on('sendImage', data => {
    // 广播给所有用户
     console.log(data.username+"发送了图片");
    io.emit('receiveImage', data)
  })
 
})


//插入数据库
let connection ='';
mysql = require('mysql');
function handleDisconnection() {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',  //用户名
        password: '',   //密码
        database: 'express', //数据库名字  
        port: '3306'     //端口号
    })
    connection.connect(function (err) {
        if (err) {
            setTimeout('handleDisconnection()', 2000);
        }
    });

    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            consolog.log('db error执行重连:' + err.message);
            handleDisconnection();
        } else {
            throw err;
        }
    });
}
handleDisconnection();

