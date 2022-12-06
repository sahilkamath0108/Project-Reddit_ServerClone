const {instrument} = require("@socket.io/admin-ui")
const io = require("socket.io")(5050,{
    cors: {
        origin: ["https://admin.socket.io/", "http://localhost:5050"],
    },
});
require("./clientSide")



io.on("connect",(socket)=>{
    console.log(socket.id)
    socket.on("sendMessage", (message, room)=>{
      // console.log(message+ " \"text by user\" "+socket.id)
      // io.emit('receiveMessage', message)
      if(!room){
      socket.broadcast.emit('receiveMessage', (message+"  -->(by user)"+socket.id+" to all" ))
      }else{
        socket.to(room).emit('receiveMessage', (message+"  -->(by user)"+socket.id+" to you" ))
      }
    })
    
    socket.on("joinRoom", room => {
      socket.join(room)
      console.log(socket.id+" joined room "+room)
    })
  })

instrument(io, {auth: false})