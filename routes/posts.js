var mongoose = require("mongoose");


var postSchema = mongoose.Schema({
  postdets: String,
  users: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },

  like: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'user',
    default: []
  }],
  image: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
})


module.exports = mongoose.model("post", postSchema);