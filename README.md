# What To Eat — Da Nang Dinner Wheel

Can't decide what to eat tonight? Spin the wheel and let it pick one of 40 Da Nang dishes for you.
Toggle cuisine categories to narrow down the options, then spin.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build and run

```bash
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- react-custom-roulette

## How it works

1. Toggle cuisine category chips to include or exclude dish groups (Street Food, Noodles, Rice, etc.)
2. Hit **Spin** — the wheel randomly selects from all active dishes
3. A winner modal pops up with the dish name and category; dismiss or spin again

## Extend: Add new dishes

Edit `data/dishes.ts` and add a new object to the `DISHES` array:

```typescript
{ name: "Your dish name", category: "vietnamese" },
```

Categories: `vietnamese`, `seafood`, `street_food`, `indian`, `thai`, `lao`, `japanese`, `italian`, `western`, `mexican`.

## Deploy on Vercel

1. Push repo to GitHub
2. Import project in Vercel dashboard: [vercel.com/new](https://vercel.com/new)
3. Select repository and deploy (zero config needed)
4. Update the "Live: TBD" link in this README to your Vercel URL

## Live

Live: TBD
