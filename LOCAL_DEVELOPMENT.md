# Local Development Setup

This guide explains how to run Care-Connect-Pro in local development mode with mock data, allowing you to develop and test features without connecting to the Base44 backend.

## Quick Start

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Mock Mode vs Production Mode

The application supports two modes:

### Mock Mode (Default)
- Uses local mock data stored in `src/api/mockData.js`
- No backend connection required
- Perfect for frontend development and testing
- Faster development with instant API responses

### Production Mode
- Connects to the real Base44 API backend
- Requires a valid Base44 account and app ID
- Used for production deployment

## Configuration

The mode is controlled by the `.env` file:

```env
# Mock Mode (default)
VITE_USE_MOCK_MODE=true

# Production Mode (connect to Base44 API)
VITE_USE_MOCK_MODE=false
VITE_BASE44_APP_ID=your_app_id_here
```

## Mock Data

Mock data is defined in `src/api/mockData.js` and includes:

- **3 Clients** - Sample client profiles with demographics and care information
- **3 Caregivers** - Healthcare staff with certifications and availability
- **4 Visits** - Scheduled and completed care visits
- **3 Claims** - Billing claims in various states
- **Medications** - Medication schedules for clients
- **Care Plans** - Active care plans with goals
- **Messages** - Sample communication threads
- **Documents** - Mock document library
- **Family Members** - Family portal access records
- **Dashboard Stats** - KPIs and analytics data

### Customizing Mock Data

To add more mock data or modify existing data:

1. Open `src/api/mockData.js`
2. Add or modify entries in the `mockData` object
3. Save the file - Vite will hot-reload the changes

Example:
```javascript
clients: [
  {
    id: "4",
    name: "New Client",
    dateOfBirth: "1950-01-01",
    // ... other fields
  }
]
```

## Mock API Features

The mock client (`src/api/mockClient.js`) simulates the Base44 SDK with:

- **CRUD operations** - Create, Read, Update, Delete for all entities
- **Filtering** - Filter results by field values
- **Sorting** - Sort results by any field
- **Pagination** - Limit and offset support
- **Async simulation** - 300ms delay to simulate network requests
- **In-memory storage** - Changes persist during the session

## Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Make changes** to components in `src/components/` or pages in `src/pages/`
3. **View changes** instantly with hot module replacement
4. **Test features** using the mock data
5. **Add new mock data** as needed for testing new features

## Available Routes

Once running, you can access:

- `/` - Dashboard with stats and charts
- `/clients` - Client management
- `/caregivers` - Caregiver management
- `/schedule` - Visit scheduling calendar
- `/evv` - Electronic Visit Verification
- `/documentation` - Visit documentation
- `/billing` - Claims management
- `/reports` - Business intelligence reports
- `/documents` - Document library
- `/messages` - Team messaging
- `/medications` - Medication management
- `/careplans` - Care plan builder
- `/incidents` - Incident reporting
- `/quality-assurance` - Quality audits
- `/family-portal` - Family member access
- `/mobile-app` - Mobile interface
- `/onboarding` - Client onboarding

## Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Switching to Production Mode

When ready to connect to the real Base44 API:

1. Update `.env`:
   ```env
   VITE_USE_MOCK_MODE=false
   VITE_BASE44_APP_ID=your_actual_app_id
   ```

2. Restart the dev server

3. Log in with your Base44 credentials

## Troubleshooting

### Port already in use
If port 5173 is already in use, Vite will automatically try another port (5174, 5175, etc.).

### Changes not reflecting
- Make sure the dev server is running
- Check the terminal for errors
- Try restarting the dev server

### Mock mode not working
- Check that `.env` has `VITE_USE_MOCK_MODE=true`
- Look in browser console for the mode message: "🔧 Running in MOCK mode"
- Restart the dev server after changing .env

## Tech Stack

- **React 18.2** - UI framework
- **Vite 6.1** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Hook Form + Zod** - Form management
- **React Query** - Server state management
- **Recharts** - Data visualization

## Next Steps

- Explore the codebase structure
- Customize mock data for your needs
- Build new features using the existing component patterns
- Add more mock entities as needed
- Test the UI/UX flow
- Connect to real Base44 API when ready

## Support

For Base44 platform support, contact: app@base44.com

For local development issues, check:
- Terminal output for errors
- Browser console for frontend errors
- Network tab for API calls (should show as immediate in mock mode)
