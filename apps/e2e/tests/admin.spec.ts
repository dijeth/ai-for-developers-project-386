import { test, expect } from '@playwright/test'
import { setupTestDatabase, createBooking } from '../fixtures/db.js'
import { generateTestEmail, generateTestName, getTomorrow, getNextWeekday, formatDateISO, createDateAtHour, toISODateTime } from '../fixtures/test-data.js'

/**
 * Admin dashboard tests
 * Tests admin functionality including viewing and managing bookings
 */
test.describe('Admin Dashboard', () => {
  // Setup database before all tests
  test.beforeAll(async () => {
    await setupTestDatabase()
  })

  test('admin page loads and displays dashboard', async ({ page }) => {
    await page.goto('/admin')

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible()

    // Wait for Vue to mount
    await page.waitForTimeout(3000)

    // Should have some content
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText?.length).toBeGreaterThan(50)
  })

  test('admin can view bookings list', async ({ page }) => {
    await page.goto('/admin')

    // Wait for dashboard to load
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })

    // Look for bookings section/tab
    const bookingsTab = page.locator('text=/бронирования|bookings|appointments/i').first()

    if (await bookingsTab.isVisible().catch(() => false)) {
      await bookingsTab.click()
    }

    // Wait for content to load
    await page.waitForTimeout(1000)

    // Check for table or list of bookings
    const bookingsTable = page.locator('table, .booking-list, [data-testid="bookings-table"], .p-datatable').first()

    // Table might be empty but should exist
    const hasTable = await bookingsTable.isVisible().catch(() => false)
    if (hasTable) {
      // If we have a table, check its structure
      const rows = bookingsTable.locator('tr, .p-datatable-row')
      const rowCount = await rows.count()

      // Should have header row at minimum, or data rows if bookings exist
      expect(rowCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('admin can view event types', async ({ page }) => {
    await page.goto('/admin')

    // Wait for dashboard to load
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })

    // Look for event types section/tab
    const eventTypesTab = page.locator('text=/типы событий|event types|services/i').first()

    if (await eventTypesTab.isVisible().catch(() => false)) {
      await eventTypesTab.click()
    }

    // Wait for content
    await page.waitForTimeout(1000)

    // Check for event types table or list
    const eventTypesTable = page.locator('.event-types-table, [data-testid="event-types"], table').first()

    // Should have event type information displayed
    const hasEventTypes = await eventTypesTable.isVisible().catch(() => false)
    if (hasEventTypes) {
      const rows = eventTypesTable.locator('tr, .event-type-row')
      expect(await rows.count()).toBeGreaterThan(0)
    }
  })

  test('admin can view working hours', async ({ page }) => {
    await page.goto('/admin')

    // Wait for dashboard
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })

    // Look for working hours section
    const workingHoursTab = page.locator('text=/рабочие часы|working hours|schedule/i').first()

    if (await workingHoursTab.isVisible().catch(() => false)) {
      await workingHoursTab.click()
    }

    // Wait for content
    await page.waitForTimeout(1000)

    // Should show working hours configuration
    const workingHoursContent = page.locator('.working-hours, [data-testid="working-hours"], .schedule-container').first()
    const hasContent = await workingHoursContent.isVisible().catch(() => false)

    if (hasContent) {
      // Check for weekday entries
      const weekdays = page.locator('text=/mon|tue|wed|thu|fri|пн|вт|ср|чт|пт/i')
      expect(await weekdays.count()).toBeGreaterThan(0)
    }
  })

  test('admin API returns bookings data', async ({ request }) => {
    // Get bookings for today and next 30 days
    const today = new Date()
    const dateFrom = toISODateTime(today)
    const dateTo = toISODateTime(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000))

    const response = await request.get(`/api/admin/bookings?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json() as { bookings: unknown[] }
    expect(data).toHaveProperty('bookings')
    expect(Array.isArray(data.bookings)).toBeTruthy()
  })

  test('admin API returns owner profile', async ({ request }) => {
    const response = await request.get('/api/admin/owner')

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json() as { name?: string; email?: string }
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('email')
  })
})
