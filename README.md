# LevyMate - Your Everyday Tax Companion

A mobile-first web application designed for Nigerian tax estimation and financial tracking.

## Features

- **Income & Expense Tracking**: Manual entry with OCR support (planned)
- **Tax Estimation**: Nigeria's 2026 tax regime calculations
- **Learning Hub**: Educational content about Nigerian taxes
- **Mobile-First Design**: Optimized for 375px - 1440px screens
- **Offline Support**: Basic functionality works offline

## Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **UI Components**: ShadCN/UI, Radix UI primitives
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Deployment**: Vercel (planned)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── add/              # Add transaction page
│   ├── tax/              # Tax calculator page
│   ├── learn/            # Learning hub page
│   └── profile/          # Profile page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard components
│   ├── transactions/     # Transaction components
│   ├── tax/              # Tax calculator components
│   ├── learning/         # Learning hub components
│   └── profile/          # Profile components
├── lib/                  # Utility functions
│   ├── utils.ts         # General utilities
│   └── tax-engine.ts    # Tax calculation engine
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── data/                # Static data (tax rules, etc.)
```

## Tax Engine

The tax engine implements Nigeria's 2025 tax rules with:

- Progressive Personal Income Tax (PIT) bands
- Rent relief (20% up to ₦500,000)
- Capital Gains Tax integration
- Small business tax estimation

## Mobile-First Breakpoints

- **< 768px**: Mobile card-stack, bottom nav
- **768–1024px**: Tablet, two-column cards
- **>1024px**: Desktop centered layout, sidebar nav

## Contributing

1. Follow the existing code conventions
2. Use TypeScript for all new code
3. Ensure mobile-first responsive design
4. Test on multiple screen sizes

## License

© 2025 LevyMate. All rights reserved.