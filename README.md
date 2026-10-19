# AuraFinance — Personal Accounting

A single-page personal finance and accounting app: multi-currency accounts, transactions,
budgets, savings goals, and analytics.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Recharts, Lucide icons

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Data

All data lives in the browser (`localStorage`). Nothing is sent to a server.
Use the **Reset** button in the sidebar to restore the sample data.

## Deploy

Deployed on Vercel as a static Vite build.
