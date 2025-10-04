'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, TrendingUp, AlertCircle, Activity, Calendar, ChevronDown, Flame, Users, Target, AlertTriangle, Home } from 'lucide-react';
import CrimeCard from './CrimeCard';
import { filterCrimes, sortCrimesByDate, filterCrimesByTimeRange, TIME_RANGES, getDateRange, getAllCategories } from '../utils/crimeData';

export default function Sidebar({ crimes, selectedCrime, onCrimeSelect, onFilteredCrimesChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState(TIME_RANGES.ALL);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let filtered = filterCrimes(crimes, searchQuery);

    // Apply time range filter
    filtered = filterCrimesByTimeRange(filtered, timeRange);

    // Apply category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(crime => crime.category === categoryFilter);
    }

    // Sort by date (most recent first)
    filtered = sortCrimesByDate(filtered);

    setFilteredCrimes(filtered);

    // Notify parent component of filtered crimes
    if (onFilteredCrimesChange) {
      onFilteredCrimesChange(filtered);
    }
  }, [crimes, searchQuery, categoryFilter, timeRange, onFilteredCrimesChange]);

  // Get category counts
  const categoryCounts = {};
  getAllCategories().forEach(category => {
    categoryCounts[category] = filteredCrimes.filter(c => c.category === category).length;
  });

  const crimeStats = {
    total: filteredCrimes.length,
    ...categoryCounts,
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Crime Incidents
          </h2>
          <p className="text-xs text-slate-300 mt-1">Real-time crime data</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 col-span-2">
            <div className="flex items-center justify-between mb-1">
              <Activity className="w-4 h-4 text-slate-300" />
              <p className="text-3xl font-bold">{crimeStats.total}</p>
            </div>
            <p className="text-xs text-slate-300">Total Incidents</p>
          </div>
          {/* Show top categories with counts */}
          {Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([category, count]) => (
              <div key={category} className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-slate-300 truncate">{category}</p>
              </div>
            ))}
        </div>

      </div>

      {/* Search and Filter Section */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search incidents..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm
                     placeholder:text-gray-400 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2
                       hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Time Range Dropdown */}
        <div className="relative mb-3" ref={dropdownRef}>
          <button
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl
                     hover:border-gray-300 transition-all duration-200 text-sm"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 font-medium">
                {getDateRange(timeRange).label}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isTimeDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
              {[
                { value: TIME_RANGES.TODAY, label: 'Today' },
                { value: TIME_RANGES.YESTERDAY, label: 'Yesterday' },
                { value: TIME_RANGES.PAST_7, label: 'Past 7 days' },
                { value: TIME_RANGES.PAST_14, label: 'Past 14 days' },
                { value: TIME_RANGES.PAST_28, label: 'Past 28 days' },
                { value: TIME_RANGES.PAST_90, label: 'Past 90 days' },
                { value: TIME_RANGES.PAST_365, label: 'Past 365 days' },
                { value: TIME_RANGES.ALL, label: 'All time' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTimeRange(option.value);
                    setIsTimeDropdownOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                    ${timeRange === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
                    ${option.value === TIME_RANGES.ALL ? 'border-t border-gray-100' : ''}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Pills - Category Filter */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-600 font-medium">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${categoryFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              ALL
            </button>
            {getAllCategories().map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${categoryFilter === category
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-6 py-2 bg-white border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500">
          {filteredCrimes.length} {filteredCrimes.length === 1 ? 'incident' : 'incidents'} found
        </p>
      </div>

      {/* Crime List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        {filteredCrimes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No incidents found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCrimes.map((crime) => (
              <CrimeCard
                key={crime.record_id}
                crime={crime}
                isSelected={selectedCrime?.record_id === crime.record_id}
                onClick={() => onCrimeSelect(crime)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-white px-6 py-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: Today</span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </span>
        </div>
      </div>
    </div>
  );
}