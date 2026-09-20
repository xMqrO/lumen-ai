# Lumen — AI Assistant

A refined, distraction-free AI chat workspace built with React, TypeScript, Vite, and Tailwind CSS.

## Quick start

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## What's inside

- Three-pane chat workspace (sidebar, thread, tools panel)
- AI agents — turn a prompt into a saved, specialized assistant
- Full settings modal (models, temperature, capabilities, system prompt)
- Light / dark theme with persistence
- Backend-ready (Readdy Backend) for auth, data, and edge functions

## Notes

- Replies stream a placeholder by default. Wire a real AI provider by storing your
  API key as a Backend secret and calling it from a secure edge function — never
  expose the key in the browser.
- Agents and settings persist to local storage; sync them to your Backend account
  once auth is wired up.
