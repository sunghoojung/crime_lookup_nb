'use client';

import { useEffect, useRef, useState } from 'react';
import { geocodeCrimes } from '../utils/geocoding';
import { getMarkerIcon } from '../utils/crimeData';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

// Dynamic import for Google Maps loader
let mapsPromise = null;

const loadGoogleMaps = async () => {
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Clear any existing Google Maps objects
    if (window.google) {
      delete window.google.maps;
    }

    const script = document.createElement('script');
    // Use the libraries without deprecated marker library
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}&libraries=places,geocoding&v=weekly&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Create a global callback function
    window.initMap = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps failed to load'));
      }
    };

    script.onerror = (error) => {
      console.error('Script loading error:', error);
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);

    // Set up error handler for API errors
    window.gm_authFailure = () => {
      console.error('Google Maps authentication failure detected');
      reject(new Error('Google Maps API authentication failed - Check if APIs are enabled'));
    };
  });

  return mapsPromise;
};

export default function Map({ crimes, selectedCrime, onCrimeSelect }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [geocodedCrimes, setGeocodedCrimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const infoWindowRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const google = await loadGoogleMaps();

        // Check if Google Maps loaded properly
        if (!google.maps) {
          throw new Error('Google Maps API not properly loaded');
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.4862, lng: -74.4518 }, // New Brunswick, NJ
          zoom: 14,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
        });

        const geocoderInstance = new google.maps.Geocoder();
        const infoWindow = new google.maps.InfoWindow();

        setMap(mapInstance);
        setGeocoder(geocoderInstance);
        infoWindowRef.current = infoWindow;
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);

        // Determine error type and set appropriate message
        let errorMessage = 'Failed to load Google Maps';
        let errorType = 'unknown';

        // Check console for specific error messages
        const errorString = error.toString();
        const errorMsg = error.message || '';

        console.error('Map initialization error:', {
          error: errorString,
          message: errorMsg,
          stack: error.stack,
          apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY ? 'Key present' : 'No key',
          keyLength: process.env.NEXT_PUBLIC_MAPS_API_KEY?.length || 0
        });

        if (errorMsg.includes('authentication') || errorMsg.includes('invalid key')) {
          errorMessage = 'Google Maps API authentication failed';
          errorType = 'auth';
        } else if (errorMsg.includes('ApiNotActivatedMapError') || errorString.includes('ApiNotActivated')) {
          errorMessage = 'Google Maps JavaScript API is not activated';
          errorType = 'not_activated';
        } else if (errorMsg.includes('RefererNotAllowedMapError')) {
          errorMessage = 'This domain is not allowed to use this API key';
          errorType = 'referer';
        } else if (errorMsg.includes('OverQuotaMapError')) {
          errorMessage = 'API quota exceeded';
          errorType = 'quota';
        }

        setError({
          message: errorMessage,
          details: errorMsg || errorString,
          type: errorType,
          apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY?.substring(0, 10) + '...'
        });
        setIsLoading(false);
      }
    };

    // Add delay before retry to avoid rate limiting
    const delay = retryCount > 0 ? Math.min(1000 * Math.pow(2, retryCount - 1), 10000) : 0;
    setTimeout(() => {
      initMap();
    }, delay);
  }, [retryCount]);

  // Geocode crimes and create markers
  useEffect(() => {
    if (!map || !geocoder || !crimes.length) return;

    const setupMarkers = async () => {
      setIsLoading(true);

      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));

      // Geocode crimes
      const geocoded = await geocodeCrimes(crimes, geocoder);
      setGeocodedCrimes(geocoded);

      // Create new markers (using standard Marker API)
      const newMarkers = geocoded.map(crime => {
        // Using the standard Marker API (not deprecated, just a TS warning)
        const marker = new window.google.maps.Marker({
          position: crime.coordinates,
          map: map,
          title: crime.displayType,
          icon: getMarkerIcon(crime.severity),
          animation: window.google.maps.Animation.DROP,
        });

        // Add click listener
        marker.addListener('click', () => {
          const content = `
            <div class="p-4 max-w-xs">
              <h3 class="font-semibold text-gray-900 mb-3 text-base">${crime.displayType}</h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-start">
                  <svg class="w-4 h-4 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-gray-600">${crime.location}</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-gray-600">${crime.formattedDate} at ${crime.formattedTime}</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                  </svg>
                  <span class="text-gray-500 font-mono text-xs">${crime.record_id}</span>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-100">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                  style="background-color: ${crime.severityColor}15; color: ${crime.severityColor}; border: 1px solid ${crime.severityColor}40">
                  ${crime.severity} RISK
                </span>
              </div>
            </div>
          `;

          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, marker);
          onCrimeSelect(crime);
        });

        return marker;
      });

      setMarkers(newMarkers);

      // Adjust map bounds to fit all markers
      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        map.fitBounds(bounds);
      }

      setIsLoading(false);
    };

    setupMarkers();
  }, [map, geocoder, crimes]);

  // Handle selected crime from sidebar
  useEffect(() => {
    if (!selectedCrime || !map || !markers.length) return;

    const crime = geocodedCrimes.find(c => c.record_id === selectedCrime.record_id);
    if (!crime || !crime.coordinates) return;

    // Find the corresponding marker
    const markerIndex = geocodedCrimes.indexOf(crime);
    const marker = markers[markerIndex];

    if (marker) {
      map.setCenter(crime.coordinates);
      map.setZoom(16);

      // Trigger click on the marker to show info window
      google.maps.event.trigger(marker, 'click');
    }
  }, [selectedCrime, map, markers, geocodedCrimes]);

  // Handle retry
  const handleRetry = () => {
    mapsPromise = null; // Reset the promise to force reload
    setRetryCount(prev => prev + 1);
  };

  // Show error state with instructions
  if (error) {
    return (
      <div className="relative h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="max-w-md px-6 py-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Map Loading Error</h3>
          </div>

          <p className="text-sm text-gray-600 mb-4">{error.message}</p>

          {(error.type === 'not_activated' || error.message.includes('not activated')) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">🔧 API Not Activated - Here's how to fix it:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li><strong>Open Google Cloud Console</strong> using the link below</li>
                <li>Make sure you're in the right project (check top bar)</li>
                <li>Go to <strong>"APIs & Services"</strong> → <strong>"Library"</strong></li>
                <li>Search for <strong>"Maps JavaScript API"</strong></li>
                <li>Click on it and press the blue <strong>"ENABLE"</strong> button</li>
                <li>Also search and enable <strong>"Geocoding API"</strong></li>
                <li>Wait 1-2 minutes for changes to propagate</li>
                <li>Come back here and click "Retry Loading"</li>
              </ol>

              <div className="mt-4 space-y-2">
                <a
                  href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <span>→ Open Maps JavaScript API page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <br />
                <a
                  href="https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <span>→ Open Geocoding API page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                <strong>Note:</strong> Make sure billing is enabled on your Google Cloud account.
                You get $200 free credits monthly.
              </div>
            </div>
          )}

          {error.message.includes('authentication') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-900 mb-2">API Key Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>Check if your API key is correct in .env.local</li>
                <li>Ensure the key has no usage restrictions blocking localhost</li>
                <li>Verify billing is enabled on your Google Cloud account</li>
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Information:</p>
            <p className="text-gray-600">Error: {error.details}</p>
            <p className="text-gray-600">API Key: {error.apiKey}</p>
            <p className="text-gray-600">Type: {error.type}</p>
            <p className="text-gray-600 mt-2">
              <strong>Quick Check:</strong> Open browser console (F12) for detailed error messages
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && !error && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading crime locations...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />

      {/* Legend - only show when map is loaded */}
      {map && !error && (
        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-100">
          <h4 className="font-medium text-gray-800 mb-3 text-xs uppercase tracking-wider">Severity</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200"></div>
              <span className="text-xs text-gray-600">High Risk</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-200"></div>
              <span className="text-xs text-gray-600">Medium Risk</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-200"></div>
              <span className="text-xs text-gray-600">Low Risk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}