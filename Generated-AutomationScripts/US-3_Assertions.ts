test.describe('Product Search Functionality', () => {

  // TC-PS-001: Search by exact product name
  test('TC-PS-001 Verify search by exact product name match', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-002: Search by partial product name
  test('TC-PS-002 Verify search by partial product name match', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = 'Laptop';
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(PRODUCT_DATA.LAPTOP_PRO_X.name, false);
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-003: Search functionality is case-insensitive for product names
  test('TC-PS-003 Verify search functionality is case-insensitive for product names', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const originalSearchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    const searchTerm = originalSearchTerm.toLowerCase(); // "laptop pro x"
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(originalSearchTerm);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-004: Search functionality with an exact SKU match
  test('TC-PS-004 Verify search functionality with an exact SKU match', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku;
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-005: Search functionality is case-insensitive for SKUs (if applicable)
  test('TC-PS-005 Verify search functionality is case-insensitive for SKUs (if applicable)', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const originalSku = PRODUCT_DATA.LAPTOP_PRO_X.sku;
    const searchTerm = originalSku.toLowerCase(); // "lpx-001"
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(originalSku);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-006: "No results found" message for non-existent product search
  test('TC-PS-006 Verify "No results found" message for non-existent product search', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = 'XYZ NonExistent Product 123';
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-007: Invalid input validation for empty search query
  test('TC-PS-007 Verify invalid input validation for empty search query', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    await productSearchPage.search('');
    const validationMessage = await productSearchPage.getSearchInputValidationMessage();
    expect(validationMessage).not.toBe('');
    await expect(page).toHaveURL(APP_URLS.HOME); // No search initiated, URL remains home
    await productSearchPage.expectNoProductsDisplayed();
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(productSearchPage.searchInput).toHaveValue('');
    await expect(productSearchPage.searchInput).toBeFocused(); // Input should remain focused
    await expect(productSearchPage.validationMessage).toBeHidden(); // If no custom message element is used
  });

  // TC-PS-008: Invalid input validation for search query with only spaces
  test('TC-PS-008 Verify invalid input validation for search query with only spaces', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = '   '; // multiple spaces
    await productSearchPage.search(searchTerm);

    // Assuming the system trims spaces and treats it as an empty query on the backend
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm.trim())}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Input field should retain actual typed value
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-009: Search functionality trims leading/trailing spaces from product name search
  test('TC-PS-009 Verify search functionality trims leading/trailing spaces from product name search', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const rawSearchTerm = `  ${PRODUCT_DATA.WIRELESS_MOUSE.name}  `;
    const trimmedSearchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(rawSearchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(rawSearchTerm.trim())}`));
    await expect(productSearchPage.searchInput).toHaveValue(rawSearchTerm); // Input field should retain actual typed value
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(trimmedSearchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-010: Search with product name containing supported special characters (e.g., hyphenated)
  test('TC-PS-010 Verify search with product name containing supported special characters', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const mockProduct = { name: 'Product-Name-Hyphenated', sku: 'PN-H-001' };
    const searchTerm = mockProduct.name;
    // For this to pass, 'Product-Name-Hyphenated' must be in the product catalog.
    // Assuming product data is seeded to include this or test environment supports it.
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(mockProduct.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(mockProduct.sku);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-011: System handles unsupported or unsafe special characters gracefully in search query
  test('TC-PS-011 Verify system handles unsupported/unsafe special characters gracefully in search query', async ({ productSearchPage, page }) => {
    const searchTerm = "`!@#$%^&*()_+"; // Common special characters
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(page).not.toContainText(/Invalid characters|error/i);
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-012: Invalid input validation for search query exceeding max length
  test('TC-PS-012 Verify invalid input validation for search query exceeding max length', async ({ productSearchPage, page }) => {
    const longSearchTerm = 'A'.repeat(MAX_SEARCH_QUERY_LENGTH + 10); // 110 'A's
    await productSearchPage.searchInput.fill(longSearchTerm);
    const currentInputValue = await productSearchPage.searchInput.inputValue();
    expect(currentInputValue.length).toBeLessThanOrEqual(MAX_SEARCH_QUERY_LENGTH);
    await expect(productSearchPage.searchInput).toHaveValue('A'.repeat(MAX_SEARCH_QUERY_LENGTH)); // Input should be truncated
    await productSearchPage.searchButton.click();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent('A'.repeat(MAX_SEARCH_QUERY_LENGTH))}`));
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-013: Search bar visibility, accessibility, and placeholder text
  test('TC-PS-013 Verify search bar visibility, accessibility, and placeholder text', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEditable();
    await expect(productSearchPage.searchInput).toHaveAttribute('placeholder', /search product|search by name or sku/i);
    await expect(productSearchPage.searchInput).toBeEmpty();
    await expect(productSearchPage.searchInput).toHaveRole('searchbox'); // Accessibility check

    await expect(productSearchPage.searchButton).toBeVisible();
    await expect(productSearchPage.searchButton).toBeEnabled();
    await expect(productSearchPage.searchButton).toHaveText(/Search/i);
    await expect(productSearchPage.searchButton).toHaveRole('button');

    // Test responsiveness (example for one breakpoint, expand for more)
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchButton).toBeVisible();
    // Consider adding assertions for layout/position if specific responsive behavior is expected (e.g., search bar fills width)
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop viewport
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchButton).toBeVisible();
  });

  // TC-PS-014: Clicking search button initiates search functionality
  test('TC-PS-014 Verify clicking search button initiates search functionality', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.searchInput.fill(searchTerm);
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.searchButton.click();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-015: Pressing Enter key in search bar initiates search functionality
  test('TC-PS-015 Verify pressing Enter key in search bar initiates search functionality', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(searchTerm, 'enter'); // Use 'enter' method
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-016: Search results are displayed clearly and correctly formatted
  test('TC-PS-016 Verify search results are displayed clearly and correctly formatted', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = 'Laptop'; // Partial search to get multiple results potentially
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    const productCount = await productSearchPage.getAllProductCards().count();
    await expect(productCount).toBeGreaterThanOrEqual(1);

    const firstProductCard = productSearchPage.getAllProductCards().first();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_NAME)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_NAME)).not.toBeEmpty();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toHaveAttribute('src', expect.any(String));
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE)).toContainText('$');
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);

    if (productCount > 1) {
      const secondProductCard = productSearchPage.getProductCardByIndex(1);
      await expect(secondProductCard.locator(SELECTORS.PRODUCT_CARD_NAME)).toBeVisible();
      await expect(secondProductCard.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
      await expect(secondProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible();
    }
  });

  // TC-PS-017: API - Successful product search by name
  test('TC-PS-017 API Verify successful product search by name via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.GAMING_KEYBOARD_RGB.name;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectProductInApiResponse(response, PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);
    const jsonResponse = await response.json();
    expect(jsonResponse.length).toBeGreaterThanOrEqual(1); // At least one result
    const foundProduct = jsonResponse.find((p: any) => p.name === PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);
    expect(foundProduct.sku).toBe(PRODUCT_DATA.GAMING_KEYBOARD_RGB.sku);
    expect(foundProduct.price).toBe(PRODUCT_DATA.GAMING_KEYBOARD_RGB.price);
  });

  // TC-PS-018: API - Product search by SKU
  test('TC-PS-018 API Verify successful product search by SKU via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.sku;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectProductInApiResponse(response, PRODUCT_DATA.WIRELESS_MOUSE.name);
    const jsonResponse = await response.json();
    expect(jsonResponse.length).toBe(1); // Assuming SKU is unique for exact match
    const foundProduct = jsonResponse[0];
    expect(foundProduct.name).toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
    expect(foundProduct.sku).toBe(PRODUCT_DATA.WIRELESS_MOUSE.sku);
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
    expect(jsonResponse.message).toContain('Query parameter');
    expect(jsonResponse.code).toBe('BAD_REQUEST'); // If API returns specific error codes
  });

  // TC-PS-021: Integration - Search results link to Product Detail Page
  test('TC-PS-021 Verify clicking a search result navigates to the correct Product Detail Page', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = PRODUCT_DATA.EXTERNAL_SSD_1TB.name;
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    const productCard = productSearchPage.getAllProductCards().first();
    await expect(productCard).toBeVisible();

    await productCard.locator(SELECTORS.PRODUCT_CARD_NAME).click();
    await page.waitForURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}.*`));

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}[a-zA-Z0-9-]+`)); // Check for slug in URL
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_NAME)).toBeVisible();
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_SKU)).toBeVisible();
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_DESCRIPTION)).toBeVisible();
    await expect(page.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible(); // Product detail page might reuse this selector or have its own
    await productSearchPage.expectProductDetailPage(PRODUCT_DATA.EXTERNAL_SSD_1TB.name, PRODUCT_DATA.EXTERNAL_SSD_1TB.sku);
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_DESCRIPTION)).toContainText(PRODUCT_DATA.EXTERNAL_SSD_1TB.description);
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-022: Integration - Search functionality with product catalog updates
  test.skip('TC-PS-022 Verify newly added products are searchable immediately (simulated)', async ({ productSearchPage, page }) => {
    // This test ideally requires a setup hook to add a product to the backend dynamically.
    // For demonstration, we'll assume PRODUCT_DATA.BRAND_NEW_GADGET was just added.
    // In a real scenario, use globalSetup/teardown or an API call within a `test.beforeAll` to add/remove test data.

    const newProductName = PRODUCT_DATA.BRAND_NEW_GADGET.name;
    const newProductSku = PRODUCT_DATA.BRAND_NEW_GADGET.sku;

    await expect(productSearchPage.searchInput).toBeEmpty();
    await productSearchPage.search(newProductName);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductName)}`));
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.getProductSKU(productSearchPage.getAllProductCards().first())).resolves.toContain(newProductSku);
    await expect(productSearchPage.searchInput).toHaveValue(newProductName);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await productSearchPage.navigateToHomePage(); // Reset for next search

    await expect(productSearchPage.searchInput).toBeEmpty();
    await productSearchPage.search(newProductSku);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductSku)}`));
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.getProductName(productSearchPage.getAllProductCards().first())).resolves.toBe(newProductName);
    await expect(productSearchPage.searchInput).toHaveValue(newProductSku);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-023: Security - SQL Injection attempt in search query
  test('TC-PS-023 Security Verify protection against SQL Injection via search input', async ({ productSearchPage, page }) => {
    const sqlInjectionTerms = [
      `' OR '1'='1`,
      `'; DROP TABLE products; --`,
    ];

    for (const term of sqlInjectionTerms) {
      await expect(productSearchPage.searchInput).toBeEmpty();
      await productSearchPage.search(term);
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(term)}`));
      await expect(productSearchPage.searchInput).toHaveValue(term);
      await productSearchPage.expectNoProductsDisplayed();
      await productSearchPage.expectNoResultsMessageToBeDisplayed();
      await expect(page.locator('body')).not.toContainText(/sql error|database error|syntax error|error in query|failed to connect/i);
      await expect(page.locator('body')).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
      await productSearchPage.navigateToHomePage(); // Re-navigate to clear state for next attempt
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
      await expect(productSearchPage.searchInput).toBeEmpty();
      await productSearchPage.search(term);
      await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(term)}`));
      await expect(productSearchPage.searchInput).toHaveValue(term);
      await productSearchPage.expectNoProductsDisplayed(); // Assuming XSS attempts yield no legitimate results
      await productSearchPage.expectNoResultsMessageToBeDisplayed();
      await expect(page.locator('body')).not.toContainText(/<script>alert|onerror=alert/i);
      await expect(page.locator('body')).not.toContainHTML(term); // Ensures the raw HTML isn't rendered
      await expect(page.locator('body')).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
      await productSearchPage.navigateToHomePage();
    }
  });

  // TC-PS-025: Performance Measure search response time for a common product query
  test('TC-PS-025 Performance Measure search response time for a common product query', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = 'Laptop';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`TC-PS-025: Search for "${searchTerm}" took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(2000); // Example threshold: 2 seconds
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectProductToBeDisplayed(PRODUCT_DATA.LAPTOP_PRO_X.name, false);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-026: Performance Measure search response time for a non-existent product query
  test('TC-PS-026 Performance Measure search response time for a non-existent product query', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = 'NonexistentProductXYZ';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`TC-PS-026: Search for "${searchTerm}" (no results) took ${duration.toFixed(2)} ms.`);
    expect(duration).toBeLessThan(1500); // Example threshold: 1.5 seconds
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-027: Error Handling Verify user-friendly error message when search service is unavailable (mocked)
  test('TC-PS-027 Error Handling Verify user-friendly error message when search service is unavailable (mocked)', async ({ productSearchPage, page }) => {
    // Mock the API response to simulate a backend error
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}`), async route => {
      await route.fulfill({
        status: 500, // Internal Server Error
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error: Search service temporarily unavailable.' }),
      });
    });

    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = 'Any Product';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(page.locator('text=' + UI_MESSAGES.GENERIC_ERROR)).toBeVisible();
    await productSearchPage.expectNoProductsDisplayed();
    await expect(productSearchPage.noResultsMessage).toBeHidden();
  });

  // TC-PS-028: Pagination on search results page
  test('TC-PS-028 Verify pagination functionality on search results page', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = 'Mouse'; // Assuming 'Mouse' returns many results that span multiple pages
    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await expect(productSearchPage.paginationContainer).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeEnabled();
    await expect(productSearchPage.paginationPrevButton).toBeHidden(); // First page usually doesn't show Prev or is disabled

    await productSearchPage.clickPaginationLink('Next');
    await page.waitForURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=2`));
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1); // Ensure products are displayed
    await expect(productSearchPage.paginationPrevButton).toBeVisible();
    await expect(productSearchPage.paginationPrevButton).toBeEnabled();
    await expect(productSearchPage.paginationNextButton).toBeVisible();
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);

    await productSearchPage.clickPaginationLink('Previous');
    await page.waitForURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=1`));
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1); // Ensure products are displayed
    await expect(productSearchPage.paginationPrevButton).toBeHidden();
    await expect(productSearchPage.paginationNextButton).toBeVisible();
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-029: Search by multiple keywords in any order
  test('TC-PS-029 Verify search by multiple keywords in any order', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm1 = 'Gaming RGB'; // "Gaming" then "RGB"
    await productSearchPage.search(searchTerm1);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm1)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm1);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
    await productSearchPage.navigateToHomePage();

    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm2 = 'RGB Gaming'; // "RGB" then "Gaming"
    await productSearchPage.search(searchTerm2);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm2)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm2);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2);
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-030: Accessibility - Search bar keyboard navigation
  test('TC-PS-030 Accessibility Verify search bar is keyboard navigatable and usable', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEnabled();
    await expect(productSearchPage.searchInput).toBeEmpty();

    await page.keyboard.press('Tab'); // Assuming search input is the first tabbable element
    await expect(productSearchPage.searchInput).toBeFocused();

    const searchTerm = 'Accessibility Test';
    await page.keyboard.type(searchTerm); // Type using keyboard
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await page.keyboard.press('Tab'); // Tab to the search button
    await expect(productSearchPage.searchButton).toBeFocused();
    await expect(productSearchPage.searchButton).toBeEnabled();

    await page.keyboard.press('Enter'); // Activate search button
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });

  // TC-PS-031: Browser back/forward button functionality after search
  test('TC-PS-031 Verify browser back/forward buttons work correctly after a search', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeEmpty();
    const searchTerm = PRODUCT_DATA.MONITOR.name;
    const homePageUrl = page.url();
    await expect(page).toHaveURL(homePageUrl);

    await productSearchPage.search(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const searchResultsUrl = page.url();
    await expect(searchResultsUrl).not.toEqual(homePageUrl);
    await expect(searchResultsUrl).toContain(`?query=${encodeURIComponent(searchTerm)}`);

    await page.goBack();
    await page.waitForURL(homePageUrl);
    await expect(page).toHaveURL(homePageUrl);
    await expect(productSearchPage.searchInput).toBeEmpty(); // Search input should be cleared on navigation back to home
    await expect(productSearchPage.noResultsMessage).toBeHidden();

    await page.goForward();
    await page.waitForURL(searchResultsUrl);
    await expect(page).toHaveURL(searchResultsUrl);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Search input value should be preserved
    await expect(productSearchPage.noResultsMessage).toBeHidden();
    await expect(page).not.toContainText(UI_MESSAGES.GENERIC_ERROR);
  });
});