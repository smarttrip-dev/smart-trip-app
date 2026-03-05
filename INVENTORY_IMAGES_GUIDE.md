# Inventory Images Implementation Guide

## Overview
The inventory management system now supports image uploads for vehicles, activities, accommodation, meals, packages, and other inventory items. Vendors can upload multiple images per item during creation or edit operations.

## Features

### ✅ What's Implemented

1. **Image Upload**
   - Supports multiple images per inventory item (max 10)
   - Accepted formats: JPG, PNG, WebP, GIF
   - Max file size: 5MB per image
   - Stored in `/public/images/inventory/` directory

2. **Image Display**
   - Grid view shows primary image with image count badge
   - Fallback to category emoji if no image uploaded
   - Image previews in inventory listings

3. **Image Management**
   - Add images during inventory creation
   - Add/replace images on inventory edit
   - Remove individual images from items
   - Replace all images or append new ones

4. **Backend Validation**
   - File type validation (MIME types + extensions)
   - File size validation (5MB limit)
   - Unique filename generation: `[vendor-id]-[timestamp]-[originalname]`
   - Error handling with detailed messages

## Backend Implementation

### Middleware: `src/middleware/imageUpload.js`

```javascript
// Setup multer for image uploads
- Storage location: `public/images/inventory/`
- File filter: validates image formats
- Limits: 5MB per file, 10 files max
- Error handling: detailed error messages
```

**Key Functions:**
- `uploadSingleImage` - Upload one image
- `uploadMultipleImages` - Upload up to 10 images
- `getImageURL(filename)` - Generate image URL
- `handleUploadError` - Error handling middleware

### Controller Updates: `src/controllers/inventoryController.js`

**New Exports:**
```javascript
// Handle image uploads in add
addInventoryItem(req, res)

// Handle image uploads in update
updateInventoryItem(req, res)

// Remove image from item
removeImageFromItem(req, res) - PUT /api/inventory/:id/remove-image
```

**Image Handling:**
- Auto-converts uploaded files to image URLs
- Supports append or replace mode on update
- Maintains image array in MongoDB

### Routes Update: `src/routes/inventoryRoutes.js`

```javascript
// New routes
POST   /api/inventory
       - uploadMultipleImages middleware
       - Handles multipart/form-data with images

PUT    /api/inventory/:id
       - uploadMultipleImages middleware
       - Can append or replace images

PUT    /api/inventory/:id/remove-image
       - Remove specific image by URL
```

## Frontend Implementation

### InventoryManagement.jsx Updates

**mapItem Function:**
```javascript
// Now includes images array
image: raw.images && raw.images.length > 0 ? raw.images[0] : TYPE_COLORS[raw.type]
images: raw.images || []
```

**Grid View Display:**
```javascript
// If image URL exists, display actual image
// Otherwise fallback to gradient + emoji
// Shows "+X more" badge if multiple images
```

## API Usage Examples

### 1. Add Inventory with Images

```bash
curl -X POST http://localhost:5001/api/inventory \
  -H "Authorization: Bearer TOKEN" \
  -F "name=Toyota Camry" \
  -F "type=transport" \
  -F "price=5000" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Form Data Fields:**
- `images` (file, multiple) - Image files
- `name` (string) - Item name
- `type` (string) - Item type
- `price` (number) - Price
- ... other fields

### 2. Update Inventory with New Images

```bash
# Append new images to existing ones (default)
curl -X PUT http://localhost:5001/api/inventory/ITEM_ID \
  -H "Authorization: Bearer TOKEN" \
  -F "images=@/path/to/image3.jpg"

# Replace all images with new ones
curl -X PUT http://localhost:5001/api/inventory/ITEM_ID \
  -H "Authorization: Bearer TOKEN" \
  -F "replaceImages=true" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### 3. Remove Image from Item

```bash
curl -X PUT http://localhost:5001/api/inventory/ITEM_ID/remove-image \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "/images/inventory/FILENAME"}'
```

## Frontend Implementation Examples

### Adding Images in React

```javascript
// Using FormData for multipart upload
const handleAddInventory = async (itemData, imageFiles) => {
  const formData = new FormData();
  
  // Add item data
  formData.append('name', itemData.name);
  formData.append('type', itemData.type);
  formData.append('price', itemData.price);
  
  // Add images
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await axios.post('/api/inventory', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};
```

### Displaying Images

```javascript
// In inventory grid
{service.images && service.images.length > 0 ? (
  <img 
    src={service.images[0]} 
    alt={service.name}
    className="w-full h-full object-cover"
  />
) : (
  // Fallback to emoji
  <span>🏨</span>
)}
```

