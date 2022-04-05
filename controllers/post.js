const userModel = require('../models/users')
const postModel = require('../models/Post')
const validator = require('../utility/validator')

module.exports.createPost = async (req, res) => {
    try {
        console.log("inside create post-=-=-=-=-=-=-")
        req.checkBody('title', 'Please enter the Title').notEmpty()
        req.checkBody('content', 'Please enter your Content').notEmpty()
        req.checkBody('userId', 'UserId is required').notEmpty().isInt().withMessage("Invalid userId")

        let validationResult = await validator(req)
        if (!validationResult.status) {
            res.status(422).json({ status: 422, message: "Please enter correct data", error: validationResult.data })
            return
        }
        const postID = parseInt(req.body.userId + makeid(5))
        let obj = req.body
        obj.postId = postID
        let postObj = new postModel(obj)
        await postObj.save()
        return res.status(200).send({
            status: 200,
            message: "Post Saved Successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 500, message: error.message, data: error.data })
    }
}

module.exports.like = async (req, res) => {
    try {
        console.log("inside Likes-=-=-=-=-=-=-")
        req.checkBody('likeType', 'likeType is required').notEmpty().isIn(["post", "comment"]).withMessage("Invalid likeType")
        req.checkBody('userId', 'userId is required').notEmpty().isInt().withMessage("Invalid userId")
        req.checkBody('Id', 'Id is required').notEmpty().isInt().withMessage("Invalid Id")

        let validationResult = await validator(req)
        if (!validationResult.status) {
            res.status(422).json({ status: 422, message: "Please enter correct data", error: validationResult.data })
            return
        }
        req.body.Id = parseInt(req.body.Id)
        req.body.userId = parseInt(req.body.userId)
        let obj = {
            userId: req.body.userId,
            likedAt: new Date()
        }
        let query = {
            userId: req.body.userId
        }

        if (req.body.likeType == "post") {

            let islikePostExist = await postModel.findOne({
                postId: req.body.Id,
                "likes.userId": req.body.userId
            })
            if (islikePostExist) {
                await postModel.updateOne({
                    postId: req.body.Id,
                    "likes.userId": req.body.userId
                }, {
                    $pull: {
                        likes: {
                            userId: req.body.userId
                        }
                    }
                })
                res.status(200).send({ status: 200, message: "Post has been disliked" })
            }
            else {
                await postModel.updateOne({
                    postId: req.body.Id
                }, {
                    $push: {
                        likes: {
                            userId: req.body.userId,
                            likedAt: new Date()
                        }
                    }
                })
                // console.log({
                //     postId: req.body.Id,
                //     "likes.userId": req.body.userId
                // }, "QQQQQQQQQQQQ", {
                //     $push: {
                //         likes: {
                //             userId: req.body.userId,
                //             likedAt: new Date()
                //         }
                //     }
                // })
                res.status(200).send({ status: 200, message: "Post has been Liked" })

            }

        }
        else if (req.body.likeType == "comment") {
            let iscommentlikeExist = await postModel.findOne({
                "comments.commentID": req.body.Id,
                "comments.likes.userId": req.body.userId
            })
            if (iscommentlikeExist) {
                await postModel.updateOne({
                    "comments.commentID": req.body.Id,
                    "comments.likes.userId": req.body.userId
                }, {
                    $pull: {
                        'comments.$.likes': {
                            userId: req.body.userId
                        }
                    }
                })
                res.status(200).send({ status: 200, message: "Comment has been disliked" })
            }
            else {
                await postModel.updateOne({
                    "comments.commentID": req.body.Id,
                }, {
                    $push: {
                        'comments.$.likes': {
                            userId: req.body.userId,
                            likedAt: new Date()
                        }
                    }
                })
                // console.log({
                //     postId: req.body.Id,
                // }, "dkuchufivhr", {
                //     $push: {
                //         comments: {
                //             "likes.userId": req.body.userId,
                //             "likes.likedAt": new Date()
                //         }
                //     }
                // })
                res.status(200).send({ status: 200, message: "Comment has been Liked" })

            }
        }

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: 500, message: error.message, data: error.data })
    }
}

