const express = require('express');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Configure AWS SDK v3 with IAM Role (No need for accessKeyId and secretAccessKey if using IAM Role)
const s3 = new S3Client({
  region: 'eu-north-1', // Set the region for your S3 bucket
  // No need for accessKeyId and secretAccessKey when using IAM Role on EC2
});

// Set up Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload route: Handles the file upload to S3
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Generate a unique file name using UUID
  const fileName = `${uuidv4()}-${file.originalname}`;

  // Define the parameters for uploading to S3
  const params = {
    Bucket: 'file-sharing-bucket-girllhell', // Your S3 Bucket name
    Key: fileName, // File name on S3
    Body: file.buffer, // The file data (from memory storage)
    ContentType: file.mimetype, // Content type (e.g., image/jpeg)
    ACL: 'public-read', // Set the file to be publicly readable
  };

  try {
    // Upload the file to S3
    await s3.send(new PutObjectCommand(params));

    // Generate the public URL for the uploaded file
    const fileUrl = `https://${params.Bucket}.s3.${'eu-north-1'}.amazonaws.com/${fileName}`;

    // Respond with the file URL
    res.json({ success: true, fileUrl });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ success: false, message: 'File upload failed!' });
  }
});

// Start the Express server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
