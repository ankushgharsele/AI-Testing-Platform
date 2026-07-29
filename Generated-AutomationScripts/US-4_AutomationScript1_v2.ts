```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // For API tests
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  // Global setup/teardown (optional, for seeding data or starting servers)
  // globalSetup: require.resolve('./global-setup'),
  // globalTeardown: require.resolve('./global-teardown'),
});
```

```typescript
// src/utils/constants/app.constants.ts
export const APP_URLS = {
  HOME: '/',
  PRODUCT_DETAIL_BASE: '/product/', // e.g., /product/laptop-pro-x
  API_SEARCH: '/api/products/search',
};

export const UI_MESSAGES = {
  NO_RESULTS: 'No results found',
  EMPTY_SEARCH_TERM_VALIDATION: 'Please enter a search term.',
  GENERIC_ERROR: 'We are currently experiencing technical difficulties. Please try again later.',
};

export const SELECTORS = {
  SEARCH_INPUT: '[data-qa="search-input"]',
  SEARCH_BUTTON: '[data-qa="search-button"]',
  PRODUCT_CARD: '[data-qa="product-card"]',
  PRODUCT_CARD_NAME: '[data-qa="product-name"]',
  PRODUCT_CARD_SKU: '[data-qa="product-sku"]',
  PRODUCT_CARD_PRICE: '[data-qa="product-price"]',
  PRODUCT_CARD_IMAGE: '[data-qa="product-image"]',
  PRODUCT_DETAIL_NAME: '[data-qa="product-detail-name"]',
  PRODUCT_DETAIL_SKU: '[data-qa="product-detail-sku"]',
  PRODUCT_DETAIL_DESCRIPTION: '[data-qa="product-detail-description"]',
  NO_RESULTS_MESSAGE: '[data-qa="no-results-message"]',
  PAGINATION_CONTAINER: '[data-qa="pagination"]',
  PAGINATION_NEXT_BUTTON: '[data-qa="pagination-next"]',
  PAGINATION_PREV_BUTTON: '[data-qa="pagination-prev"]',
  PAGINATION_PAGE_LINK: '[data-qa="pagination-page-link"]',
  VALIDATION_MESSAGE: '[data-qa="validation-message"]',
};

export const PRODUCT_DATA = {
  LAPTOP_PRO_X: {
    name: 'Laptop Pro X',
    sku: 'LPX-001',
    description: 'High-performance laptop for professionals.',
    price: '$1200.00',
  },
  GAMING_KEYBOARD_RGB: {
    name: 'Gaming Keyboard RGB',
    sku: 'GKB-RGB-001',
    description: 'Mechanical keyboard with customizable RGB lighting.',
    price: '$99.99',
  },
  WIRELESS_MOUSE: {
    name: 'Wireless Mouse',
    sku: 'M-WIRE-005',
    description: 'Ergonomic wireless mouse with long battery life.',
    price: '$25.00',
  },
  EXTERNAL_SSD_1TB: {
    name: 'External SSD 1TB',
    sku: 'SSD-EXT-001',
    description: 'Fast and portable 1TB external solid-state drive.',
    price: '$150.00',
  },
  MONITOR: {
    name: 'Dell UltraSharp Monitor',
    sku: 'MON-DELL-U27',
    description: '27-inch QHD monitor for productivity.',
    price: '$450.00',
  },
  BRAND_NEW_GADGET: {
    name: 'Brand New Gadget',
    sku: 'BNG-001',
    description: 'An innovative new gadget with advanced features.',
    price: '$79.99',
  },
  RGB_GAMING_MOUSE: { // For multi-keyword search
    name: 'RGB Gaming Mouse',
    sku: 'GM-RGB-002',
    description: 'Precision gaming mouse with RGB effects.',
    price: '$50.00',
  },
};

export const MAX_SEARCH_QUERY_LENGTH = 100;
```

