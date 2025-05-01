const express = require('express');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // Importing new S3 client for v3
const { v4: uuidv4 } = require('uuid'); // For generating unique file names

const app = express();

// Configure AWS S3
const s3 = new S3Client({
  region: 'eu-north-1', // Replace with your AWS region, e.g., 'us-west-2'
  credentials: {
    accessKeyId: 'AKIAZZL6YSTLWVX2MDL2', // Replace with your AWS access key
    secretAccessKey: 'GQT/w67SMQfwmljcSqYiaIwkuhXE1WnC4HBYlpKQ', // Replace with your AWS secret key
  },
});

// Set up Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory before uploading to S3
const upload = multer({ storage: storage });

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the index.html file
});

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const fileName = `${uuidv4()}-${file.originalname}`; // Unique file name to avoid collisions

  const params = {
    Bucket: 'file-sharing-bucket-girllhell', // Replace with your actual S3 bucket name
    Key: fileName, // File name to be stored in S3
    Body: file.buffer, // File data
    ContentType: file.mimetype, // Set the content type (MIME type)
    ACL: 'public-read', // Make file publicly accessible
  };

  try {
    // Upload file to S3
    const command = new PutObjectCommand(params);
    const data = await s3.send(command); // Using async/await with S3 v3
    console.log('Success', data);

    // Return the file URL after successful upload
    const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${fileName}`;
    res.json({
      success: true,
      fileUrl: fileUrl, // URL of the uploaded file
    });
  } catch (err) {
    console.log('Error uploading file:', err);
    return res.status(500).json({ success: false, message: 'File upload failed!' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
