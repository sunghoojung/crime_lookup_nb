# New Brunswick Crime Tracker

A real-time crime tracking web application for New Brunswick, NJ, displaying recent crime incidents on an interactive map.

## Features

- 📍 Interactive Google Maps with crime location markers
- 🔍 Search crimes by type, location, or date
- 🎨 Color-coded markers based on crime severity
- 📊 Statistics dashboard showing crime distribution
- 🔄 Real-time filtering and search capabilities
- 📱 Responsive design for mobile and desktop

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google Maps API

#### Enable Required APIs

To fix the `ApiNotActivatedMapError`, you need to enable the following APIs in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Library**
4. Search for and enable these APIs:
   - **Maps JavaScript API** (Required for the map)
   - **Geocoding API** (Required for converting addresses to coordinates)
   - **Places API** (Optional but recommended)

#### Get Your API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **CREATE CREDENTIALS** → **API Key**
3. Copy the generated API key

#### Configure API Key

1. The API key is already in `.env.local`:
   ```
   NEXT_PUBLIC_MAPS_API_KEY=your_api_key_here
   ```

2. (Optional) Restrict your API key for security:
   - In Cloud Console, click on your API key
   - Under **Application restrictions**, select **HTTP referrers**
   - Add these referrers:
     - `http://localhost:3000/*`
     - `http://localhost:3005/*`
     - `https://yourdomain.com/*` (for production)

#### Enable Billing

Google Maps requires a billing account to be active:
1. Go to **Billing** in Google Cloud Console
2. Set up a billing account (you get $200 free credits monthly)
3. Link your project to the billing account

### 3. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3005](http://localhost:3005) to see the application.

## Troubleshooting

### ApiNotActivatedMapError

If you see this error, it means the Maps JavaScript API is not enabled:
1. Follow the setup instructions above to enable the API
2. Wait 1-2 minutes for changes to take effect
3. Click the "Retry Loading" button in the app

### Authentication Failed

If you get an authentication error:
1. Verify your API key is correct in `.env.local`
2. Check that billing is enabled on your Google Cloud account
3. Ensure there are no IP or HTTP referrer restrictions blocking your requests

### Geocoding Not Working

If crime locations aren't appearing on the map:
1. Enable the Geocoding API in Google Cloud Console
2. Check the browser console for specific error messages
3. Verify the addresses in `file.json` are properly formatted

## Crime Data

The application reads crime data from `file.json`. Each crime record includes:
- **Type**: Crime classification
- **Record ID**: Unique identifier
- **Time**: Date and time of incident
- **Location**: Street address or block

Crime severity is automatically determined based on the crime type:
- **High**: Aggravated assault, robbery, burglary
- **Medium**: Simple assault, medical assault
- **Low**: Vehicle-related crimes

## Project Structure

```
src/
├── app/
│   ├── page.js         # Main application page
│   ├── layout.js       # Root layout
│   └── globals.css     # Global styles
├── components/
│   ├── Map.js          # Google Maps component
│   ├── Sidebar.js      # Search and filter sidebar
│   └── CrimeCard.js    # Individual crime display
└── utils/
    ├── crimeData.js    # Crime data processing
    └── geocoding.js    # Address geocoding utilities
```

## Technologies Used

- Next.js 15.5
- React 19
- Google Maps JavaScript API
- Tailwind CSS
- Lucide Icons
- date-fns

## License

MIT