```typescript
// src/pages/product-search/ProductSearchPage.ts
import { Locator, Page, expect } from '@playwright/test';
import { APP_URLS, SELECTORS, UI_MESSAGES, PRODUCT_DATA } from '../../utils/constants/app.constants';

/**
 * Represents the Product Search Page/Component in the Page Object Model.
 * This class provides methods to interact with the search functionality and assert its state.
 */
export class ProductSearchPage {
  private readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly noResultsMessage: Locator;
  readonly paginationContainer: Locator;
  readonly paginationNextButton: Locator;
  readonly paginationPrevButton: Locator;
  readonly validationMessage: Locator;

  /**
   * Initializes a new instance of the ProductSearchPage.
   * @param page The Playwright page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator(SELECTORS.SEARCH_INPUT);
    this.searchButton = page.locator(SELECTORS.SEARCH_BUTTON);
    this.productCards = page.locator(SELECTORS.PRODUCT_CARD);
    this.noResultsMessage = page.locator(SELECTORS.NO_RESULTS_MESSAGE);
    this.paginationContainer = page.locator(SELECTORS.PAGINATION_CONTAINER);
    this.paginationNextButton = page.locator(SELECTORS.PAGINATION_NEXT_BUTTON);
    this.paginationPrevButton = page.locator(SELECTORS.PAGINATION_PREV_BUTTON);
    this.validationMessage = page.locator(SELECTORS.VALIDATION_MESSAGE);
  }

  /**
   * Navigates to the home page where the search bar is located.
   */
  async navigateToHomePage(): Promise<void> {
    await this.page.goto(APP_URLS.HOME);
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  /**
   * Enters a search term into the search input field and initiates the search.
   * @param term The search term to enter.
   * @param method 'click' to click the search button, 'enter' to press Enter key.
   */
  async search(term: string, method: 'click' | 'enter' = 'click'): Promise<void> {
    await this.searchInput.fill(term);
    if (method === 'click') {
      await this.searchButton.click();
    } else {
      await this.searchInput.press('Enter');
    }
    await this.page.waitForLoadState('domcontentloaded'); // Ensure page is loaded after search
  }

  /**
   * Retrieves all visible product cards on the current page.
   * @returns A Locator representing all product cards.
   */
  getAllProductCards(): Locator {
    return this.productCards;
  }

  /**
   * Retrieves a specific product card by its index.
   * @param index The 0-based index of the product card.
   * @returns A Locator for the specified product card.
   */
  getProductCardByIndex(index: number): Locator {
    return this.productCards.nth(index);
  }

  /**
   * Retrieves the name of a product from a given product card.
   * @param productCard The Locator of the product card.
   * @returns The text content of the product name.
   */
  async getProductName(productCard: Locator): Promise<string | null> {
    return productCard.locator(SELECTORS.PRODUCT_CARD_NAME).textContent();
  }

  /**
   * Retrieves the SKU of a product from a given product card.
   * @param productCard The Locator of the product card.
   * @returns The text content of the product SKU.
   */
  async getProductSKU(productCard: Locator): Promise<string | null> {
    return productCard.locator(SELECTORS.PRODUCT_CARD_SKU).textContent();
  }

  /**
   * Asserts that a specific product is displayed in the search results.
   * @param expectedProduct The name or SKU of the expected product.
   * @param exactMatch If true, asserts only one product with an exact name/SKU, else partial match.
   */
  async expectProductToBeDisplayed(expectedProduct: string, exactMatch: boolean = true): Promise<void> {
    await expect(this.productCards).not.toHaveCount(0, { timeout: 10000 }); // Ensure at least one product is found
    if (exactMatch) {
      const productNames = await this.productCards.locator(SELECTORS.PRODUCT_CARD_NAME).allTextContents();
      expect(productNames.filter(name => name.includes(expectedProduct)).length).toBe(1);
    } else {
      await expect(this.productCards.locator(SELECTORS.PRODUCT_CARD_NAME).filter({ hasText: expectedProduct, hasNotText: UI_MESSAGES.NO_RESULTS })).toBeVisible();
    }
  }

  /**
   * Asserts that a list of products are displayed in the search results.
   * @param expectedProducts An array of product names or SKUs.
   */
  async expectProductsToBeDisplayed(expectedProducts: string[]): Promise<void> {
    await expect(this.productCards).not.toHaveCount(0, { timeout: 10000 });
    for (const product of expectedProducts) {
      await expect(this.productCards.locator(SELECTORS.PRODUCT_CARD_NAME).filter({ hasText: product })).toBeVisible();
    }
  }

  /**
   * Asserts that no products are displayed in the search results.
   */
  async expectNoProductsDisplayed(): Promise<void> {
    await expect(this.productCards).toHaveCount(0);
  }

  /**
   * Asserts that the "No results found" message is displayed.
   */
  async expectNoResultsMessageToBeDisplayed(): Promise<void> {
    await expect(this.noResultsMessage).toBeVisible();
    await expect(this.noResultsMessage).toContainText(UI_MESSAGES.NO_RESULTS);
  }

  /**
   * Asserts that a client-side validation message is displayed for the search input.
   * @param expectedMessage The expected validation message text.
   */
  async expectClientSideValidationMessage(expectedMessage: string): Promise<void> {
    await expect(this.searchInput).toHaveJSProperty('validationMessage', expectedMessage);
  }

  /**
   * Clicks on a pagination link (e.g., 'Next', '2').
   * @param link The text or number of the pagination link.
   */
  async clickPaginationLink(link: string | number): Promise<void> {
    await this.paginationContainer.locator(SELECTORS.PAGINATION_PAGE_LINK, { hasText: String(link) }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Asserts that a specific product detail page is displayed.
   * @param expectedProductName The name of the product.
   * @param expectedProductSku The SKU of the product.
   */
  async expectProductDetailPage(expectedProductName: string, expectedProductSku: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}.*`));
    await expect(this.page.locator(SELECTORS.PRODUCT_DETAIL_NAME)).toHaveText(expectedProductName);
    await expect(this.page.locator(SELECTORS.PRODUCT_DETAIL_SKU)).toHaveText(`SKU: ${expectedProductSku}`);
  }

  /**
   * Waits for and returns the client-side validation message (if any).
   * Note: This primarily works for native HTML5 validation.
   * For custom validation, a specific locator might be needed.
   */
  async getSearchInputValidationMessage(): Promise<string> {
    await this.searchInput.focus();
    // Native browser validation messages are often not directly accessible via textContent
    // but rather via the element's validity properties or a specific validation message element.
    // For native messages, accessing validity.valid and validationMessage property works.
    const validationMessage = await this.searchInput.evaluate((input: HTMLInputElement) => input.validationMessage);
    return validationMessage;
  }
}
```

```typescript
// src/fixtures/contexts/ProductSearchTest.ts
import { test as base } from '@playwright/test';
import { ProductSearchPage } from '../../pages/product-search/ProductSearchPage';
import { APIHelper } from '../../utils/api/APIHelper';

