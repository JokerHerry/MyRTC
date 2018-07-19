'use strict';

var constraints = {
    "video":{
        "width" : 100,
        "height" : 100,
        "maxFrameRate":25,
        "minFrameRate":25
    }
}

var video = document.getElementById('myVideo');

function handleSuccess(stream){
    video.srcObject = stream;
}

function handleError(error){
    console .log("getUserMedia error " , error);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);