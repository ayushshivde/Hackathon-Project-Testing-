import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MapView = ({ latitude, longitude, address, zoom = 15 }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Google Maps
        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();

        if (!mapRef.current) {
          setError('Map container not found');
          return;
        }

        // Create map
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(mapInstance);

        // Create marker
        const markerInstance = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstance,
          title: address || 'Your Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          },
          animation: google.maps.Animation.DROP
        });

        setMarker(markerInstance);

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                Your Location
              </h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                ${address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
              </p>
            </div>
          `
        });

        markerInstance.addListener('click', () => {
          infoWindow.open(mapInstance, markerInstance);
        });

        // Open info window by default
        infoWindow.open(mapInstance, markerInstance);

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map. Please check your Google Maps API key.');
        setIsLoading(false);
      }
    };

    if (latitude && longitude) {
      initMap();
    }
  }, [latitude, longitude, address, zoom]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (map && marker && latitude && longitude) {
      const newPosition = { lat: latitude, lng: longitude };
      marker.setPosition(newPosition);
      map.setCenter(newPosition);
    }
  }, [map, marker, latitude, longitude]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => {
            if (map) {
              map.setZoom(map.getZoom() + 1);
            }
          }}
          className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          title="Zoom In"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (map) {
              map.setZoom(map.getZoom() - 1);
            }
          }}
          className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          title="Zoom Out"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (map && marker) {
              map.setCenter(marker.getPosition());
              map.setZoom(zoom);
            }
          }}
          className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          title="Center on Location"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Location Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Your Location</span>
          </div>
          <p className="text-xs text-gray-600 mt-1 truncate">
            {address || `${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
