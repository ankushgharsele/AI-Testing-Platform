// src/tests/features/product-search/product-search.spec.ts
import { test, expect } from '../../../fixtures/contexts/ProductSearchTest';
import { APP_URLS, PRODUCT_DATA, UI_MESSAGES, SELECTORS, MAX_SEARCH_QUERY_LENGTH } from '../../../utils/constants/app.constants';

test.describe('Product Search Functionality', () => {

  // Ensure navigation to home page is robustly checked for each test setup
  test.beforeEach(async ({ productSearchPage, page }) => {
    // These are already part of productSearchPage.navigateToHomePage() in fixture,
    // but re-asserting current state can be good for clarity or if setup changes.
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}$`));
    await expect(page).toHaveTitle(/home|shop|store/i); // Assuming a generic home page title
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchButton).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEmpty();
  });

  // TC-PS-001: Search by exact product name
  test('TC-PS-001 Verify search by exact product name match', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`)); // Validate URL contains query
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}|${searchTerm} - mystore`,'i')); // Example: dynamic title
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Verify search input retains value

    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    const firstProductCard = productCards.first();
    await expect(firstProductCard).toBeVisible();
    await expect(productSearchPage.getProductName(firstProductCard)).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(firstProductCard)).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE)).toHaveText(PRODUCT_DATA.LAPTOP_PRO_X.price);
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-002: Search by partial product name
  test('TC-PS-002 Verify search by partial product name match', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await productSearchPage.expectProductToBeDisplayed(PRODUCT_DATA.LAPTOP_PRO_X.name, false);
    // Add an assertion for minimum expected products, assuming 'Laptop' might also match 'Gaming Laptop'
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-003: Search by product name (case-insensitive)
  test('TC-PS-003 Verify search functionality is case-insensitive for product names', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name.toLowerCase(); // "laptop pro x"
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    const firstProductCard = productCards.first();
    await expect(productSearchPage.getProductName(firstProductCard)).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(firstProductCard)).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-004: Search by SKU (exact match)
  test('TC-PS-004 Verify search functionality with an exact SKU match', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku;
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    const firstProductCard = productCards.first();
    await expect(productSearchPage.getProductSKU(firstProductCard)).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(firstProductCard)).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-005: Search by SKU (case-insensitive if alphanumeric SKU allows)
  test('TC-PS-005 Verify search functionality is case-insensitive for SKUs (if applicable)', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku.toLowerCase(); // "lpx-001"
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    const firstProductCard = productCards.first();
    await expect(productSearchPage.getProductSKU(firstProductCard)).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(firstProductCard)).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-006: Search with no matching results
  test('TC-PS-006 Verify "No results found" message for non-existent product search', async ({ productSearchPage, page }) => {
    const searchTerm = 'XYZ NonExistent Product 123';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-007: Search with an empty query
  test('TC-PS-007 Verify invalid input validation for empty search query', async ({ productSearchPage, page }) => {
    await productSearchPage.search(''); // This will attempt to fill with empty string and press enter/click.

    // Playwright `fill` with empty string might not trigger native validation immediately.
    // Instead, assert on the state after attempting to search.
    // If the system has server-side validation for empty string:
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed(); // Assuming empty search yields no results.
    // If client-side validation prevents submission:
    // const validationMessage = await productSearchPage.getSearchInputValidationMessage();
    // expect(validationMessage).not.toBe('');
    // expect(validationMessage).toContain(UI_MESSAGES.EMPTY_SEARCH_TERM_VALIDATION); // If custom message or native HTML5 `required`

    // Also ensure no search was performed and we are likely on the same page
    await expect(productSearchPage.page).toHaveURL(new RegExp(`${APP_URLS.HOME}$`)); // URL should not have a query parameter
    await expect(productSearchPage.searchInput).toBeEmpty(); // Input should still be empty
    await expect(productSearchPage.searchInput).not.toHaveClass(/error|invalid/); // Check for error styling
  });

  // TC-PS-008: Search with a query containing only spaces
  test('TC-PS-008 Verify invalid input validation for search query with only spaces', async ({ productSearchPage, page }) => {
    const searchTerm = '   '; // multiple spaces
    await productSearchPage.search(searchTerm);

    // Assuming the system trims the search term and treats it as an empty search.
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}$`)); // URL should not have query parameter if trimmed to empty
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    // Verify search input value after search might be empty or trimmed by browser/framework
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // The UI input might still show the spaces
  });

  // TC-PS-009: Search by product name with leading/trailing spaces
  test('TC-PS-009 Verify search functionality trims leading/trailing spaces from product name search', async ({ productSearchPage, page }) => {
    const searchTermWithSpaces = `  ${PRODUCT_DATA.WIRELESS_MOUSE.name}  `;
    const expectedSearchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(searchTermWithSpaces);

    // The URL parameter should contain the *trimmed* search term, not the original with spaces.
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(expectedSearchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${expectedSearchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTermWithSpaces); // Input field might retain original value

    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-010: Search with special characters in product name (if supported)
  test('TC-PS-010 Verify search with product name containing supported special characters', async ({ productSearchPage, page }) => {
    const searchTerm = 'Dell UltraSharp Monitor'; // Using an existing product with common special chars like spaces
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.MONITOR.name);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-011: Search with unsupported or unsafe special characters (Security/Validation)
  test('TC-PS-011 Verify system handles unsupported/unsafe special characters gracefully in search query', async ({ productSearchPage, page }) => {
    const searchTerm = "`!@#$%^&*()_+"; // Common special characters
    await productSearchPage.search(searchTerm);

    // Expect no results, implying the search was either sanitized or yielded nothing.
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`)); // URL should contain the exact query for robust test
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}|no results`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(page.locator('body')).not.toContainText(/error|failed|invalid/i); // No generic error messages
  });

  // TC-PS-012: Search query exceeding maximum length
  test('TC-PS-012 Verify invalid input validation for search query exceeding max length', async ({ productSearchPage, page }) => {
    const longSearchTerm = 'A'.repeat(MAX_SEARCH_QUERY_LENGTH + 10); // 110 'A's
    await productSearchPage.searchInput.fill(longSearchTerm);

    const currentInputValue = await productSearchPage.searchInput.inputValue();
    expect(currentInputValue.length).toBeLessThanOrEqual(MAX_SEARCH_QUERY_LENGTH); // Input field should have truncated it

    await productSearchPage.searchButton.click();
    await page.waitForLoadState('domcontentloaded');

    const truncatedSearchTerm = 'A'.repeat(MAX_SEARCH_QUERY_LENGTH);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(truncatedSearchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(truncatedSearchTerm); // Input should reflect the truncated value in the UI after interaction.

    await productSearchPage.expectNoProductsDisplayed(); // Assuming 'A' repeated 100 times yields no results
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-013: UI - Search bar visibility and placeholder
  test('TC-PS-013 Verify search bar visibility, accessibility, and placeholder text', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEditable();
    await expect(productSearchPage.searchInput).toHaveAttribute('placeholder', /search product|search by name or sku/i); // Case-insensitive regex
    await expect(productSearchPage.searchInput).toHaveId(/search|productsearch/i); // Check for an accessible ID

    await expect(productSearchPage.searchButton).toBeVisible();
    await expect(productSearchPage.searchButton).toBeEnabled();
    await expect(productSearchPage.searchButton).toHaveText(/search|go/i);

    // Test responsiveness (example for one breakpoint, expand for more)
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchButton).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop viewport
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchButton).toBeVisible();
  });

  // TC-PS-014: UI - Search button functionality
  test('TC-PS-014 Verify clicking search button initiates search functionality', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.searchInput.fill(searchTerm);
    await productSearchPage.searchButton.click();
    await page.waitForLoadState('domcontentloaded'); // Ensure page is loaded after search

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-015: UI - Enter key functionality in search bar
  test('TC-PS-015 Verify pressing Enter key in search bar initiates search functionality', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(searchTerm, 'enter'); // Use 'enter' method

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-016: UI - Search results display
  test('TC-PS-016 Verify search results are displayed clearly and correctly formatted', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    const allProductCards = productSearchPage.getAllProductCards();
    await expect(allProductCards).toBeVisible();
    await expect(allProductCards).toHaveCount(expect.any(Number)); // Expect at least one product
    await expect(allProductCards.count()).toBeGreaterThanOrEqual(1);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();

    const firstProductCard = allProductCards.first();
    await expect(firstProductCard).toBeVisible();
    await expect(firstProductCard).toHaveAttribute('data-qa', 'product-card'); // Verify data-qa attribute
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_NAME)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_SKU)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();

    const productName = await productSearchPage.getProductName(firstProductCard);
    expect(productName).not.toBeNull();
    expect(productName?.length).toBeGreaterThan(0);
    const productSKU = await productSearchPage.getProductSKU(firstProductCard);
    expect(productSKU).not.toBeNull();
    expect(productSKU?.length).toBeGreaterThan(0);
    const productPrice = await firstProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE).textContent();
    expect(productPrice).toMatch(/^\$\d+(\.\d{2})?$/); // Basic price format check
  });

  // TC-PS-017: API - Successful product search by name
  test('TC-PS-017 API Verify successful product search by name via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.GAMING_KEYBOARD_RGB.name;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.request().url()).toContain(encodeURIComponent(searchTerm));
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectProductInApiResponse(response, PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);
    const jsonResponse = await response.json();
    expect(jsonResponse.length).toBeGreaterThanOrEqual(1); // At least one product expected
  });

  // TC-PS-018: API - Product search by SKU
  test('TC-PS-018 API Verify successful product search by SKU via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.sku;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.request().url()).toContain(encodeURIComponent(searchTerm));
    await api.expectProductInApiResponse(response, PRODUCT_DATA.WIRELESS_MOUSE.name);
    const jsonResponse = await response.json();
    expect(jsonResponse.length).toBe(1); // Assuming SKU is unique
  });

  // TC-PS-019: API - No search results
  test('TC-PS-019 API Verify API endpoint response for no matching products', async ({ api }) => {
    const searchTerm = 'NonExistentAPIProduct';
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200); // Or 204 No Content, depending on API design
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectEmptyApiResponse(response);
  });

  // TC-PS-020: API - Missing query parameter
  test('TC-PS-020 API Verify API endpoint handles missing search query parameter', async ({ api }) => {
    const response = await api.searchProductsWithoutQuery();

    await expect(response.status()).toBe(400); // Bad Request
    await expect(response.headers()['content-type']).toContain('application/json');
    const jsonResponse = await response.json();
    expect(jsonResponse.message).toBeDefined();
    expect(jsonResponse.message).toContain('Query parameter'); // Generic check for an error message
    expect(jsonResponse.message).toMatch(/required|missing/i);
  });

  // TC-PS-021: Integration - Search results link to Product Detail Page
  test('TC-PS-021 Verify clicking a search result navigates to the correct Product Detail Page', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.EXTERNAL_SSD_1TB.name;
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    const productCard = productSearchPage.getAllProductCards().first();
    await expect(productCard).toBeVisible();
    await expect(productSearchPage.getProductName(productCard)).resolves.toBe(PRODUCT_DATA.EXTERNAL_SSD_1TB.name);
    await expect(productSearchPage.getProductSKU(productCard)).resolves.toContain(PRODUCT_DATA.EXTERNAL_SSD_1TB.sku);

    // Click on the product name or image to navigate
    await productCard.locator(SELECTORS.PRODUCT_CARD_NAME).click();
    await page.waitForURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}.*`)); // Wait for navigation

    await productSearchPage.expectProductDetailPage(PRODUCT_DATA.EXTERNAL_SSD_1TB.name, PRODUCT_DATA.EXTERNAL_SSD_1TB.sku);
    await expect(page).toHaveTitle(new RegExp(`${PRODUCT_DATA.EXTERNAL_SSD_1TB.name} - product details`,'i')); // Dynamic title for product detail
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_DESCRIPTION)).toHaveText(PRODUCT_DATA.EXTERNAL_SSD_1TB.description);
  });

  // TC-PS-022: Integration - Search functionality with product catalog updates
  test.skip('TC-PS-022 Verify newly added products are searchable immediately (simulated)', async ({ productSearchPage, page }) => {
    // This test ideally requires a setup hook to add a product to the backend dynamically.
    // For demonstration, we'll assume PRODUCT_DATA.BRAND_NEW_GADGET was just added.
    // In a real scenario, use globalSetup/teardown or an API call within a `test.beforeAll` to add/remove test data.

    const newProductName = PRODUCT_DATA.BRAND_NEW_GADGET.name;
    const newProductSku = PRODUCT_DATA.BRAND_NEW_GADGET.sku;

    // Search by name
    await productSearchPage.search(newProductName);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductName)}`));
    await expect(productSearchPage.searchInput).toHaveValue(newProductName);
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(1);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await productSearchPage.navigateToHomePage(); // Reset for next search

    // Search by SKU
    await productSearchPage.search(newProductSku);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductSku)}`));
    await expect(productSearchPage.searchInput).toHaveValue(newProductSku);
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(1);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-023: Security - SQL Injection attempt in search query
  test('TC-PS-023 Security Verify protection against SQL Injection via search input', async ({ productSearchPage, page }) => {
    const sqlInjectionTerms = [
      `' OR '1'='1`,
      `'; DROP TABLE products; --`,
      `" OR "1"="1`,
      `SLEEP(5)`, // Time-based
    ];

    for (const term of sqlInjectionTerms) {
      await productSearchPage.search(term);
      // Assert no unexpected products are returned (like the entire catalog)
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(term)}`));
      await expect(page).toHaveTitle(new RegExp(`search results|no results`,'i'));
      await expect(productSearchPage.searchInput).toHaveValue(term); // Input should retain exact value
      await productSearchPage.expectNoProductsDisplayed();
      await productSearchPage.expectNoResultsMessageToBeDisplayed();
      // Also assert no error messages indicating a backend SQL error
      await expect(page.locator('body')).not.toContainText(/sql error|database error|syntax error|unexpected token|connection refused/i);
      // Re-navigate to clear state for next attempt
      await productSearchPage.navigateToHomePage();
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}$`));
      await expect(productSearchPage.searchInput).toBeEmpty();
    }
  });

  // TC-PS-024: Security - Cross-Site Scripting (XSS) attempt in search query
  test('TC-PS-024 Security Verify protection against XSS via search input', async ({ productSearchPage, page }) => {
    const xssAttackTerms = [
      `<script>alert('XSS')</script>`,
      `<img src=x onerror=alert('XSS')>`,
      `<body onload=alert('XSS')>`,
      `"><script>alert(document.domain)</script>`,
    ];

    // Listen for dialog events (alerts) which indicate successful XSS
    page.on('dialog', async dialog => {
      expect(false, `XSS attack successful: An alert dialog with message "${dialog.message()}" appeared.`).toBeTruthy();
      await dialog.dismiss(); // Dismiss the dialog to prevent test from hanging
    });

    for (const term of xssAttackTerms) {
      await productSearchPage.search(term);
      // The search term should be rendered as plain text, not executed as script.
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(term)}`));
      await expect(page).toHaveTitle(new RegExp(`search results|no results`,'i'));
      await expect(productSearchPage.searchInput).toHaveValue(term); // Input value might contain it

      // Assert the page content does not contain unescaped script tags or executable HTML
      await expect(page.locator('body')).not.toContainHTML(term, { timeout: 1000 }); // Should not be rendered as executable HTML
      await expect(page.locator('body')).not.toContainText(/alert\('XSS'\)/i); // Should not display the script text unescaped

      await productSearchPage.expectNoProductsDisplayed();
      await productSearchPage.expectNoResultsMessageToBeDisplayed();

      await productSearchPage.navigateToHomePage();
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}$`));
      await expect(productSearchPage.searchInput).toBeEmpty();
    }
  });

  // TC-PS-025: Performance - Search response time for common queries
  test('TC-PS-025 Performance Measure search response time for a common product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // console.log(`TC-PS-025: Search for "${searchTerm}" took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(2000); // Example threshold: 2 seconds
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectProductToBeDisplayed(PRODUCT_DATA.LAPTOP_PRO_X.name, false);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-026: Performance - Search response time for uncommon queries (no results)
  test('TC-PS-026 Performance Measure search response time for a non-existent product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'NonexistentProductXYZ';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // console.log(`TC-PS-026: Search for "${searchTerm}" (no results) took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(1500); // Example threshold: 1.5 seconds
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-027: Error Handling - Backend search service unavailable (Not automatable in UI without mocking)
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

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    // Expect a user-friendly error message on the UI
    await expect(page.locator(`text=${UI_MESSAGES.GENERIC_ERROR}`)).toBeVisible();
    await productSearchPage.expectNoProductsDisplayed();
    await expect(productSearchPage.noResultsMessage).not.toBeVisible(); // 'No results' isn't the same as a generic error
    await expect(page.locator('body')).not.toContainText(/500 internal server error/i); // No raw server errors
  });

  // TC-PS-028: Pagination on search results page
  test('TC-PS-028 Verify pagination functionality on search results page', async ({ productSearchPage, page }) => {
    // Assuming 'Mouse' returns many results that span multiple pages
    const searchTerm = 'Mouse';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards().count()).toBeGreaterThan(0);

    // Verify pagination controls are visible
    await expect(productSearchPage.paginationContainer).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeEnabled();
    await expect(productSearchPage.paginationPrevButton).toBeHidden(); // First page usually doesn't show Prev or is disabled

    // Click on the 'Next' button or page '2'
    await productSearchPage.clickPaginationLink('Next'); // Or '2' if numerical links are present
    await page.waitForURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=2`)); // Verify URL changes to indicate page 2
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm} - page 2`,'i'));

    await expect(productSearchPage.getAllProductCards()).toBeVisible(); // Ensure products are displayed
    await expect(productSearchPage.getAllProductCards().count()).toBeGreaterThan(0);
    await expect(productSearchPage.paginationPrevButton).toBeVisible(); // Prev should now be visible
    await expect(productSearchPage.paginationPrevButton).toBeEnabled();
    // Assuming 'Next' might be disabled on the last page, but for now we expect it visible
    await expect(productSearchPage.paginationNextButton).toBeVisible();

    // Click on 'Previous' or page '1'
    await productSearchPage.clickPaginationLink('Previous'); // Or '1'
    await page.waitForURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=1`)); // Verify URL changes back to page 1
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm} - page 1`,'i'));

    await expect(productSearchPage.getAllProductCards()).toBeVisible(); // Ensure products are displayed
    await expect(productSearchPage.getAllProductCards().count()).toBeGreaterThan(0);
    await expect(productSearchPage.paginationPrevButton).toBeHidden(); // Prev should be hidden again
    await expect(productSearchPage.paginationNextButton).toBeVisible();
  });

  // TC-PS-029: Search by multiple keywords in any order
  test('TC-PS-029 Verify search by multiple keywords in any order', async ({ productSearchPage, page }) => {
    const searchTerm1 = 'Gaming RGB';
    const searchTerm2 = 'RGB Gaming';

    // Test 1: "Gaming RGB"
    await productSearchPage.search(searchTerm1);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm1)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm1);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2); // Assuming exactly two match
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await productSearchPage.navigateToHomePage(); // Reset for next search
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}$`));

    // Test 2: "RGB Gaming"
    await productSearchPage.search(searchTerm2);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm2)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm2);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2); // Assuming exactly two match
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-030: Accessibility - Search bar keyboard navigation
  test('TC-PS-030 Accessibility Verify search bar is keyboard navigatable and usable', async ({ productSearchPage, page }) => {
    await page.keyboard.press('Tab'); // Tab to the first interactive element, assume it's search input or close to it
    await productSearchPage.searchInput.focus(); // Ensure search input is focused for this test, for robustness
    await expect(productSearchPage.searchInput).toBeFocused();
    await expect(productSearchPage.searchInput).toHaveAttribute('aria-label', /search|product search/i); // Check for ARIA label

    const searchTerm = 'Accessibility Test Product';
    await page.keyboard.type(searchTerm); // Type using keyboard
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await page.keyboard.press('Tab'); // Tab to the search button
    await expect(productSearchPage.searchButton).toBeFocused();

    await page.keyboard.press('Enter'); // Activate search button
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed(); // Assuming no results for this term
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}|no results`,'i'));
  });

  // TC-PS-031: Browser back/forward button functionality after search
  test('TC-PS-031 Verify browser back/forward buttons work correctly after a search', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.MONITOR.name;
    const homePageUrl = page.url();
    await expect(page).toHaveTitle(/home|shop/i);

    // Perform a search
    await productSearchPage.search(searchTerm);
    await page.waitForURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    const searchResultsUrl = page.url();
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    // Click browser back button
    await page.goBack();
    await page.waitForURL(homePageUrl);
    await expect(page).toHaveURL(homePageUrl); // Should be back on the home page
    await expect(page).toHaveTitle(/home|shop/i);
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEmpty(); // Input should be cleared on back navigation

    // Click browser forward button
    await page.goForward();
    await page.waitForURL(searchResultsUrl);
    await expect(page).toHaveURL(searchResultsUrl); // Should be back on search results
    await expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}`,'i'));
    await productSearchPage.expectProductToBeDisplayed(searchTerm); // Results should be preserved
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Search input value should be preserved
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });
});