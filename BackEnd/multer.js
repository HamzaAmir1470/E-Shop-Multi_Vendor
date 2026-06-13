const multer = require('multer');

// Store files in memory as buffers
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit example
});

module.exports = upload;