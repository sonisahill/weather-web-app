# weather

> A compact React + Vite weather lookup tool. Search a city, read the conditions.

```
 ┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
 │  Search.jsx  │ ──▶ │  fetch()    │ ──▶ │  OpenWeather API │
 └──────────────┘     └─────────────┘     └──────────────────┘
        ▲                                           │
        └────────────── weather data ◀──────────────┘
```

## Overview

`weather` is a single-page app. The user types a city name in `Search.jsx`, the app calls the OpenWeather API with a key loaded from `import.meta.env`, and the result is rendered on screen.

| Layer     | Choice                    |
| --------- | ------------------------- |
| UI        | React                     |
| Tooling   | Vite (HMR, fast builds)   |
| Styling   | Material UI + plain CSS   |
| Data      | OpenWeather REST API      |
| Lint      | ESLint                    |

## Requirements

- Node.js 18+
- npm 9+
- An OpenWeather API key

## Setup

```bash
npm install
```

Create `.env.local` in the project root:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

Read in code as:

```js
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
```

### Security notes

1. `.env.local` must stay in `.gitignore`. Check with `git check-ignore .env.local`.
2. `VITE_*` values ship to the browser. Treat the key as public and restrict it (allowed domains, rate limits) in your OpenWeather dashboard.
3. If a key was ever committed, revoke it and generate a new one. Removing it from the latest commit is not enough because it remains in Git history.

## Usage

```bash
npm run dev       # development server
npm run build     # production bundle in dist/
npm run preview   # serve the built bundle locally
npm run lint      # run ESLint
```

## Structure

```
src/
  assets/      images, svg
  App.jsx      layout and state
  Search.jsx   input + API call
  main.jsx     React root
public/        static assets
.env.example   variable names only, no secrets
```

## Troubleshooting

| Problem                          | Fix                                                        |
| -------------------------------- | ---------------------------------------------------------- |
| `401 Unauthorized` from API      | Key missing or wrong. Check `.env.local`, restart dev server. |
| Env variable is `undefined`      | Name must start with `VITE_`. Restart after editing.       |
| New key not picked up            | Vite reads env files at startup, so stop and rerun `npm run dev`. |
| City not found                   | Check spelling, or add a country code like `Pune,IN`.      |
| Build output committed by mistake | Add `dist/` to `.gitignore`.                               |

## Contributing

1. Fork and create a branch: `git checkout -b feature/your-change`
2. Run `npm run lint && npm run build`
3. Open a pull request with a short description

## License

MIT
