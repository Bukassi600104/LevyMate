🔥 LEVYMATE — Mobile-First Web App Build Instructions (for AI Coding Agent)
(You will copy/paste this into your coding assistant as the “MASTER INSTRUCTION FILE”)
I will generate the full document ONLY when you say “Generate the Mobile-First Build Instructions.”

But here is a preview of what it includes:
1. Frontend Technology Expectations
Use Next.js 15 (App Router)
Use TailwindCSS for styling
Use ShadCN/UI for UI components
Use Zustand for lightweight state handling
Use Lucide Icons
Use Framer Motion for micro animations
Use TypeScript everywhere

2. Mobile-First Layout Rules
Mobile is the primary view
Desktop simply expands spacing + multi-column

All screens must support:
375px
414px
768px
1024px
1440px

Breakpoint behavior:

Device	Layout Style
< 768px	Mobile card-stack, bottom nav
768–1024px	Tablet, two-column cards
>1024px	Desktop centered layout, sidebar nav
3. Component System Rules

Cards = rounded-xl, soft shadows, 16px padding
Buttons = shadcn button + icon support
Charts = responsive container wrappers
Forms = 1-column (mobile) / 2-column (desktop)
Lists = swipeable on mobile

4. Navigation System
Mobile:
Bottom navigation with 4 main tabs
Floating Action Button for “Add Income/Expense”
Desktop:
Left sidebar
Top-level breadcrumbs
Full-width dashboard header

5. API Architecture
/api/users
/api/auth
/api/taxes/calculate
/api/taxes/rules
/api/transactions
/api/profiles
/api/subscription
Every endpoint documented cleanly.

6. Tax Engine Integration Rules
Engine must import tax_rules.json
All tax logic is purely client + server calculated
Engine is stateless
All rules update dynamically (no hardcoding)

7. Performance Requirements
Lazy load all pages
Preload critical fonts
Optimise for Lighthouse 90+
All assets < 200kb

8. Security Requirements
No handling of money
No bank API
No scraping
Use Supabase or Clerk for auth

OWASP-compliant

9. Accessibility Requirements
Minimum 16px text
ARIA labels
Full contrast compliance
Focus states for all buttons

10. Deployment Guidelines
Deploy on Vercel
Database on Supabase
Attach environment variables
Configure Edge Runtime for speed
