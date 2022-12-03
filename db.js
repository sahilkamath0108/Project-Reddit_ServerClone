const mongoose = require("mongoose");
require('dotenv').config();



mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log("Connected to DB, Enjoy"))
  .catch((err)=>console.log(err));