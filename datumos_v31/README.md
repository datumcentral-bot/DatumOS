# DatumOS v31

A comprehensive Next.js application for enterprise resource planning and management.

## Overview

DatumOS v31 is a full-stack business operating system built with Next.js, React, and Node.js. It provides integrated tools for:

- **CRM Management** - Customer relationship management and sales tracking
- **Project Management** - Task tracking, milestones, and project planning
- **Financial Tracking** - Revenue, funding, and financial forecasting
- **Team Collaboration** - Meetings, conversations, and team management
- **Calendar & Planning** - Event scheduling and roadmap planning
- **Resource Management** - Allocation and utilization tracking

## Project Structure

```
datumos_v31/
├── server.js                 # Node.js backend server
├── package.json              # Dependencies and scripts
├── next.config.mjs           # Next.js configuration
├── postcss.config.mjs        # PostCSS configuration
├── jsconfig.json             # JavaScript configuration
├── .env                      # Environment variables
├── .env.production.example   # Production environment template
├── src/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   └── middleware.js         # Request middleware
└── scripts/
    ├── seed_auth.mjs         # Authentication seeding
    ├── seed_v16.mjs          # Data seeding script
    ├── test_login.mjs        # Login testing
    └── gen_keys.mjs          # Key generation
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Environment Configuration

Copy `.env.production.example` to `.env.production` and configure:

- Database connection string
- API keys and secrets
- Public URL configuration
- Authentication settings

For local development, create a `.env.local` file with your development settings.

## Technology Stack

- **Frontend**: React 18, Next.js 14
- **Backend**: Node.js with Express-like server
- **Styling**: PostCSS, Tailwind CSS
- **Package Manager**: npm

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linting checks

## Features

### CRM Module
- Contact and account management
- Sales pipeline tracking
- Deal forecasting

### Project Management
- Task creation and assignment
- Kanban boards
- Project timelines
- Milestone tracking

### Financial Module
- Revenue tracking
- Funding management
- Budget forecasting
- Financial reporting

### Collaboration
- Team messaging
- Meeting scheduling
- Document sharing
- Real-time updates

## License

DatumOS v31 - All rights reserved
