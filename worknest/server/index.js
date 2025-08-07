const express = require('express');
const app = express();
const upload = require('./middlewares/upload');
const port = process.env.PORT || 5000;

app.use(express.json());

// ✅ Cloudinary Upload Route
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const uploadedFile = req.file;
    res.status(200).json({
      message: 'File uploaded successfully!',
      url: uploadedFile.path,
    });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Hello from WorkNest server!');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
