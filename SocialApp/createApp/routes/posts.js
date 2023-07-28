const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  postDetails: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  likes: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("post", postSchema);
