'use client';

import { useState } from 'react';
import { MapPin, Route, X, Loader2 } from 'lucide-react';

export default function RoutePlanner({ onRouteCalculated, onClearRoute }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [hasRoute, setHasRoute] = useState(false);

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

      // Pass the route data to parent component
      onRouteCalculated({
        path: data.path,
        from: from,
        to: to,
        distance: data.distance,
        duration: data.duration
      });

      setHasRoute(true);
    } catch (err) {
      setError('Failed to calculate route. Please try again.');
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
              placeholder="Enter starting location"
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
              placeholder="Enter destination"
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

      {hasRoute && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">From:</span> {from}</p>
            <p><span className="font-medium">To:</span> {to}</p>
          </div>
        </div>
      )}
    </div>
  );
}