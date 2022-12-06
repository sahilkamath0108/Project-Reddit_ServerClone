const io = require("socket.io-client")

const socket = io("http://localhost:5050")

socket.on("connection", (message,room) =>{
    console.log("Connected with "+socket.id)
    socket.emit("sendMessage", message, room)     //message to all or personal
    socket.emit("joinRoom", room)          //join a particular room
})

socket.on("receiveMessage", message => {
    console.log(message)
})



 