// Define the types for your fixtures
interface ProductSearchFixtures {
  productSearchPage: ProductSearchPage;
  api: APIHelper;
}

// Extend the base test to add your custom fixtures
export const test = base.extend<ProductSearchFixtures>({
  productSearchPage: async ({ page }, use) => {
    const productSearchPage = new ProductSearchPage(page);
    await productSearchPage.navigateToHomePage(); // Navigate to the home page for each UI test
    await use(productSearchPage);
  },
  api: async ({ request, baseURL }, use) => {
    const api = new APIHelper(request, baseURL!);
    await use(api);
  },
});

export { expect } from '@playwright/test';
```

```typescript
// src/utils/api/APIHelper.ts
import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { APP_URLS } from '../constants/app.constants';

/**
 * A utility class for making API requests, specifically for product search.
 */
export class APIHelper {
  private readonly request: APIRequestContext;
  private readonly baseURL: string;

  /**
   * Initializes a new instance of the APIHelper.
   * @param request The Playwright APIRequestContext.
   * @param baseURL The base URL for API endpoints.
   */
  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  /**
   * Performs a GET request to the product search API endpoint.
   * @param query The search query string.
   * @returns The API response.
   */
  async searchProducts(query: string): Promise<APIResponse> {
    const encodedQuery = encodeURIComponent(query);
    return await this.request.get(`${this.baseURL}${APP_URLS.API_SEARCH}?query=${encodedQuery}`);
  }

  /**
   * Performs a GET request to the product search API endpoint without a query parameter.
   * @returns The API response.
   */
  async searchProductsWithoutQuery(): Promise<APIResponse> {
    return await this.request.get(`${this.baseURL}${APP_URLS.API_SEARCH}`);
  }

  /**
   * Asserts that the API response contains a specific product.
   * @param response The APIResponse object.
   * @param expectedProductName The name of the product to look for.
   */
  async expectProductInApiResponse(response: APIResponse, expectedProductName: string): Promise<void> {
    const jsonResponse = await response.json();
    expect(jsonResponse).toBeInstanceOf(Array);
    const productFound = jsonResponse.some((product: any) => product.name === expectedProductName);
    expect(productFound).toBeTruthy(`Expected product '${expectedProductName}' not found in API response.`);
  }

