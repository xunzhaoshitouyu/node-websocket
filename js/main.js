// 定义一个类，所有业务方法写在类中
class hichat {
    constructor() {
        this.socket = null;
    }
    init() { //此方法初始化程序
        var that = this;
        // 调用表情初始化的方法
        that.initialEmoji();
        // 建立到服务器的socket连接
        this.socket = io.connect();
        // 监听socket的connect事件，此事件表示连接已经建立
        this.socket.on("connect", function() {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = '请输入您的昵称：';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        // 监听输入的用户昵称信息是否正确
        document.getElementById("loginBtn").addEventListener("click", function() {
            // 获取用户输入的昵称
            var nickName = document.getElementById("nicknameInput").value;
            // 检查昵称是否为空
            if (nickName.trim().length != 0) {
                // 如果不为空则发起一个login事件，并且将nickname发送给服务器
                that.socket.emit("login", nickName);
            } else {
                // 如果为空则输入框获得焦点
                document.getElementById("nicknameInput").focus();
            }
        }, false);
        // 当昵称已经存在时，服务器返回的消息
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '此昵称已经存在，请重新输入'; //显示昵称被占用的提示
            document.getElementById("nicknameInput").focus();
        });
        // 当昵称不存在是，服务器返回的消息
        this.socket.on("loginSuccess", function() {
            document.title = "嗨聊 | " + document.getElementById("nicknameInput").value;
            document.getElementById("loginWrapper").style.display = "none";
            document.getElementById("messageInput").focus();
        })

        // 监听用户输入的聊天信息
        document.getElementById("sendBtn").addEventListener("click", function() {
            var sendMessage = document.getElementById("messageInput").value;
            var color = document.getElementById("colorStyle").value;
            document.getElementById("messageInput").value = "";
            document.getElementById("messageInput").focus();
            if (sendMessage.trim().length != 0) {
                that.socket.emit("postMsg", sendMessage, color);
                that.displayNewMessage("我", sendMessage, color);
            }
        }, false);

        // 监听服务端返回的system方法
        this.socket.on("system", function(nickName, userCount, type) {
            var msg = nickName + (type == "login" ? "加入" : "离开");
            that.displayNewMessage("system", msg, "red");
            // 显示在线人数
            document.getElementById("status").innerHTML = userCount + "个用户在线"
        });

        // 接收服务器返回的用户输入的聊天信息
        this.socket.on("backSend", function(nickname, message, color) {
            that.displayNewMessage(nickname, message, color);
        })

        // 发送图片
        document.getElementById('sendImage').addEventListener('change', function() {
            //检查是否有文件被选中
            if (this.files.length != 0) {
                //获取文件并用FileReader进行读取
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that.displayNewMessage('system', '您的浏览器不支持发送图片，请升级浏览器', 'red');
                    this.value = '';
                    return;
                };
                reader.readAsDataURL(file);
                reader.onload = function(e) {
                    //读取成功，显示到页面并发送到服务器
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that.displayImage('我', e.target.result);
                };
            };
        }, false);
        // 接收服务器返回的图片数据
        this.socket.on("reciveImg", function(nickname, imgData) {
            that.displayImage(nickname, imgData, "black");
        })

        // 给表情框添加绑定事件
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        // 点击页面其他地方的时候表情框隐藏
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        }, false);
        // 选择表情的时候修改样式
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            //获取被点击的表情
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
        // 添加键盘监听事件
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that.displayNewMessage('我', msg, color);
            };
        }, false);

        // 清空聊天记录
        document.getElementById("clearBtn").addEventListener("click", function() {
            document.getElementById("historyMsg").innerHTML = "";
        }, false);

        // 发送窗口抖动请求
        document.getElementById("shake").addEventListener("click", function() {
            that.socket.emit("shake");
        }, false);

        // 接收窗口抖动信息
        this.socket.on("shaking", function() {
            document.getElementById("wrapper").style.animation = "shake .7s";
            setTimeout(function() {
                document.getElementById("wrapper").style.animation = "";
            }, 700);
        });

        // 添加视频聊天监听按钮
        // document.getElementById("videoRTC").addEventListener("click", function(e) {
        //     navigator.getUserMedia ||
        //         (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);

        //     if (!navigator.getUserMedia) {
        //         return;
        //     }
        //     // 调用getUserMedia方法
        //     navigator.getUserMedia({
        //         video: true,
        //         audio: true
        //     }, onSuccess, onError);

        //     // 成功是执行的操作
        //     function onSuccess(stream) {
        //         that.socket.emit("videoRequest", stream);
        //     }
        //     // 出错时执行的操作
        //     function onError() {}
        // })

        // 接受视频流
        this.socket.on("videoResponse", function(stream) {
            var video = document.getElementById('webcam');
            console.log(stream);
            // if (window.URL) {
            //     video.src = window.URL.createObjectURL(stream);
            // } else {
            //     video.src = stream;
            // }
            // video.autoplay = true;
            //or video.play();
        })
    };
    // 显示发送的消息
    displayNewMessage(user, msg, bgc) {
        var container = document.getElementById("historyMsg");
        var msgToDisplay = document.createElement("p");
        var dt = new Date().toTimeString().substr(0, 8);
        // 将消息中的表情转换为gif图
        msg = this.transGif(msg);
        msgToDisplay.style.color = bgc || "#000";
        if (user == "我") {
            msgToDisplay.innerHTML = "<span class='timeSpanR'>" + user + "(" + dt + "):" + msg + "</span>";
        } else if (user == "system" && (msg.indexOf("加入") > -1 || msg.indexOf("离开") > -1)) {
            msgToDisplay.innerHTML = "<span class='timeSpanC'>" + user + "(" + dt + "):" + msg + "</span>";
            $("#chatAudioOnline")[0].play();
        } else {
            msgToDisplay.innerHTML = "<span class='timeSpanL'>" + user + "(" + dt + "):" + msg + "</span>";
            $("#chatAudio")[0].play();
        }
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    };
    // 接收服务器返回的图片数据
    displayImage(user, imgData, bgc) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = bgc || '#000';
        if (user == "我") {
            msgToDisplay.innerHTML = '<span class="timeSpanR">' + user + "(" + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        } else {
            msgToDisplay.innerHTML = '<span class="timeSpanL">' + user + "(" + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
            $("#chatAudio")[0].play();
        }
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
        document.getElementById("messageInput").focus();
    };

    // 初始化表情
    initialEmoji() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = 'img/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    };

    // 将选择表情数据转换为gif图
    transGif(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="img/emoji/' + emojiIndex + '.gif" />');
            };
        };
        return result;
    };

    // 视频聊天
    videoChat() {

    };
}

window.onload = function() {
    var hiChat = new hichat();
    hiChat.init();
    $('<audio id="chatAudio"><source src = "mp3/xxx.wav" type = "audio/wav" ><source src="mp3/notify.ogg" type="audio/ogg">  < source src = "mp3/notify.mp3"type = "audio/mpeg" > </audio>').appendTo('body'); // 载入声音文件
    $('<audio id="chatAudioOnline"><source src = "mp3/sx.wav" type = "audio/wav" ><source src="mp3/notify.ogg" type="audio/ogg">  < source src = "mp3/notify.mp3"type = "audio/mpeg" > </audio>').appendTo('body'); // 载入声音文件
}