// Updated app.js
const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();
const postModel = require('../models/postmodel');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.set('views', path.join(__dirname, '..', 'views'));

// Correct MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
   
}).then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads')); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function (err, bytes) {
            const fn = bytes.toString('hex') + path.extname(file.originalname);
            cb(null, fn);
        });
    }
});

const upload = multer({ storage: storage });

// Render the upload file form
app.get('/', (req, res) => {
    res.render('up'); // Ensure "up.ejs" exists in the "views" folder
});

// Handle file upload with multer middleware
app.post('/uploads', upload.single('image'), async (req, res) => {
    try {
        const { name, post } = req.body;
        const image = req.file ? req.file.filename : ''; // Assign filename from the uploaded file

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

// Start the server
app.listen(3000, () => {
    console.log('Connected successfully');
});
