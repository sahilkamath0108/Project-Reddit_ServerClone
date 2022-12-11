const UserSchema = require("../models/userSchema");
const PostSchema = require("../models/postSchema");
const userC = require("./userC");

//my posts

const myPosts = async (req,res)=>{
  try{
    let data = await PostSchema.find({username: req.user.username})
    // console.log(data)
    res.json({
      data: data
    })
  }catch(e){
    res.json({
      success: false,
      message: e.message
    })
  }
}

//show all posts

const allPosts = async (req, res) => {
  try {
    // await UserSchema.find().populate("pop");

    let data = await PostSchema.find().sort({ createdAt: -1 }).select('-files')        //removed files because buffer taking lots of space
      res.status(200).json({
        success: true,
        data: data
      })
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
};

// create new post

const newPost = async (req, res) => {
  try {
    let newPost = new PostSchema(req.body);
    const username = req.user.username

    let post = await newPost.save();

    const buffer = req.files;
    // console.log(buffer)
    const arrOfPosts= [];
    var fileCount = 0;
    for(var i = 0; i<buffer.length; i++){
      arrOfPosts[i]= buffer[i].buffer;
      fileCount++;
    }
    // for(var i = 0; i<buffer.length; i++){
    //   console.log(arrOfPosts[i])
    // }
    // console.log(fileCount);

    
    await PostSchema.findByIdAndUpdate({_id: post._id},{username: username, files: arrOfPosts, fileCount: fileCount})
    let postUsername = await PostSchema.findById({ _id: post._id }).select('-files')
    // console.log(postUsername, username)



    await UserSchema.findOneAndUpdate({ username: username },{ $push: { pop: post._id }, $inc: {postCount: 1}});

      res.status(201).json({
        success: true,
        data: postUsername
      })
    } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//delete a post

const deletePost = async (req, res) => {
  try {
    // const deleteRef = await UserSchema.fin({_id: req.user._id} ,{"pop._id" : req.params.id}) 
    // if(!deleteRef){
    //   res.status(404).json({
    //     success: false,
    //     message: "No such post"
    //   })
    // }
    const info = await PostSchema.deleteOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: info,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//updating a post

const updatePost = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["title", "text"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid Updates!" });
    }

     await PostSchema.findOneAndUpdate({ _id: req.params.id },{ $set: req.body })
     const data = await PostSchema.findById({ _id: req.params.id })
        res.status(201).json({
            success: true,
            data: data
        })
      
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// like a post

const likePost = async (req,res) => {
  const id = req.params.id;
  const post = await PostSchema.findById({_id: id});

  if(!post){
    res.status(404).json({
      success: false,
      message: "Post does not exist"
    })
  }

  const username = req.user.username
  const cond = post.likedBy.includes(username)
  
  if(cond){
    await PostSchema.findOneAndUpdate({_id: id}, {$pull : {likedBy: username}})
    const remove = await PostSchema.findOneAndUpdate({_id: id}, {$inc: {likes: -1}})
    res.json({
      success: true,
      message: "Unliked the post"
    })
  }else{
      try{
      await PostSchema.findByIdAndUpdate({_id : id}, { $inc: {likes : 1}});
      await PostSchema.findByIdAndUpdate({_id : id}, { $push: {likedBy : username}});
      const updated = await PostSchema.findById({_id: id});
      res.json({
        success: true,
        data: updated
      })
    }catch(e){
      res.json({
        success: false,
        message: e.message
      })
    }
  }


  
}


module.exports = {
  allPosts,
  newPost,
  deletePost,
  updatePost,
  likePost,
  myPosts
}
