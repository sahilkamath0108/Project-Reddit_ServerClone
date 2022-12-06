require('dotenv').config();
const jwt = require("jsonwebtoken");
const UserSchema = require('../models/userSchema');
const {instrument} = require("@socket.io/admin-ui")
const io = require("socket.io")(5050,{
    cors: {
        origin: ["https://admin.socket.io/", "http://localhost:5050"],
    },
});
require("./clientSide")
var noToken = 0;

io.use(async (socket,next)=>{
  
  const token = socket.handshake.headers.authorization;
  if(!token && noToken===0){
    next()
    noToken++
  }else if(!token && noToken===1){
    console.log("No Token Provided")
  }else{
  const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  const user = await UserSchema.findById({_id : decode._id})
  socket.username=user.username
  next()
  }
})

io.on("connection",(socket)=>{
    console.log(socket.username)
    socket.on("sendMessage", (message, room)=>{
      // console.log(message+ " \"text by user\" "+socket.id)
      // io.emit('receiveMessage', message)
      if(!room){
      socket.broadcast.emit('receiveMessage', (message+"  -->(by user)"+socket.username+" to all" ))
      }else{
        socket.to(room).emit('receiveMessage', (message+"  -->(by user)"+socket.username+" to you" ))
      }
    })
    
    socket.on("joinRoom", room => {
      socket.join(room)
      console.log(socket.username+" joined room "+room)
    })
  })

instrument(io, {auth: false})