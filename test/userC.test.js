const User = require('../controllers/userC')

test("Should create a new user", () => {
    let user = {
        username: "test",
        fname: "TEst",
        lname: "teST",
        email: "test@gmail.com",
        number: 78887888,
        password: "test"
    }
    User.createUser(user)
})