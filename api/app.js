const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();
const postModel = require('../models/postmodel');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use memory storage for uploads (or configure a temporary directory)
const storage = multer.memoryStorage(); // Using memory storage for temporary file handling
const upload = multer({ storage: storage });

// Render the upload file form
app.get('/', (req, res) => {
    res.render('up'); // Ensure "up.ejs" exists in the "views" folder
});

// Handle file upload with multer middleware
app.post('/uploads', upload.single('image'), async (req, res) => {
    try {
        const { name, post } = req.body;
        const image = req.file ? req.file.buffer.toString('base64') : ''; // Convert to Base64 for storage

        // Save post to MongoDB
        await postModel.create({ name, post, image });

        // Redirect to the uploaded file view to display all posts
        res.redirect('/uploadedfiles'); // Redirect to another route to display all uploaded posts
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).send('An error occurred while saving the post.');
    }
});

// Route to display all uploaded files
app.get('/uploadedfiles', async (req, res) => {
    try {
        // Retrieve all posts from MongoDB
        const posts = await postModel.find();
        
        // Render the uploadedfile view, passing the posts array
        res.render('uploadedfile', { posts });
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).send('An error occurred while retrieving the posts.');
    }
});

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined');
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected!'))
    .catch(err => console.error('Database connection error:', err));

// Start the server
app.listen(3000, () => {
    console.log('Connected successfully on port 3000');
});
