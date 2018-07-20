
var client;
(function () {
    client = new PeerManager();
})();


initBtn = function () {
    console.log("initBtn");
};




function  getRemoteID(id ) {
    console.log("拿到  id  " + id);
    client.peerInit(id);
}












/**--------------分割线----------------**/
init = function () {
    if(client != null){
        client.sendReady();
    }
};
