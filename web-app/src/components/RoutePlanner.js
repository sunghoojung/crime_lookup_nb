'use client';

import { useState } from 'react';
import { MapPin, Route, X, Loader2, Navigation, Clock } from 'lucide-react';

export default function RoutePlanner({ onRouteCalculated, onClearRoute }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [hasRoute, setHasRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleCalculateRoute = async (e) => {
    e.preventDefault();

    if (!from.trim() || !to.trim()) {
      setError('Please enter both from and to locations');
      return;
    }

    setError('');
    setIsCalculating(true);

    try {
      // Call the API endpoint
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate route');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Store route information
      setRouteInfo({
        from: data.from,
        to: data.to,
        distance: data.distance,
        duration: data.duration
      });

      // Pass the route data to parent component
      onRouteCalculated({
        path: data.path,
        from: data.from,
        to: data.to,
        distance: data.distance,
        duration: data.duration
      });

      setHasRoute(true);
    } catch (err) {
      setError(err.message || 'Failed to calculate route. Please check the addresses and try again.');
      console.error('Route calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearRoute = () => {
    setFrom('');
    setTo('');
    setError('');
    setHasRoute(false);
    setRouteInfo(null);
    onClearRoute();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Route className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Route Planner</h3>
        </div>
        {hasRoute && (
          <button
            onClick={handleClearRoute}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear route"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleCalculateRoute} className="space-y-4">
        <p className="text-xs text-gray-500 mb-3">
          Enter addresses in New Brunswick, NJ. You can use street names, landmarks, or building names.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g., 123 College Ave"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCalculating}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g., 54 Joyce Kilmer Ave"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCalculating}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isCalculating || !from.trim() || !to.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calculating route...</span>
            </>
          ) : (
            <>
              <Route className="h-4 w-4" />
              <span>Calculate Route</span>
            </>
          )}
        </button>
      </form>

      {hasRoute && routeInfo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Route Details</p>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-sm text-gray-900">{routeInfo.from}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">To</p>
                    <p className="text-sm text-gray-900">{routeInfo.to}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Distance</p>
                    <p className="text-sm font-semibold text-blue-900">{routeInfo.distance}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Walk Time</p>
                    <p className="text-sm font-semibold text-green-900">{routeInfo.duration}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}