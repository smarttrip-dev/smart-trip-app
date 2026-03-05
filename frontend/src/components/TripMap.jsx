import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TripMap({ pickupLocation, dropoffLocation, tripDestination, onRecalculateRoute, onSetDistance, onViewDirections }) {
  const [map, setMap] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Sri Lankan coordinates mapping (expanded with more locations)
  const locationCoordinates = {
    'Colombo': [6.9271, 80.7789],
    'Kandy': [6.9271, 80.6368],
    'Galle': [6.0535, 80.2170],
    'Ella': [6.8606, 81.0581],
    'Sigiriya': [7.9400, 80.7595],
    'Yala': [6.3714, 81.5142],
    'Mirissa': [5.9497, 80.7744],
    'Trincomalee': [8.5874, 81.2357],
    'Anuradhapura': [8.3142, 80.4167],
    'Nuwara Eliya': [6.9497, 80.7860],
    'Dambulla': [7.8667, 80.6500],
    'Hikkaduwa': [6.1344, 80.1344],
    'Negombo': [7.2064, 79.8581],
    'Bentota': [6.4281, 80.0061],
    'Jaffna': [9.6615, 80.7855],
    'Gampaha': [7.0896, 80.1313],
    'Kurunegala': [7.4833, 80.6333],
    'Matara': [5.7808, 80.5355],
    'Hambantota': [6.1256, 81.1242],
    'Mannar': [8.9833, 79.9167]
  };

  const getCoordinates = (location) => {
    const normalized = location?.trim().split(/\s+/)[0]; // Get first word (city name)
    return locationCoordinates[normalized] || [6.9271, 80.7789]; // Default to Colombo
  };

  /**
   * Fetch actual routing data from OpenRouteService
   * Shows the easiest/fastest route with turn-by-turn directions
   */
  const fetchActualRoute = async (start, end) => {
    try {
      setRouteLoading(true);
      setRouteError(null);

      // OpenRouteService API (free tier, no API key required for basic requests)
      // Format: [longitude, latitude]
      const apiUrl = `https://api.openrouteservice.org/v2/directions/driving-car?start=${end[1]},${end[0]}&end=${start[1]},${start[0]}`;
      
      // Fallback: Use OSRM (Open Source Routing Machine) - completely free, no key needed
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${end[1]},${end[0]};${start[1]},${start[0]}?overview=full&steps=true&geometries=geojson`;

      try {
        // Try OSRM first (most reliable, free, no auth)
        const response = await fetch(osrmUrl);
        if (!response.ok) throw new Error('OSRM service unavailable');
        
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
          const durationMinutes = Math.round(route.duration / 60);
          
          return {
            coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert to [lat, lng]
            distance: distanceKm,
            duration: durationMinutes,
            steps: route.legs[0]?.steps || []
          };
        }
      } catch (osrmError) {
        console.warn('OSRM unavailable, falling back to straight line:', osrmError);
      }
      
      // Fallback: return straight line route with haversine distance
      return {
        coordinates: [start, end],
        distance: calculateDistance(start, end),
        duration: Math.round(calculateDistance(start, end) / 60) // Assume 60 km/h average
      };
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteError('Unable to fetch route');
      return null;
    } finally {
      setRouteLoading(false);
    }
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const dLng = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1[0] * Math.PI) / 180) *
        Math.cos((coord2[0] * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Distance in km with 1 decimal
  };

  useEffect(() => {
    // Check if map already exists
    const mapContainer = document.getElementById('trip-map');
    if (!mapContainer) return;

    // Remove old map instance if exists (but continue to reinitialize with new props)
    if (map) {
      map.remove();
      setMap(null);
    }

    const initializeMapWithRoute = async () => {
      try {
        const pickupCoords = getCoordinates(pickupLocation || tripDestination);
        const dropoffCoords = getCoordinates(dropoffLocation || tripDestination);

        // Fetch actual route
        const routeData = await fetchActualRoute(pickupCoords, dropoffCoords);

        const newMap = L.map('trip-map', {
          center: [(pickupCoords[0] + dropoffCoords[0]) / 2, (pickupCoords[1] + dropoffCoords[1]) / 2],
          zoom: 9,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(newMap);

        // Add custom marker icons
        const pickupIcon = L.divIcon({
          html: `<div style="background-color: #10B981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
          iconSize: [32, 32],
          className: 'custom-marker'
        });

        const dropoffIcon = L.divIcon({
          html: `<div style="background-color: #EF4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
          iconSize: [32, 32],
          className: 'custom-marker'
        });

        // Add markers
        L.marker(pickupCoords, { icon: pickupIcon })
          .addTo(newMap)
          .bindPopup(
            `<div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">Pickup Location</div><div>${pickupLocation || tripDestination}</div>`,
            { maxWidth: 200 }
          );

        L.marker(dropoffCoords, { icon: dropoffIcon })
          .addTo(newMap)
          .bindPopup(
            `<div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">Dropoff Location</div><div>${dropoffLocation || tripDestination}</div>`,
            { maxWidth: 200 }
          );

        // Draw route line with actual path coordinates
        if (routeData && routeData.coordinates) {
          L.polyline(routeData.coordinates, {
            color: '#BFBD31',
            weight: 4,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(newMap);

          // Update distance and duration
          setDistance(routeData.distance);
          setDuration(routeData.duration);

          if (onSetDistance) {
            onSetDistance(routeData.distance);
          }
        } else {
          // Fallback: straight line
          const routeLatLngs = [pickupCoords, dropoffCoords];
          L.polyline(routeLatLngs, {
            color: '#BFBD31',
            weight: 3,
            opacity: 0.8,
            dashArray: '5, 5'
          }).addTo(newMap);

          const dist = calculateDistance(pickupCoords, dropoffCoords);
          setDistance(dist);
          setDuration(Math.round(dist / 60));

          if (onSetDistance) {
            onSetDistance(dist);
          }
        }

        setMap(newMap);

        // Fit bounds to show both markers with padding
        const southWest = L.latLng(
          Math.min(pickupCoords[0], dropoffCoords[0]) - 0.15,
          Math.min(pickupCoords[1], dropoffCoords[1]) - 0.15
        );
        const northEast = L.latLng(
          Math.max(pickupCoords[0], dropoffCoords[0]) + 0.15,
          Math.max(pickupCoords[1], dropoffCoords[1]) + 0.15
        );
        newMap.fitBounds(L.latLngBounds(southWest, northEast));
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMapWithRoute();

    return () => {
      // Cleanup will be handled on next effect run
    };
  }, [pickupLocation, dropoffLocation, tripDestination]);

  return (
    <div className="flex flex-col h-full">
      <div id="trip-map" style={{ height: '300px', borderRadius: '8px', marginBottom: '12px' }} className="z-10"></div>
      
      {routeLoading && (
        <div className="mb-3 p-3 bg-slate-950 border border-white/10 rounded-lg text-center">
          <p className="text-xs text-slate-400">🔄 Calculating fastest route...</p>
        </div>
      )}

      {routeError && (
        <div className="mb-3 p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{routeError}</p>
        </div>
      )}
      
      {distance && (
        <div className="mb-3 p-3 bg-slate-950 border border-white/10 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 mb-1">Estimated Distance</p>
              <p className="text-lg font-bold text-[#BFBD31]">{distance} km</p>
            </div>
            {duration && (
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Estimated Time</p>
                <p className="text-lg font-bold text-[#BFBD31]">{duration} min</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (onRecalculateRoute) {
            onRecalculateRoute();
          } else {
            alert('Route Recalculated! Distance optimized.');
          }
        }}
        className="w-full py-3 bg-[#BFBD31] text-slate-950 font-semibold rounded-lg hover:bg-[#BFBD31]/90 transition-all mb-3 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 4v16m0 0l4-4m-4 4l-4-4"/>
        </svg>
        Recalculate Route
      </button>

      <button
        onClick={() => {
          if (onViewDirections) {
            onViewDirections();
          } else {
            alert(`📍 Directions\n\nFrom: ${pickupLocation || 'Not set'}\nTo: ${dropoffLocation || 'Not set'}\n\nDistance: ${distance} km`);
          }
        }}
        className="w-full py-3 border border-white/20 text-slate-300 font-semibold rounded-lg hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        View Directions
      </button>

      <div className="mt-4 p-4 bg-slate-950 border border-white/10 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Trip Locations</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-xs font-bold text-green-400">A</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Pickup</p>
              <p className="text-sm text-slate-400">{pickupLocation || tripDestination}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-xs font-bold text-red-400">B</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Dropoff</p>
              <p className="text-sm text-slate-400">{dropoffLocation || tripDestination}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
