const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  author: String,
  title: {
    type: String,
    required: true,
    minlenght: 3,
    unique: true,
  },
  published: Number,
  genres: [String],
});

module.exports = mongoose.model("Book", bookSchema);
