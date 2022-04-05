const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {

    username: { type: String, unique: true },
    name: { type: String },
    password: { type: String },
    userId: { type: Number, unique: true },
    cts: { type: Number },
    uts: { type: Number }

  }, {
  timestamps: true
}

)


module.exports = mongoose.model('testuser', userSchema)
