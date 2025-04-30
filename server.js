const express = require('express');
const path = require('path');

const app = express();

// خدمة الملفات الساكنة (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
