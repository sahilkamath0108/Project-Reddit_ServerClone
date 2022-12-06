const express = require("express");
// const { Socket } = require("socket.io");
require("./db");
require('dotenv').config();
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
require("./socket/serverSide")          //socket


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









