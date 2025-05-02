const express = require('express');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const app = express();

const s3 = new S3Client({
  region: 'eu-north-1',
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Route: Upload file to S3
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileName = `${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: 'file-sharing-bucket-girllhell',
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

// ✅ Route: Get list of uploaded files
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

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
