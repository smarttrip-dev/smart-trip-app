import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import LRM from 'leaflet-routing-machine';

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
  const [directions, setDirections] = useState([]);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);

  // Sri Lankan coordinates mapping
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
    'Jaffna': [9.6615, 80.7855]
  };

  const getCoordinates = (location) => {
    const normalized = location?.trim().split(/\s+/)[0]; // Get first word (city name)
    return locationCoordinates[normalized] || [6.9271, 80.7789]; // Default to Colombo
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
    return Math.round(R * c); // Distance in km
  };

  const getDirectionIcon = (type) => {
    const icons = {
      'continue': '🟰',
      'slight right': '↗️',
      'right': '➡️',
      'sharp right': '💥',
      'slight left': '↖️',
      'left': '⬅️',
      'sharp left': '💥',
      'u-turn': '🔄',
      'roundabout': '🔁'
    };
    return icons[type] || '📍';
  };

  useEffect(() => {
    // Check if map already exists
    const mapContainer = document.getElementById('trip-map');
    if (!mapContainer) return;

    // Remove old map instance if exists
    if (map) {
      map.remove();
      setMap(null);
      return;
    }

    // Initialize map
    const pickupCoords = getCoordinates(pickupLocation || tripDestination);
    const dropoffCoords = getCoordinates(dropoffLocation || tripDestination);

    try {
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

      // Calculate distance first
      const dist = calculateDistance(pickupCoords, dropoffCoords);
      setDistance(dist);
      if (onSetDistance) {
        onSetDistance(dist);
      }

      // Try routing with OSRM
      try {
        const routing = LRM.Routing.control({
          waypoints: [
            L.latLng(pickupCoords[0], pickupCoords[1]),
            L.latLng(dropoffCoords[0], dropoffCoords[1])
          ],
          router: LRM.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
          }),
          lineOptions: {
            styles: [
              { color: '#BFBD31', opacity: 1, weight: 5 }
            ]
          },
          showAlternatives: false,
          altLineOptions: {
            styles: [
              { color: '#000', opacity: 0.15, weight: 5 }
            ]
          }
        }).addTo(newMap);

        // Get routing response data for directions
        routing.on('routesfound', function (e) {
          const routes = e.routes;
          if (routes && routes.length > 0) {
            const route = routes[0];
            
            // Parse instructions for turn-by-turn directions
            if (route.instructions) {
              const directionSteps = route.instructions.map((instruction, idx) => ({
                step: idx + 1,
                text: instruction.text || `Continue for ${instruction.distance}m`,
                distance: instruction.distance,
                time: instruction.time,
                icon: getDirectionIcon(instruction.type)
              }));
              setDirections(directionSteps);
            }
          }
        });

        routing.on('routingerror', function (e) {
          console.warn('OSRM routing unavailable, using fallback');
          addFallbackRoute(newMap, pickupCoords, dropoffCoords);
        });
      } catch (routingError) {
        console.warn('Routing error:', routingError);
        addFallbackRoute(newMap, pickupCoords, dropoffCoords);
      }

      setMap(newMap);

      // Fit bounds to show both markers
      const southWest = L.latLng(
        Math.min(pickupCoords[0], dropoffCoords[0]) - 0.1,
        Math.min(pickupCoords[1], dropoffCoords[1]) - 0.1
      );
      const northEast = L.latLng(
        Math.max(pickupCoords[0], dropoffCoords[0]) + 0.1,
        Math.max(pickupCoords[1], dropoffCoords[1]) + 0.1
      );
      newMap.fitBounds(L.latLngBounds(southWest, northEast));
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      // Cleanup will be handled on next effect run
    };
  }, [pickupLocation, dropoffLocation, tripDestination]);

  const addFallbackRoute = (newMap, pickupCoords, dropoffCoords) => {
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
      .bindPopup(`<div style="font-weight: bold;">Pickup Location</div><div>${pickupLocation || tripDestination}</div>`);

    L.marker(dropoffCoords, { icon: dropoffIcon })
      .addTo(newMap)
      .bindPopup(`<div style="font-weight: bold;">Dropoff Location</div><div>${dropoffLocation || tripDestination}</div>`);

    // Draw route line (fallback)
    L.polyline([pickupCoords, dropoffCoords], {
      color: '#BFBD31',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 5'
    }).addTo(newMap);

    // Set simple directions
    setDirections([
      {
        step: 1,
        text: `Head from ${pickupLocation || tripDestination} to ${dropoffLocation || tripDestination}`,
        distance: Math.round(calculateDistance(pickupCoords, dropoffCoords) * 1000),
        time: 0,
        icon: '🛣️'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {!showDirectionsPanel ? (
        <>
          <div id="trip-map" style={{ height: '300px', borderRadius: '8px', marginBottom: '12px' }} className="z-10"></div>
          
          {distance && (
            <div className="mb-3 p-3 bg-slate-950 border border-white/10 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Estimated Distance</p>
              <p className="text-lg font-bold text-[#BFBD31]">{distance} km</p>
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
            onClick={() => setShowDirectionsPanel(true)}
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
        </>
      ) : (
        /* Directions Panel */
        <div className="flex flex-col h-full gap-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[#BFBD31] flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              Turn-by-Turn Directions
            </h3>
            <button
              onClick={() => setShowDirectionsPanel(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          {distance && (
            <div className="bg-slate-950 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Distance</p>
                  <p className="text-2xl font-bold text-[#BFBD31]">{distance} km</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Est. Time</p>
                  <p className="text-lg font-semibold text-slate-100">{Math.round(distance / 60) + 1}h {Math.round((distance % 60) / 10) * 10}m</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-300 mb-1">START</p>
            <p className="font-semibold text-slate-100">{pickupLocation || tripDestination}</p>
          </div>

          {directions.length > 0 ? (
            <div className="flex-1 overflow-y-auto bg-slate-950 border border-white/10 rounded-lg p-4">
              <div className="space-y-3">
                {directions.map((dir, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="text-xl flex-shrink-0">{dir.icon}</div>
                    <div className="flex-1">
                      <p className="text-slate-200">{dir.text}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {dir.distance} m {dir.time ? `• ${Math.round(dir.time / 60)}m` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-slate-950 border border-white/10 rounded-lg p-4 flex items-center justify-center">
              <p className="text-slate-400 text-center">Loading directions...</p>
            </div>
          )}

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-300 mb-1">ARRIVAL</p>
            <p className="font-semibold text-slate-100">{dropoffLocation || tripDestination}</p>
          </div>

          <button
            onClick={() => setShowDirectionsPanel(false)}
            className="w-full py-2 border border-white/20 text-slate-300 rounded-lg font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Map
          </button>
        </div>
      )}
    </div>
  );
}
