# HRMS Frontend

HRMS Frontend is a polished React + Vite application built for HR teams to manage employee data, payroll, attendance, recruitment, and notifications in a single admin dashboard.
Demo check use below credentials:-
Super Admin  → admin@hrms.com     / Admin@1234"
    "HR Manager   → hr@hrms.com        / Hr@12345"
    "Team Manager → manager@hrms.com   / Manager@1234"
    "Employee 1   → amit@hrms.com      / Emp@12345"
    "Employee 2   → sneha@hrms.com     / Emp@12345"
    "Employee 3   → ananya@hrms.com    / Emp@12345"
## Features

- React 19 and Vite 4-based SPA
- Tailwind CSS for styling
- Route-based page organization
- Dashboard, attendance, payroll, employees, leaves, documents, notifications, recruitment, and settings pages
- Auth flow with login, reset password, and protected routes

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `src/` - source files
- `src/pages/` - page views
- `src/components/` - reusable UI components
- `src/layouts/` - layout wrappers
- `src/routes/` - route handling
- `src/api/` - Axios API setup
- `src/context/` - authentication context
- `src/utils/` - shared utilities and helpers

## Notes

- Tailwind CSS is configured via `tailwind.config.js`
- Main styles are in `src/index.css`
- The app uses `react-router-dom` for navigation
