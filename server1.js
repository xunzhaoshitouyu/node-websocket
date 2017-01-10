//引入http模块
var http = require("http");
require("express");

// 创建一个服务器
server = http.createServer(function(req, res) {
    res.writeHead(200, {
        "content-type": "text/html"
    });
    res.write("<h1>hello world</h1>");
    res.end();
});
// 监听8012端口
server.listen(8012);
console.log("server started");