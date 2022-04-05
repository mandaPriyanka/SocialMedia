let userModel = require('../models/users')
let validator = require('../utility/validator')
let moment = require('moment')
let bcrypt = require('bcrypt')
let salt_round = bcrypt.genSaltSync(10)
let registerApi = async (req, res) => {
    try {

        req.checkBody('name', 'Please enter your name').notEmpty().isAlpha().withMessage("only alphabets allowed")
        req.checkBody('username', 'Please enter your username').notEmpty()
        req.checkBody('password', 'Please enter your password').notEmpty().matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}/).withMessage('Password should be combination of atleast one uppercase, one lower case, one special character, one digit and minimum 6, maximum 15 characters long')

        let validationResult = await validator(req)
        if (!validationResult.status) {
            res.status(422).json({ status: 422, message: "Please enter correct data", error: validationResult.data })
            return
        }
        let { name, username, password } = req.body
        let userCount = await userModel.find({ username: username }).count()
        if (userCount > 0) {
            res.status(409).json({ status: 409, message: "username already belongs to other user, Please use diffrent username" })
            return
        }

        let hashedPassword = bcrypt.hashSync(password, salt_round)

        let userId = Math.floor(10000000 + Math.random() * 90000000);
        let userObj = {
            name: name,
            username: username,
            password: hashedPassword,
            userId: userId,
            cts: Date.now(),
            uts: Date.now()
        }
        let saveUser = await userModel(userObj).save()
        console.log(saveUser)
        res.status(200).json({ status: 200, userId: userId, username: username, name: name })
        return
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, message: 'Internal server error', error: error.message })
        return
    }
}

module.exports = {
    registerApi: registerApi
}