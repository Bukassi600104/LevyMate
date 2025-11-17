ready checklist, project repo layout, env vars, dependencies, dev commands and step-by-step tasks to implement the app from prototype → production.

1) Project fundamentals & repo structure

Monorepo layout (recommended)

/levymate
  /apps
    /mobile (React Native)
    /web (React)
  /services
    /api (FastAPI or NestJS)
    /ocr (microservice - python)
    /ai-assistant (stateless wrapper)
    /tax-engine (microservice)
  /infra
    /terraform (optional)
    /k8s-manifests (optional)
  /docs
    /brand
    /api-spec
    /deployment
  /scripts

2) Tech stack (recommended)

Frontend mobile: React Native (Expo or bare)

Frontend web: React + Vite (optional)

Backend API: FastAPI (Python) or NestJS (Node)

DB: PostgreSQL (managed: Neon/Heroku/AWS RDS)

Storage: S3-compatible for receipts

OCR: Tesseract + light ML model for receipts OR hosted OCR (if you later permit paid APIs)

AI assistant: use OpenAI API (or your chosen LLM). NOTE: keep prompts focused on “educational” responses and always append disclaimers.

Auth: JWT + refresh tokens.

CI/CD: GitHub Actions → deploy to Render/AWS/ECS/Vercel.

Monitoring: Sentry + Prometheus + Datadog (optional).

3) Environment / secrets (example)
DATABASE_URL=postgres://...
JWT_SECRET=...
S3_BUCKET=levymate-files
S3_KEY=...
S3_SECRET=...
OPENAI_API_KEY=...
MAILER_API_KEY=...
STRIPE_SECRET_KEY / PAYSTACK_KEY = (for subscription)


Important: do not add bank API keys or anything related to payment processing beyond subscription gate.

4) API contracts (copy-ready)

Use the API endpoints in the spec I gave earlier. Add OpenAPI docs automatically from FastAPI / NestJS.

Provide sample JSON payloads for each endpoint in /docs/api-samples.

5) Database migrations & seed data

Use alpine migrations (Alembic / TypeORM). Seed sample users (salary earner, tailor, pos agent) and rule JSON for tax_rules (the official bands). Set up sample transactions for QA.

6) Task list for the AI coding agent (step-by-step)

Initialize monorepo with the folder structure above.

Create backend skeleton (FastAPI or NestJS) with auth, user profile, income, expense endpoints. Implement JWT auth.

Implement tax_engine microservice as isolated service with tax_rules DB table (JSON rules). Add unit tests for PIT band calculations. Use KPMG bands as initial seed. 
KPMG Assets

Build OCR microservice (Tesseract + simple postprocessing): endpoint /ocr/parse accept image → return date, amount, merchant text. Add OCR tests with sample receipts.

Implement WhatsApp parser (NLP script): accept text file → regex & NLP for currency extraction → return potential transactions. Add test corpus (.txt exports).

Frontend: mobile: build onboarding, income/expense forms, dashboard. Connect to backend endpoints. Use local storage to queue offline entries.

Frontend: web: admin/learning hub uploader + report download.

AI Assistant: create LLM wrapper that accepts user message + context (profile + last 3 actions) and uses a prompt template to produce an educational answer. Always append the legal disclaimer.

PDF export: implement HTML→PDF templates using wkhtmltopdf or headless Chrome. Include rule version in footer.

Payments: integrate subscription via Paystack/Flutterwave only for subscription billing. Ensure subscription service is isolated and does not process user funds beyond SDK.

Testing: write unit tests for tax engine (covering edge cases), integration tests for endpoints, E2E for onboarding→add income→tax calc→export.

Security & privacy: implement encryption for uploaded files, session timeouts, and data retention policy screens for GDPR-style flows.

Deployment: CI builds and deploys to staging, run smoke tests, then to production. Add DB backup & monitoring.

