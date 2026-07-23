### Test Case ID: TC-PS-001
- Module Name: Product Search
- Test Scenario: Search by exact product name
- Test Case Title: Verify search functionality with an exact product name match
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Products exist in the catalog.
- Test Data:
    - Search Term: "Laptop Pro X"
    - Expected Product: "Laptop Pro X" (SKU: LPX-001)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "Laptop Pro X" into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays "Laptop Pro X" as a top/only result, and no irrelevant products are shown.
- Priority: High
- Severity: Critical
- Test Type: Functional / Positive
- Automation Candidate: Yes

### Test Case ID: TC-PS-002
- Module Name: Product Search
- Test Scenario: Search by partial product name
- Test Case Title: Verify search functionality with a partial product name match
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Products with partial matches exist in the catalog.
- Test Data:
    - Search Term: "Laptop"
    - Expected Products: "Laptop Pro X", "Gaming Laptop" (if exists), etc.
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "Laptop" into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays all products whose names contain "Laptop" (e.g., "Laptop Pro X", "Gaming Laptop").
- Priority: High
- Severity: Major
- Test Type: Functional / Positive
- Automation Candidate: Yes

### Test Case ID: TC-PS-003
- Module Name: Product Search
- Test Scenario: Search by product name (case-insensitive)
- Test Case Title: Verify search functionality is case-insensitive for product names
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Products exist in the catalog.
- Test Data:
    - Search Term: "laptop pro x"
    - Expected Product: "Laptop Pro X" (SKU: LPX-001)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "laptop pro x" (lowercase) into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays "Laptop Pro X" as a top/only result, demonstrating case-insensitive search.
- Priority: High
- Severity: Major
- Test Type: Functional / Positive
- Automation Candidate: Yes

### Test Case ID: TC-PS-004
- Module Name: Product Search
- Test Scenario: Search by SKU (exact match)
- Test Case Title: Verify search functionality with an exact SKU match
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Products with unique SKUs exist in the catalog.
- Test Data:
    - Search Term: "LPX-001"
    - Expected Product: "Laptop Pro X" (SKU: LPX-001)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "LPX-001" into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays only "Laptop Pro X".
- Priority: High
- Severity: Critical
- Test Type: Functional / Positive
- Automation Candidate: Yes

### Test Case ID: TC-PS-005
- Module Name: Product Search
- Test Scenario: Search by SKU (case-insensitive if SKU allows alphanumeric)
- Test Case Title: Verify search functionality is case-insensitive for SKU
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Products with alphanumeric SKUs exist in the catalog.
- Test Data:
    - Search Term: "lpx-001"
    - Expected Product: "Laptop Pro X" (SKU: LPX-001)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "lpx-001" (lowercase) into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays only "Laptop Pro X".
- Priority: Medium
- Severity: Major
- Test Type: Functional / Positive
- Automation Candidate: Yes

### Test Case ID: TC-PS-006
- Module Name: Product Search
- Test Scenario: Search with no matching results
- Test Case Title: Verify "No results found" message for non-existent product search
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
- Test Data:
    - Search Term: "XYZ NonExistent Product 123"
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "XYZ NonExistent Product 123" into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays a clear "No results found" message (e.g., "Sorry, no products found matching 'XYZ NonExistent Product 123'. Please try a different search term.") and no products.
- Priority: High
- Severity: Critical
- Test Type: Functional / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-007
- Module Name: Product Search
- Test Scenario: Search with an empty query
- Test Case Title: Verify invalid input validation for empty search query
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
- Test Data:
    - Search Term: (empty string)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Leave the search bar empty.
    4. Click the "Search" button or press Enter.
    5. Observe the page behavior.
- Expected Result:
    - Option A (Preferred): A client-side validation message appears (e.g., "Please enter a search term.") and the search is not performed.
    - Option B: The page reloads without performing a search, and the search bar remains empty.
    - Option C: A "No results found" page is displayed as if searching for an empty string, or an error message indicating invalid input. (Less preferred than A/B).
