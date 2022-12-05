const express = require("express");
// const { Socket } = require("socket.io");
require("./db");
require('dotenv').config();
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const io = require("socket.io")(5050);
require("./clientSide")

const app = express();


app.use(express.json());

// User 
app.use('/user',userRoutes);


// Post
app.use('/post',postRoutes);

app.listen(3000 , ()=>{
  console.log('The server is up and running at port 3000');
});

//socket.io

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







