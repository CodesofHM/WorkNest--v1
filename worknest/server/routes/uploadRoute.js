const express = require("express");
const router = express.Router();
const multer = require("multer"); // Required to check for Multer-specific errors
const upload = require("../middlewares/upload"); // Import your configured Cloudinary middleware

// --- Main Route for Successful Uploads ---
// The `upload.single("file")` middleware runs first.
// If it succeeds, the next function (the handler) is called.
// If it fails, it skips the handler and passes the error to the error-handling middleware below.
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded." });
  }

  // On success, respond with the public URL from Cloudinary
  res.status(200).json({
    message: "File uploaded successfully!",
    url: req.file.path,
  });
});

// --- Error Handling Middleware for this Router ---
// This middleware will "catch" any errors thrown by `upload.single("file")`.
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large. Maximum size is 1MB." });
    }
    // Handle other potential multer errors 
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Handle any other non-multer errors
    console.error("Unknown upload error:", err);
    return res.status(500).json({ message: "An unknown error occurred during file upload." });
  }
  next();
});

module.exports = router;