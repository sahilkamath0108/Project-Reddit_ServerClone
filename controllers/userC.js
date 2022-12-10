require("dotenv").config();
const UserSchema = require("../models/userSchema");
const PostSchema = require("../models/postSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authToken } = require("../middleware/auth");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator")

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  port: 465,
});

//show all users info
const getUser = async (req, res) => {
  try {
    let userData = await UserSchema.find()
      .populate("pop")
      .select("-password -profilePic -pop");
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
};

//create user
const createUser = async (req, res) => {
  try {
    let userData = new UserSchema(req.body);
    let savedUserData = await userData.save();
    let id = savedUserData._id;
    userMail = savedUserData.email;

    mailTransporter.sendMail({
      from: process.env.EMAIL,
      to: userMail,
      subject:"Thank you for creating an account on our website " +savedUserData.fname,
      text: "We hope you have a good time with our app.",
    });

    let pswd = await UserSchema.findById({ _id: id }).select("-password -profilePic"); //to hide hashed pswd

    const accessToken = await savedUserData.genAuthToken();
    res.status(201).json({
      success: true,
      data: pswd,
      accessToken,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//upload profile picture

const uploadPfp = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    req.user.profilePic = buffer;
    await req.user.save();
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//delete user

const deleteUser = async (req, res) => {
  try {
    // let id = req.params.id;
    let id = req.user._id;

    const user = await UserSchema.findByIdAndDelete({ _id: id });
    const userMail = user.email;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      await PostSchema.deleteMany({ username: user.username });

      mailTransporter.sendMail({
        from: process.env.EMAIL,
        to: userMail,
        subject: "Sorry to see you leave " + user.fname,
        text: "We do hope you come back, we will be waiting for you! Thank you",
      });

      res.status(201).json({
        success: true,
        message: "User and and their posts were deleted",
        data: user,
      });
    }
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

//updating user

const updateUser = async (req, res) => {
  // let uname = req.params.uname;
  let uname = req.user.username;

  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "fname", "lname", "number", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  let user = await UserSchema.findOne({ username: uname });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  } else {
    try {
      await UserSchema.findOneAndUpdate({ username: uname },{ $set: req.body })
      await PostSchema.updateMany({ username: uname }, { $set: req.body });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      let newPswd = await UserSchema.findOneAndUpdate({ username: uname },{ password: hashedPassword })

      
      res.status(201).json({
        success: true,
        data: req.body,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};

const loginUser = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await UserSchema.findOne({ username: username });
  const withoutPswd = await UserSchema.findOne({ username: username }).select(
    "-password -profilePic"
  );

  if (!user) {
    return res.status(400).send({ error: "User does not exist..." });
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      const token = await user.genAuthToken();
      res.json({
        user: withoutPswd,
        token: token,
      });
    } else {
      res.send("Wrong password");
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// forgot password

const forgotPswd = async (req, res) => {
  const username = req.body.username;
  const user = await UserSchema.findOne({ username: username });
  // console.log(user);

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  let r = (Math.random() + 1).toString(36).substring(5);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(r, salt);
  let newPswd = await UserSchema.findOneAndUpdate(
    { username: username },
    { password: hashedPassword }
  );

  const userMail = user.email;

  mailTransporter.sendMail({
    from: process.env.EMAIL,
    to: userMail,
    subject: "Here is your password " + user.fname,
    text:
      "Kindly enter the following password to get access to your account: " + r,
  });

  res.send("Email has been sent to registered email ID");
};

// login using otp

const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false,upperCaseAlphabets: false, specialChars: false });

const loginOTP = async (req,res) => {
  const username = req.body.username
  const user = await UserSchema.findOne({username: username})

  if(!user){
    res.status(404).json({
      success: false,
      message: "User not found"
    })
  }
  const OTP = otp
  const userWithOtp = await UserSchema.findOneAndUpdate({username: username}, {OTP: OTP})

  const userMail = user.email;

  mailTransporter.sendMail({
    from: process.env.EMAIL,
    to: userMail,
    subject: "Here is your OTP " + user.fname,
    text:
      "Kindly enter the following password to get access to your account: " + OTP,
  });

  res.send("Email with the OTP has been sent to registered email ID");

}

const verifyOTP = async (req,res) =>{
  const username = req.user.username
  const deleteOTP = await UserSchema.findOneAndUpdate({username: username}, { $set :{OTP: null}})
  const user = await UserSchema.findOne({ username: username }).select("-password -profilePic")
  const token = await user.genAuthToken()
  res.json({
    success: true,
    token: token,
    user: user
  })
}

module.exports = {
  deleteUser,
  getUser,
  createUser,
  updateUser,
  loginUser,
  uploadPfp,
  forgotPswd,
  loginOTP,
  verifyOTP
};
