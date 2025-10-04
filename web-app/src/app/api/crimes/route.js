import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper function to generate unique record ID
function generateRecordId() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `${year}NB${randomNum}-1`;
}

// Helper function to validate crime data
function validateCrimeData(data) {
  const errors = [];

  if (!data.type || data.type.trim() === '') {
    errors.push('Crime type is required');
  }

  if (!data.location || data.location.trim() === '') {
    errors.push('Location is required');
  }

  if (!data.time || data.time.trim() === '') {
    errors.push('Time is required');
  }

  if (!data.category || data.category.trim() === '') {
    errors.push('Category is required');
  }

  const validCategories = [
    'Murder',
    'Shooting with Injuries',
    'Aggravated Assault',
    'Robbery',
    'Arson',
    'Burglary',
    'Simple Assault'
  ];

  if (data.category && !validCategories.includes(data.category)) {
    errors.push('Invalid category');
  }

  return errors;
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Validate the input data
    const validationErrors = validateCrimeData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    // Generate a unique record ID
    const recordId = generateRecordId();

    // Create the new crime object
    const newCrime = {
      type: data.type.trim(),
      record_id: recordId,
      time: data.time.trim(),
      location: data.location.trim(),
      category: data.category
    };

    // Read the existing crimes from file.json
    const filePath = path.join(process.cwd(), 'src/data/file.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const crimes = JSON.parse(fileContent);

    // Add the new crime to the array
    crimes.push(newCrime);

    // Write the updated data back to file.json
    await fs.writeFile(filePath, JSON.stringify(crimes, null, 4));

    // Return success response
    return NextResponse.json(
      {
        message: 'Crime report submitted successfully',
        crime: newCrime
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving crime report:', error);
    return NextResponse.json(
      { error: 'Failed to save crime report' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Read the crimes from file.json
    const filePath = path.join(process.cwd(), 'src/data/file.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const crimes = JSON.parse(fileContent);

    return NextResponse.json(crimes);
  } catch (error) {
    console.error('Error reading crimes:', error);
    return NextResponse.json(
      { error: 'Failed to read crimes' },
      { status: 500 }
    );
  }
}