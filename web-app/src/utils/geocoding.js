import { normalizeLocation } from './crimeData';

// Cache for geocoded locations to avoid repeated API calls
const geocodeCache = new Map();

// Geocode a single address
export const geocodeAddress = async (address, geocoder) => {
  const normalizedAddress = normalizeLocation(address);

  // Check cache first
  if (geocodeCache.has(normalizedAddress)) {
    return geocodeCache.get(normalizedAddress);
  }

  try {
    const result = await geocoder.geocode({ address: normalizedAddress });

    if (result.results && result.results[0]) {
      const location = result.results[0].geometry.location;
      const coords = {
        lat: location.lat(),
        lng: location.lng(),
      };

      // Cache the result
      geocodeCache.set(normalizedAddress, coords);
      return coords;
    }
  } catch (error) {
    console.error(`Failed to geocode address: ${normalizedAddress}`, error);
  }

  return null;
};

// Batch geocode multiple crimes
export const geocodeCrimes = async (crimes, geocoder) => {
  const geocodedCrimes = [];

  // Process in batches to avoid rate limiting
  const batchSize = 10;
  const delayMs = 200; // Delay between batches

  for (let i = 0; i < crimes.length; i += batchSize) {
    const batch = crimes.slice(i, i + batchSize);

    const promises = batch.map(async (crime) => {
      const coords = await geocodeAddress(crime.location, geocoder);
      return {
        ...crime,
        coordinates: coords,
      };
    });

    const results = await Promise.all(promises);
    geocodedCrimes.push(...results);

    // Add delay between batches if not the last batch
    if (i + batchSize < crimes.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return geocodedCrimes.filter(crime => crime.coordinates !== null);
};