module.exports.createComment = async (req, res) => {
    try {
        console.log("inside CreateComment-=-=-=-=-=-=-", req.body)
        req.checkBody('postId', 'postId is required').notEmpty().isInt().withMessage("Invalid userId")
        req.checkBody('userId', 'userId is required').notEmpty().isInt().withMessage("Invalid userId")
        req.checkBody('comment', 'comment is required').notEmpty()

        let validationResult = await validator(req)
        if (!validationResult.status) {
            res.status(422).json({ status: 422, message: "Please enter correct data", error: validationResult.data })
            return
        }

        // req.body.postId = parseInt(req.body.postId)
        let {
            postId,
            userId,
            comment
        } = req.body
        req.body.userId = parseInt(req.body.userId)
        const commentId = parseInt(req.body.userId + makeid(5))
        let obj = {}
        obj.userId = userId
        obj.commentID = commentId
        obj.comment = comment
        obj.commentedAt = new Date()

        let commentObj = await postModel.updateOne({
            postId: postId
        }, {
            $push: {
                comments: obj
            }
        })
        // console.log({
        //     postId: req.body.postID,
        // }, "audhciksduhwiure", {
        //     $push: {
        //         comments: obj
        //     }
        // }, "iudhcdisuwehiuhidu", req.body.postId)
        return res.status(200).send({
            status: 200,
            message: "Comment Saved Successfully"
        })



    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 500, message: error.message, data: error.data })
    }
}
module.exports.UsersLikePost = async (req, res) => {
    try {
        let userId = req.body.userId
        let latestUsers = await postModel.aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $unwind: "$likes"
            }, {
                $sort: {
                    "likes.likedAt": -1
                }
            }, {
                $match: {
                    "likes.userId": {
                        $ne: userId
                    }
                }
            }, {
                $project: {
                    "title": 1,
                    "content": 1,
                    "postId": 1,
                    "likes": 1
                }
            }
        ])
        return res.send({ status: 200, data: latestUsers })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: 500, message: error.message, data: error.data })
    }
}
module.exports.usersLikeComment = async (req, res) => {
    try {
        let commentedUserId = req.body.userId
        let latestUsers = await postModel.aggregate([
            {
                $match: {
                    "comments.userId": commentedUserId
                }
            },
            {
                $unwind: "$comments"
            }, {
                $match:{
                    "comments.userId": commentedUserId,
                    "comments.likes.userId":{
                        $ne: commentedUserId
                    }
                }
            },{
                $project: {
                    "title": 1,
                    "content": 1,
                    "postId": 1,
                    "comments.likes": 1,
                    "comments.userId":1,
                    "comments.commentID":1,
                    "comments.comment":1,
                    "comments.commentedAt":1
                }
            },
            {
                $unwind:{
                    path:"$comments.likes"
                }
            },
            {
                $sort: {
                    "comments.likes.likedAt": -1
                }
            }, 
        ])
        return res.send({ status: 200, data: latestUsers })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: 500, message: error.message, data: error.data })
    }
}

module.exports.usersCommented = async (req, res) => {
    console.log("Inside users Commented")
    try {
        let userId = req.body.userId
        console.log("@@@@@",req.body)
        let latestUsers = await postModel.aggregate([
             {
                $match: {
                    userId: userId
                }
            },{
                $unwind: "$comments"
            },
            {
                $sort: {
                    "comments.commentedAt": -1
                }
            }, {
                $match: {
                    "comments.userId": {
                        $ne: userId
                    }
                }
            }, {
                $project: {                
                    "postId": 1,
                    "title": 1,
                    "comments.userId":1,
                    "comments.comment":1,
                    "comments.commentedAt":1
                }
            }
        ])
    return res.send({ status: 200, data: latestUsers })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: 500, message: error.message, data: error.data })
    }
}

function makeid(length) {
    var result = ''
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}