# DataViz App

A modern, lightweight, and simple data visualization application. Alternative to Metabase and Grafana, designed to be fast, intuitive, and easy to deploy.

## Key Features

### Visualizations
- Line Charts
- Bar Charts
- Pie Charts
- Area Charts
- Scatter Plots
- Radial Charts
- Statistics Cards
- Data Tables

### Dashboards
- **Customizable dashboards** with drag-and-drop grid system
- **Dynamic variables** to filter your data (text, number, date, select, boolean)
- **Global date range** for all your charts
- **Annotations** on X and Y axes to mark important events
- **Auto-refresh** of charts with configurable intervals

### Data Connections
- **PostgreSQL** - Direct connection to your databases
- **REST API** - Integration with your existing APIs

### Security
- **Authentication** integrated with Better Auth
- **Encryption of sensitive data** (passwords, tokens)

### Other Features
- **Import/Export** of configurations

## Technologies

React 19, TypeScript, Vite, Tailwind CSS, Recharts, React Grid Layout, Zustand, Better Auth, TanStack Query, PostgreSQL (NeonDB)

## Installation

### Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (recommended) or npm
- **PostgreSQL** (optional, for data persistence)

### Install Dependencies

```bash
git clone ...
cd dataviz-app

pnpm install
pnpm dev
```

### Configuration

1. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

2. Configure the environment variables in `.env`:

```env
# Base URL for Better Auth (optional in development)
VITE_BETTER_AUTH_URL=http://localhost:5173

# Production URL (for deployment)
PRODUCTION_URL=https://your-domain.com

# PostgreSQL database connection URL
DATABASE_URL=postgresql://user:password@localhost:5432/dataviz

# Encryption key for sensitive data (generate a random key)
ENCRYPT_KEY=your-secret-encryption-key-minimum-32-characters
```

## Project Structure

```
dataviz-app/
├── src/
│   ├── api/              # Backend (API servers, repositories, use cases)
│   ├── shared/           # Shared code (types, utils, constants)
│   └── web/              # Frontend (UI, stores, hooks, pages)
├── assets/               # Static resources
├── public/               # Public files
└── package.json
```
