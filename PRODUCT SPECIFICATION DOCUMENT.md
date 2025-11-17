FULL, DEVELOPER-READY FEATURE & PRODUCT SPECIFICATION DOCUMENT — structured exactly like a “single-source development blueprint” that you can paste directly into an AI coding assistant to build the entire SaaS app from end to end.

It contains:
Full feature list
Functional requirements
Non-functional requirements
Backend architecture
Frontend architecture
API specs
Database schema
Modules & workflows
User flows
App logic
AI integration instructions
Security rules
Deployment environment
Testing requirements
Monetization logic
Compliance boundaries
No timelines included.


✅ LEVYMATE — COMPLETE DEVELOPMENT SPECIFICATION DOCUMENT
Developer-Ready Master Blueprint (Copy & Paste into AI Coding Agent)
SECTION 1 — PRODUCT OVERVIEW

Product Name: LevyMate
Type: Mobile + Web SaaS (Subscription-based)
Purpose: A personal + small-business financial and tax assistant tailored to Nigeria’s 2026 tax regime.
Core Function:

Record income & expenses manually (no bank APIs)

Estimate tax liability using Nigeria's updated laws

Provide compliance guides (not legal advice)

Provide capital gains tax calculations

Assist micro-businesses with simple bookkeeping

AI-powered explanations, OCR, WhatsApp-message parsing

This app must NOT:

Handle or transfer user money

Connect to bank APIs

File taxes or represent users

Provide legal or accounting services

SECTION 2 — USER PROFILES

System must support these user categories:

Salary Earners

Small Business Owners / Artisans

Sellers (online / physical)

POS Agents

Freelancers / Remote Workers

Crypto & Digital Traders

Mixed Income (Salary + Hustle)

Students with small income

Each user profile changes:

Onboarding questions

Tax formulas

Recommended expense categories

Yearly estimation logic

SECTION 3 — CORE FEATURES
3.1 Income Tracking Module
Functional Requirements:

Users must manually add income entries.

Users can upload photos → OCR extracts amount + description.

Users can upload exported WhatsApp chats (.txt) → system parses payments, orders, amounts.

Users can record inventory purchases → system tracks units sold to determine income.

Support cash, transfers, POS earnings, digital earnings.

Auto-categorization engine sorts income into:

Personal income

Business income

Non-taxable income

Capital gains

Windfall income

Data Needed Per Income Entry:

Amount

Source (string)

Category

Payment type

Timestamp

Optional: photo receipt, OCR text, or file upload

3.2 Expense Tracking Module
Functional Requirements:

Manual expense entry.

OCR extraction for receipts.

Voice input → convert to text → auto-tag.

Default categories per industry:

Tailor: fabric, thread, sewing machine repairs

Mechanic: parts, tools, fuel

POS: agent fees, charges

etc.

Mark expenses as “deductible” or “non-deductible”.

System must automatically detect rent expenses and apply 20% rent deduction (cap NGN 500k).

Expense Entry Fields:

Amount

Category

Optional: Receipt photo

Business or Personal

Description

Timestamp

3.3 Tax Estimation Engine

Tax engine must compute estimations using Nigeria’s 2025 Nigeria Tax Act (NTA) & Nigeria Tax Administration Act (NTAA).

Engine Components:
A. Personal Income Tax (PIT)

Apply updated progressive PIT bands.

Automatically determine user’s income band.

Apply new rent deduction logic.

Consider multiple income streams.

B. Small Business Tax Estimator

Determine tax liability based on:

Turnover

Profit after allowed deductions

Industry-specific rules

C. Mixed Income Calculator

Combine salary + business data and apply correct PIT formula.

D. Capital Gains Tax Module

For disposal of:

Crypto

Shares

Real estate

Vehicles

Digital assets

Use progressive rates based on income bracket.

E. Business Type Logic

Support:

Sole proprietors

Unregistered businesses

Micro-traders

3.4 Compliance Guidance System
Requirements:

Provide checklists for compliance (not advice).

Provide procedural steps for:

Getting TIN

Checking residency

Paying taxes

Provide non-binding summaries of obligations.

Provide due-date reminders.

Must NOT:

File taxes

Connect to government systems

Provide legal advice

3.5 Learning Hub
Structure:

Micro-videos or text modules

Infographics

Grouped by:

Salary Earners

Small Businesses

Crypto Traders

Freelancers

Mixed Income

Examples:

“Tax for Tailors”

“Crypto Gains Explained Simply”

“Side Hustle Tax Rules Explained”

Admin dashboard required to upload lessons.

3.6 AI Assistant Integration
Capabilities Required:

Answer questions about Nigerian tax laws.

Simplify calculations.

Explain rules using examples.

Interpret OCR results.

Extract amounts from WhatsApp conversations.

Constraints:

Must show disclaimer: “Educational assistance only.”

Must redirect users to learn modules when needed.

3.7 User Reports (PDF Export)
Exportable Reports:

Monthly income summary

Monthly expenses summary

