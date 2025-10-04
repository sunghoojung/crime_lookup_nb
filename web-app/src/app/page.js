'use client';

import { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map';
import Sidebar from '../components/Sidebar';
import { processCrimeData } from '../utils/crimeData';

export default function Home() {
  const [crimes, setCrimes] = useState([]);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Process crime data on mount
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-96 lg:w-[420px] flex-shrink-0 border-r">
        <Sidebar
          crimes={crimes}
          selectedCrime={selectedCrime}
          onCrimeSelect={handleCrimeSelect}
          onFilteredCrimesChange={handleFilteredCrimesChange}
        />
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          crimes={filteredCrimes}
          selectedCrime={selectedCrime}
          onCrimeSelect={handleCrimeSelect}
        />
      </div>
    </div>
  );
}
