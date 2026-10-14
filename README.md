# LeadFlow AI

A React demo for guided lead qualification, business discovery, contact capture, and rule-based recommendations.

## Current capabilities

- Multi-stage qualification conversation
- Contact-field validation
- Rule-based lead-quality estimate
- Challenge-based solution suggestion
- Optional Gemini-backed replies through a server-side API endpoint
- Responsive React interface

**Important:** This is currently a demo. Lead details and chat history are held in browser memory and are lost when the page is refreshed. Database persistence, CRM synchronization, calendar booking, automated follow-up, and analytics are not configured.

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Google Gemini API (optional server-side reply endpoint)
- Lucide React icons

## Local development

```bash
npm install
npm run dev
```

The Vite dev server does not execute Vercel serverless functions automatically. To test the Gemini endpoint locally, install the Vercel CLI and use `vercel dev` after configuring the server-only environment variable below.

## Environment variables

Configure `GEMINI_API_KEY` in the server environment (for example, Vercel Project Settings → Environment Variables). **Do not use `VITE_GEMINI_API_KEY` or expose the key to browser code.** Vite-prefixed variables are bundled into client-side code.

The app falls back to local replies and rule-based recommendations if the API endpoint is unavailable.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Set `GEMINI_API_KEY` as a server-side environment variable if you want Gemini-backed replies.
3. Deploy the project and verify the `/api/gemini` endpoint in the deployment.

## Project structure

```
api/
└── gemini.js
src/
├── components/
├── data/
├── hooks/
├── services/
├── types/
├── App.tsx
└── main.tsx
```

## Core user flow

1. Welcome and quick-action selection
2. Business qualification
3. Business discovery
4. Contact capture
5. Rule-based recommendation and feature summary

## Scripts

```bash
npm run typecheck
npm run lint
npm run build
```

## License

MIT
