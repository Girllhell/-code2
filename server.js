const express = require('express');
const path = require('path');
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // For generating unique file names

const app = express();

// Configure AWS S3
AWS.config.update({
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',      // Replace with your AWS access key
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',  // Replace with your AWS secret key
  region: 'YOUR_AWS_REGION'  // Replace with your AWS region, e.g., 'us-west-2'
});

const s3 = new AWS.S3();

// Set up Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory before uploading to S3
const upload = multer({ storage: storage });

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serve the index.html file
});

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const fileName = `${uuidv4()}-${file.originalname}`; // Unique file name to avoid collisions

  const params = {
    Bucket: 'your-bucket-name', // Replace with your actual S3 bucket name
    Key: fileName,              // File name to be stored in S3
    Body: file.buffer,          // File data
    ContentType: file.mimetype, // Set the content type (MIME type)
    ACL: 'public-read',         // Make file publicly accessible
  };

  // Upload file to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.log('Error uploading file:', err);
      return res.status(500).json({ success: false, message: 'File upload failed!' });
    }

    // Return the file URL after successful upload
    res.json({
      success: true,
      fileUrl: data.Location, // URL of the uploaded file
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
