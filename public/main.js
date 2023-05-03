const socket = io.connect("http://localhost:3004")

var username;
var U = {}
var chats = document.querySelector(".chats")
var user_list = document.querySelector(".user-list")
var user_count = document.querySelector(".user-count")
var msg_send = document.querySelector("#user-send");
var user_msg = document.querySelector("#user-msg")
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
const uName = document.createElement('h5')
myVideo.muted = true
const peers = {}


do{
    username = prompt("Enter your name: ")
}while(!username);

const myPeer = new Peer()
let myVideoStream;
myPeer.on('open', id => {
    socket.emit("new-user-joined", ROOM_ID,id,username )
})

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        console.log("userVideoStream", 73)

        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          console.log(userVideoStream, 73)
            addVideoStream(video, userVideoStream)
        })
        })
        let users = new Set()

        socket.on('user-connected',({userid, name})=>{
                // U[name] = "Online"
                // userJoinLeft(U);
            users.add(userid) 
            connectToNewUser(userid, stream)

        })

    socket.on('user-disconnected', (id)=> {
        // U[user] = "Offline"
        // userJoinLeft(U);
        if (peers[id]) peers[id].close()

    })
})


socket.on('user-list',users => {
    user_list.innerHTML="";
        users_arr= Object.values(users);
        for(i=0;i<users_arr.length;i++){
            let div = document.createElement('div')
            let p= document.createElement('p');
            let span= document.createElement('span');
            // span.innerText= Object.values(users)[i]
            p.innerText= Object.keys(users)[i] ;  
            if(Object.values(users)[i]==="Online"){
                // span.innerText = Object.values(users)[i]
                span.style.background = "green";
            }else{
                // span.innerText = Object.values(users)[i]
                span.style.background = "red";
            }  
            div.appendChild(p);  
            div.appendChild(span);       
     
            user_list.appendChild(div);
        }
        // user_count.innerHTML=users_arr.length
    })

    msg_send.addEventListener('click', ()=> {
        let data = {
            user: username,
            msg: user_msg.value
        };
        if(user_msg.value!=''){
            appendMessage(data, 'outgoing');
            socket.emit('message', data);
            user_msg.value='';
        }
    })

    function appendMessage(data,status){
        let div = document.createElement('div');
        let newDiv = document.createElement('div');
        let adDiv = document.createElement('div')
        newDiv.classList.add('message', status);
        div.classList.add('message_chat');
        adDiv.classList.add('userinitial');
        let currentTime = new Date();
        let content = ``
        if(currentTime.getHours()>12)
        { content = `
        <h5> ${data.user}</h5>
        <p>${data.msg}</p>
        <span>${currentTime.getHours()-12}:${currentTime.getMinutes()}PM</span>`;}
        else if(currentTime.getHours()==12){
             content = `
        <h5> ${data.user}</h5>
        <p>${data.msg}</p>
        <span>${currentTime.getHours()}:${currentTime.getMinutes()}PM</span>`;
        }else if(currentTime.getHours()< 12){
             content = `
        <h5> ${data.user}</h5>
        <p>${data.msg}</p>
        <span>${currentTime.getHours()}:${currentTime.getMinutes()}AM</span>`
        }
        div.innerHTML= content;
        adDiv.innerHTML = `<h6>${data.user[0].toUpperCase()}</h6>`
        newDiv.appendChild(div);
        newDiv.appendChild(adDiv) 
        chats.appendChild(newDiv)
        chats.scrollTop = chats.scrollHeight;
    }

    function addVideoStream(video, stream) {
        video.srcObject = stream
        console.log(video, 'addVideoStream')

        video.addEventListener('loadedmetadata', () => {
          video.play()
        videoGrid.append(video)
    })
  }

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    console.log(call, 'call')
    call.on('stream', userVideoStream => {
        console.log(userVideoStream, 'video')

      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        // video.parentNode.removeChild(video)
        video.remove()
    })
  
    peers[userId] = call
  }
  
    socket.on('message', (data) => {
        appendMessage(data, 'incoming')
    })
