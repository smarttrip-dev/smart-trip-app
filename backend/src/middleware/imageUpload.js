import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage location for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store images in public/images/inventory/
    cb(null, path.join(__dirname, '../../public/images/inventory'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: [vendor-id]-[timestamp]-[originalname]
    const vendor = req.user._id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${vendor}-${timestamp}-${name}${ext}`);
  },
});

// File filter - only accept image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only images are allowed. Supported: JPG, PNG, WebP, GIF`), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Middleware to handle single image upload
export const uploadSingleImage = upload.single('image');

// Middleware to handle multiple images upload
export const uploadMultipleImages = upload.array('images', 10); // Max 10 images

// Helper function to generate image URL
export const getImageURL = (filename) => {
  if (!filename) return null;
  return `/images/inventory/${filename}`;
};

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ message: 'File is too large. Max size is 5MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Max 10 images allowed' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};
