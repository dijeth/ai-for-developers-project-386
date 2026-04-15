import { test, expect } from '@playwright/test'
import { setupTestDatabase } from '../fixtures/db.js'

/**
 * Smoke test to verify Playwright setup and infrastructure
 * Tests basic connectivity: frontend, proxy, backend
 */
test.describe('Infrastructure Smoke Tests', () => {
  // Setup database before all smoke tests
  test.beforeAll(async () => {
    await setupTestDatabase()
  })

  test('frontend is accessible and renders', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Verify page loaded - check for some basic element
    // The page should have some content (title, header, or body)
    await expect(page.locator('body')).toBeVisible()

    // Check that the page has loaded without errors
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('API is reachable through proxy', async ({ request }) => {
    // Test the public API endpoint for owner info
    const response = await request.get('/api/owner')

    // Should return 200 (even if no data, the endpoint should respond)
    expect(response.status()).toBe(200)

    // Verify we get JSON response
    expect(response.headers()['content-type']).toContain('application/json')

    // Verify response has expected structure
    const data = await response.json() as { name?: string }
    expect(data).toHaveProperty('name')
  })

  test('booking page is accessible', async ({ page }) => {
    await page.goto('/booking')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()

    // Wait for Vue to mount and render content
    await page.waitForTimeout(2000)

    // Should show the booking page content (event types selector)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
  })

  test('admin page is accessible', async ({ page }) => {
    await page.goto('/admin')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()

    // Wait for Vue to mount
    await page.waitForTimeout(2000)

    // Should have some admin content
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
  })

  test('event types API returns data', async ({ request }) => {
    const response = await request.get('/api/event-types')

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json() as { eventTypes: Array<{ id: string; title: string }> }
    // API returns { eventTypes: [...] } wrapper
    expect(data).toHaveProperty('eventTypes')
    expect(Array.isArray(data.eventTypes)).toBeTruthy()
    expect(data.eventTypes.length).toBeGreaterThan(0)

    // Check structure of first event type
    if (data.eventTypes.length > 0) {
      expect(data.eventTypes[0]).toHaveProperty('id')
      expect(data.eventTypes[0]).toHaveProperty('title')
      expect(data.eventTypes[0]).toHaveProperty('durationMinutes')
    }
  })

  test('working hours API returns data', async ({ request }) => {
    const response = await request.get('/api/owner/working-hours')

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json() as { workingHours: Array<{ weekday: string; startTime: string; endTime: string }> }
    // API returns { workingHours: [...] } wrapper
    expect(data).toHaveProperty('workingHours')
    expect(Array.isArray(data.workingHours)).toBeTruthy()
    expect(data.workingHours.length).toBeGreaterThan(0)
  })
})
