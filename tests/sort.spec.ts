import { test, expect } from '@playwright/test';
import { AutomobilesPage } from './pages/AutomobilesPage';
import { parsePrice, toEur, ParsedPrice } from './helpers/priceUtils';

test.describe('Sort by price — Automobiles', () => {

  test('prices are in ascending order when sorted by cheapest', async ({ page }) => {
    const automobilesPage = new AutomobilesPage(page);
    await automobilesPage.navigate();
    await automobilesPage.sortByCheapest();

    const priceTexts = await automobilesPage.getPriceTexts();
    const prices = priceTexts
      .map(parsePrice)
      .filter((p): p is ParsedPrice => p !== null)
      .map(p => toEur(p));

    expect(prices.length).toBeGreaterThan(0);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('sort filter persists after navigating to a listing and going back', async ({ page }) => {
    const automobilesPage = new AutomobilesPage(page);
    await automobilesPage.navigate();
    await automobilesPage.sortByCheapest();

    await automobilesPage.navigateToFirstListing();
    await page.goBack();
    await page.waitForLoadState('networkidle');

    expect(await automobilesPage.isSortedByCheapest()).toBe(true);
  });

  test('listings without a price (Kupujem/Kontakt) appear at the end of sorted results', async ({ page }) => {
    const automobilesPage = new AutomobilesPage(page);
    await automobilesPage.navigate();
    await automobilesPage.sortByCheapest();

    const priceTexts = await automobilesPage.getPriceTexts();
    const firstNullIndex = priceTexts.findIndex(t => parsePrice(t) === null);

    if (firstNullIndex === -1) {
      // no Kupujem/Kontakt listings on this page
      return;
    }

    const itemsAfterFirstNull = priceTexts.slice(firstNullIndex);
    const numericPricesAfterNull = itemsAfterFirstNull.filter(t => parsePrice(t) !== null);
    expect(numericPricesAfterNull).toHaveLength(0);
  });

  test('switching from most expensive to cheapest correctly inverts the order', async ({ page }) => {
    const automobilesPage = new AutomobilesPage(page);
    await automobilesPage.navigate();

    await automobilesPage.sortByMostExpensive();
    const expensiveTexts = await automobilesPage.getPriceTexts();
    const expensivePrices = expensiveTexts
      .map(parsePrice)
      .filter((p): p is ParsedPrice => p !== null)
      .map(p => toEur(p));

    for (let i = 1; i < expensivePrices.length; i++) {
      expect(expensivePrices[i]).toBeLessThanOrEqual(expensivePrices[i - 1]);
    }

    await automobilesPage.sortByCheapest();
    const cheapTexts = await automobilesPage.getPriceTexts();
    const cheapPrices = cheapTexts
      .map(parsePrice)
      .filter((p): p is ParsedPrice => p !== null)
      .map(p => toEur(p));

    for (let i = 1; i < cheapPrices.length; i++) {
      expect(cheapPrices[i]).toBeGreaterThanOrEqual(cheapPrices[i - 1]);
    }

    if (cheapPrices.length > 0 && expensivePrices.length > 0) {
      expect(cheapPrices[0]).toBeLessThanOrEqual(expensivePrices[0]);
    }
  });

});