Business profit summary

Yearly tax estimate

Capital gains report

PDF must be:

Branded

Clean

Printable

Non-binding disclaimer

SECTION 4 — NON-FUNCTIONAL REQUIREMENTS
Performance

Must work offline for basic entries

Sync when internet is available

Low CPU usage on budget smartphones

Fast loading (<1.5 seconds for major screens)

Security

JWT auth

Row-level access control

Hash passwords

No sensitive financial data storage

Legal Compliance

Add disclaimers

Do not promise legal accuracy

Do not store bank credentials

Do not file taxes for users

SECTION 5 — FRONTEND REQUIREMENTS
Technology:

React Native (mobile)

React.js (web version)

Core Screens:

Onboarding

Dashboard

Income

Expenses

Tax Calculator

Learning Hub

Compliance Guides

Reports

Settings

Subscription / Billing

UI Characteristics:

Minimal, Nigerian-friendly

Large buttons

Offline caching

Light/dark mode

SECTION 6 — BACKEND ARCHITECTURE
Recommended Stack:

Node.js (NestJS preferred)
or

Python (FastAPI)

Services Needed:

Authentication service

User profile service

Income service

Expense service

Tax engine service

OCR & NLP microservice

AI Assistance service

Subscription service

Reports service

Notifications service

SECTION 7 — API ENDPOINT SPECIFICATION

Below is a minimal API specification.

AUTHENTICATION

POST /auth/register
POST /auth/login
POST /auth/logout

USER PROFILE

GET /user/profile
PATCH /user/profile

INCOME

POST /income/add
GET /income/list
GET /income/summary
POST /income/ocr-upload
POST /income/whatsapp-upload

EXPENSE

POST /expense/add
GET /expense/list
GET /expense/summary
POST /expense/ocr-upload

TAX ENGINE

POST /tax/pit
POST /tax/business
POST /tax/mixed
POST /tax/cgt

LEARNING HUB

GET /learn/modules
GET /learn/module/:id

REPORTS

GET /reports/pdf/:type

SUBSCRIPTIONS

POST /billing/initialize
POST /billing/webhook
GET /billing/status

SECTION 8 — DATABASE SCHEMA (POSTGRESQL)
Tables
users

id
full_name
email
phone
password_hash
profile_type
industry
created_at
updated_at

income

id
user_id
amount
category
source
payment_method
timestamp
notes
ocr_text
attachment_url

expenses

id
user_id
amount
category
is_deductible
timestamp
notes
attachment_url

tax_rules

id
rule_name
rule_data (JSON)
effective_date

reports

id
user_id
report_type
pdf_url
created_at

subscriptions

id
user_id
plan
status
renewal_date
reference

SECTION 9 — TAX ENGINE LOGIC
Inputs:

Profile type

Total income

Total deductible expenses

Rent paid

Type of income (salary/hustle/crypto/etc.)

Outputs:

Total estimated tax

Band

Breakdown

Simple explanation

Logic:

Implement the Nigerian 2025 PIT rate schedule:

0 – 800,000 NGN → 0%  
Next band → X% (to be applied according to NTA 2025)  
Top marginal → 25%  


Rent deduction:

20% of rent up to ₦500k

Capital Gains Tax:

Progressive by income band

SECTION 10 — AI INTEGRATION REQUIREMENTS
OCR Requirements

Extract:

Numbers

Invoice names

Dates

Payment tags

Categorize automatically using NLP

WhatsApp Parser

Detect currency amounts

Detect “paid”, “send”, “sell”, “collect”, “balance”, “owing”

Extract transaction lines

AI Assistant

Explain tax concepts

Interpret rules

Convert user text to structured data

SECTION 11 — SECURITY RULES

Encrypt all stored files

No financial credentials stored

GDPR-like privacy features

Session timeout

Rate limiting

Logs must avoid storing sensitive text

SECTION 12 — DEPLOYMENT REQUIREMENTS
Environments:

Development

Staging

Production

Recommended Hosting:

Backend → AWS or Render

Database → Neon/Postgres

File storage → S3-compatible

Frontend → Vercel or Netlify

CI/CD Requirements:

Linting

Unit tests

API tests

Automatic deployment

SECTION 13 — MONETIZATION MODEL
Free Tier:

Basic income entry

Basic tax estimate

Limited OCR

Paid Tier:

Full tax engine

Unlimited OCR

WhatsApp importer

Capital gains calculations

PDF reports

Full learning library

AI tax assistant

Billing processor:

Paystack or Flutterwave

SECTION 14 — TESTING REQUIREMENTS
Unit Tests:

Tax engine

OCR parser

WhatsApp parser

Integration Tests:

Login

Income/expense flow

Subscription flow

E2E Tests:

Onboarding → Entry → Tax Estimate → PDF report

SECTION 15 — DISCLAIMERS TO SHOW IN APP

“Educational purpose only, not legal or tax advice.”

“This app does not file taxes on your behalf.”

“Calculations are estimates based on publicly available tax rules.”
