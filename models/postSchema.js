const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    postPic: {
        type: Buffer
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    likes: {
        type: Number,
        default: 0
    },
    files: [{
        type: Buffer
    }],
    fileCount: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const PostSchema = mongoose.model("post", postSchema);

module.exports = PostSchema;