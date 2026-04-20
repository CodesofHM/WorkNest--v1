const express = require("express");
const router = express.Router();
const multer = require("multer"); // Required to check for Multer-specific errors
const upload = require("../middlewares/upload"); // Import your configured Cloudinary middleware
const { verifyToken } = require("../middlewares/auth");

// Test endpoint to check if server is working
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Upload server is healthy" });
});

// --- Main Route for Successful Uploads ---
// The `upload.single("file")` middleware runs first.
// If it succeeds, the next function (the handler) is called.
// If it fails, it skips the handler and passes the error to the error-handling middleware below.
router.post("/upload", verifyToken, upload.single("file"), (req, res) => {
  console.log("Upload endpoint hit");
  console.log("File received:", req.file);
  
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
  console.error("Upload route error:", {
    type: err.constructor.name,
    message: err.message,
    code: err.code,
  });

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large. Maximum size is 1MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    // Handle Cloudinary or other errors
    if (err.message && err.message.includes("Invalid")) {
      return res.status(400).json({ message: "Invalid file format or configuration." });
    }
    
    console.error("Detailed error:", err);
    return res.status(500).json({ 
      message: "An error occurred during file upload.",
      ...(process.env.NODE_ENV === 'development' && { detail: err.message })
    });
  }
  next();
});

module.exports = router;
