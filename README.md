# DataViz App

A modern, lightweight, and simple data visualization application. Alternative to Metabase and Grafana, designed to be fast, intuitive, and easy to deploy.

## Screenshots

<p align="center">
  <img src="captures/dashboard-preview-1.png" width="75%">
</p>
<p align="center">
  <img src="captures/dashboard-preview-2.png" width="32%">
  <img src="captures/dashboard-preview-3.png" width="32%">
  <img src="captures/dashboard-preview-4.png" width="32%">
</p>

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
# PostgreSQL database connection URL
DATABASE_URL=postgresql://user:password@localhost:5432/dataviz

# Encryption key for sensitive data (generate a random key)
ENCRYPT_KEY=your-secret-encryption-key-minimum-32-characters

# Better Auth secret key
BETTER_AUTH_SECRET=

# prod api url for cros origin
PRODUCTION_URL=
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
