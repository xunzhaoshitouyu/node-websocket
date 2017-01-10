var http = require("http");
var express = require("express"),
    app = express(),
    server = http.createServer(app),
    io = require("socket.io").listen(server);
app.use('/', express.static(__dirname));
server.listen(5521);
console.log("服务已启动");

var users = new Array();

io.on("connection", function(socket) {
    // 建立连接的事件
    socket.on("login", function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit("nickExisted");
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            socket.broadcast.emit('system', nickname, users.length, "login"); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        }
    });

    // 断开连接的事件
    socket.on("disconnect", function() {
        // 将断开的用户从数组中移除
        users.splice(socket.userIndex, 1);
        // 通知除自己以外的所有人
        socket.broadcast.emit("system", socket.nickname, users.length, "logout")
    });
    // 接送用户输入的聊天信息
    socket.on("postMsg", function(sendMessage, color) {
        socket.broadcast.emit("backSend", socket.nickname, sendMessage, color)
    });

    // 接收用户上传的图片信息
    socket.on("img", function(imgData) {
        socket.broadcast.emit("reciveImg", socket.nickname, imgData)
    });
    // 窗口抖动
    socket.on("shake", function() {
            socket.broadcast.emit("shaking");
        })
        //     // 视频请求
        // socket.on("videoRequest", function(stream) {
        //     socket.broadcast.emit("videoResponse", stream);
        // })
})