- Priority: High
- Severity: Major
- Test Type: Validation / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-008
- Module Name: Product Search
- Test Scenario: Search with a query containing only spaces
- Test Case Title: Verify invalid input validation for search query with only spaces
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
- Test Data:
    - Search Term: "    " (multiple spaces)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter multiple spaces into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the page behavior.
- Expected Result: Similar to an empty search query, either a validation message should appear, or the search should not be performed, or a "No results found" message should be displayed. Trailing/leading spaces should ideally be trimmed.
- Priority: Medium
- Severity: Minor
- Test Type: Validation / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-009
- Module Name: Product Search
- Test Scenario: Search by product name with leading/trailing spaces
- Test Case Title: Verify search functionality trims leading/trailing spaces from product name search
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Product "Wireless Mouse" exists.
- Test Data:
    - Search Term: " Wireless Mouse " (with leading and trailing spaces)
    - Expected Product: "Wireless Mouse" (SKU: M-WIRE-005)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter " Wireless Mouse " into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays "Wireless Mouse" as a top/only result, indicating that leading/trailing spaces were trimmed.
- Priority: Medium
- Severity: Minor
- Test Type: Functional / Boundary
- Automation Candidate: Yes

### Test Case ID: TC-PS-010
- Module Name: Product Search
- Test Scenario: Search with special characters in product name (if supported by product names)
- Test Case Title: Verify search functionality with product name containing special characters
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Product "Product-Name-Hyphenated" exists.
- Test Data:
    - Search Term: "Product-Name-Hyphenated"
    - Expected Product: "Product-Name-Hyphenated"
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "Product-Name-Hyphenated" into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page.
- Expected Result: The search results page displays "Product-Name-Hyphenated" as a top/only result.
- Priority: Medium
- Severity: Minor
- Test Type: Functional / Boundary
- Automation Candidate: Yes

### Test Case ID: TC-PS-011
- Module Name: Product Search
- Test Scenario: Search with unsupported or unsafe special characters
- Test Case Title: Verify invalid input validation for unsupported special characters in search query
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
- Test Data:
    - Search Term: "`!@#$%^&*()_+" (a string of common special characters, possibly for SQL injection testing)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Enter "`!@#$%^&*()_+" into the search bar.
    4. Click the "Search" button or press Enter.
    5. Observe the search results page/system response.
- Expected Result:
    - Option A (Preferred): No results found message, or a message indicating invalid characters. System handles the input gracefully without errors or security vulnerabilities.
    - Option B: Returns relevant products if the characters are indeed part of product names/SKUs.
- Priority: High
- Severity: Major
- Test Type: Validation / Negative / Security
- Automation Candidate: Yes

### Test Case ID: TC-PS-012
- Module Name: Product Search
- Test Scenario: Search query exceeding maximum length
- Test Case Title: Verify invalid input validation for search query exceeding max length
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Assume max search query length is 100 characters (common limit for text inputs).
- Test Data:
    - Search Term: "A" repeated 101 times (e.g., `str_repeat('A', 101)`)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Locate the search bar.
    3. Attempt to enter a string longer than the assumed maximum length (e.g., 101 characters).
    4. If the input field truncates, observe the truncation. If not, click the "Search" button.
    5. Observe the page behavior/search results.
- Expected Result:
    - Option A (Preferred): The input field client-side limits the input to the maximum allowed length (e.g., 100 characters).
    - Option B: A client-side validation error message appears, preventing submission of the excessively long query.
    - Option C: Server-side validation handles the long query, resulting in a "No results found" or "Invalid input" message, or truncating the query and performing a search. The system must not crash or expose sensitive information.
- Priority: Medium
- Severity: Major
- Test Type: Validation / Boundary / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-013
- Module Name: Product Search
- Test Scenario: UI - Search bar visibility and placeholder
- Test Case Title: Verify search bar visibility, accessibility, and placeholder text
- Preconditions:
    1. User is on the e-commerce website homepage.
- Test Data: None
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Visually locate the search bar.
    3. Check for a descriptive placeholder text (e.g., "Search products...", "Search by name or SKU...").
    4. Ensure the search bar is interactable (can click and type).
    5. Resize the browser window to different breakpoints (desktop, tablet, mobile).
    6. Observe the search bar's responsiveness and visibility.
