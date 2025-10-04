'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight } from 'lucide-react';
import Map from '../components/Map';
import Sidebar from '../components/Sidebar';
import { processCrimeData } from '../utils/crimeData';

export default function Home() {
  const [crimes, setCrimes] = useState([]);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    const processedData = processCrimeData();
    setCrimes(processedData);
    setFilteredCrimes(processedData);
    setIsLoading(false);
  }, []);

  const handleCrimeSelect = useCallback((crime) => {
    setSelectedCrime(crime);
  }, []);

  const handleFilteredCrimesChange = useCallback((filtered) => {
    setFilteredCrimes(filtered);
  }, []);

  const handleRouteCalculated = useCallback((route) => {
    setRouteData(route);
  }, []);

  const handleClearRoute = useCallback(() => {
    setRouteData(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading crime data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Expand tab (shown only when collapsed) */}
      {sidebarCollapsed && (
        <button
          aria-label="Expand sidebar"
          onClick={() => setSidebarCollapsed(false)}
          className="absolute left-2 top-4 z-30 rounded-full bg-slate-900 text-white p-1 shadow ring-1 ring-black/10 hover:opacity-90"
          title="Show sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-96 lg:w-[420px] flex-shrink-0 border-r">
        <Sidebar
          crimes={crimes}
          selectedCrime={selectedCrime}
          onCrimeSelect={handleCrimeSelect}
          onFilteredCrimesChange={handleFilteredCrimesChange}
          onRouteCalculated={handleRouteCalculated}
          onClearRoute={handleClearRoute}
        />
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          crimes={filteredCrimes}
          selectedCrime={selectedCrime}
          onCrimeSelect={handleCrimeSelect}
          routeData={routeData}
        />
      </div>
    </div>
  );
}