  /**
   * Asserts that the API response is an empty array or list.
   * @param response The APIResponse object.
   */
  async expectEmptyApiResponse(response: APIResponse): Promise<void> {
    const jsonResponse = await response.json();
    expect(jsonResponse).toBeInstanceOf(Array);
    expect(jsonResponse.length).toBe(0);
  }
}
```

```typescript
// src/tests/features/product-search/product-search.spec.ts
import { test, expect } from '../../../fixtures/contexts/ProductSearchTest';
import { APP_URLS, PRODUCT_DATA, UI_MESSAGES, SELECTORS, MAX_SEARCH_QUERY_LENGTH } from '../../../utils/constants/app.constants';

test.describe('Product Search Functionality', () => {

  // TC-PS-001: Search by exact product name
  test('TC-PS-001 Verify search by exact product name match', async ({ productSearchPage }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
  });

  // TC-PS-002: Search by partial product name
  test('TC-PS-002 Verify search by partial product name match', async ({ productSearchPage }) => {
    const searchTerm = 'Laptop';
    await productSearchPage.search(searchTerm);
    // Assuming multiple laptops might exist like "Laptop Pro X", "Gaming Laptop"
    await productSearchPage.expectProductToBeDisplayed(PRODUCT_DATA.LAPTOP_PRO_X.name, false);
    // If "Gaming Laptop" also exists, we'd check for it too. For now, checking the known one.
    // await productSearchPage.expectProductToBeDisplayed('Gaming Laptop', false);
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);
  });

  // TC-PS-003: Search by product name (case-insensitive)
  test('TC-PS-003 Verify search functionality is case-insensitive for product names', async ({ productSearchPage }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name.toLowerCase(); // "laptop pro x"
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
  });

  // TC-PS-004: Search by SKU (exact match)
  test('TC-PS-004 Verify search functionality with an exact SKU match', async ({ productSearchPage }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku;
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
  });

  // TC-PS-005: Search by SKU (case-insensitive if alphanumeric SKU allows)
  test('TC-PS-005 Verify search functionality is case-insensitive for SKUs (if applicable)', async ({ productSearchPage }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku.toLowerCase(); // "lpx-001"
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
  });

  // TC-PS-006: Search with no matching results
  test('TC-PS-006 Verify "No results found" message for non-existent product search', async ({ productSearchPage }) => {
    const searchTerm = 'XYZ NonExistent Product 123';
    await productSearchPage.search(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-007: Search with an empty query
  test('TC-PS-007 Verify invalid input validation for empty search query', async ({ productSearchPage }) => {
    await productSearchPage.search('');
    // Option A (Preferred): Client-side validation message
    const validationMessage = await productSearchPage.getSearchInputValidationMessage();
    expect(validationMessage).not.toBe(''); // Expect some validation message
    // If there's a specific UI element for validation, check it
    // await expect(productSearchPage.validationMessage).toBeVisible();
    // await expect(productSearchPage.validationMessage).toContainText(UI_MESSAGES.EMPTY_SEARCH_TERM_VALIDATION);
    
    // Also ensure no search was performed and we are likely on the same page
    await expect(productSearchPage.page).toHaveURL(APP_URLS.HOME);
  });

  // TC-PS-008: Search with a query containing only spaces
  test('TC-PS-008 Verify invalid input validation for search query with only spaces', async ({ productSearchPage }) => {
    const searchTerm = '   '; // multiple spaces
    await productSearchPage.search(searchTerm);

    // Option A (Preferred): Client-side validation message or no search performed
    // For many systems, this would be trimmed and then handled as an empty search.
    // If the system treats it as empty:
    // const validationMessage = await productSearchPage.getSearchInputValidationMessage();
    // expect(validationMessage).not.toBe(''); // Expect some validation message
    // If the system performs a search and finds no results (due to trimming):
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-009: Search by product name with leading/trailing spaces
  test('TC-PS-009 Verify search functionality trims leading/trailing spaces from product name search', async ({ productSearchPage }) => {
    const searchTerm = `  ${PRODUCT_DATA.WIRELESS_MOUSE.name}  `;
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
  });

  // TC-PS-010: Search with special characters in product name (if supported)
  test('TC-PS-010 Verify search with product name containing supported special characters', async ({ productSearchPage }) => {
    // Assuming 'Product-Name-Hyphenated' exists
    const searchTerm = 'Product-Name-Hyphenated';
    // If the test setup doesn't dynamically add this, assume it's in PRODUCT_DATA
    const mockProduct = { name: searchTerm, sku: 'PN-H-001' };
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(mockProduct.name);
  });

  // TC-PS-011: Search with unsupported or unsafe special characters (Security/Validation)
  test('TC-PS-011 Verify system handles unsupported/unsafe special characters gracefully in search query', async ({ productSearchPage }) => {
    const searchTerm = "`!@#$%^&*()_+"; // Common special characters, potentially for SQLi/XSS
    await productSearchPage.search(searchTerm);
    // Expected Result: No results found message, or a message indicating invalid characters
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    // Or if there's a specific message for invalid characters
    // await expect(productSearchPage.validationMessage).toContainText("Invalid characters in search term.");
  });

  // TC-PS-012: Search query exceeding maximum length
  test('TC-PS-012 Verify invalid input validation for search query exceeding max length', async ({ productSearchPage }) => {
    const longSearchTerm = 'A'.repeat(MAX_SEARCH_QUERY_LENGTH + 10); // 110 'A's
    await productSearchPage.searchInput.fill(longSearchTerm);

    // Option A (Preferred): Input field client-side limits the input
    const currentInputValue = await productSearchPage.searchInput.inputValue();
    expect(currentInputValue.length).toBeLessThanOrEqual(MAX_SEARCH_QUERY_LENGTH);

    // Attempt to search the truncated value
    await productSearchPage.searchButton.click();
    await productSearchPage.expectNoProductsDisplayed(); // Assuming 'A' repeated 100 times yields no results
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-013: UI - Search bar visibility and placeholder
  test('TC-PS-013 Verify search bar visibility, accessibility, and placeholder text', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEditable(); // Ensures it's interactive
    await expect(productSearchPage.searchInput).toHaveAttribute('placeholder', /search product|search by name or sku/i);

    // Test responsiveness (example for one breakpoint, expand for more)
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await expect(productSearchPage.searchInput).toBeVisible(); // Should still be visible on mobile
    // Add assertions for layout/position if specific responsive behavior is expected
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop viewport
    await expect(productSearchPage.searchInput).toBeVisible();
  });

  // TC-PS-014: UI - Search button functionality
  test('TC-PS-014 Verify clicking search button initiates search functionality', async ({ productSearchPage }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.searchInput.fill(searchTerm);
    await productSearchPage.searchButton.click();
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
  });

  // TC-PS-015: UI - Enter key functionality in search bar
  test('TC-PS-015 Verify pressing Enter key in search bar initiates search functionality', async ({ productSearchPage }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(searchTerm, 'enter'); // Use 'enter' method
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
  });

  // TC-PS-016: UI - Search results display
  test('TC-PS-016 Verify search results are displayed clearly and correctly formatted', async ({ productSearchPage }) => {
    const searchTerm = 'Laptop'; // Partial search to get multiple results potentially
    await productSearchPage.search(searchTerm);

    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards()).toHaveCount(expect.any(Number)); // Expect at least one product
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_NAME)).toBeVisible();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible();

    // Verify each product card links to its detail page (via clicking name/image) - covered in TC-PS-021
    // For this test, just verify the structure is present for multiple results (if applicable)
    const productCount = await productSearchPage.getAllProductCards().count();
    if (productCount > 1) {
      await expect(productSearchPage.getProductCardByIndex(1).locator(SELECTORS.PRODUCT_CARD_NAME)).toBeVisible();
    }
  });

  // TC-PS-017: API - Successful product search by name
  test('TC-PS-017 API Verify successful product search by name via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.GAMING_KEYBOARD_RGB.name;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await api.expectProductInApiResponse(response, PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);
  });

  // TC-PS-018: API - Product search by SKU
  test('TC-PS-018 API Verify successful product search by SKU via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.sku;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await api.expectProductInApiResponse(response, PRODUCT_DATA.WIRELESS_MOUSE.name);
  });

  // TC-PS-019: API - No search results
  test('TC-PS-019 API Verify API endpoint response for no matching products', async ({ api }) => {
    const searchTerm = 'NonExistentAPIProduct';
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200); // Or 204 No Content, depending on API design
    await api.expectEmptyApiResponse(response);
  });

  // TC-PS-020: API - Missing query parameter
  test('TC-PS-020 API Verify API endpoint handles missing search query parameter', async ({ api }) => {
    const response = await api.searchProductsWithoutQuery();

    await expect(response.status()).toBe(400); // Bad Request
    const jsonResponse = await response.json();
    expect(jsonResponse.message).toContain('Query parameter'); // Generic check for an error message
  });

  // TC-PS-021: Integration - Search results link to Product Detail Page
  test('TC-PS-021 Verify clicking a search result navigates to the correct Product Detail Page', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.EXTERNAL_SSD_1TB.name;
    await productSearchPage.search(searchTerm);

    const productCard = productSearchPage.getAllProductCards().first();
    await expect(productCard).toBeVisible();

    // Click on the product name or image to navigate
    await productCard.locator(SELECTORS.PRODUCT_CARD_NAME).click();
    await page.waitForURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}.*`)); // Wait for navigation

    await productSearchPage.expectProductDetailPage(PRODUCT_DATA.EXTERNAL_SSD_1TB.name, PRODUCT_DATA.EXTERNAL_SSD_1TB.sku);
  });

  // TC-PS-022: Integration - Search functionality with product catalog updates
  test.skip('TC-PS-022 Verify newly added products are searchable immediately (simulated)', async ({ productSearchPage }) => {
    // This test ideally requires a setup hook to add a product to the backend dynamically.
    // For demonstration, we'll assume PRODUCT_DATA.BRAND_NEW_GADGET was just added.
    // In a real scenario, use globalSetup/teardown or an API call within a `test.beforeAll` to add/remove test data.

    const newProductName = PRODUCT_DATA.BRAND_NEW_GADGET.name;
    const newProductSku = PRODUCT_DATA.BRAND_NEW_GADGET.sku;

    // Search by name
    await productSearchPage.search(newProductName);
    await productSearchPage.expectProductToBeDisplayed(newProductName);

    // Search by SKU
    await productSearchPage.search(newProductSku);
    await productSearchPage.expectProductToBeDisplayed(newProductName);
  });

  // TC-PS-023: Security - SQL Injection attempt in search query
  test('TC-PS-023 Security Verify protection against SQL Injection via search input', async ({ productSearchPage, page }) => {
    const sqlInjectionTerms = [
      `' OR '1'='1`,
      `'; DROP TABLE products; --`,
    ];

    for (const term of sqlInjectionTerms) {
      await productSearchPage.search(term);
      // Assert no unexpected products are returned (like the entire catalog)
      await productSearchPage.expectNoProductsDisplayed();
      await productSearchPage.expectNoResultsMessageToBeDisplayed();
      // Also assert no error messages indicating a backend SQL error
      await expect(page.locator('body')).not.toContainText(/sql error|database error/i);
      // Re-navigate to clear state for next attempt
      await productSearchPage.navigateToHomePage();
    }
  });

  // TC-PS-024: Security - Cross-Site Scripting (XSS) attempt in search query
  test('TC-PS-024 Security Verify protection against XSS via search input', async ({ productSearchPage, page }) => {
    const xssAttackTerms = [
      `<script>alert('XSS')</script>`,
      `<img src=x onerror=alert('XSS')>`,
    ];

    page.on('dialog', async dialog => {
      // If an alert dialog appears, it means XSS was successful. Fail the test.
      expect(false, `XSS attack successful: ${dialog.message()}`).toBeTruthy();
      await dialog.dismiss();
    });

    for (const term of xssAttackTerms) {
      await productSearchPage.search(term);
      // The search term should be rendered as plain text, not executed as script.
      // Assert the page content does not contain unescaped script tags
      await expect(page.locator('body')).not.toContainText(/<script>alert/i);
      // The search query itself might be displayed on the page, verify it's escaped
      await expect(productSearchPage.page.locator(SELECTORS.SEARCH_INPUT)).toHaveValue(term); // Input value might contain it
      await expect(page.locator('body')).not.toContainHTML(term); // Should not be rendered as HTML
      await productSearchPage.navigateToHomePage();
    }
  });

  // TC-PS-025: Performance - Search response time for common queries
  test('TC-PS-025 Performance Measure search response time for a common product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`TC-PS-025: Search for "${searchTerm}" took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(2000); // Example threshold: 2 seconds
  });

  // TC-PS-026: Performance - Search response time for uncommon queries (no results)
  test('TC-PS-026 Performance Measure search response time for a non-existent product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'NonexistentProductXYZ';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`TC-PS-026: Search for "${searchTerm}" (no results) took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(1500); // Example threshold: 1.5 seconds
  });

  // TC-PS-027: Error Handling - Backend search service unavailable (Not automatable in UI without mocking)
  // This test case (`TC-PS-027`) is marked as "No" for automation candidacy due to manual backend simulation.
  // However, it can be partially automated by mocking the API response.
  test('TC-PS-027 Error Handling Verify user-friendly error message when search service is unavailable (mocked)', async ({ productSearchPage, page }) => {
    // Mock the API response to simulate a backend error
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}`), async route => {
      await route.fulfill({
        status: 500, // Internal Server Error
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error: Search service temporarily unavailable.' }),
      });
    });

    const searchTerm = 'Any Product';
    await productSearchPage.search(searchTerm);

    // Expect a user-friendly error message on the UI
    await expect(page.locator('text=' + UI_MESSAGES.GENERIC_ERROR)).toBeVisible();
    await productSearchPage.expectNoProductsDisplayed();
  });

  // TC-PS-028: Pagination on search results page
  test('TC-PS-028 Verify pagination functionality on search results page', async ({ productSearchPage, page }) => {
    // Assuming 'Mouse' returns many results that span multiple pages
    const searchTerm = 'Mouse';
    await productSearchPage.search(searchTerm);

    // Verify pagination controls are visible
    await expect(productSearchPage.paginationContainer).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeVisible();
    await expect(productSearchPage.paginationPrevButton).toBeHidden(); // First page usually doesn't show Prev

    // Click on the 'Next' button or page '2'
    await productSearchPage.clickPaginationLink('Next'); // Or '2' if numerical links are present
    await expect(page).toHaveURL(/page=2/); // Verify URL changes to indicate page 2
    await expect(productSearchPage.getAllProductCards()).toBeVisible(); // Ensure products are displayed
    await expect(productSearchPage.paginationPrevButton).toBeVisible(); // Prev should now be visible

    // Click on 'Previous' or page '1'
    await productSearchPage.clickPaginationLink('Previous'); // Or '1'
    await expect(page).toHaveURL(/page=1/); // Verify URL changes back to page 1
    await expect(productSearchPage.getAllProductCards()).toBeVisible(); // Ensure products are displayed
    await expect(productSearchPage.paginationPrevButton).toBeHidden(); // Prev should be hidden again
  });

  // TC-PS-029: Search by multiple keywords in any order
  test('TC-PS-029 Verify search by multiple keywords in any order', async ({ productSearchPage }) => {
    // Assuming products "Gaming Keyboard RGB" and "RGB Gaming Mouse" exist
    const searchTerm1 = 'Gaming RGB'; // "Gaming" then "RGB"
    const searchTerm2 = 'RGB Gaming'; // "RGB" then "Gaming"

    // Test 1: "Gaming RGB"
    await productSearchPage.search(searchTerm1);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await productSearchPage.navigateToHomePage(); // Reset for next search

    // Test 2: "RGB Gaming"
    await productSearchPage.search(searchTerm2);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
  });

  // TC-PS-030: Accessibility - Search bar keyboard navigation
  test('TC-PS-030 Accessibility Verify search bar is keyboard navigatable and usable', async ({ productSearchPage, page }) => {
    await page.keyboard.press('Tab'); // Tab to the first interactive element
    // Keep tabbing until search input is focused. This assumes a typical page layout.
    // More robust would be to assert active element.
    await expect(productSearchPage.searchInput).toBeFocused();

    const searchTerm = 'Accessibility Test';
    await page.keyboard.type(searchTerm); // Type using keyboard
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await page.keyboard.press('Tab'); // Tab to the search button
    await expect(productSearchPage.searchButton).toBeFocused();

    await page.keyboard.press('Enter'); // Activate search button
    await productSearchPage.expectNoProductsDisplayed(); // Assuming no results for this term
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-031: Browser back/forward button functionality after search
  test('TC-PS-031 Verify browser back/forward buttons work correctly after a search', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.MONITOR.name;
    const homePageUrl = productSearchPage.page.url();

    // Perform a search
    await productSearchPage.search(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    const searchResultsUrl = productSearchPage.page.url();

    // Click browser back button
    await page.goBack();
    await expect(page).toHaveURL(homePageUrl); // Should be back on the home page

    // Click browser forward button
    await page.goForward();
    await expect(page).toHaveURL(searchResultsUrl); // Should be back on search results
    await productSearchPage.expectProductToBeDisplayed(searchTerm); // Results should be preserved
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Search input value should be preserved
  });
});
```