- Expected Result: The search bar is prominently visible, has appropriate placeholder text, is interactable, and remains responsive across different screen sizes.
- Priority: High
- Severity: Minor
- Test Type: UI
- Automation Candidate: Yes

### Test Case ID: TC-PS-014
- Module Name: Product Search
- Test Scenario: UI - Search button functionality
- Test Case Title: Verify search button click initiates search
- Preconditions:
    1. User is on the e-commerce website.
    2. Search bar and search button are visible.
- Test Data:
    - Search Term: "Laptop Pro X"
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Enter "Laptop Pro X" into the search bar.
    3. Click the "Search" button.
    4. Observe the page.
- Expected Result: The search results page for "Laptop Pro X" is displayed.
- Priority: High
- Severity: Minor
- Test Type: UI / Functional
- Automation Candidate: Yes

### Test Case ID: TC-PS-015
- Module Name: Product Search
- Test Scenario: UI - Enter key functionality in search bar
- Test Case Title: Verify pressing Enter key in search bar initiates search
- Preconditions:
    1. User is on the e-commerce website.
    2. Search bar and search button are visible.
- Test Data:
    - Search Term: "Wireless Mouse"
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Enter "Wireless Mouse" into the search bar.
    3. Press the Enter key on the keyboard.
    4. Observe the page.
- Expected Result: The search results page for "Wireless Mouse" is displayed.
- Priority: High
- Severity: Minor
- Test Type: UI / Functional
- Automation Candidate: Yes

### Test Case ID: TC-PS-016
- Module Name: Product Search
- Test Scenario: UI - Search results display
- Test Case Title: Verify search results are displayed clearly and correctly formatted
- Preconditions:
    1. User has performed a successful search (e.g., for "Laptop").
- Test Data:
    - Search Term: "Laptop"
    - Expected Product Details: Product name, image, price, short description, add to cart button (if applicable).
- Test Steps:
    1. Perform a search for "Laptop".
    2. Observe the search results page.
    3. Verify that product names, images, prices, and other relevant details are displayed correctly for each matching product.
    4. Check for consistent layout and styling.
    5. Verify that each product result links to its respective product detail page.
- Expected Result: Search results are displayed in a clear, consistent, and visually appealing manner, showing all expected product information and linking correctly to product detail pages.
- Priority: High
- Severity: Major
- Test Type: UI / Functional
- Automation Candidate: Yes

### Test Case ID: TC-PS-017
- Module Name: Product Search
- Test Scenario: API - Successful product search by name
- Test Case Title: Verify API endpoint for successful product search by name
- Preconditions:
    1. Backend API service for product search is running and accessible.
    2. A product "Gaming Keyboard RGB" exists in the product catalog.
- Test Data:
    - API Endpoint: `/api/products/search?query=Gaming%20Keyboard%20RGB`
    - Expected HTTP Status: 200 OK
    - Expected API Response: JSON payload containing "Gaming Keyboard RGB" details.
- Test Steps:
    1. Send a GET request to the product search API endpoint with `query=Gaming Keyboard RGB`.
    2. Examine the HTTP response status code.
    3. Examine the JSON response body.
- Expected Result: HTTP status code is 200 OK. The JSON response body contains an array of products, with "Gaming Keyboard RGB" present and its details correctly represented.
- Priority: High
- Severity: Critical
- Test Type: API / Functional
- Automation Candidate: Yes

### Test Case ID: TC-PS-018
- Module Name: Product Search
- Test Scenario: API - Product search by SKU
- Test Case Title: Verify API endpoint for successful product search by SKU
- Preconditions:
    1. Backend API service for product search is running and accessible.
    2. A product with SKU "M-WIRE-005" ("Wireless Mouse") exists.
- Test Data:
    - API Endpoint: `/api/products/search?query=M-WIRE-005`
    - Expected HTTP Status: 200 OK
    - Expected API Response: JSON payload containing "Wireless Mouse" details.
