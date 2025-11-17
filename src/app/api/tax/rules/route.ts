import { NextResponse } from 'next/server'
import taxRules from '@/data/tax-rules.json'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: taxRules
    })
  } catch (error) {
    console.error('Tax rules error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}