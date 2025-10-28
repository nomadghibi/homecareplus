# Care-Connect-Pro

A comprehensive home healthcare management platform built with React and Vite.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server with mock data
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

## Local Development Mode

By default, the app runs with **mock data** for local development - no backend required!

See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed setup instructions.

## Features

- **Client Management** - Track client demographics, diagnoses, and care preferences
- **Caregiver Management** - Staff profiles, certifications, and availability
- **Visit Scheduling** - Calendar-based care coordination
- **Electronic Visit Verification (EVV)** - GPS tracking and compliance
- **Billing & Claims** - Create and track insurance claims
- **Care Plans** - Build and manage personalized care plans
- **Medications** - Medication schedules and administration tracking
- **Family Portal** - Family engagement and transparency
- **Reports & Analytics** - Business intelligence dashboards
- **Team Messaging** - Internal communication system
- **Document Management** - Secure file storage and sharing
- **Mobile App** - Field staff mobile interface

## Tech Stack

- React 18.2
- Vite 6.1
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- React Query
- Recharts

## Configuration

Create a `.env` file (see `.env.example`) to configure:

```env
# Use mock data for local development
VITE_USE_MOCK_MODE=true

# Base44 App ID (for production)
VITE_BASE44_APP_ID=your_app_id
```

## Production Mode

To connect to the Base44 API:

1. Set `VITE_USE_MOCK_MODE=false` in `.env`
2. Add your Base44 app ID
3. Restart the dev server

For Base44 platform support: app@base44.com