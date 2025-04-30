const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// استخدم ملفات ثابتة من المجلد الحالي
app.use(express.static(__dirname));

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
