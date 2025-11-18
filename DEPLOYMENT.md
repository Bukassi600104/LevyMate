# Vercel Deployment Configuration

## Directory Structure

This repository contains two separate applications:

### 1. Next.js Frontend (Root Directory)
- **Location**: `/` (root directory)
- **Framework**: Next.js 15 with App Router
- **Deployment Target**: Vercel (this deployment)
- **API Routes**: 
  - `/api/tax/calculate` - Tax calculation endpoint
  - `/api/tax/rules` - Tax rules endpoint

### 2. Express Backend API (`/api` directory)
- **Location**: `/api` subdirectory
- **Framework**: Express.js with TypeORM
- **Deployment Target**: Should be deployed separately (Railway, Render, AWS, etc.)
- **Purpose**: Full backend with authentication, transactions, OCR, etc.

## Vercel Configuration

The `.vercelignore` file excludes the Express API backend from Vercel deployment to avoid:
- Exceeding the 12 function limit on Hobby plan
- Build conflicts between Next.js and Express
- Unnecessary deployment of backend dependencies

## Deployment Instructions

### Frontend (Vercel)
1. Deploy the root directory to Vercel
2. Only Next.js pages and API routes will be deployed
3. Static pages and 2 API functions (within Hobby plan limits)

### Backend (Separate Service)
The Express API in `/api` should be deployed to a separate service:
1. Railway, Render, AWS, Google Cloud, or similar
2. Requires PostgreSQL database
3. Environment variables for database connection, JWT secrets, etc.

## API Integration

Once both services are deployed:
1. Update environment variables in the Next.js app to point to the backend API
2. Configure CORS on the backend to allow requests from the Vercel frontend
3. Set up authentication flow between frontend and backend

## Function Count

With this configuration:
- **Vercel Functions**: 2 (tax calculate + tax rules)
- **Static Pages**: ~20 pages
- **Total**: Well within the 12 function limit for Hobby plan