/**
 * Example Express raw body setup for webhook verification.
 * This is for reference when setting up a standalone Express server.
 * Note: Next.js API routes handle body parsing differently.
 * 
 * @example
 * ```typescript
 * import type express from 'express'
 * 
 * const app = express()
 * 
 * // capture raw body for webhook verification
 * app.use((req, res, next) => {
 *   let data = ''
 *   req.setEncoding('utf8')
 *   req.on('data', (chunk) => {
 *     data += chunk
 *   })
 *   req.on('end', () => {
 *     ;(req as any).rawBody = data
 *     try {
 *       req.body = JSON.parse(data)
 *     } catch (e) {
 *       req.body = data
 *     }
 *     next()
 *   })
 * })
 * 
 * export default app
 * ```
 */

// This file is for documentation only and not meant to be imported
// It shows example Express middleware setup for webhook verification
// TypeScript users should add express types: npm i --save-dev @types/express
