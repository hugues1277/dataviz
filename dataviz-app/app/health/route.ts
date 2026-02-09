import { NextResponse } from 'next/server';

/**
 * Route API: GET /health
 * Health check endpoint
 * Basée sur authApiPlugin.ts
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