7) Developer QA checklist (before launch)

 All tax calculations include rule_version & audit trail.

 All PDF exports contain disclaimers.

 AI assistant always shows “Educational only” before the answer.

 No bank connectivity code present in repo. (🔒 required)

 Subscription flow functional and audited.

 OCR accuracy > 85% on sample receipts.

 Offline queue sync works after network restores.

 Penetration test results are posted.

8) Testing data & mocks

Provide the AI assistant with 20 canonical user examples and expected outputs (e.g., “Ada sold 40 garments this month — here’s how to input”, “How rent deduction works if rent paid = ₦360,000”).

9) Release & monitoring

Release behind feature-flag “early access”.

Monitor usage metrics: Daily active users, new profiles, tax estimate runs, OCR success rate, PDF exports, conversion to paid.

Implement error alerting (Sentry) and performance traces for tax engine.

Final legal / compliance reminders (developer checklist)

Disclaimers visible everywhere tax calculations appear.

Avoid language promising compliance or legal accuracy.

No bank APIs or money handling. (Hard-block in code reviews)

Retention policy: store minimal personal data, allow export/delete.

Trademark step: run formal trademark search in Nigeria and file before major marketing.


A. Brand Assets

SVG / Designer Prompts

CSS Tokens / Design Tokens

App-Store Listing Copy

B. Tax Rules JSON File (tax_rules)

Seeded with 2025 PIT bands + rent-relief

C. Figma-Ready UI Screen Specs

Wireframes + microcopy for all major screens + notes for designers

A. Brand Assets
A1. Designer Prompts (SVG / Logo)
Design Brief for LevyMate Logo:

