const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// نخلي السيرفر يقدم الملفات من نفس المجلد
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
