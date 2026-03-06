import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddInventoryForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'accommodation',
    description: '',
    price: '',
    location: '',
    capacity: 1,
    availableCount: 1,
    amenities: '',
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const locations = ['Kandy', 'Galle', 'Ella', 'Sigiriya', 'Yala', 'Nuwara Eliya', 'Mirissa', 'Trincomalee', 'Anuradhapura', 'Colombo', 'Dambulla', 'Hikkaduwa'];
  const types = ['accommodation', 'transport', 'activity', 'meal', 'package', 'other'];

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : (name === 'capacity' || name === 'availableCount' ? parseInt(value) || 1 : value)
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newImages = [];
    const newPreviews = [];
    let loaded = 0;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        loaded++;
        if (loaded === files.length) {
          setImages(prev => [...prev, ...newImages]);
          setImagePreview(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Valid price is required');
      return;
    }

    if (!formData.location) {
      toast.error('Location is required');
      return;
    }

    if (formData.capacity < 1) {
      toast.error('Capacity must be at least 1');
      return;
    }

    if (formData.availableCount > formData.capacity) {
      toast.error('Available count cannot exceed capacity');
      return;
    }

    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('type', formData.type);
      submitData.append('description', formData.description);
      submitData.append('price', parseFloat(formData.price));
      submitData.append('location', formData.location);
      submitData.append('capacity', formData.capacity);
      submitData.append('availableCount', formData.availableCount);
      submitData.append('amenities', formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean).join(',') : '');
      submitData.append('isActive', formData.isActive);

      images.forEach(img => submitData.append('files', img));

      const { data } = await axios.post('/api/inventory', submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Service added successfully!');
      onSubmit(data);
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to add service';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Service</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Service Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Deluxe Double Room"
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
              >
                {types.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Price (LKR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="15000"
                step="100"
                min="0"
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Location *</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="999"
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Currently Available *</label>
              <input
                type="number"
                name="availableCount"
                value={formData.availableCount}
                onChange={handleChange}
                min="0"
                max={formData.capacity}
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your service..."
              rows="3"
              className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Amenities (comma-separated)</label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="WiFi, Air Conditioning, Breakfast, Pool"
              className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full"
            />
            <p className="text-xs text-slate-400 mt-2">Max 10 images, 5MB each</p>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {imagePreview.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300">Active (visible to users)</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/20 text-slate-300 rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#BFBD31] text-slate-950 rounded-lg font-semibold hover:bg-[#a8a51f] disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
      submitData.append('description', formData.description);
      submitData.append('price', parseInt(formData.price));
      submitData.append('location', formData.location);
      submitData.append('capacity', parseInt(formData.capacity));

      if (formData.amenities.trim()) {
        submitData.append('amenities', formData.amenities.split(',').map(a => a.trim()).join(','));
      }

      // Add images
      images.forEach(image => {
        submitData.append('images', image);
      });

      await axios.post('/api/inventory', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Service added successfully!');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Service Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Toyota Camry Rental"
          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Service Type *</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
        >
          <option value="accommodation">Accommodation / Hotel</option>
          <option value="transport">Transport / Vehicle</option>
          <option value="activity">Activity / Experience</option>
          <option value="meal">Meal Package</option>
          <option value="package">Tour Package</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Price & Capacity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Price (LKR) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 5000"
            className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Capacity</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Colombo, Sri Lanka"
          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your service in detail..."
          rows="4"
          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40 resize-none"
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Amenities (comma-separated)</label>
        <textarea
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          placeholder="e.g. AC, WiFi, Parking, Free Breakfast"
          rows="3"
          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#BFBD31]/40 resize-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Images (JPG, PNG, WebP, GIF - Max 5MB each)</label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#BFBD31]/50 transition-colors cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            <p className="text-slate-300 font-semibold">Click to upload images</p>
            <p className="text-slate-500 text-sm">or drag and drop</p>
            <p className="text-slate-600 text-xs mt-1">Up to 10 images, max 5MB each</p>
          </label>
        </div>

        {/* Image Previews */}
        {imagePreview.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-300 mb-3">Selected Images ({imagePreview.length}/10)</p>
            <div className="grid grid-cols-4 gap-3">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Adding...' : 'Add Service'}
        </button>
      </div>
    </form>
  );
}
