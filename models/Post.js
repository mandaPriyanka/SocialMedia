const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    postId: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    likes: [{
        userId: Number,
        likedAt: Date
    }],
    comments: [{
        userId: Number,
        commentID: Number,
        commentedAt: Date,
        comment: String,
        likes: [{
            userId: Number,
            likedAt: Date
        }]
    }]
}, {
    timestamps: true
})



module.exports = mongoose.model('Posts', PostSchema)