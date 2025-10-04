import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

    // For now, we'll use the sample data from shortest_path.json
    // In a real implementation, you would call your routing API here
    const dataPath = path.join(process.cwd(), '..', 'shortest_path.json');

    try {
      const fileContent = await fs.readFile(dataPath, 'utf8');
      const pathData = JSON.parse(fileContent);

      // Simulate API response with additional metadata
      const response = {
        path: pathData,
        from: from,
        to: to,
        // These would be calculated by a real routing service
        distance: '2.3 miles',
        duration: '8 mins',
        status: 'success'
      };

      return NextResponse.json(response);
    } catch (fileError) {
      console.error('Error reading shortest_path.json:', fileError);

      // Return a default path if file not found (for testing)
      const defaultPath = [
        { lon: -74.4511747, lat: 40.4894213 },
        { lon: -74.4504089, lat: 40.4898723 },
        { lon: -74.44963, lat: 40.490369 },
        { lon: -74.4489131, lat: 40.4908597 },
        { lon: -74.4481883, lat: 40.4913386 },
        { lon: -74.4474798, lat: 40.4918288 },
        { lon: -74.446264, lat: 40.4926308 },
        { lon: -74.4465419, lat: 40.494006 },
        { lon: -74.4467056, lat: 40.4947636 },
        { lon: -74.4469212, lat: 40.4959304 },
        { lon: -74.4461663, lat: 40.4963113 },
        { lon: -74.4457508, lat: 40.4965516 },
        { lon: -74.4443072, lat: 40.4967595 }
      ];

      return NextResponse.json({
        path: defaultPath,
        from: from,
        to: to,
        distance: '2.3 miles',
        duration: '8 mins',
        status: 'success',
        note: 'Using sample data'
      });
    }
  } catch (error) {
    console.error('Route API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route' },
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