- Test Steps:
    1. Send a GET request to the product search API endpoint with `query=M-WIRE-005`.
    2. Examine the HTTP response status code.
    3. Examine the JSON response body.
- Expected Result: HTTP status code is 200 OK. The JSON response body contains an array of products, with "Wireless Mouse" present and its details correctly represented.
- Priority: High
- Severity: Critical
- Test Type: API / Functional
- Automation Candidate: Yes

### Test Case ID: TC-PS-019
- Module Name: Product Search
- Test Scenario: API - No search results
- Test Case Title: Verify API endpoint response for no matching products
- Preconditions:
    1. Backend API service for product search is running and accessible.
- Test Data:
    - API Endpoint: `/api/products/search?query=NonExistentAPIProduct`
    - Expected HTTP Status: 200 OK (or 204 No Content, depending on API design)
    - Expected API Response: Empty array/list in JSON payload.
- Test Steps:
    1. Send a GET request to the product search API endpoint with `query=NonExistentAPIProduct`.
    2. Examine the HTTP response status code.
    3. Examine the JSON response body.
- Expected Result: HTTP status code is 200 OK. The JSON response body contains an empty array or list of products, correctly indicating no results.
- Priority: High
- Severity: Major
- Test Type: API / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-020
- Module Name: Product Search
- Test Scenario: API - Missing query parameter
- Test Case Title: Verify API endpoint handles missing search query parameter
- Preconditions:
    1. Backend API service for product search is running and accessible.
- Test Data:
    - API Endpoint: `/api/products/search` (no query parameter)
    - Expected HTTP Status: 400 Bad Request
    - Expected API Response: Error message indicating missing query parameter.
- Test Steps:
    1. Send a GET request to the product search API endpoint without the `query` parameter.
    2. Examine the HTTP response status code.
    3. Examine the JSON response body.
- Expected Result: HTTP status code is 400 Bad Request. The JSON response body contains a clear error message (e.g., "Query parameter 'query' is required").
- Priority: Medium
- Severity: Major
- Test Type: API / Validation / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-021
- Module Name: Product Search
- Test Scenario: Integration - Search results link to Product Detail Page
- Test Case Title: Verify clicking a search result navigates to the correct Product Detail Page
- Preconditions:
    1. User has performed a successful search.
    2. Product Detail Pages are functional.
- Test Data:
    - Search Term: "External SSD 1TB"
    - Expected Product: "External SSD 1TB"
- Test Steps:
    1. Perform a search for "External SSD 1TB".
    2. On the search results page, locate the "External SSD 1TB" product.
    3. Click on the product name or image.
    4. Observe the URL and content of the navigated page.
- Expected Result: The browser navigates to the dedicated Product Detail Page for "External SSD 1TB", displaying its full details.
- Priority: High
- Severity: Critical
- Test Type: Integration / Functional
- Automation Candidate: Yes

### Test Case ID: TC-PS-022
- Module Name: Product Search
- Test Scenario: Integration - Search functionality with product catalog updates
- Test Case Title: Verify newly added products are searchable immediately
- Preconditions:
    1. Admin user can add new products to the catalog.
    2. Product search service is integrated with the product catalog.
- Test Data:
    - New Product Name: "Brand New Gadget"
    - New SKU: "BNG-001"
- Test Steps:
    1. As an admin, add a new product "Brand New Gadget" with SKU "BNG-001" to the system.
    2. As a customer, navigate to the homepage.
    3. Search for "Brand New Gadget".
    4. Observe the search results.
    5. Search for "BNG-001".
    6. Observe the search results.
- Expected Result: Both searches for "Brand New Gadget" and "BNG-001" yield the newly added product in the search results. (Consider caching mechanisms, this might be eventual consistency rather than immediate).
- Priority: High
- Severity: Major
- Test Type: Integration / Functional
- Automation Candidate: Yes

### Test Case ID: TC-PS-023
- Module Name: Product Search
- Test Scenario: Security - SQL Injection attempt in search query
- Test Case Title: Verify protection against SQL Injection via search input
- Preconditions:
    1. User is on the e-commerce website.
    2. Search bar and search button are visible.
