const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// إعداد S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucket = process.env.AWS_BUCKET_NAME;

// إعداد multer لحفظ الملفات بشكل مؤقت
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// إعداد المسارات
app.use(express.static('public')); // السيرفر هيوجه ملفات HTML و CSS

// التعامل مع رفع الملفات
app.post('/upload', upload.array('files'), async (req, res) => {
  const files = req.files;
  const uploadedUrls = [];

  for (let file of files) {
    const fileContent = fs.readFileSync(file.path);
    const params = {
      Bucket: bucket,
      Key: file.originalname,
      Body: fileContent,
      ContentType: file.mimetype
    };

    try {
      const data = await s3.upload(params).promise();
      fs.unlinkSync(file.path); // احذف الملف من السيرفر بعد الرفع
      uploadedUrls.push(data.Location);
    } catch (err) {
      console.error('Upload error:', err);
    }
  }

  res.json({ urls: uploadedUrls });
});

// تشغيل السيرفر
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
