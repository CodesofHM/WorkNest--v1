const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'worknest_uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4'],
  },
});

const upload = multer({ storage });

module.exports = upload;
    