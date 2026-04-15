/**
 * Database fixtures for E2E tests
 *
 * Provides utilities for seeding test data before tests.
 * Uses Prisma client directly from the backend for type safety.
 *
 * Note: We use raw SQL queries here to avoid importing @prisma/client
 * which would require building the backend first.
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Database path (relative to api package)
const DB_PATH = join(__dirname, '../../api/prisma/dev.db')

/**
 * Reset database to clean state using Prisma migrations
 */
export async function resetDatabase(): Promise<void> {
  console.log('🔄 Resetting database...')
  try {
    // Use Prisma CLI to reset and migrate
    execSync('npx prisma migrate reset --force --skip-generate', {
      cwd: join(__dirname, '../../api'),
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: `file:./prisma/dev.db` },
    })
    console.log('✅ Database reset complete')
  } catch (error) {
    console.error('❌ Database reset failed:', error)
    throw error
  }
}

/**
 * Seed database with test data
 */
export async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding database...')
  try {
    execSync('npm run db:seed', {
      cwd: join(__dirname, '../../api'),
      stdio: 'pipe',
    })
    console.log('✅ Database seed complete')
  } catch (error) {
    console.error('❌ Database seed failed:', error)
    throw error
  }
}

/**
 * Setup clean database with seed data
 */
export async function setupTestDatabase(): Promise<void> {
  await resetDatabase()
  await seedDatabase()
}

/**
 * Create a test event type directly via API
 * Returns the created event type ID
 */
export async function createTestEventType(
  apiContext: { post: (url: string, data: unknown) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
  data: {
    title: string
    durationMinutes: number
    description?: string
  }
): Promise<string> {
  const response = await apiContext.post('/api/admin/event-types', {
    title: data.title,
    durationMinutes: data.durationMinutes,
    description: data.description,
  })

  if (!response.ok()) {
    throw new Error(`Failed to create event type: ${data.title}`)
  }

  const result = await response.json() as { id: string }
  return result.id
}

/**
 * Generate unique test data to avoid conflicts
 */
export function generateUniqueTestData(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Get available slots for a date via API
 * Endpoint: /api/event-types/{eventTypeId}/available-slots
 */
export async function getAvailableSlots(
  apiContext: { get: (url: string) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
  eventTypeId: string,
  dateFrom: string,
  dateTo: string
): Promise<Array<{ startTime: string; endTime: string }>> {
  const url = `/api/event-types/${eventTypeId}/available-slots?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`
  const response = await apiContext.get(url)

  if (!response.ok()) {
    throw new Error(`Failed to get available slots for event type: ${eventTypeId}`)
  }

  const result = await response.json() as { slots: Array<{ startTime: string; endTime: string }> }
  return result.slots || []
}

/**
 * Create a booking via API
 */
export async function createBooking(
  apiContext: { post: (url: string, data: unknown) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
  data: {
    eventTypeId: string
    startTime: string
    guestName: string
    guestEmail: string
  }
): Promise<{ id: string }> {
  const response = await apiContext.post('/api/bookings', {
    eventTypeId: data.eventTypeId,
    startTime: data.startTime,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
  })

  if (!response.ok()) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to create booking: ${JSON.stringify(error)}`)
  }

  return await response.json() as { id: string }
}
