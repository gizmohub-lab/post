const { name } = require('ejs')
const mongoose = require('mongoose')

// Define the schema
const postSchema = new mongoose.Schema({
    name: String,
    post: String,
    image: String
});

// Create and export the model
module.exports = mongoose.model("User", postSchema);