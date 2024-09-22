var mongoose = require("mongoose");
var plm = require('passport-local-mongoose');
const posts = require("./posts");


mongoose.connect("mongodb://127.0.0.1:27017/dataname");

var userSchema =mongoose.Schema({
  username: String,
  email: String,
  image:{
    type:String
  },
  password:String,
  like:{
    type: Array,
    default:[]
  },
  follow: {
    type:Number,
    default:0
  },
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'posts'
  }]
})

userSchema.plugin(plm,{usernameField:'email'});

module.exports = mongoose.model("user", userSchema);