- Test Data:
    - Search Term: `' OR '1'='1`
    - Search Term: `'; DROP TABLE products; --`
- Test Steps:
    1. Enter `' OR '1'='1` into the search bar.
    2. Click "Search".
    3. Observe search results and system behavior (e.g., error messages, unexpected data).
    4. Repeat with `'; DROP TABLE products; --`.
    5. Check server logs for any SQL errors or execution.
- Expected Result: The search should either yield no results or return a message indicating invalid input. There should be no signs of SQL injection (e.g., entire catalog displayed, database errors, data manipulation). The system should handle the input as a literal search string.
- Priority: High
- Severity: Critical
- Test Type: Security / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-024
- Module Name: Product Search
- Test Scenario: Security - Cross-Site Scripting (XSS) attempt in search query
- Test Case Title: Verify protection against XSS via search input
- Preconditions:
    1. User is on the e-commerce website.
    2. Search bar and search button are visible.
- Test Data:
    - Search Term: `<script>alert('XSS');</script>`
    - Search Term: `<img src=x onerror=alert('XSS')>`
- Test Steps:
    1. Enter `<script>alert('XSS');</script>` into the search bar.
    2. Click "Search".
    3. Observe the search results page.
    4. Repeat with `<img src=x onerror=alert('XSS')>`.
    5. Check if any alert boxes appear or if the script is executed.
- Expected Result: The search query should be displayed as plain text (escaped/sanitized) on the results page. No JavaScript alerts or unintended script execution should occur.
- Priority: High
- Severity: Critical
- Test Type: Security / Negative
- Automation Candidate: Yes

### Test Case ID: TC-PS-025
- Module Name: Product Search
- Test Scenario: Performance - Search response time for common queries
- Test Case Title: Measure response time for a frequently searched product name
- Preconditions:
    1. User is on the e-commerce website.
    2. Performance monitoring tools are set up.
