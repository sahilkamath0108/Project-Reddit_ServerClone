require('dotenv').config();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const PostSchema = require('../models/postSchema');
const UserSchema = require('../models/userSchema');

const authToken = async (req, res, next)=> {
    try{
    const authHeader =req.header('Authorization')
    const token = authHeader && authHeader.split(" ")[1]
    if(token == null) return res.sendStatus(401)

    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await UserSchema.findById({_id : decode._id})

    if(!user){
        res.status(404).json({
            message: "User not found"
        })
    }

    req.user = user
    next()
} catch(e){
    res.status(401).json({
        success: false,
        message: e.message
    })
}
}

const authorizePost = async (req, res, next) => {

    const user = req.user.username
    const reqUser = req.params.id

    const post =  await PostSchema.findById({_id: reqUser});

    if(post.username===user){
        res.status(201);
        next()
    }else{
        res.status(400).json({
            success: false,
            message: "Not authorized"
        })
    }
}


const fileVerifyPfp = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.jpg|jpeg|png/)) {
            return callback(new Error('Incorrect file format!'))
        }
        callback(undefined, true)
    }
})

const fileVerifyPost = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.jpg|jpeg|png|pdf|docx/)) {
            return callback(new Error('Incorrect file format!'))
        }
        callback(undefined, true)
    }
})


module.exports = {
    authToken,
    authorizePost,
    fileVerifyPfp,
    fileVerifyPost
}