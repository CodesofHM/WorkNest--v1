const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.config");

// This configures the storage engine to use Cloudinary.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "worknest-profile-pictures", // A specific folder in Cloudinary for these images
    allowed_formats: ["jpg", "png", "jpeg"],
    // You could add transformations here to resize images on upload
  },
});

// This creates the Multer instance that will handle the upload process.
// It uses the Cloudinary storage engine and sets a file size limit.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024, // 1 MB limit
  },
});

module.exports = upload;