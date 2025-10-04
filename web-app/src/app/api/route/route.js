import { NextResponse } from 'next/server';

// Function to geocode an address using Google Maps API
async function geocodeAddress(address) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  // Ensure we're searching in New Brunswick, NJ area
  const fullAddress = address.includes('New Brunswick') ? address : `${address}, New Brunswick, NJ`;

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;

  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lon: location.lng,
        formatted_address: data.results[0].formatted_address
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error(`No results found for address: ${address}`);
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Function to call the shortest path API
async function getShortestPath(startCoords, endCoords) {
  const apiUrl = `https://inchoately-shrubbier-cesar.ngrok-free.dev/shortest_path?start_lon=${startCoords.lon}&start_lat=${startCoords.lat}&end_lon=${endCoords.lon}&end_lat=${endCoords.lat}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // ngrok requires this header
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Shortest path API error:', error);
    throw error;
  }
}

// Function to calculate distance between two points (in miles)
function calculateDistance(path) {
  if (!path || path.length < 2) return '0 miles';

  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const lat1 = path[i].lat;
    const lon1 = path[i].lon;
    const lat2 = path[i + 1].lat;
    const lon2 = path[i + 1].lon;

    // Haversine formula
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    totalDistance += distance;
  }

  return `${totalDistance.toFixed(1)} miles`;
}

// Function to estimate duration (assuming 15 mph average speed in city)
function estimateDuration(distanceStr) {
  const distance = parseFloat(distanceStr);
  const avgSpeed = 5; // mph for city driving
  const minutes = Math.round((distance / avgSpeed) * 60);

  if (minutes < 60) {
    return `${minutes} mins`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}

export async function POST(request) {
  try {
    const { from, to } = await request.json();

    // Validate input
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Both from and to locations are required' },
        { status: 400 }
      );
    }

    try {
      // Step 1: Geocode both addresses
      console.log('Geocoding addresses...');
      const [startCoords, endCoords] = await Promise.all([
        geocodeAddress(from),
        geocodeAddress(to)
      ]);

      console.log('Start coordinates:', startCoords);
      console.log('End coordinates:', endCoords);

      // Step 2: Call the shortest path API
      console.log('Fetching shortest path...');
      const pathData = await getShortestPath(startCoords, endCoords);

      // Step 3: Calculate distance and duration
      const distance = calculateDistance(pathData);
      const duration = estimateDuration(distance);

      // Step 4: Return the response
      const response = {
        path: pathData,
        from: startCoords.formatted_address || from,
        to: endCoords.formatted_address || to,
        startCoords: { lat: startCoords.lat, lon: startCoords.lon },
        endCoords: { lat: endCoords.lat, lon: endCoords.lon },
        distance: distance,
        duration: duration,
        status: 'success'
      };

      return NextResponse.json(response);

    } catch (apiError) {
      console.error('API Error:', apiError);

      // If the external API fails, return a fallback response
      if (apiError.message.includes('fetch')) {
        return NextResponse.json({
          error: 'Route service temporarily unavailable. Please try again later.',
          details: apiError.message
        }, { status: 503 });
      }

      return NextResponse.json({
        error: apiError.message || 'Failed to calculate route',
        details: apiError.toString()
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Route API error:', error);
    return NextResponse.json(
      { error: 'Failed to process route request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Route API - Use POST method to calculate routes' },
    { status: 200 }
  );
}