## File Structure

```
backend/
├── public/
│   └── images/
│       └── inventory/          # Uploaded images stored here
├── src/
│   ├── middleware/
│   │   └── imageUpload.js      # NEW: Image upload config & helpers
│   ├── controllers/
│   │   └── inventoryController.js  # UPDATED: Image handling
│   └── routes/
│       └── inventoryRoutes.js      # UPDATED: Image upload routes
```

## Inventory Item Schema

```javascript
// MongoDB InventoryItem Schema
{
  _id: ObjectId,
  vendor: ObjectId,  // Reference to Vendor
  name: String,
  type: enum['accommodation', 'transport', 'activity', 'meal', 'package', 'other'],
  description: String,
  price: Number,
  currency: enum['LKR', 'USD', 'EUR'],
  capacity: Number,
  availableCount: Number,
  images: [String],  // Array of image URLs
  amenities: [String],
  isActive: Boolean,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### Backend Errors

| Code | Message | Solution |
|------|---------|----------|
| 400 | Invalid file type | Use JPG, PNG, WebP, or GIF |
| 400 | File is too large | Max 5MB per image |
| 400 | Too many files | Max 10 images per request |
| 404 | Vendor profile not found | Ensure vendor is logged in |
| 404 | Item not found | Check inventory item ID |
| 500 | Server error | Check server logs |

### Frontend Validation

```javascript
// File type check
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// File size check (5MB)
const MAX_SIZE = 5 * 1024 * 1024;

if (!ALLOWED_TYPES.includes(file.type)) {
  toast.error('Invalid image format');
}

if (file.size > MAX_SIZE) {
  toast.error('Image too large (max 5MB)');
}
```

## Testing Checklist

### Backend Tests

- [ ] Upload single image with inventory item
- [ ] Upload multiple images with inventory item
- [ ] Upload image on inventory update
- [ ] Replace all images mode
- [ ] Append images mode
- [ ] Remove image endpoint
- [ ] File type validation (reject .pdf, .txt, etc.)
- [ ] File size validation (reject >5MB)
- [ ] Filename uniqueness
- [ ] Image URL generation

### Frontend Tests

- [ ] Display images in grid view
- [ ] Show "+X more" badge for multiple images
- [ ] Fallback to emoji when no image
- [ ] Upload images in add form
- [ ] Upload images in edit form
- [ ] Remove images in edit form
- [ ] Handle upload errors gracefully
- [ ] Show loading state during upload

## Configuration

### Environment Variables (if needed)

```env
# Optional - customize upload directory
UPLOAD_DIR=public/images/inventory

# Optional - customize file size limit
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Optional - customize allowed files
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif
```

## Performance Optimization

1. **Image Compression** (Future Enhancement)
   ```javascript
   // Consider implementing sharp or similar
   // Compress images before storage
   ```

2. **CDN Integration** (Future Enhancement)
   ```javascript
   // Upload to cloud storage (AWS S3, GCS, etc.)
   // Return CDN URLs instead of local paths
   ```

3. **Thumbnail Generation** (Future Enhancement)
   ```javascript
   // Generate thumbnails for grid view
   // Serve optimized images
   ```

## Directory Permissions

Ensure the `/public/images/inventory/` directory is writable by the Node.js process:

```bash
# Create directory if not exists
mkdir -p public/images/inventory

# Set permissions
chmod 755 public/images/inventory
```

## Troubleshooting

### Images Not Uploading

1. Check `Content-Type: multipart/form-data` header
2. Verify `public/images/inventory/` directory exists
3. Check directory permissions (755)
4. Verify file type and size

### Images Not Displaying

1. Check browser console for 404 errors
2. Verify image URLs in MongoDB (should start with `/images/inventory/`)
3. Check that Express static middleware is configured for `/public`
4. Clear browser cache and reload

### File Type Rejected

Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
Use proper MIME types when uploading.

## Future Enhancements

1. **Image Ordering** - Reorder images in gallery
2. **Crop/Resize** - Edit images before upload
3. **Bulk Upload** - Import images via CSV
4. **Image Gallery** - Full-screen image viewer
5. **WebP Conversion** - Auto-convert to WebP for performance
6. **Cloud Storage** - AWS S3 / Google Cloud Storage integration
7. **Image Optimization** - Auto-compress and resize
8. **Alt Text** - SEO-friendly image descriptions

## Support

For issues with image uploading:
1. Check backend logs: `npm run dev`
2. Check browser console: F12 → Console tab
3. Verify file formats and size
4. Ensure authentication token is valid
5. Check MongoDB connection

---

**Last Updated:** March 2026
**Version:** 1.0
