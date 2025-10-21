const cloudinary = require('cloudinary').v2;

// This file configures and exports the Cloudinary instance.
// It assumes that you have a .env file in the /server directory with your credentials.
// The .env file is loaded in your main index.js file.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;