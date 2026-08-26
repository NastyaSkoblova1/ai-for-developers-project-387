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
})
