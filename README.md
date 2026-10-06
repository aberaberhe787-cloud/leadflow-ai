# LeadFlow AI

**Qualify visitors automatically. Generate more leads while you focus on closing deals.**

A production-quality AI-powered lead generation assistant that qualifies website visitors, captures lead information, and recommends relevant solutions before handing qualified leads to a sales team.

## Features

- AI-driven lead qualification conversation
- Natural multi-stage discovery flow
- Lead capture with validation
- Gemini-powered personalized recommendations
- Premium dark SaaS UI
- Fully responsive (mobile + desktop)
- CRM-ready data structure

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Google Gemini API
- Lucide React icons

## Getting Started

```bash
# Install dependencies
npm install

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_key_here
# VITE_GEMINI_API_KEY=your_key_here

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   ├── LeadCaptureForm.tsx
│   ├── SuggestionChips.tsx
│   └── Sidebar.tsx
├── services/
│   └── gemini.ts
├── data/
│   └── qualificationQuestions.ts
├── types/
│   └── lead.ts
├── hooks/
│   └── useLeadQualification.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `VITE_GEMINI_API_KEY` | Same key exposed to client (Vite prefix) |

> **Note:** For production, prefer a backend proxy so the API key is never exposed to the client.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY`
4. Deploy

Or via CLI:

```bash
npm i -g vercel
vercel
```

## Core User Flow

1. **Welcome** – Greeting + quick action chips
2. **Qualification** – Business type, industry, volume, challenge
3. **Discovery** – Company size, tools, audience, goals
4. **Lead Capture** – Name, email, company, website, contact method
5. **AI Recommendation** – Personalized summary + benefits + lead quality score
6. **Features** – Visual feature grid

## License

MIT
