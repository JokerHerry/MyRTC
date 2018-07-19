var PeerManager =  (function () {
    console.log("PeerManager 初始化");

    var localId,
        config = {
            peerConnectionConfig: {
                iceServers: [
                    // {"url": "stun:23.21.150.121"},
                    // {"url": "stun:stun.l.google.com:19302"}
                ]
            },
            peerConnectionConstraints: {
                optional: [
                    {"DtlsSrtpKeyAgreement": true}
                ]
            }
        },
        peerDatabase = {},
        remoteVideoContainer = document.getElementById('remoteVideosContainer'),
        socket = io();

    socket.on('message', handleMessage);
    socket.on('id', function (id) {
        console.log("拿到自己的id  " + id);
        localId = id;
    });

    function handleMessage(message) {
        var type = message.type,
            from = message.from,
            pc = peerDatabase[from] ;

        console.log(" socket 接收到信息");
        console.log("type为 " + type + "  来自 " + from);

        switch (type) {
            case 'init':

                break;
            case 'offer':
                console .log("网页端接收到 offer  现在正在准备给你一个answer");
                console.log(pc);
                pc.pc.setRemoteDescription(
                    new RTCSessionDescription(message.payload),
                    function (){
                        console.log("这里是运行成功了");
                    },
                    function () {
                        console.log("这是被运行失败了");
                    }
                );


                console.log("现在开始给你answer");
                pc.pc.createAnswer(
                    function (sessionDescription) {
                        pc.pc.setLocalDescription(sessionDescription);
                        send('disposeAnsewer', from, sessionDescription);
                    },
                    error
                );

                break;
            case 'answer':

                break;
            case 'candidate':
                if (pc.pc.remoteDescription) {
                    pc.pc.addIceCandidate(new RTCIceCandidate({
                        sdpMLineIndex: message.payload.label,
                        sdpMid: message.payload.id,
                        candidate: message.payload.candidate
                    }), function () {
                    }, error);
                }
                break;
            case 'readyToStream':
                console.log(from);

                peer =  addPeer(from);
                send('pleaseSendOffer', from, null);
        }

    }

    function error(err) {
        console.log(err);
    }

    function addPeer(remoteId) {
        console .log("addPeer");
        // 对应的配置
        var peer = new Peer(config.peerConnectionConfig, config.peerConnectionConstraints);

        peer.pc.onicecandidate = function (event) {
            console .log("onicecandidate ");
            if (event.candidate) {
                send('candidate', remoteId, {
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            }
        };


        peer.pc.onaddstream = function (event) {
            console .log("onaddstream 现在已经获取到 媒体流 了");

            // 将远方的视频流 于视频标签内显示出来
            attachMediaStream(peer.remoteVideoEl, event.stream);

            // 将视频节点插入网页中显示出来
            remoteVideosContainer.appendChild(peer.remoteVideoEl);
        };

        peer.pc.oniceconnectionstatechange = function (event) {
            console.log("oniceconnectionstatechange");
            switch (
                (event.srcElement // Chrome
                    || event.target) // Firefox
                    .iceConnectionState) {
                case 'disconnected':
                    remoteVideosContainer.removeChild(myVideo);
                    console.log("链接断开了");
                    break;
            }
        };

        peerDatabase[remoteId] = peer;

        return peer;
    }

     function attachMediaStream(element, stream) {
        console.log("哈哈  我才是调用的函数");
        if (typeof element.srcObject !== 'undefined') {
            console.log("srcObject");
            element.srcObject = stream;
            console.log(stream);
        } else if (typeof element.mozSrcObject !== 'undefined') {
            console.log("mozSrcObject");
            element.mozSrcObject = stream;
        } else if (typeof element.src !== 'undefined') {
            console.log("src");
            element.src = URL.createObjectURL(stream);
        } else {
            console.log('Error attaching stream to element.');
        }
    };

    function send(type, to, payload) {
        console.log('sending ' + type + ' to ' + to);

        socket.emit('message', {
            to: to,
            type: type,
            payload: payload
        });
    }

    return {
        getId : function () {
            return localId;
        },

        peerInit: function (remoteId) {
            console.log("peerInit");
            peer =  addPeer(remoteId);
            send('init', remoteId, null);
        },


    }
});


var Peer = function (pcConfig, pcConstraints) {
    this.pc = new RTCPeerConnection(pcConfig, pcConstraints);


    this.remoteVideoEl = document.createElement('video');

    this.remoteVideoEl.controls = true;
    this.remoteVideoEl.autoplay = true;
};
