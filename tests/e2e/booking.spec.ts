import { test, expect } from '@playwright/test'

test.describe('Booking scenarios', () => {
  test('successful booking', async ({ page }) => {
    // Step 1: Open public page
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible()

    // Step 2: See available event types
    const eventCard = page.getByTestId('event-type-card-et-1')
    await expect(eventCard).toBeVisible()
    await expect(eventCard.getByText('Quick Call')).toBeVisible()
    await expect(eventCard.getByText('15 мин')).toBeVisible()
    await expect(eventCard.getByText('Забронировать')).toBeVisible()

    // Step 3: Select event type
    await eventCard.click()

    // Step 4: Navigate to booking page
    await expect(page).toHaveURL(/\/book\/et-1/)
    await expect(page.getByRole('button', { name: 'Вернуться к списку встреч' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quick Call' })).toBeVisible()
    await expect(page.getByText('15 минут')).toBeVisible()

    // Step 5: Select a date with available slots
    await expect(page.getByTestId('calendar-picker')).toBeVisible()

    // Step 6: Wait for slots to load and select a free slot
    await page.waitForSelector('[data-testid^="slot-button-"]', { timeout: 10000 })
    const slotButton = page.locator('[data-testid^="slot-button-"]').first()
    await expect(slotButton).toBeVisible()
    await slotButton.click()

    // Step 7: Fill in name and email
    await expect(page.getByTestId('guest-name-input')).toBeVisible()
    await expect(page.getByTestId('guest-email-input')).toBeVisible()
    await expect(page.getByTestId('guest-phone-input')).toBeVisible()
    await page.getByTestId('guest-name-input').fill('Test User')
    await page.getByTestId('guest-email-input').fill('test@example.com')

    // Step 8: Submit the form
    await expect(page.getByTestId('submit-booking-button')).toBeVisible()
    await page.getByTestId('submit-booking-button').click()

    // Step 9: See booking confirmation
    await expect(page.getByTestId('booking-success')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Встреча запланирована!' })).toBeVisible()
    await expect(page.getByText('test@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Забронировать ещё' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'На главную' })).toBeVisible()
  })

  test('double booking shows error', async ({ page }) => {
    // Step 1: Open public page and select event type
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible()

    const eventCard = page.getByTestId('event-type-card-et-2')
    await expect(eventCard).toBeVisible()
    await expect(eventCard.getByText('Deep Dive')).toBeVisible()
    await eventCard.click()

    await expect(page).toHaveURL(/\/book\/et-2/)
    await expect(page.getByRole('heading', { name: 'Deep Dive' })).toBeVisible()

    // Step 2: Select a free slot
    await page.waitForSelector('[data-testid^="slot-button-"]', { timeout: 10000 })
    const slotButton = page.locator('[data-testid^="slot-button-"]').first()
    await expect(slotButton).toBeVisible()
    const slotId = await slotButton.getAttribute('data-testid')
    await slotButton.click()

    // Step 3: Create first booking
    await expect(page.getByTestId('guest-name-input')).toBeVisible()
    await page.getByTestId('guest-name-input').fill('First User')
    await page.getByTestId('guest-email-input').fill('first@example.com')
    await page.getByTestId('submit-booking-button').click()

    await expect(page.getByTestId('booking-success')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Встреча запланирована!' })).toBeVisible()

    // Step 4: Try to book again
    await page.getByRole('button', { name: 'Забронировать ещё' }).click()
    await expect(page.getByTestId('booking-success')).not.toBeVisible()

    // Step 5: The same slot should no longer be visible after booking
    const sameSlotButton = page.locator(`[data-testid="${slotId}"]`)
    await expect(sameSlotButton).not.toBeVisible()

    // Step 6: Try to book via API directly - should get 409 conflict
    const slotIdValue = slotId.replace('slot-button-', '')
    const response = await page.request.post('/api/bookings', {
      data: {
        slotId: slotIdValue,
        guestName: 'Second User',
        guestEmail: 'second@example.com',
      }
    })
    expect(response.status()).toBe(409)
  })

  test('cross-type double booking is prevented', async ({ page }) => {
    // Step 1: Book a slot for et-1 via API
    const slot = await getFirstAvailableSlot(page, 'et-1')
    const booking = await page.request.post('/api/bookings', {
      data: {
        slotId: slot.id,
        guestName: 'First User',
        guestEmail: 'first@example.com',
      }
    })
    expect(booking.status()).toBe(200)

    // Step 2: Try to book the exact same time for et-2 via API
    const otherTypeStart = await getSameTimeSlotForOtherType(page, 'et-2', slot.startTime)

    if (otherTypeStart) {
      const et2Slot = {
        id: `et-2__${otherTypeStart}`,
        startTime: otherTypeStart,
      }
      const response = await page.request.post('/api/bookings', {
        data: {
          slotId: et2Slot.id,
          guestName: 'Second User',
          guestEmail: 'second@example.com',
        }
      })
      expect(response.status()).toBe(409)
    }
  })

  test('slots persist after page refresh', async ({ page }) => {
    // Step 1: Open booking page for et-1
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible()
    await page.getByTestId('event-type-card-et-1').click()
    await expect(page).toHaveURL(/\/book\/et-1/)

    // Step 2: Count available slots
    await page.waitForSelector('[data-testid^="slot-button-"]', { timeout: 10000 })
    const before = await page.locator('[data-testid^="slot-button-"]').count()

    // Step 3: Book the first available slot
    const firstSlot = page.locator('[data-testid^="slot-button-"]').first()
    const slotId = (await firstSlot.getAttribute('data-testid'))!.replace('slot-button-', '')
    await firstSlot.click()
    await expect(page.getByTestId('guest-name-input')).toBeVisible()
    await page.getByTestId('guest-name-input').fill('Persist User')
    await page.getByTestId('guest-email-input').fill('persist@example.com')
    await page.getByTestId('submit-booking-button').click()
    await expect(page.getByTestId('booking-success')).toBeVisible({ timeout: 10000 })

    // Step 4: Full page reload (no server restart)
    await page.reload()

    // Step 5: Return to the calendar view and verify one slot is gone
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible()
    await page.getByTestId('event-type-card-et-1').click()
    await expect(page).toHaveURL(/\/book\/et-1/)
    await page.waitForSelector('[data-testid^="slot-button-"]', { timeout: 10000 })
    const after = await page.locator('[data-testid^="slot-button-"]').count()

    expect(after).toBeLessThan(before)
  })
})

async function getFirstAvailableSlot(page: any, eventTypeId: string) {
  const response = await page.request.get(`/api/event-types/${eventTypeId}/slots`)
  expect(response.status()).toBe(200)
  const body = await response.json()
  const slots = body.items
  expect(slots.length).toBeGreaterThan(0)
  const slot = slots[0]
  return { id: slot.id, startTime: slot.startTime, endTime: slot.endTime }
}

async function getSameTimeSlotForOtherType(page: any, eventTypeId: string, startTime: string) {
  const response = await page.request.get(`/api/event-types/${eventTypeId}/slots`)
  expect(response.status()).toBe(200)
  const body = await response.json()
  const slots = body.items
  const match = slots.find((s: any) => s.startTime === startTime)
  return match ? match.startTime : null
}
