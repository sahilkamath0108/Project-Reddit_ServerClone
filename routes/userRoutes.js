const express = require("express")

const userC = require("../controllers/userC")
const auth = require("../middleware/auth")



const router = express.Router()

//List all users

router.get("/", userC.getUser)

//create user

router.post("/new", userC.createUser)

//upload profile picture

router.post("/uploadPfp", auth.authToken , auth.fileVerifyPfp.single('pfp'), userC.uploadPfp )

//login user

router.post("/login", userC.loginUser)

//delete user

router.delete("/delete", auth.authToken ,userC.deleteUser)

//updating user info

router.put("/update/:uname", auth.authToken ,userC.updateUser)

//forgot password

router.post("/forgotPassword", userC.forgotPswd)


module.exports = router