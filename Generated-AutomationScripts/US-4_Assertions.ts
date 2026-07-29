test.describe('Product Search Functionality', () => {

  // TC-PS-001: Search by exact product name
  test('TC-PS-001 Verify search by exact product name match', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name;
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productCards.first()).toBeVisible();
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toHaveText(PRODUCT_DATA.LAPTOP_PRO_X.price);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await expect(productSearchPage.paginationContainer).not.toBeVisible();
  });

  // TC-PS-002: Search by partial product name
  test('TC-PS-002 Verify search by partial product name match', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(PRODUCT_DATA.LAPTOP_PRO_X.name, false);
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await expect(productSearchPage.getAllProductCards().first()).toBeVisible();
  });

  // TC-PS-003: Search by product name (case-insensitive)
  test('TC-PS-003 Verify search functionality is case-insensitive for product names', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.name.toLowerCase(); // "laptop pro x"
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productCards.first()).toBeVisible();
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toHaveText(PRODUCT_DATA.LAPTOP_PRO_X.price);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-004: Search by SKU (exact match)
  test('TC-PS-004 Verify search functionality with an exact SKU match', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku;
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productCards.first()).toBeVisible();
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toHaveText(PRODUCT_DATA.LAPTOP_PRO_X.price);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-005: Search by SKU (case-insensitive if alphanumeric SKU allows)
  test('TC-PS-005 Verify search functionality is case-insensitive for SKUs (if applicable)', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.LAPTOP_PRO_X.sku.toLowerCase(); // "lpx-001"
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productCards.first()).toBeVisible();
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.LAPTOP_PRO_X.sku);
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toHaveText(PRODUCT_DATA.LAPTOP_PRO_X.price);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-006: Search with no matching results
  test('TC-PS-006 Verify "No results found" message for non-existent product search', async ({ productSearchPage, page }) => {
    const searchTerm = 'XYZ NonExistent Product 123';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.paginationContainer).not.toBeVisible();
    await expect(productSearchPage.searchButton).toBeEnabled();
  });

  // TC-PS-007: Search with an empty query
  test('TC-PS-007 Verify invalid input validation for empty search query', async ({ productSearchPage, page }) => {
    await productSearchPage.search('');
    const validationMessage = await productSearchPage.getSearchInputValidationMessage();
    expect(validationMessage).not.toBe('');
    expect(validationMessage).toContain(UI_MESSAGES.EMPTY_SEARCH_TERM_VALIDATION);

    await expect(page).toHaveURL(APP_URLS.HOME);
    await expect(productSearchPage.searchInput).toHaveValue('');
    await expect(productSearchPage.searchButton).toBeEnabled();
    await productSearchPage.expectNoProductsDisplayed();
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await expect(productSearchPage.paginationContainer).not.toBeVisible();
  });

  // TC-PS-008: Search with a query containing only spaces
  test('TC-PS-008 Verify invalid input validation for search query with only spaces', async ({ productSearchPage, page }) => {
    const searchTerm = '   '; // multiple spaces
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm.trim())}`)); // Assuming trimming occurs before URL param
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm); // Input field might preserve spaces
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.searchButton).toBeEnabled();
    await expect(productSearchPage.paginationContainer).not.toBeVisible();
  });

  // TC-PS-009: Search by product name with leading/trailing spaces
  test('TC-PS-009 Verify search functionality trims leading/trailing spaces from product name search', async ({ productSearchPage, page }) => {
    const rawSearchTerm = `  ${PRODUCT_DATA.WIRELESS_MOUSE.name}  `;
    const trimmedSearchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(rawSearchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(trimmedSearchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(rawSearchTerm); // Input field might preserve spaces
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productCards.first()).toBeVisible();
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(PRODUCT_DATA.WIRELESS_MOUSE.sku);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toHaveText(PRODUCT_DATA.WIRELESS_MOUSE.price);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-010: Search with special characters in product name (if supported)
  test('TC-PS-010 Verify search with product name containing supported special characters', async ({ productSearchPage, page }) => {
    const searchTerm = 'Product-Name-Hyphenated';
    const mockProduct = { name: searchTerm, sku: 'PN-H-001', price: '$10.00', description: 'Product with hyphens' };
    // Assuming the test setup (e.g., globalSetup or mocked API) ensures this product exists for this test.
    // Otherwise, this test relies on the product being pre-existing in the data.

    // To properly simulate, we should mock the API response here if the product isn't actually in PRODUCT_DATA
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}\\?query=${encodeURIComponent(searchTerm)}`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '123', name: mockProduct.name, sku: mockProduct.sku, description: mockProduct.description, price: mockProduct.price }
        ]),
      });
    });

    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    const productCards = productSearchPage.getAllProductCards();
    await expect(productCards).toHaveCount(1);
    await expect(productCards.first()).toBeVisible();
    await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(mockProduct.name);
    await expect(productSearchPage.getProductSKU(productCards.first())).resolves.toContain(mockProduct.sku);
    await expect(productCards.first().locator(SELECTORS.PRODUCT_CARD_PRICE)).toHaveText(mockProduct.price);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-011: Search with unsupported or unsafe special characters (Security/Validation)
  test('TC-PS-011 Verify system handles unsupported/unsafe special characters gracefully in search query', async ({ productSearchPage, page }) => {
    const searchTerm = "`!@#$%^&*()_+";
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.searchButton).toBeEnabled();
    await expect(page.locator('body')).not.toContainText(/error|exception|fail/i); // No generic error message
    await expect(productSearchPage.validationMessage).not.toBeVisible(); // Assuming no specific UI validation message for this.
  });

  // TC-PS-012: Search query exceeding maximum length
  test('TC-PS-012 Verify invalid input validation for search query exceeding max length', async ({ productSearchPage, page }) => {
    const longSearchTerm = 'A'.repeat(MAX_SEARCH_QUERY_LENGTH + 10); // 110 'A's
    await productSearchPage.searchInput.fill(longSearchTerm);

    const currentInputValue = await productSearchPage.searchInput.inputValue();
    expect(currentInputValue.length).toBeLessThanOrEqual(MAX_SEARCH_QUERY_LENGTH);
    expect(currentInputValue).toBe('A'.repeat(MAX_SEARCH_QUERY_LENGTH)); // Input should be truncated client-side

    await productSearchPage.searchButton.click();
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent('A'.repeat(MAX_SEARCH_QUERY_LENGTH))}`));
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.searchButton).toBeEnabled();
    await expect(productSearchPage.validationMessage).not.toBeVisible();
  });

  // TC-PS-013: UI - Search bar visibility and placeholder
  test('TC-PS-013 Verify search bar visibility, accessibility, and placeholder text', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toBeEditable();
    await expect(productSearchPage.searchInput).toBeEnabled();
    await expect(productSearchPage.searchInput).toHaveAttribute('placeholder', /search product|search by name or sku/i);
    await expect(productSearchPage.searchButton).toBeVisible();
    await expect(productSearchPage.searchButton).toBeEnabled();
    await expect(page).toHaveTitle(/home|search|shop/i); // Assuming a relevant page title

    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchInput).toHaveCSS('font-size', /14px|16px/); // Example: Check mobile font size
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
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-015: UI - Enter key functionality in search bar
  test('TC-PS-015 Verify pressing Enter key in search bar initiates search functionality', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.name;
    await productSearchPage.search(searchTerm, 'enter');

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-016: UI - Search results display
  test('TC-PS-016 Verify search results are displayed clearly and correctly formatted', async ({ productSearchPage, page }) => {
    const searchTerm = 'Mouse';
    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    const productCount = await productSearchPage.getAllProductCards().count();
    await expect(productCount).toBeGreaterThan(0);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();

    const firstProductCard = productSearchPage.getAllProductCards().first();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_NAME)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_NAME)).not.toBeEmpty();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_SKU)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_SKU)).not.toBeEmpty();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_PRICE)).not.toBeEmpty();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toBeVisible();
    await expect(firstProductCard.locator(SELECTORS.PRODUCT_CARD_IMAGE)).toHaveAttribute('src', /http/); // Image src should be a valid URL
  });

  // TC-PS-017: API - Successful product search by name
  test('TC-PS-017 API Verify successful product search by name via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.GAMING_KEYBOARD_RGB.name;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.request().url()).toContain(`${APP_URLS.API_SEARCH}?query=${encodeURIComponent(searchTerm)}`);
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectProductInApiResponse(response, PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);
    const jsonResponse = await response.json();
    expect(jsonResponse).toBeInstanceOf(Array);
    expect(jsonResponse[0].sku).toBe(PRODUCT_DATA.GAMING_KEYBOARD_RGB.sku);
  });

  // TC-PS-018: API - Product search by SKU
  test('TC-PS-018 API Verify successful product search by SKU via API endpoint', async ({ api }) => {
    const searchTerm = PRODUCT_DATA.WIRELESS_MOUSE.sku;
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.request().url()).toContain(`${APP_URLS.API_SEARCH}?query=${encodeURIComponent(searchTerm)}`);
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectProductInApiResponse(response, PRODUCT_DATA.WIRELESS_MOUSE.name);
    const jsonResponse = await response.json();
    expect(jsonResponse).toBeInstanceOf(Array);
    expect(jsonResponse[0].sku).toBe(PRODUCT_DATA.WIRELESS_MOUSE.sku);
  });

  // TC-PS-019: API - No search results
  test('TC-PS-019 API Verify API endpoint response for no matching products', async ({ api }) => {
    const searchTerm = 'NonExistentAPIProduct';
    const response = await api.searchProducts(searchTerm);

    await expect(response.status()).toBe(200);
    await expect(response.request().url()).toContain(`${APP_URLS.API_SEARCH}?query=${encodeURIComponent(searchTerm)}`);
    await expect(response.headers()['content-type']).toContain('application/json');
    await api.expectEmptyApiResponse(response);
  });

  // TC-PS-020: API - Missing query parameter
  test('TC-PS-020 API Verify API endpoint handles missing search query parameter', async ({ api }) => {
    const response = await api.searchProductsWithoutQuery();

    await expect(response.status()).toBe(400);
    await expect(response.request().url()).toContain(APP_URLS.API_SEARCH);
    await expect(response.headers()['content-type']).toContain('application/json');
    const jsonResponse = await response.json();
    expect(jsonResponse.message).toContain('Query parameter');
    expect(jsonResponse.message).not.toBeEmpty();
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

    await productCard.locator(SELECTORS.PRODUCT_CARD_NAME).click();
    await page.waitForURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}.*`));

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}${PRODUCT_DATA.EXTERNAL_SSD_1TB.sku.toLowerCase()}`)); // Assuming SKU is used in URL
    await productSearchPage.expectProductDetailPage(PRODUCT_DATA.EXTERNAL_SSD_1TB.name, PRODUCT_DATA.EXTERNAL_SSD_1TB.sku);
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_DESCRIPTION)).toHaveText(PRODUCT_DATA.EXTERNAL_SSD_1TB.description);
    await expect(page.locator(SELECTORS.PRODUCT_DETAIL_DESCRIPTION)).toBeVisible();
  });

  // TC-PS-022: Integration - Search functionality with product catalog updates
  test.skip('TC-PS-022 Verify newly added products are searchable immediately (simulated)', async ({ productSearchPage, page }) => {
    const newProductName = PRODUCT_DATA.BRAND_NEW_GADGET.name;
    const newProductSku = PRODUCT_DATA.BRAND_NEW_GADGET.sku;

    await page.route(new RegExp(`${APP_URLS.API_SEARCH}\\?query=${encodeURIComponent(newProductName)}`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'new1', name: newProductName, sku: newProductSku, description: PRODUCT_DATA.BRAND_NEW_GADGET.description, price: PRODUCT_DATA.BRAND_NEW_GADGET.price }
        ]),
      });
    });
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}\\?query=${encodeURIComponent(newProductSku)}`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'new1', name: newProductName, sku: newProductSku, description: PRODUCT_DATA.BRAND_NEW_GADGET.description, price: PRODUCT_DATA.BRAND_NEW_GADGET.price }
        ]),
      });
    });

    // Search by name
    await productSearchPage.search(newProductName);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductName)}`));
    await expect(productSearchPage.searchInput).toHaveValue(newProductName);
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await productSearchPage.navigateToHomePage(); // Reset for next search

    // Search by SKU
    await productSearchPage.search(newProductSku);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(newProductSku)}`));
    await expect(productSearchPage.searchInput).toHaveValue(newProductSku);
    await productSearchPage.expectProductToBeDisplayed(newProductName);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
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
      await expect(page.locator('body')).not.toContainText(/sql error|database error|syntax error|fatal error/i);
      await expect(productSearchPage.searchButton).toBeEnabled();
      await productSearchPage.navigateToHomePage();
      await expect(page).toHaveURL(APP_URLS.HOME); // Verify navigated back
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
      await expect(productSearchPage.searchInput).toHaveValue(term);
      await expect(page.locator('body')).not.toContainText(/<script>alert/i);
      await expect(page.locator('body')).not.toContainHTML(term);
      await productSearchPage.expectNoProductsDisplayed();
      await productSearchPage.expectNoResultsMessageToBeDisplayed();
      await expect(productSearchPage.searchButton).toBeEnabled();
      await productSearchPage.navigateToHomePage();
      await expect(page).toHaveURL(APP_URLS.HOME);
    }
  });

  // TC-PS-025: Performance - Search response time for common queries
  test('TC-PS-025 Performance Measure search response time for a common product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'Laptop';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.getAllProductCards()).toBeVisible();
    await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    expect(duration).toBeLessThan(2000);
  });

  // TC-PS-026: Performance - Search response time for uncommon queries (no results)
  test('TC-PS-026 Performance Measure search response time for a non-existent product query', async ({ productSearchPage, page }) => {
    const searchTerm = 'NonexistentProductXYZ';
    const startTime = performance.now();
    await productSearchPage.search(searchTerm);
    const endTime = performance.now();
    const duration = endTime - startTime;

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    expect(duration).toBeLessThan(1500);
  });

  // TC-PS-027: Error Handling - Backend search service unavailable (mocked)
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
    await expect(productSearchPage.noResultsMessage).not.toBeVisible(); // Should show generic error, not "no results"
    await expect(productSearchPage.searchButton).toBeEnabled();
  });

  // TC-PS-028: Pagination on search results page
  test('TC-PS-028 Verify pagination functionality on search results page', async ({ productSearchPage, page }) => {
    const searchTerm = 'Mouse';
    // Mock for pagination to ensure multiple pages. Assume 1 product per page for simplicity in mock.
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}\\?query=${encodeURIComponent(searchTerm)}&page=1`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([PRODUCT_DATA.WIRELESS_MOUSE]),
      });
    });
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}\\?query=${encodeURIComponent(searchTerm)}&page=2`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([PRODUCT_DATA.RGB_GAMING_MOUSE]),
      });
    });
    await page.route(new RegExp(`${APP_URLS.API_SEARCH}\\?query=${encodeURIComponent(searchTerm)}&page=3`), async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]), // End of results
      });
    });

    await productSearchPage.search(searchTerm);

    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.paginationContainer).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeVisible();
    await expect(productSearchPage.paginationNextButton).toBeEnabled();
    await expect(productSearchPage.paginationPrevButton).toBeHidden();
    await expect(productSearchPage.getAllProductCards()).toHaveCount(1);
    await expect(productSearchPage.getProductName(productSearchPage.getAllProductCards().first())).resolves.toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();

    await productSearchPage.clickPaginationLink('Next');
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=2`));
    await expect(productSearchPage.getAllProductCards()).toHaveCount(1);
    await expect(productSearchPage.getProductName(productSearchPage.getAllProductCards().first())).resolves.toBe(PRODUCT_DATA.RGB_GAMING_MOUSE.name);
    await expect(productSearchPage.paginationPrevButton).toBeVisible();
    await expect(productSearchPage.paginationPrevButton).toBeEnabled();
    await expect(productSearchPage.paginationNextButton).toBeVisible(); // Still visible if more pages exist or if it's always visible but disabled at end

    await productSearchPage.clickPaginationLink('Previous');
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}&page=1`));
    await expect(productSearchPage.getAllProductCards()).toHaveCount(1);
    await expect(productSearchPage.getProductName(productSearchPage.getAllProductCards().first())).resolves.toBe(PRODUCT_DATA.WIRELESS_MOUSE.name);
    await expect(productSearchPage.paginationPrevButton).toBeHidden();
  });

  // TC-PS-029: Search by multiple keywords in any order
  test('TC-PS-029 Verify search by multiple keywords in any order', async ({ productSearchPage, page }) => {
    const searchTerm1 = 'Gaming RGB';
    const searchTerm2 = 'RGB Gaming';

    await productSearchPage.search(searchTerm1);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm1)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm1);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2); // Assuming exactly two match
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await productSearchPage.navigateToHomePage();

    await productSearchPage.search(searchTerm2);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm2)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm2);
    await productSearchPage.expectProductsToBeDisplayed([PRODUCT_DATA.GAMING_KEYBOARD_RGB.name, PRODUCT_DATA.RGB_GAMING_MOUSE.name]);
    await expect(productSearchPage.getAllProductCards()).toHaveCount(2);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
  });

  // TC-PS-030: Accessibility - Search bar keyboard navigation
  test('TC-PS-030 Accessibility Verify search bar is keyboard navigatable and usable', async ({ productSearchPage, page }) => {
    await expect(productSearchPage.searchInput).toBeVisible();
    await expect(productSearchPage.searchButton).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(productSearchPage.searchInput).toBeFocused();

    const searchTerm = 'Accessibility Test';
    await page.keyboard.type(searchTerm);
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);

    await page.keyboard.press('Tab');
    await expect(productSearchPage.searchButton).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await productSearchPage.expectNoProductsDisplayed();
    await productSearchPage.expectNoResultsMessageToBeDisplayed();
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await expect(productSearchPage.searchButton).toBeEnabled();
  });

  // TC-PS-031: Browser back/forward button functionality after search
  test('TC-PS-031 Verify browser back/forward buttons work correctly after a search', async ({ productSearchPage, page }) => {
    const searchTerm = PRODUCT_DATA.MONITOR.name;
    const homePageUrl = page.url();

    await productSearchPage.search(searchTerm);
    await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    const searchResultsUrl = page.url();

    await page.goBack();
    await expect(page).toHaveURL(homePageUrl);
    await expect(productSearchPage.searchInput).toHaveValue(''); // Search input should be cleared on back navigation to home
    await expect(productSearchPage.searchButton).toBeEnabled();
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await productSearchPage.expectNoProductsDisplayed(); // Should be no products if on home without search

    await page.goForward();
    await expect(page).toHaveURL(searchResultsUrl);
    await expect(productSearchPage.searchInput).toHaveValue(searchTerm);
    await productSearchPage.expectProductToBeDisplayed(searchTerm);
    await expect(productSearchPage.noResultsMessage).not.toBeVisible();
    await expect(productSearchPage.searchButton).toBeEnabled();
  });
});