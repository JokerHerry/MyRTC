module.exports = function (io, streams) {

    var webClient = [],androidClient=[];


    io.on('connection', function (client) {

        console.log('-- ' + client.id + ' joined --');
        var if_web = false;
         // 有cookie表示 web端
        // console.log(client.handshake.headers.cookie);
        if(client.handshake.headers.cookie){
            console.log("存在  你是web端");
            webClient.push(client);
            if_web = true;
        }else{
            console.log("不存在  你是android 端");
            androidClient.push(client)
        }

        client.emit('id', client.id);

        client.on('message', function (details) {
            console.log("socket 收到消息   message");
            console.log(details);

            var otherClient = io.sockets.connected[details.to];

            if (!otherClient) {
                console.log(details.to);
                console.log("我在链接处 失败了！");
                console.log("\n");
                return;
            }
            delete details.to;
            details.from = client.id;
            otherClient.emit('message', details);

            console.log("\n");
        });

        // {
        //     name:
        //     from:
        // }
        client.on('readyToStream', function (options) {
            console.log("socket 收到消息   readyToStream");
            console.log('-- ' + client.id + ' is ready to stream --');
            console.log( " 当前已经有  " + io.sockets.server.eio.clientsCount  +"  个peer连接");

            var webClient = new WebClient("android",client);

            streams.addStream(client.id, options.name);

            if (if_web) {
                androidClient.forEach(function (otherClient) {
                    otherClient.emit("message",options);
                })
            }else{
                webClient.forEach(function (otherClient) {
                    otherClient.emit("message",options);
                })
            }


        });

        client.on('update', function (options) {
            console.log("socket  收到消息   update");
            streams.update(client.id, options.name);
        });

        function leave() {
            console.log('-- ' + client.id + ' left --');
            streams.removeStream(client.id);
        }

        client.on('disconnect', leave);
        client.on('leave', leave);
    });
};