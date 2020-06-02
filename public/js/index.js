/* 
  聊天室的主要功能
*/
/* 
  1. 连接socketio服务
*/
var socket = io('http://localhost:4400')
var username, avatar






/* 
  2. 登录功能
*/
$('#login_avatar li').on('click', function () {
  $(this)
    .addClass('now')
    .siblings()
    .removeClass('now')
})
// 点击按钮，登录
$('#loginBtn').on('click', function () {
  // 获取用户名
  var username = $('#username')
    .val()
    .trim()
  var password = $('#password').val().trim()

  if (!username) {
    alert('请输入用户名')
    return
  }
  if (!password){
    alert('请输入密码')
    return
  }
  // 获取选择的头像
  var avatar = $('#login_avatar li.now img').attr('src')
  var ti = new Date().toLocaleTimeString()
  var me = new Date().toLocaleDateString()
  var time = me + ti;
  // 需要告诉socket io服务，登录
  socket.emit('login', {
    username: username,
    avatar: avatar,
    times: time
  })
})

// 监听登录失败的请求
socket.on('loginError', data => {
  alert('用户名已经存在')
})
// 监听登录成功的请求
socket.on('loginSuccess', data => {
  // 需要显示聊天窗口
  // 隐藏登录窗口
  $('.login_box').fadeOut()
  $('.container').fadeIn()
  // 设置个人信息
  console.log("登录成功，个人信息为：",data)
  $('.avatar_url').attr('src', data.avatar)
  $('.user-list .username').text(data.username)

  username = data.username
  avatar = data.avatar
})

// 监听添加用户的消息
socket.on('addUser', data => {
  // 添加一条系统消息
  $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}   加入了群聊   ${data.times}</span>
      </p>
    </div>
  `)
  scrollIntoView()
})

// 监听用户列表的消息
socket.on('userList', data => {
  // 把userList中的数据动态渲染到左侧菜单
  $('.user-list ul').html('')
  data.forEach(item => {
    $('.user-list ul').append(`
      <li class="user">
        <div class="avatar"><img src="${item.avatar}" alt="" /></div>
        <div class="name">${item.username}</div>
      </li>      
    `)
  })

  $('#userCount').text(data.length)
})

// 监听用户离开的消息
socket.on('delUser', data => {
  // 添加一条系统消息
  $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}   离开了群聊   ${data.times}</span>
      </p>
    </div>
  `)
  scrollIntoView()
})

// 聊天功能
$('.btn-send').on('click', () => {
  // 获取到聊天的内容
  var content = $('#content').html()
  $('#content').html('')
  
 var ti = new Date().toLocaleTimeString()
  var me = new Date().toLocaleDateString()
  var time = me + ti;
  
  if (!content) return alert('请输入内容')
  // 发送给服务器
  socket.emit('sendMessage', {
    msg: content,
    username: username,
    avatar: avatar,
    times: time
  })
})

//按下CTRL+回车
$("#content").keydown(function (event) {

  if (event.ctrlKey && event.which === 13) {
    var content = $('#content').html()
    $('#content').html('')
    
    
     var ti = new Date().toLocaleTimeString()
  var me = new Date().toLocaleDateString()
  var time = me + ti;
    
    if (!content) return alert('请输入内容')
    // 发送给服务器
    
    socket.emit('sendMessage', {
      msg: content,
      username: username,
      avatar: avatar,
      times:time
    })

  }
});



// 监听聊天的消息
socket.on('receiveMessage', data => {
  // 把接收到的消息显示到聊天窗口中
  if (data.username === username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.times}<br><br>${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">${data.times}<br><br>${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  scrollIntoView()
})

function scrollIntoView() {
  // 当前元素的底部滚动到可视区
  $('.box-bd')
    .children(':last')
    .get(0)
    .scrollIntoView(false)
}

// 发送图片功能
$('#file').on('change', function () {
  var file = this.files[0]

  // 需要把这个文件发送到服务器， 借助于H5新增的fileReader
  var fr = new FileReader()
  fr.readAsDataURL(file)
  
   var ti = new Date().toLocaleTimeString()
  var me = new Date().toLocaleDateString()
  var time = me + ti;
  
  
  fr.onload = function () {
    socket.emit('sendImage', {
      username: username,
      avatar: avatar,
      img: fr.result,
    })
  }
})

//查看历史聊天记录功能
$('.screen-cut').on('click', function () {

  socket.emit('select_Message', {
    username: username,
    select: 'SELECT user,avatar,msg,date FROM user_msg ',

  })

  socket.on('show_Message', data => {
  var i = 0;
    console.log(data)
   for(i;i<data.length;i++) {
    console.log(data[i].user)
    if (data[i].user === username) {
    
      // 把接收到的消息显示到聊天窗口中
      $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data[i].avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data[i].date}<br><br>${data[i].msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
    scrollIntoView()
    } else {
      // 别人的消息
      $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data[i].avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data[i].user}</div>
            <div class="bubble">
              <div class="bubble_cont">${data[i].date}<br><br>${data[i].msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
scrollIntoView()
    }
   
  }

  })
 
})





// 监听图片聊天信息
socket.on('receiveImage', data => {
  // 把接收到的消息显示到聊天窗口中
  if (data.username === username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  // 等待图片加载完成,在滚动到底部
  $('.box-bd img:last').on('load', function () {
    scrollIntoView()
  })
})

// 初始化jquery-emoji插件
$('.face').on('click', function () {
  $('#content').emoji({
    // 设置触发表情的按钮
    button: '.face',
    showTab: false,
    animation: 'slide',
    position: 'topRight',
    icons: [{
      name: '表情',
      path: 'lib/jquery-emoji/img/bzhan/',
      maxNum: 73,
      // excludeNums: [41, 45, 54],
      file: '.png'
    }]
  })
})