var http = require("http");
var express = require("express"),
    app = express(),
    server = http.createServer(app),
    io = require("socket.io").listen(server);
app.use('/', express.static(__dirname));
// app.use(express.static('demo1'));
// app.use('/', express.static('D:/old/bootstrap'));
server.listen(5324);
console.log("server started");
io.on('connection', function(socket) {
    socket.on('foo', function(data) {
        console.log(data);
    })
})