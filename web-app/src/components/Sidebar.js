'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, TrendingUp, AlertCircle, Activity, Calendar, ChevronDown, Flame, Users, Target, AlertTriangle, Home, Route, MapPin } from 'lucide-react';
import CrimeCard from './CrimeCard';
import RoutePlanner from './RoutePlanner';
import { filterCrimes, sortCrimesByDate, filterCrimesByTimeRange, TIME_RANGES, getDateRange, getAllCategories } from '../utils/crimeData';

export default function Sidebar({ crimes, selectedCrime, onCrimeSelect, onFilteredCrimesChange, onRouteCalculated, onClearRoute }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState(TIME_RANGES.ALL);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const [activeTab, setActiveTab] = useState('crimes'); // 'crimes' or 'route'
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
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('crimes')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'crimes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Crime Data</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('route')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'route'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Route className="w-4 h-4" />
              <span>Route Planner</span>
            </div>
          </button>
        </div>
      </div>

      {/* Crime Tab Content */}
      {activeTab === 'crimes' && (
        <>
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Crime Incidents</h2>
                <p className="text-xs text-slate-300">Real-time data</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{crimeStats.total}</p>
                <p className="text-xs text-slate-300">Total</p>
              </div>
            </div>

            {/* Compact Stats Bar */}
            <div className="flex gap-2 mt-2 text-xs">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([category, count]) => (
                  <div key={category} className="bg-white/10 px-2 py-1 rounded flex items-center gap-1">
                    <span className="font-semibold">{count}</span>
                    <span className="text-slate-300 truncate max-w-[80px]">{category}</span>
                  </div>
                ))}
            </div>
          </div>

      {/* Compact Search and Filter Section */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search incidents..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm
                     placeholder:text-gray-400 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2
                       hover:bg-gray-100 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Time Range Dropdown - Compact */}
        <div className="relative mb-2" ref={dropdownRef}>
          <button
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg
                     hover:border-gray-300 transition-all duration-200 text-sm"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-700 font-medium text-sm">
                {getDateRange(timeRange).label}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
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

        {/* Compact Category Filter */}
        <div>
          <div className="flex items-center space-x-1.5 mb-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-600 font-medium">Categories</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`
                px-2 py-1 rounded text-xs font-medium transition-all duration-200
                ${categoryFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              All
            </button>
            {getAllCategories().map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`
                  px-2 py-1 rounded text-xs font-medium transition-all duration-200
                  ${categoryFilter === category
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {category.length > 15 ? category.substring(0, 12) + '...' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Results Count */}
      <div className="px-4 py-1.5 bg-white border-b border-gray-100">
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

      {/* Compact Footer */}
      <div className="border-t bg-white px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Updated: Today</span>
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </span>
        </div>
      </div>
        </>
      )}

      {/* Route Tab Content */}
      {activeTab === 'route' && (
        <div className="p-6 overflow-y-auto flex-1">
          <RoutePlanner
            onRouteCalculated={onRouteCalculated}
            onClearRoute={onClearRoute}
          />
        </div>
      )}
    </div>
  );
}