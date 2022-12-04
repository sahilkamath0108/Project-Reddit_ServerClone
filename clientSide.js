const io = require("socket.io-client")

const socket = io("http://localhost:5050")

socket.on("connect", (message) =>{
    console.log("Connected with "+socket.id)
    socket.emit("sendMessage", message)
})

socket.on("receiveMessage", message => {
    console.log(message)
})



 