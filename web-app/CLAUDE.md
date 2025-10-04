# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 crime tracking web application for New Brunswick, NJ. It displays crime incidents on an interactive Google Maps interface with filtering, search, and reporting capabilities.

## Key Commands

### Development
```bash
npm run dev        # Start development server with Turbopack on port 3000
npm run build      # Build production bundle with Turbopack
npm start          # Start production server
npm run lint       # Run ESLint checks
```

## Architecture

### Data Flow
1. **Crime Data Source**: `file.json` contains all crime records with fields: type, record_id, time, location, category
2. **Data Processing**: `src/utils/crimeData.js` processes raw data, handles categorization, date formatting, and filtering logic
3. **Client State**: Main page (`src/app/page.js`) manages application state using React hooks
4. **API Layer**: `/api/crimes` route handles GET (fetch crimes) and POST (submit new crime) operations

### Component Hierarchy
```
app/page.js (Main State Container)
├── components/Sidebar.js (Search, Filter, Crime List)
│   └── components/CrimeCard.js (Individual Crime Display)
├── components/Map.js (Google Maps Integration)
│   └── Custom Markers with Category Icons
└── components/Navigation.js (Header with Submit Link)
```

### Google Maps Integration
- Uses `@googlemaps/js-api-loader` for dynamic loading
- API key stored in `NEXT_PUBLIC_MAPS_API_KEY` environment variable
- Custom SVG markers based on crime categories with color coding
- Geocoding service converts addresses to coordinates with caching

### Crime Categorization System
Categories are predefined with specific colors and custom SVG icons:
- Murder (red-800, triangle)
- Shooting with Injuries (red-600, diamond)
- Aggravated Assault (orange-600, square)
- Robbery (amber-600, pentagon)
- Arson (yellow-600, star)
- Burglary (green-600, house)
- Simple Assault (cyan-600, circle)

### State Management
- No external state management library - uses React hooks
- Crime data loaded once on mount from `file.json`
- Filtered crimes maintained separately for performance
- Selected crime state shared between Map and Sidebar components

### Key Technical Decisions
1. **Static Data**: Crime data stored in `file.json` rather than database for simplicity
2. **Client-Side Filtering**: All filtering/searching happens client-side for instant response
3. **Geocoding Cache**: Map component maintains internal cache to minimize API calls
4. **Date Handling**: Uses date-fns for all date operations, crime dates parsed from "MM/DD/YYYY HH:mm" format
5. **Responsive Design**: Tailwind CSS with mobile-first approach, sidebar collapses on mobile