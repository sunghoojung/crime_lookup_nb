import crimeDataRaw from '../../file.json';
import { parseISO, format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// Crime severity mapping for color coding
const CRIME_SEVERITY = {
  HIGH: ['AGGRAVATED ASSAULT', 'ROBBERY', 'STRANGULATION', 'BURGLARY'],
  MEDIUM: ['SIMPLE ASSAULT', 'ASSAULT ON MEDICAL'],
  LOW: ['MV::Burglary']
};

// Get severity level based on crime type
export const getCrimeSeverity = (crimeType) => {
  const upperType = crimeType.toUpperCase();

  for (const [severity, keywords] of Object.entries(CRIME_SEVERITY)) {
    if (keywords.some(keyword => upperType.includes(keyword))) {
      return severity;
    }
  }
  return 'LOW';
};

// Get color based on severity
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'HIGH':
      return '#DC2626'; // red-600
    case 'MEDIUM':
      return '#F97316'; // orange-500
    case 'LOW':
      return '#EAB308'; // yellow-500
    default:
      return '#6B7280'; // gray-500
  }
};

// Get marker icon based on severity
export const getMarkerIcon = (severity) => {
  const color = getSeverityColor(severity);

  // Check if google maps is loaded
  if (typeof google !== 'undefined' && google.maps) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8,
    };
  }

  // Fallback icon if google maps not loaded
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    fillColor: color,
    fillOpacity: 0.9,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1,
  };
};

// Format crime data for display
export const formatCrimeData = (crime) => {
  const severity = getCrimeSeverity(crime.type);

  // Parse the date string (MM/DD/YYYY HH:mm format)
  const [datePart, timePart] = crime.time.split(' ');
  const [month, day, year] = datePart.split('/');
  const [hours, minutes] = timePart.split(':');
  const crimeDate = new Date(year, month - 1, day, hours, minutes);

  return {
    ...crime,
    severity,
    severityColor: getSeverityColor(severity),
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
    crime.severity.toLowerCase().includes(query) ||
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

// Get date range based on selection
export const getDateRange = (timeRange) => {
  const now = new Date();
  const today = startOfDay(now);

  switch (timeRange) {
    case TIME_RANGES.TODAY:
      return {
        start: today,
        end: endOfDay(now),
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
        start: subDays(today, 7),
        end: endOfDay(now),
        label: 'Past 7 days',
      };
    case TIME_RANGES.PAST_14:
      return {
        start: subDays(today, 14),
        end: endOfDay(now),
        label: 'Past 14 days',
      };
    case TIME_RANGES.PAST_28:
      return {
        start: subDays(today, 28),
        end: endOfDay(now),
        label: 'Past 28 days',
      };
    case TIME_RANGES.PAST_90:
      return {
        start: subDays(today, 90),
        end: endOfDay(now),
        label: 'Past 90 days',
      };
    case TIME_RANGES.PAST_365:
      return {
        start: subDays(today, 365),
        end: endOfDay(now),
        label: 'Past 365 days',
      };
    case TIME_RANGES.ALL:
    default:
      return {
        start: new Date(2020, 0, 1), // Far past date
        end: endOfDay(now),
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