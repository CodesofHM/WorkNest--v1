const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID tokens
 * Extracts the token from the Authorization header (Bearer token)
 * and verifies it using Firebase Admin SDK
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Missing or invalid authorization header.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token using Firebase Admin SDK
    // Check if Firebase Admin is properly initialized
    if (!admin.apps.length) {
      console.error('Firebase Admin SDK not initialized');
      return res.status(500).json({ 
        message: 'Server configuration error.' 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach the user info to the request object for use in subsequent handlers
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message || error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        message: 'Token has expired. Please log in again.' 
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }

    // Return 401 for auth errors, not 500
    return res.status(401).json({ 
      message: 'Authentication failed.',
      ...(process.env.NODE_ENV === 'development' && { detail: error.message })
    });
  }
};

module.exports = { verifyToken };
