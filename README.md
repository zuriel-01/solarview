# SolarView Prototype

SolarView is a Next.js prototype for exploring simulated 2025 solar generation, appliance usage, battery status, and optimization tips.

## Prototype behavior

- No database, authentication service, or external persistence is required.
- System and appliance settings are held in memory while the app is open.
- Refreshing the page resets the prototype configuration to its defaults.
- The prediction dataset is bundled in `app/data/solarData.json`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deploy on Vercel

Use the repository root as the Vercel Root Directory. The project uses the Next.js App Router and requires no database environment variables.
