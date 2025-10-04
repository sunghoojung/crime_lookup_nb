import crimeDataRaw from '../data/file.json'; 
import { parseISO, format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// Crime categories with their associated colors
const CATEGORY_COLORS = {
  'Murder': '#991B1B', // red-800
  'Shooting with Injuries': '#DC2626', // red-600
  'Aggravated Assault': '#EA580C', // orange-600
  'Robbery': '#D97706', // amber-600
  'Arson': '#CA8A04', // yellow-600
  'Burglary': '#16A34A', // green-600
  'Simple Assault': '#0891B2', // cyan-600
};

// Get color based on category
export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#6B7280'; // gray-500 as default
};

// Get SVG path for category icon - using simpler shapes for better visibility
const getCategoryIconPath = (category) => {
  switch (category) {
    case 'Murder':
      // Triangle (warning)
      return 'M 0,-8 L -7,7 L 7,7 Z';
    case 'Shooting with Injuries':
      // Diamond
      return 'M 0,-8 L 8,0 L 0,8 L -8,0 Z';
    case 'Aggravated Assault':
      // Square
      return 'M -6,-6 L 6,-6 L 6,6 L -6,6 Z';
    case 'Robbery':
      // Pentagon (shield-like)
      return 'M 0,-8 L 7,-3 L 5,6 L -5,6 L -7,-3 Z';
    case 'Arson':
      // Star
      return 'M 0,-8 L 2,-2 L 8,-1 L 3,3 L 4,8 L 0,5 L -4,8 L -3,3 L -8,-1 L -2,-2 Z';
    case 'Burglary':
      // House shape
      return 'M 0,-7 L -7,0 L -7,7 L -2,7 L -2,2 L 2,2 L 2,7 L 7,7 L 7,0 Z';
    case 'Simple Assault':
      // Circle
      return 'M 0,-7 A 7,7 0 1,1 0,7 A 7,7 0 1,1 0,-7 Z';
    default:
      // Default circle
      return 'M 0,-7 A 7,7 0 1,1 0,7 A 7,7 0 1,1 0,-7 Z';
  }
};

// Get marker icon based on category
export const getMarkerIcon = (category) => {
  const color = getCategoryColor(category);
  const iconPath = getCategoryIconPath(category);

  // Check if google maps is loaded
  if (typeof google !== 'undefined' && google.maps) {
    // Create a custom SVG icon
    const svgIcon = {
      path: iconPath,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.8,
      anchor: new google.maps.Point(0, 0), // Center anchor for our centered paths
    };

    return svgIcon;
  }

  // Fallback icon if google maps not loaded
  return {
    path: iconPath,
    fillColor: color,
    fillOpacity: 0.9,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.8,
  };
};

// Format crime data for display
export const formatCrimeData = (crime) => {
  // Use the category from the JSON data
  const category = crime.category || 'Unknown';

  // Parse the date string (MM/DD/YYYY HH:mm format)
  const [datePart, timePart] = crime.time.split(' ');
  const [month, day, year] = datePart.split('/');
  const [hours, minutes] = timePart.split(':');
  const crimeDate = new Date(year, month - 1, day, hours, minutes);

  return {
    ...crime,
    category,
    categoryColor: getCategoryColor(category),
    formattedDate: format(crimeDate, 'MMM dd, yyyy'),
    formattedTime: format(crimeDate, 'h:mm a'),
    fullDateTime: crimeDate,
    // Clean up the type for display
    displayType: crime.type
      .replace(/2C:\d+-\d+[A-Z]*(?:\(\d+\))?(?:\s*\d+[A-Z]*)?::/, '')
      .replace(/\s+/g, ' ')
      .trim(),
  };
};

// Process all crime data
export const processCrimeData = () => {
  return crimeDataRaw.map(crime => formatCrimeData(crime));
};

