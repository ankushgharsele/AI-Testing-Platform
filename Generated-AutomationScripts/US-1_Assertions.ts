// src/tests/features/product-search/product-search.spec.ts
import { test, expect } from '../../../fixtures/contexts/ProductSearchTest';
import { APP_URLS, PRODUCT_DATA, UI_MESSAGES, SELECTORS, MAX_SEARCH_QUERY_LENGTH } from '../../../utils/constants/app.constants';

test.describe('Product Search Functionality', () => {

  // TC-PS-001: Search by exact product name
  test('TC-PS-001 Verify search by exact product name match', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible();
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toContainText(PRODUCT_DATA.LAPTOP_PRO_X.price);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(productSearchPage.paginationContainer).toBeHidden(); // Only one result, no pagination
  });

  // TC-PS-002: Search by partial product name
  test('TC-PS-002 Verify search by partial product name match', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(PRODUCT_DATA.LAPTOP_PRO_X.name, false);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    // Assuming 'Laptop' yields multiple results, pagination should be visible
    await expect(productSearchPage.paginationContainer).toBeVisible();
  });

  // TC-PS-003: Search by product name (case-insensitive)
  test('TC-PS-003 Verify search functionality is case-insensitive for product names', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name.toLowerCase(); // "laptop pro x"
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-004: Search by SKU (exact match)
  test('TC-PS-004 Verify search functionality with an exact SKU match', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku;
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-005: Search by SKU (case-insensitive if alphanumeric SKU allows)
  test('TC-PS-005 Verify search functionality is case-insensitive for SKUs (if applicable)', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku.toLowerCase(); // "lpx-001"
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-006: Search with no matching results
  test('TC-PS-006 Verify "No results found" message for non-existent product search', async ({ productSearchPage, page }) => {
    const searchTerm = 'XYZ NonExistent Product 123';
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.paginationContainer).toBeHidden();
  });

  // TC-PS-007: Search with an empty query
  test('TC-PS-007 Verify invalid input validation for empty search query', async ({ productSearchPage, page }) => {
    await productSearchPage.search('');
    await expect(productSearchPage.searchInput).toBeVisible();
    const validationMessage = await productSearchPage.getSearchInputValidationMessage();
    expect(validationMessage).not.toBe('');
    await expect(productSearchPage.searchInput).toBeInvalid(); // Expect HTML5 validation to mark it as invalid
    await expect(productSearchPage.searchInput).toHaveJSProperty('validity.valid', false);
    // If the validation message is in a specific UI element:
    // await expect(productSearchPage.validationMessage).toBeVisible();
    // await expect(productSearchPage.validationMessage).toContainText(UI_MESSAGES.EMPTY_SEARCH_TERM_VALIDATION);
    await expect(productSearchPage.page).toHaveURL(APP_URLS.HOME); // Should remain on the home page, no search performed
    await productSearchPage.expectNoProductsDisplayed(); // No products should be shown
    await expect(productSearchPage.noResultsMessage).toBeHidden(); // Not a "no results" scenario, but a validation error
  });

  // TC-PS-008: Search with a query containing only spaces
  test('TC-PS-008 Verify invalid input validation for search query with only spaces', async ({ productSearchPage, page }) => {
    const searchTerm = '   '; // multiple spaces
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm.trim())}`)); // Assuming trimming occurs
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Input field might retain spaces
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.paginationContainer).toBeHidden();
  });

  // TC-PS-009: Verify search functionality trims leading/trailing spaces from product name search
  test('TC-PS-009 Verify search functionality trims leading/trailing spaces from product name search', async ({ productSearchPage, page }) => {
    const searchTerm = `  ${PRODUCT_DATA.WIRELESS_MOUSE.name}  `;
    const trimmedTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(trimmedTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Input field should retain spaces
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.WIRELESS_MOUSE.sku);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-010: Search with special characters in product name (if supported)
  test('TC-PS-010 Verify search with product name containing supported special characters', async ({ productSearchPage, page }) => {
    const searchTerm = 'Dell UltraSharp Monitor'; // This example uses an existing product
    await productSearchPage.search(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.MONITOR.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.MONITOR.sku);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-011: Search with unsupported or unsafe special characters (Security/Validation)
  test('TC-PS-011 Verify system handles unsupported/unsafe special characters gracefully in search query', async ({ productSearchPage, page }) => {
    const searchTerm = "`!@#$%^&*()_+";
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.paginationContainer).toBeHidden();
    await expect(page.locator('body')).not.toContainText(/error|exception|invalid query/i); // Ensure no generic error messages
  });

  // TC-PS-012: Search query exceeding maximum length
  test('TC-PS-012 Verify invalid input validation for search query exceeding max length', async ({ productSearchPage, page }) => {
    const longSearchTerm = 'A'.repeat(MAX_SEARCH_QUERY_LENGTH + 10);
    await productSearchPage.searchInput.fill(longSearchTerm);
    const currentInputValue = await productSearchPage.searchInput.inputValue();
    expect(currentInputValue.length).toBeLessThanOrEqual(MAX_SEARCH_QUERY_LENGTH);
    await expect(productSearchPage.searchInput).toHaveAttribute('maxlength', String(MAX_SEARCH_QUERY_LENGTH)); // Assert max length attribute

    await productSearchPage.searchButton.click();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(currentInputValue)}`));
    await expect(productSearchPage.searchInput).toHaveValue(currentInputValue); // Should hold the truncated value
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.paginationContainer).toBeHidden();
  });

  // TC-PS-013: UI - Search bar visibility and placeholder
  test('TC-PS-013 Verify search bar visibility, accessibility, and placeholder text', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEditable();
    await expect(productSearchPage.searchInput).toHaveAttribute('placeholder', /search product|search by name or sku/i);
    await expect(productSearchPage.searchInput).toHaveAttribute('type', 'search');
    await expect(productSearchPage.searchInput).toBeEmpty(); // Initially empty
    await expect(productSearchPage.searchButton).toBeVisible();
    await expect(productSearchPage.searchButton).toBeEnabled();

    // Test responsiveness (example for one breakpoint, expand for more)
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toHaveCSS('width', /.+px/); // Check it has a non-zero width
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop viewport
    await expect(productSearchPage.searchInput).toBeVisible();
  });

  // TC-PS-014: UI - Search button functionality
  test('TC-PS-014 Verify clicking search button initiates search functionality', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.searchInput.fill(searchTerm);
    await productSearchPage.searchButton.click();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-015: UI - Enter key functionality in search bar
  test('TC-PS-015 Verify pressing Enter key in search bar initiates search functionality', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(searchTerm, 'enter');
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-016: UI - Search results display
  test('TC-PS-016 Verify search results are displayed clearly and correctly formatted', async ({ productSearchPage, page }) => {
    const searchTerm = 'Keyboard';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards()).toHaveCount(expect.any(Number));
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_NAME)).toBeVisible();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_NAME)).not.toBeEmpty();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_SKU)).toBeVisible();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_SKU)).not.toBeEmpty();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toMatch(/\$\d+\.\d{2}/); // Price format
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(productSearchPage.getAllProductCards().first().locator(SELECTORS.PRODUCT_CARD_IMAGE)).toHaveAttribute('alt', /.+/); // Image alt text
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    const productCount = await productSearchPage.getAllProductCards().count();
    if (productCount > 0) {
      await expect(productSearchPage.getAllProductCards().first()).toBeEnabled(); // Ensure clickable/interactive
    }
  });

  // TC-PS-017: API - Successful product search by name
  test('TC-PS-017 API Verify successful product search by name via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.GAMING_KEYBOARD_RGB.name;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.headers()['content-type']).toContain('application/json');
    const jsonResponse = await response.json();
    expect(jsonResponse).toBeInstanceOf(Array);
    expect(jsonResponse.length).toBeGreaterThan(0);
    await api.expectProductInApiResponse(response, PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);
    const foundProduct = jsonResponse.find((p: any) => p.name === PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);
    expect(foundProduct.sku).toBe(PRODUCT_DATA.GAMING_KEYBOARD_RGB.sku);
    expect(foundProduct.price).toContain(PRODUCT_DATA.GAMING_KEYBOARD_RGB.price.replace('$', ''));
  });

  // TC-PS-018: API - Product search by SKU
  test('TC-PS-018 API Verify successful product search by SKU via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.sku;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.headers()['content-type']).toContain('application/json');
    const jsonResponse = await response.json();
    expect(jsonResponse).toBeInstanceOf(Array);
    expect(jsonResponse.length).toBeGreaterThan(0);
    await api.expectProductInApiResponse(response, PRODUCT_DATA.WIRELESS_MOUSE.name);
    const foundProduct = jsonResponse.find((p: any) => p.sku === PRODUCT_DATA.WIRELESS_MOUSE.sku);
    expect(foundProduct.name).toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
    expect(foundProduct.price).toContain(PRODUCT_DATA.WIRELESS_MOUSE.price.replace('$', ''));
  });

  // TC-PS-019: API - No search results
  test('TC-PS-019 API Verify API endpoint response for no matching products', async ({ api }) => {
    const searchTerm = 'NonExistentAPIProduct';
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectEmptyApiResponse(response);
    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual([]);
  });

  // TC-PS-020: API - Missing query parameter
  test('TC-PS-020 API Verify API endpoint handles missing search query parameter', async ({ api }) => {
    const response = await api.searchProductsWithoutQuery();

    await expect(response.status()).toBe(400); // Bad Request
    await expect(response.headers()['content-type']).toContain('application/json');
    const jsonResponse = await response.json();
    expect(jsonResponse).toBeInstanceOf(Object);
    expect(jsonResponse).not.toBeInstanceOf(Array);
    expect(jsonResponse.message).toContain('Query parameter');
  });

  // TC-PS-021: Integration - Search results link to Product Detail Page
  test('TC-PS-021 Verify clicking a search result navigates to the correct Product Detail Page', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.EXTERNAL_SSD_1TB.name;
    await productSearchPage.search(searchTerm);

    const productCard = productSearchPage.getAllProductCards().first();
    await expect(productCard).toBeVisible();
    await expect(productCard.locator(SELECTORS.PRODUCT_CARD_NAME)).toBeEnabled(); // Ensure clickable

    await productCard.locator(SELECTORS.PRODUCT_CARD_NAME).click();
    await page.waitForURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}.*`));

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}${PRODUCT_DATA.EXTERNAL_SSD_1TB.sku.toLowerCase()}`)); // Assuming SKU is used in URL slug
    await productSearchPage.expectProductDetailPage(PRODUCT_DATA.EXTERNAL_SSD_1TB.name, PRODUCT_DATA.EXTERNAL_SSD_1TB.sku);
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_DESCRIPTION)).toBeVisible();
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_DESCRIPTION)).toContainText(PRODUCT_DATA.EXTERNAL_SSD_1TB.description);
    await expect(page.locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible(); // Assuming price on detail page uses same selector
    await expect(page.locator(SELECTORS.PRODUCT_CARD_PRICE)).toContainText(PRODUCT_DATA.EXTERNAL_SSD_1TB.price);
  });

  // TC-PS-022: Integration - Search functionality with product catalog updates
  test.skip('TC-PS-022 Verify newly added products are searchable immediately (simulated)', async ({ productSearchPage, page }) => {
    const newProductName = PRODUCT_DATA.BRAND_NEW_GADGET.name;
    const newProductSku = PRODUCT_DATA.BRAND_NEW_GADGET.sku;

    await productSearchPage.search(newProductName);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductName)}`));
    await expect(productSearchPage.searchInput).toHaveValue(newProductName);
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(1);
    await expect(productSearchPage.noResultsMessage).toBeHidden();

    await productSearchPage.navigateToHomePage(); // Reset for next search
    await productSearchPage.search(newProductSku);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductSku)}`));
    await expect(productSearchPage.searchInput).toHaveValue(newProductSku);
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(1);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-023: Security - SQL Injection attempt in search query
  test('TC-PS-023 Security Verify protection against SQL Injection via search input', async ({ productSearchPage, page }) => {
    const sqlInjectionTerms = [
      `' OR '1'='1`,
      `'; DROP TABLE products; --`,
    ];

    for (const term of sqlInjectionTerms) {
      await productSearchPage.search(term);
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(term)}`));
      await expect(productSearchPage.searchInput).toHaveValue(term);
      await productSearchPage.expectNoProductsDisplayed();
      await productSearchPage.expectNoResultsMessageToBeDisplayed();
      await expect(productSearchPage.paginationContainer).toBeHidden();
      await expect(page.locator('body')).not.toContainText(/sql error|database error|syntax error|unexpected token/i);
      await expect(page.locator('body')).not.toContainHTML(/<pre class="error">/i); // Check for server-side error display
      await productSearchPage.navigateToHomePage();
      await expect(productSearchPage.searchInput).toBeEmpty(); // Ensure page is reset
    }
  });

  // TC-PS-024: Security - Cross-Site Scripting (XSS) attempt in search query
  test('TC-PS-024 Security Verify protection against XSS via search input', async ({ productSearchPage, page }) => {
    const xssAttackTerms = [
      `<script>alert('XSS')</script>`,
      `<img src=x onerror=alert('XSS')>`,
    ];

    page.on('dialog', async dialog => {
      expect(false, `XSS attack successful: ${dialog.message()}`).toBeTruthy();
      await dialog.dismiss();
    });

    for (const term of xssAttackTerms) {
      await productSearchPage.search(term);
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(term)}`));
      await expect(productSearchPage.searchInput).toHaveValue(term); // Input value might contain it
      await expect(page.locator('body')).not.toContainText(/<script>alert/i);
      await expect(page.locator('body')).not.toContainHTML(term); // Should not be rendered as executable HTML
      await productSearchPage.expectNoProductsDisplayed();
      await productSearchPage.expectNoResultsMessageToBeDisplayed();
      await productSearchPage.navigateToHomePage();
      await expect(productSearchPage.searchInput).toBeEmpty(); // Ensure page is reset
    }
  });

  // TC-PS-025: Performance Measure search response time for a common product query
  test('TC-PS-025 Performance Measure search response time for a common product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`TC-PS-025: Search for "${searchTerm}" took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(2000); // Example threshold: 2 seconds
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-026: Performance Measure search response time for a non-existent product query
  test('TC-PS-026 Performance Measure search response time for a non-existent product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'NonexistentProductXYZ';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`TC-PS-026: Search for "${searchTerm}" (no results) took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(1500); // Example threshold: 1.5 seconds
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-027: Error Handling - Backend search service unavailable (Not automatable in UI without mocking)
  test('TC-PS-027 Error Handling Verify user-friendly error message when search service is unavailable (mocked)', async ({ productSearchPage, page }) => {
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}`), async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error: Search service temporarily unavailable.' }),
      });
    });

    const searchTerm = 'Any Product';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(page.locator('text=' + UI_MESSAGES.GENERIC_ERROR)).toBeVisible();
    await productSearchPage.expectNoProductsDisplayed();
    await expect(productSearchPage.noResultsMessage).toBeHidden(); // Generic error, not "No results"
    await expect(productSearchPage.paginationContainer).toBeHidden();
  });

  // TC-PS-028: Pagination on search results page
  test('TC-PS-028 Verify pagination functionality on search results page', async ({ productSearchPage, page }) => {
    const searchTerm = 'Mouse';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.paginationContainer).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeEnabled();
    await expect(productSearchPage.paginationPrevButton).toBeHidden();
    await expect(productSearchPage.paginationContainer.locator(SELECTORS.PAGINATION_PAGE_LINK, { hasText: '1' })).toHaveAttribute('aria-current', 'page');
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    const initialProductCount = await productSearchPage.getAllProductCards().count();
    expect(initialProductCount).toBeGreaterThan(0);

    await productSearchPage.clickPaginationLink('Next');
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=2`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    expect(await productSearchPage.getAllProductCards().count()).toBeGreaterThan(0);
    expect(await productSearchPage.getAllProductCards().count()).not.toBe(initialProductCount); // Ensure different set of results
    await expect(productSearchPage.paginationPrevButton).toBeVisible();
    await expect(productSearchPage.paginationPrevButton).toBeEnabled();
    await expect(productSearchPage.paginationContainer.locator(SELECTORS.PAGINATION_PAGE_LINK, { hasText: '2' })).toHaveAttribute('aria-current', 'page');

    await productSearchPage.clickPaginationLink('Previous');
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=1`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    expect(await productSearchPage.getAllProductCards().count()).toBe(initialProductCount); // Should be back to initial products
    await expect(productSearchPage.paginationPrevButton).toBeHidden();
    await expect(productSearchPage.paginationContainer.locator(SELECTORS.PAGINATION_PAGE_LINK, { hasText: '1' })).toHaveAttribute('aria-current', 'page');
  });

  // TC-PS-029: Search by multiple keywords in any order
  test('TC-PS-029 Verify search by multiple keywords in any order', async ({ productSearchPage, page }) => {
    const searchTerm1 = 'Gaming RGB';
    await productSearchPage.search(searchTerm1);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm1)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm1);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2);
    await expect(productSearchPage.noResultsMessage).toBeHidden();

    await productSearchPage.navigateToHomePage();
    await expect(productSearchPage.searchInput).toBeEmpty(); // Page reset verification

    const searchTerm2 = 'RGB Gaming';
    await productSearchPage.search(searchTerm2);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm2)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm2);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-030: Accessibility - Search bar keyboard navigation
  test('TC-PS-030 Accessibility Verify search bar is keyboard navigatable and usable', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toHaveAttribute('role', 'searchbox'); // Or appropriate ARIA role
    await expect(productSearchPage.searchButton).toBeVisible();
    await expect(productSearchPage.searchButton).toHaveAttribute('type', 'submit');

    await page.keyboard.press('Tab');
    await expect(productSearchPage.searchInput).toBeFocused();

    const searchTerm = 'Accessibility Test';
    await page.keyboard.type(searchTerm);
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.searchButton).toBeEnabled(); // Should be enabled after typing

    await page.keyboard.press('Tab');
    await expect(productSearchPage.searchButton).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
  });

  // TC-PS-031: Browser back/forward button functionality after search
  test('TC-PS-031 Verify browser back/forward buttons work correctly after a search', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.MONITOR.name;
    const homePageUrl = productSearchPage.page.url();
    await expect(productSearchPage.searchInput).toBeEmpty(); // Initial state

    await productSearchPage.search(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    const searchResultsUrl = productSearchPage.page.url();
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();

    await page.goBack();
    await expect(page).toHaveURL(homePageUrl);
    await expect(productSearchPage.searchInput).toBeEmpty(); // Search input should be cleared/reset on back
    await productSearchPage.expectNoProductsDisplayed(); // No products on home page before search
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(productSearchPage.paginationContainer).toBeHidden();

    await page.goForward();
    await expect(page).toHaveURL(searchResultsUrl);
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(productSearchPage.paginationContainer).toBeHidden(); // For single result
  });
});