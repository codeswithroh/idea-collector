# StackForge

A brutalist-style web app to discover and collect Web3 hackathon ideas from ETHGlobal. Swipe through projects like cards, forge your build list.

## Features

- **Landing Page** — Hero section with featured idea, stats, and feature cards
- **Feed** — Full-screen swipeable cards (16,287 ideas from 66 ETHGlobal hackathons)
- **Build List** — Track accepted ideas with status (Not Started / Building / Shipped)
- **Brutalist Design** — High contrast, bold borders, raw typography, electric accents

## Controls

| Action | Keyboard | Mouse/Touch |
|--------|----------|-------------|
| Next Idea | Arrow Down / S | Scroll down / Swipe up |
| Previous Idea | Arrow Up / W | Scroll up / Swipe down |
| Accept / Build | Arrow Right / D | Swipe right |
| Reject / Skip | Arrow Left / A | Swipe left |

## Setup

### 1. Create environment file

Create a `.env.local` file in the project root:

```
MONGODB_URI=mongodb+srv://codeswithroh:codeswithroh2001@cluster0.frga0.mongodb.net/IdeaCollector
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
web-app/
├── app/
│   ├── page.tsx          # Landing page
│   ├── feed/page.tsx     # Swipeable feed
│   ├── build/page.tsx    # Build list
│   ├── api/ideas/route.ts    # API: fetch ideas
│   ├── api/accept/route.ts   # API: save accepted ideas
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Brutalist styles
├── components/
│   ├── Hero.tsx          # Landing hero section
│   ├── IdeaCard.tsx      # Swipeable card component
│   └── Navigation.tsx    # Top nav bar
├── lib/
│   ├── mongodb.ts        # MongoDB connection
│   └── utils.ts          # Helper functions
└── package.json
```

## Data Model

### Ideas Collection (`ethglobal_ideas`)
- `id` — unique project ID
- `title` — project name
- `description` — short description
- `event` — hackathon name
- `url` — ETHGlobal showcase link
- `project_prizes` — array of prizes won
- `source`, `scraped_at` — metadata

### Accepted Ideas Collection (`accepted_ideas`)
- `ideaId` — reference to idea
- `idea` — embedded idea data
- `action` — "accept" or "reject"
- `status` — "not_started" | "building" | "built"
- `notes` — user notes
- `createdAt`, `updatedAt` — timestamps

## Design System

- **Colors**: Black (#000), White (#FFF), Yellow (#FFE500), Pink (#FF006E), Blue (#3A86FF)
- **Borders**: 3px solid black everywhere
- **Shadows**: Offset shadows (6px 6px 0px #000)
- **Fonts**: Monospace + system sans-serif
- **No rounded corners** — sharp, blocky aesthetic

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: MongoDB (via `mongodb` driver)
- **Icons**: Lucide React
- **Styling**: Custom brutalist CSS + Tailwind

## Deployment

The app can be deployed to:
- **Vercel** — easiest, native Next.js support
- **Netlify** — with Next.js adapter
- **Railway / Render** — for full-stack hosting
- **Self-hosted** — `npm run build && npm start`

## License

Open source — fork it, build on it, make it yours.

---

Built with brutalism and caffeine.