- Primary wordmark: “levymate” in lowercase, friendly modern rounded sans serif.  
- Icon: Combine a stylized receipt or tax document + a checkmark or speech bubble. The receipt should be abstract (no too much detail), with minimal lines, to suggest “receipt” or “invoice.” The check or bubble should overlap or integrate subtly—symbolizing “guidance” or “companion.”  
- Shape: circular or softly squared frame option, for app icon.  
- Style: flat, minimal, no heavy gradients. Prefer two-tone or three-tone.  
- Color: use deep teal (#0F6B66) for brand primary, warm yellow (#FFCC33) for accent, and neutral ivory (#FAFBF9) or charcoal (#222B2F) for text.  
- Deliverables:  
  - Full horizontal logo (icon + wordmark) in SVG  
  - Stacked version (icon above wordmark) in SVG  
  - Icon-only version (app icon) in SVG + PNG (512×512, 192×192)  
  - Monochrome (black / white) variations  
  - Logo usage guide (clear space, minimum size, color usage)  

Optional / Nice-to-have:  
- A simplified “mark-only” variant (just check + receipt) for small uses  
- SVG animation concept: check tick “writing” onto a receipt, for loading screen  

A2. CSS / Design Tokens

Here is a JSON object of design tokens you can copy into your design system or code base:

{
  "color": {
    "primary": "#0F6B66",
    "accent": "#FFCC33",
    "text": "#222B2F",
    "background": "#FAFBF9",
    "success": "#2EC46B",
    "muted": "#A3A3A3"
  },
  "font": {
    "family": {
      "display": "Poppins, sans-serif",
      "body": "Inter, sans-serif"
    },
    "size": {
      "small": "14px",
      "base": "16px",
      "medium": "18px",
      "large": "24px",
      "xlarge": "32px"
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "bold": 600
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "border": {
    "radius": {
      "sm": "4px",
      "md": "8px",
      "lg": "16px"
    }
  },
  "shadow": {
    "sm": "0px 1px 3px rgba(0, 0, 0, 0.1)",
    "md": "0px 4px 6px rgba(0, 0, 0, 0.1)",
    "lg": "0px 10px 15px rgba(0, 0, 0, 0.1)"
  }
}

A3. App Store / Play Store Listing Copy

App Name (Store): LevyMate — Tax & Hustle Companion
Subtitle / Short Description / Tagline:

“Estimate your taxes, track your income & expenses — no accountant needed.”

“Tax clarity for side-hustlers, artisans & micro-businesses.”

Full Description (for app store):

LevyMate is your everyday tax companion — designed for hustlers, artisans, small business owners, and salary earners in Nigeria. 

With LevyMate, you can:
• Easily track your income (cash, sales, or online)  
• Log your expenses using voice, receipts, or manual entry  
• Estimate how much tax you may owe based on Nigeria’s 2026 tax rules  
• Understand your rent deduction and how it affects your tax  
• Calculate capital gains tax on crypto, real estate, or other assets  
• Learn through bite-sized tutorials (“Tax for tailors”, “Crypto gains explained”)  
• Export tax summaries and reports (PDF)  

LevyMate is NOT an accountant. It’s a smart, educational tool that gives you clarity — not filings. All estimates are for guidance only.

**Why LevyMate?**  
- Built for the Nigerian tax regime  
- Perfect for micro-businesses and side-hustlers  
- Friendly and easy to use — no tax jargon  

**Your tax journey, simplified.**  
Subscribe to Premium to unlock advanced features like Capital Gains Estimator, PDF report export, WhatsApp message parsing, and full access to the learning hub.  

B. TAX RULES JSON (tax_rules) — Seed File

Here is a JSON file structure that your AI coding agent can import into the tax_rules table for the tax engine. It is seeded with PIT bands and rent-relief logic. (You can extend it later for CGT, business tax, etc.)

{
  "rule_version": "2025-v1",
  "effective_date": "2025-07-01",
  "pit_bands": [
    {
      "band_from": 0,
      "band_to": 800000,
      "rate": 0.0
    },
    {
      "band_from": 800001,
      "band_to": 3000000,
      "rate": 0.15
    },
    {
      "band_from": 3000001,
      "band_to": 12000000,
      "rate": 0.18
    },
    {
      "band_from": 12000001,
      "band_to": 25000000,
      "rate": 0.21
    },
    {
      "band_from": 25000001,
      "band_to": 50000000,
      "rate": 0.23
    },
    {
      "band_from": 50000001,
      "band_to": null,
      "rate": 0.25
    }
  ],
  "rent_relief": {
    "percent": 0.20,
    "cap": 500000
  },
  "cgt_rules": {
    "use_pit_rates": true,
    "exemption": 0,
    "notes": "Capital Gains taxed at the PIT marginal rate."
  }
}


Detailed Screen Specs
1. Onboarding Profile Screen

Layout: vertical scroll

Top: “Welcome to LevyMate” (H1)

Persona tiles (grid): Salary earner, Micro-business, Freelancer, Crypto trader, Mixed

Short Questions:

“Do you pay rent?” — toggle yes / no

“How often do you receive income?” — dropdown: Weekly / Monthly / Irregular

“Do you trade crypto?” — toggle yes / no

Bottom: “Continue” (button) → store profile inputs

Microcopy examples:

Persona tile: “I run a small shop or side hustle”

Question text: “Do you pay rent for your house or shop?”

Button: “Continue”

2. Home Dashboard Screen

Header: “Hello, [UserName]”

Summary Cards (4):

Income this month: ₦[x]

Expenses this month: ₦[x]

Tax estimate (annual): ₦[x]

Quick action: “Add Income” / “Add Expense”

Alerts / Reminders: “You could claim rent relief: enter rent amount”

Carousel: 2–3 tip cards from learning hub

Help (floating icon): opens AI Assistant

Microcopy:

“Estimated tax this year”

“Quick actions”

Tip: “Did you know? You can track your daily sales to make tax easier later.”

3. Income Screen

Tabs / Filter: All / Business / Personal / Crypto

List: each row shows date, amount, category, note, and thumbnail if receipt attached

Floating Action Button: “+ Add Income”

Add Income Modal:

Fields: Amount, Source (text), Category (dropdown), Payment Method, Tag, Attach Photo, Note

Button: “Save”

Microcopy:

“Where did this money come from?”

“Amount (₦)”

“Payment method”

“Tag this income”

“Attach receipt (optional)”

4. Expense Screen

Similar structure to Income screen

Deductible toggle / checkbox

Category dropdown tailored to industry

OCR “Scan Receipt” button (camera icon)

“Is this a business expense?” toggle

Microcopy:

“How much did you spend?”

“Category”

“Attach receipt”

“This expense is deductible?” → Yes / No

5. WhatsApp Importer Screen

Title: “Import from WhatsApp”

Description: “Export your chat from WhatsApp (.txt) and upload it to identify transactions.”

File upload field

After upload: preview list of parsed lines with checkboxes to accept/reject or tag as income / expense

Button: “Confirm & Import”

Microcopy:

“Upload your WhatsApp .txt file”

“We’ll highlight amounts & let you choose which are income or expense.”

“Confirm these as your transactions”

6. Tax Calculator Screen

Header: “Your Tax Estimate”

Summary block: “Total Income: ₦X”, “Deductions: ₦Y”, “Rent Deduction: ₦Z”, “Taxable Income: ₦W”, “Estimated Tax: ₦T”

Expandable breakdown sections:

“PIT (Salary / Business)”

“Business Estimator”

“Capital Gains”

Button: “Export Report” (if premium)

Info text: “Calculated using tax rules version [vXYZ]”

Microcopy:

“This is an estimate for guidance only – LevyMate is educational. Not for filing.”

“Breakdown” / “Show more”

“Export summary as PDF”

7. Capital Gains Screen

Form: Asset Type dropdown, Buy Date, Buy Price, Sell Date, Sell Price, Fees, Holding Period

Button: “Calculate CGT”

Result section: “Net Gain: ₦X”, “Estimated CGT: ₦Y”, short explanation “Based on Nigeria’s 2025 PIT rules”

Microcopy:

“What did you sell?”

“Buy price (₦)”

“Sell price (₦)”

“Estimated profit / loss”

“Capital Gains Tax (CGT) estimate”

8. Learning Hub Screen

Top: Search bar (“Search tax topics”)

Category cards: Salary, Business, Crypto, Side Hustle

Under each: micro-lessons list (video or text)

Each module: title, brief description, time (“~1 min”), “Start” button

Microcopy:

“Tax made easy — pick a topic”

Example lesson: “Tax for tailors”, “Crypto gains in plain English”, “Rent deduction explained”, “How to get a TIN”

9. AI Assistant Modal

Chat interface: user message & system response

Context bar: user profile + last 2 actions

Input box: “Ask me anything about tax or your entries”

Disclaimer: “Educational only — not a tax pro.”

Microcopy:

“Ask me how rent deduction works”

“Explain capital gains tax simply”

“What happens if I don’t pay tax on my side hustle?”

10. Reports / Export Screen

List of saved “snapshots” (date-stamped)

For each: small summary (Income, Expenses, Tax Estimate)

Buttons: “Generate PDF”, “Download”

If premium not active: “Upgrade to export” CTA

Microcopy:

“Your tax summaries”

“Export this report as PDF”

“Upgrade to Premium to unlock PDF export”

11. Settings / Subscription Screen

Sections: Profile, Notifications, Billing, Privacy

Billing: shows current plan, “Upgrade/Manage Subscription” button

Data: “Export my data”, “Delete account”

Microcopy:

“Plan: Free / Premium”

“Manage subscription”

“Export your data (JSON)”

“Delete account — All your data will be removed”

Designer / Figma Notes

Use the design tokens from A2 for spacing, font size, colors

Provide Figma frames for all screens above

Use “auto layout” for consistent spacing

Mark which elements are conditional (e.g., “Export PDF” button shows only for premium)

Provide prototype links for basic navigation: Onboarding → Home → Income → Calculator → Learn

