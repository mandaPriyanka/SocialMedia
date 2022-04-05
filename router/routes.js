
const express = require('express'),
    router = express.Router(),
    registration = require('../controllers/registration'),
    userPost = require('../controllers/post')



router.post('/user/registration', registration.registerApi)
router.post('/user/createPost', userPost.createPost)
router.post('/user/likeUnlike', userPost.like)
router.post('/user/commentPost', userPost.createComment)
router.post('/user/latestLikesPost', userPost.UsersLikePost)
router.post('/user/latestLikesComment', userPost.usersLikeComment)
router.post('/user/latestUsersCommented', userPost.usersCommented)


module.exports = router;