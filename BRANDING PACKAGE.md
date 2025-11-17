A. BRANDING PACKAGE — LEVYMATE 
1) Brand name & lock decision

Primary brand : LEVYMATE (why: “levy” = tax; “mate” = companion — friendly and local-feel like “TaxMate” but distinct). Domain levymate.com currently for sale (buy option). 
levymate.com

Alternate friendly names (shortlist):

LEVYMATE (recommended)

LEVYBUDDY

TAXPAL NG

BIZBUWIS (local-flavour test name — check before use)

TAXWISE NG

Next step (legal): do a trademark + company name search in Nigeria and file an intent-to-use domain/mark. I can draft the trademark search query and application language if you want.

2) Tagline / positioning

Primary tagline: LevyMate — Your everyday tax companion.

Alternative short taglines:

LevyMate — Taxes made human.

LevyMate — Simple tax clarity for hustlers & microbusinesses.

3) Brand voice & personality

Helpful, plain-language, reassuring, slightly playful but professional.

Speak in local English (short sentences, examples from markets, WhatsApp sellers, tailors, mechanics).

Avoid legalese — always use “estimate”, “guide”, “educational”.

4) Visual identity (logo concept)

Primary mark: friendly logotype using a lowercase “levymate” with an icon that combines:

a simple coin/receipt silhouette (abstract), and

a tick/check or speech-bubble to show “guide/companion”.

Logo usage variants: full horizontal (icon + wordmark), stacked (icon above wordmark), icon-only for app icon.

Design brief for the logo designer / generative prompt:
“Create a modern friendly logo: simple rounded sans-serif wordmark ‘levymate’. Icon: stylized receipt + check inside a circle. Palette: trust + vibrancy. No gradients. Deliver SVG, PNG (512×512), and mono versions.”

5) Color palette

Primary: Deep Teal — #0F6B66 (trust, modern)

Accent: Warm Yellow — #FFCC33 (friendly, call-to-action)

Secondary: Charcoal — #222B2F (text)

Neutral: Ivory — #FAFBF9 (background)

Success: Soft Green — #2EC46B

(Provide exact hex values to the designer.)

6) Typography

Display: Inter / Poppins (rounded, readable)

Body: Roboto / Inter (web/mobile friendly)

Sizes: scale for 14/16/18/24/32 px for mobile UI.

7) Logo/thumbnail & thumbnail text for app stores

App icon: circle background deep teal, white receipt/check icon centered.

App Store preview text: “LevyMate — Tax & business estimates for freelancers & microbusinesses (Estimates & learning only).”

8) Key brand assets to prepare (deliverables)

SVG/PNG logos (full/stack/icon)

Color tokens JSON

Type scale CSS variables

App icon (512×512, 192×192)

Brand usage guide (1-page): do/don’t, tone of voice snippets, sample microcopy.

B. SCREEN-BY-SCREEN UI WIREFRAMES (mobile-first; copy/paste ready)

Below are screen blueprints — each screen includes components, microcopy, interactions, and required API endpoints. Paste these into your UI/UX generator or AI coding agent to produce screens/code.

Global UI notes: big buttons, single-column mobile layout, offline-first, local currency (₦), prefer toggles & examples, heavy use of templates per trade.

0. Common elements (present on many screens)

Top app bar: icon + screen title + help (tooltip)

Primary CTA: prominent bottom button (e.g., “Add Income”)

Footer nav (5 tabs): Home / Income / Expenses / Tax / Learn / Profile

Floating help button → opens AI Assistant modal

Screen 1 — Onboarding / Profile selection

Route: /onboarding
Purpose: build persona for tailored flows
Components:

Welcome headline: “Welcome — which describes you best?”

Persona tiles (icons): Salary earner, Micro-business, Both, Freelancer, Crypto trader

Industry selector (dropdown): Tailor, Mechanic, POS Agent, Cloth Seller, Food Vendor, etc.

Questions (quick): “Do you pay rent?” (yes/no), “How often do you get paid?” (weekly/monthly/irregular), “Do you trade crypto?” (yes/no)

CTA: Continue → triggers POST /user/profile

Copy examples: “Pick the one that fits — we’ll tailor calculations.”

Screen 2 — Home Dashboard

Route: /home
Components:

Greeting + snapshot: “Hello Ada — estimated tax this year ₦X”

Smart cards: This month income, This month expenses, Estimated tax (annual), Quick actions (Add income, Add expense, Import WhatsApp)

Alerts: Rent deduction available; missing receipts

Quick tips carousel (from Learn hub)
APIs used: GET /income/summary, GET /expense/summary, GET /tax/estimate

Screen 3 — Income list & add

Route: /income
Components:

Top filter: All / Business / Personal / Crypto

List of entries (date, amount, tag, note, photo thumbnail)

Floating CTA: + Add income → opens Add Income modal
Add Income modal fields: amount, source, category (dropdown), payment type (cash/transfer/pos), tag (auto-suggest), attach photo, notes, save
Special: “Quick add” (voice-to-text) and “Repeat” template for recurring sales
APIs: POST /income/add, POST /income/ocr-upload

Screen 4 — Expenses list & add

Route: /expenses
Components: similar to income screen but with deductible toggle. Industry templates default categories. OCR attach receipt.
APIs: POST /expense/add, POST /expense/ocr-upload

Screen 5 — WhatsApp Importer (Lite)

Route: /import/whatsapp
Flow: user uploads .txt export or pastes messages. App parses lines and shows preview of detected amounts, user confirms mapping to income/expense.
APIs: POST /income/whatsapp-upload returns parsed transaction list for user confirmation.

Screen 6 — Tax Calculator (single screen if possible)

Route: /tax
Components:

Summary header: Combined annual income, deductible expenses, rent deduction, estimated tax (annual)

Breakdown accordion: PIT (salary), Business estimator (turnover/profit), CGT (crypto)

“What changed” link (shows rule version used)

CTA: Export PDF / Save snapshot
APIs: POST /tax/mixed returns full breakdown (detailed JSON)

Screen 7 — Capital Gains Tool

Route: /tax/cgt
Components: add disposal: asset type (crypto/property/car), buy date,buy price, sell date, sell price, fees, holding period. On submit, shows CGT due and explanation.
APIs: POST /tax/cgt

Screen 8 — Learn Hub

Route: /learn
Components: categories / short modules 60–90 sec micro-video or slide + “Try a scenario” buttons that feed data into calculators. Quizzes, “Tax tip” push notifications.

Screen 9 — AI Assistant (modal)

Route: /assistant
Components: conversation UI with context (user profile + last 3 actions), quick suggestions (“How rent deduction works”, “Add recent sale”), disclaimers at top (“Educational only”).

Screen 10 — Reports / Export

Route: /reports
Components: list of saved snapshots; options: Generate PDF: Yearly summary / VAT estimation / CGT report. PDF includes header branding, disclaimers and simple next steps.

Screen 11 — Settings / Subscription

Route: /settings
Components: profile, language, notification settings, billing (link to provider), data export, delete account.

Developer notes for UI

Build components as reusable: Card, ListItem, Modal, FormField, OCR preview.

Offline-first: keep local queue for entries until sync.

Accessibility: large tap targets, clear contrast.

C. TAX-ENGINE FORMULAS — PSEUDOCODE + RULES