- Test Data:
    - Search Term: "Laptop" (assuming it's a popular search)
- Test Steps:
    1. Start performance monitoring.
    2. Navigate to the homepage.
    3. Enter "Laptop" into the search bar.
    4. Click "Search".
    5. Stop performance monitoring upon page load.
    6. Record the total page load time for the search results page.
- Expected Result: The search results page loads within acceptable performance thresholds (e.g., < 2 seconds for initial load, < 1 second for subsequent loads).
- Priority: Medium
- Severity: Major
- Test Type: Performance
- Automation Candidate: Yes

### Test Case ID: TC-PS-026
- Module Name: Product Search
- Test Scenario: Performance - Search response time for uncommon queries (no results)
- Test Case Title: Measure response time for a non-existent product search
- Preconditions:
    1. User is on the e-commerce website.
    2. Performance monitoring tools are set up.
- Test Data:
    - Search Term: "NonexistentProductXYZ"
- Test Steps:
    1. Start performance monitoring.
    2. Navigate to the homepage.
    3. Enter "NonexistentProductXYZ" into the search bar.
    4. Click "Search".
    5. Stop performance monitoring upon page load.
    6. Record the total page load time for the "No results found" page.
- Expected Result: The "No results found" page loads within acceptable performance thresholds (e.g., < 1.5 seconds).
- Priority: Low
- Severity: Minor
- Test Type: Performance
- Automation Candidate: Yes

### Test Case ID: TC-PS-027
- Module Name: Product Search
- Test Scenario: Error Handling - Backend search service unavailable
- Test Case Title: Verify error message when product search service is unavailable
- Preconditions:
    1. User is on the e-commerce website.
    2. Simulate backend product search service being down or returning an error.
- Test Data:
    - Search Term: "Any Product"
- Test Steps:
    1. As a QA, manually stop or simulate failure of the product search backend service.
    2. As a customer, navigate to the homepage.
    3. Enter "Any Product" into the search bar.
    4. Click "Search".
    5. Observe the search results page/error message.
- Expected Result: A user-friendly error message is displayed (e.g., "We are currently experiencing technical difficulties with product search. Please try again later."), rather than a raw system error. The application should not crash.
- Priority: High
- Severity: Critical
- Test Type: Error Handling / Negative
- Automation Candidate: No (due to manual simulation of backend failure)

### Test Case ID: TC-PS-028
- Module Name: Product Search
- Test Scenario: Pagination on search results page
- Test Case Title: Verify pagination is functional and displays correct results on subsequent pages
- Preconditions:
    1. User is on the e-commerce website.
    2. A search query that returns more results than displayed on a single page (e.g., 20+ results if page size is 10).
- Test Data:
    - Search Term: "Mouse" (assuming it returns many results like "Wireless Mouse", "Gaming Mouse", etc.)
    - Expected: Pagination links (e.g., 1, 2, 3, Next)
- Test Steps:
    1. Search for "Mouse".
    2. Verify that more than one page of results is indicated by pagination controls.
    3. Click on the "Next" page link or page number "2".
    4. Observe the results displayed on the second page.
    5. Click on the "Previous" page link or page number "1".
    6. Observe the results displayed on the first page.
- Expected Result: Pagination controls are present and functional. Clicking "Next" or a page number displays the correct set of results for that page, and navigating back also works correctly.
- Priority: Medium
- Severity: Major
- Test Type: Functional / UI
- Automation Candidate: Yes

### Test Case ID: TC-PS-029
- Module Name: Product Search
- Test Scenario: Search by multiple keywords
- Test Case Title: Verify search functionality with multiple keywords in any order
- Preconditions:
    1. User is on the e-commerce website.
    2. The search bar and search button are visible and accessible.
    3. Products like "Gaming Keyboard RGB" and "RGB Gaming Mouse" exist.
- Test Data:
    - Search Term 1: "Gaming RGB"
    - Search Term 2: "RGB Gaming"
    - Expected Products: "Gaming Keyboard RGB", "RGB Gaming Mouse" (if exists)
- Test Steps:
    1. Navigate to the e-commerce website homepage.
    2. Enter "Gaming RGB" into the search bar and perform search.
    3. Observe results.
    4. Enter "RGB Gaming" into the search bar and perform search.
    5. Observe results.
- Expected Result: Both searches ("Gaming RGB" and "RGB Gaming") return relevant products containing both keywords (e.g., "Gaming Keyboard RGB", "RGB Gaming Mouse"), demonstrating logical AND behavior and order independence.
- Priority: High
- Severity: Major
- Test Type: Functional / Positive
- Automation Candidate: Yes

### Test Case ID: TC-PS-030
- Module Name: Product Search
- Test Scenario: Accessibility - Search bar keyboard navigation
- Test Case Title: Verify search bar is navigable and usable via keyboard
- Preconditions:
    1. User is on the e-commerce website.
    2. Keyboard is functioning.
- Test Data:
    - Search Term: "Accessibility Test"
- Test Steps:
    1. Navigate to the homepage.
    2. Use the Tab key to navigate through interactive elements until the search bar is focused.
    3. Type "Accessibility Test" into the search bar.
    4. Press Tab to move focus to the search button.
    5. Press Enter to activate the search button.
    6. Observe the search results page.
- Expected Result: User can navigate to the search bar, type a query, navigate to the search button, and initiate the search using only keyboard commands.
- Priority: Medium
- Severity: Minor
- Test Type: UI / Accessibility
- Automation Candidate: Yes

### Test Case ID: TC-PS-031
- Module Name: Product Search
- Test Scenario: Browser back/forward button functionality after search
- Test Case Title: Verify browser back/forward buttons work correctly after performing a search
- Preconditions:
    1. User has performed a successful search.
- Test Data:
    - Initial Page: Homepage
    - Search Term: "Monitor"
    - Search Results Page
- Test Steps:
    1. Start on the homepage.
    2. Search for "Monitor".
    3. Once on the search results page, click the browser's "Back" button.
    4. Observe the page.
    5. Click the browser's "Forward" button.
    6. Observe the page.
- Expected Result: Clicking "Back" navigates the user to the homepage (or the page before the search). Clicking "Forward" navigates back to the "Monitor" search results page, with the search term and results preserved.
- Priority: Medium
- Severity: Major
- Test Type: Functional / UI
- Automation Candidate: Yes