import { Page } from '@playwright/test';

export class AutomobilesPage {
  private readonly url = '/automobili/kategorija/2013/najnoviji?categoryId=2013';

  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  // aria-label on the sort button reflects the active sort (Sortiraj → Jeftinije → Skuplje etc.)
  private async openSortDropdown(): Promise<void> {
    await this.page
      .getByLabel(/Sortiraj|Jeftinije|Skuplje|Novije|Popularnije/)
      .click();
  }

  async sortByCheapest(): Promise<void> {
    await this.openSortDropdown();
    await Promise.all([
      this.page.waitForURL('**order=price**'),
      this.page.getByRole('button', { name: 'Jeftinije' }).click(),
    ]);
  }

  async sortByMostExpensive(): Promise<void> {
    await this.openSortDropdown();
    await this.page.getByRole('button', { name: 'Skuplje' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getPriceTexts(): Promise<string[]> {
    const priceLocator = this.page.locator('[class$="__price"]');
    await priceLocator.first().waitFor({ state: 'visible' });
    return priceLocator.allInnerTexts();
  }

  async navigateToFirstListing(): Promise<void> {
    const link = this.page.locator('[class*="AdItem-module"] a[href]').first();
    await link.waitFor({ state: 'visible' });
    const href = await link.getAttribute('href');
    if (!href) throw new Error('No listing link found');
    await this.page.goto(href);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isSortedByCheapest(): Promise<boolean> {
    try {
      await this.page.getByLabel('Jeftinije').waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
