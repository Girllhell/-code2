const express = require('express');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const app = express();

// AWS SDK setup
const s3 = new S3Client({
  region: 'eu-north-1',  // Set your S3 region
  // IAM role setup will automatically pick up the correct credentials
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve static files (if you want to serve frontend files)
app.use(express.static(path.join(__dirname, 'public')));

// Upload route: Handles the file upload to S3
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileName = `${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: 'file-sharing-bucket-girllhell',  // Your S3 bucket name
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));

    const fileUrl = `https://${params.Bucket}.s3.${'eu-north-1'}.amazonaws.com/${fileName}`;

    res.json({ success: true, fileUrl });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ success: false, message: 'File upload failed!' });
  }
});

// Get list of uploaded files
app.get('/files', async (req, res) => {
  try {
    const data = await s3.send(new ListObjectsV2Command({
      Bucket: 'file-sharing-bucket-girllhell',
    }));

    const files = data.Contents?.map(obj => {
      return {
        name: obj.Key,
        url: `https://file-sharing-bucket-girllhell.s3.eu-north-1.amazonaws.com/${obj.Key}`,
      };
    }) || [];

    res.json({ success: true, files });
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).json({ success: false, message: 'Failed to list files' });
  }
});

// Download route: Forcing file download
app.get('/download/:filename', async (req, res) => {
  const { filename } = req.params;

  const params = {
    Bucket: 'file-sharing-bucket-girllhell',
    Key: filename,
  };

  try {
    const data = await s3.send(new GetObjectCommand(params));

    // Force download
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-Type', data.ContentType);

    data.Body.pipe(res);
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).json({ success: false, message: 'Failed to download file' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
