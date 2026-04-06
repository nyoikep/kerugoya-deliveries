import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyDSCzqBwEJM6fel2xLxRCZjvaXjcGEn8Pg';

  try {
    const googlePlacesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry&key=${googleApiKey}`
    );

    const data = await googlePlacesResponse.json();

    if (data.status === 'OK' && data.candidates.length > 0) {
      const { lat, lng } = data.candidates[0].geometry.location;
      return NextResponse.json({ lat, lng }, { status: 200 });
    } else {
      console.warn('Google Places API response:', data);
      return NextResponse.json({ message: 'Location not found via Google Places API, or API key has referer restrictions.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error calling Google Places API:', error);
    return NextResponse.json({ message: 'Internal server error during geocoding' }, { status: 500 });
  }
}