// Normalize location string for geocoding
export const normalizeLocation = (location) => {
  let normalized = location;

  // Add "New Brunswick, NJ" if not already present
  if (!normalized.toLowerCase().includes('new brunswick')) {
    normalized = `${normalized}, New Brunswick, NJ`;
  }

  // Ensure state is included
  if (!normalized.toLowerCase().includes(', nj')) {
    normalized = normalized.replace(/,?\s*08901/, ', NJ 08901');
  }

  return normalized;
};

// Filter crimes based on search query
export const filterCrimes = (crimes, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') return crimes;

  const query = searchQuery.toLowerCase();

  return crimes.filter(crime =>
    crime.displayType.toLowerCase().includes(query) ||
    crime.location.toLowerCase().includes(query) ||
    crime.category.toLowerCase().includes(query) ||
    crime.formattedDate.toLowerCase().includes(query)
  );
};

// Sort crimes by date (most recent first)
export const sortCrimesByDate = (crimes) => {
  return [...crimes].sort((a, b) => b.fullDateTime - a.fullDateTime);
};

// Time range options
export const TIME_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  PAST_7: 'past_7',
  PAST_14: 'past_14',
  PAST_28: 'past_28',
  PAST_90: 'past_90',
  PAST_365: 'past_365',
  ALL: 'all',
};

// Get the latest date from the crime data
let latestCrimeDate = null;

const getLatestCrimeDate = () => {
  if (!latestCrimeDate) {
    // Parse all crime dates and find the latest one
    const allCrimes = processCrimeData();
    if (allCrimes.length > 0) {
      const sortedCrimes = sortCrimesByDate(allCrimes);
      latestCrimeDate = sortedCrimes[0].fullDateTime;
    }
  }
  return latestCrimeDate || new Date();
};

// Get date range based on selection
export const getDateRange = (timeRange) => {
  // Use the latest crime date as reference instead of current date
  const referenceDate = getLatestCrimeDate();
  const today = startOfDay(referenceDate);
  const endDate = endOfDay(referenceDate);

  switch (timeRange) {
    case TIME_RANGES.TODAY:
      return {
        start: today,
        end: endDate,
        label: 'Today',
      };
    case TIME_RANGES.YESTERDAY:
      const yesterday = subDays(today, 1);
      return {
        start: yesterday,
        end: endOfDay(yesterday),
        label: 'Yesterday',
      };
    case TIME_RANGES.PAST_7:
      return {
        start: subDays(today, 6), // Changed to 6 to include today
        end: endDate,
        label: 'Past 7 days',
      };
    case TIME_RANGES.PAST_14:
      return {
        start: subDays(today, 13), // Changed to 13 to include today
        end: endDate,
        label: 'Past 14 days',
      };
    case TIME_RANGES.PAST_28:
      return {
        start: subDays(today, 27), // Changed to 27 to include today
        end: endDate,
        label: 'Past 28 days',
      };
    case TIME_RANGES.PAST_90:
      return {
        start: subDays(today, 89), // Changed to 89 to include today
        end: endDate,
        label: 'Past 90 days',
      };
    case TIME_RANGES.PAST_365:
      return {
        start: subDays(today, 364), // Changed to 364 to include today
        end: endDate,
        label: 'Past 365 days',
      };
    case TIME_RANGES.ALL:
    default:
      return {
        start: new Date(2020, 0, 1), // Far past date
        end: new Date(2030, 0, 1), // Far future date to include all
        label: 'All time',
      };
  }
};

// Filter crimes by time range
export const filterCrimesByTimeRange = (crimes, timeRange) => {
  if (!timeRange || timeRange === TIME_RANGES.ALL) {
    return crimes;
  }

  const { start, end } = getDateRange(timeRange);

  return crimes.filter(crime => {
    if (!crime.fullDateTime) return false;
    return isWithinInterval(crime.fullDateTime, { start, end });
  });
};

// Get all unique categories from crimes
export const getAllCategories = () => {
  return ['Robbery', 'Arson', 'Aggravated Assault', 'Murder', 'Simple Assault', 'Burglary', 'Shooting with Injuries'];
};