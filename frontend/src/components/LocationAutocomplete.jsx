import React, { useState, useRef, useEffect } from 'react';

// Sri Lankan locations with coordinates
const LOCATIONS = [
  'Colombo', 'Kandy', 'Galle', 'Ella', 'Sigiriya', 'Nuwara Eliya',
  'Mirissa', 'Tangalle', 'Arugambe', 'Negombo', 'Matara', 'Gampaha',
  'Kurunegala', 'Hambantota', 'Mannar', 'Trincomalee', 'Jaffna', 'Hikkaduwa'
];

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter location...',
  label
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filter locations based on input
  useEffect(() => {
    if (value && value.trim()) {
      const filtered = LOCATIONS.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredLocations([]);
      setIsOpen(false);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location) => {
    onChange(location);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-bold text-slate-300 mb-2 font-body">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        
        {isOpen && filteredLocations.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-xl rounded-xl z-50 max-h-64 overflow-y-auto">
            {filteredLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => handleSelect(location)}
                className="w-full px-4 py-3 text-left text-slate-100 hover:bg-slate-800 transition-colors border-b border-white/5 last:border-b-0 font-body text-sm"
              >
                📍 {location}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
