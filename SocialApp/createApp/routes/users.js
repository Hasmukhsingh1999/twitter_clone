const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/BaseCollection");

const userSchema = mongoose.Schema({
  username: String,
  firstname:String,
  lastname:String,
  email: String,
  password: String,
  profileimage: {
    type: String,
    default: "default.jpg",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema);
