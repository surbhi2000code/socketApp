const express = require("express")
const app = express()
const { v4: uuidV4 } = require('uuid')
const server = require('http').Server(app)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
debug: true,
});
const port  = 3004

app.set('view engine', 'ejs')
app.use('/peerjs', peerServer);
app.use(express.static(__dirname+'/public'))

// app.get('/', (req, res) => {
//     res.sendFile(__dirname+'/index.html');
// })

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
  })
app.get('/:room', (req, res) => {
    res.render('index', { roomId: req.params.room })
  })
  

const io = require("socket.io")(server)
var users = {}
var U = {}


io.on("connection", (socket)=> {
     socket.on("new-user-joined", (roomId,id, username) => {
        socket.join(roomId)
        users[id] = username;
      //   console.log(roomId)
        U[username] = "Online"
               //  userJoinLeft(U);
        socket.to(roomId).emit('user-connected',  {userid: id,name: username})
        io.emit("user-list",U)
 
     socket.on("disconnect", ()=>{
        socket.to(roomId).emit('user-disconnected', user = users[id], id);
        // delete users[socket.id];
        U[username] = "Offline"

        io.emit("user-list",U)
     })
     socket.on('message', (data) => {
        socket.to(roomId).emit("message", {user: data.user, msg: data.msg})
     })
    })
})
server.listen(port, () =>{
    console.log("server started")
})