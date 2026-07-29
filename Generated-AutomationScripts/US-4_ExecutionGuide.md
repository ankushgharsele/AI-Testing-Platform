# Playwright Automation Execution Guide

This guide provides comprehensive instructions for setting up, configuring, executing, and understanding the Playwright TypeScript automation project. It is designed for QA engineers and developers to efficiently manage and run the automated tests.

## 1. Project Overview

This automation project leverages Playwright with TypeScript to provide robust end-to-end (E2E) and API testing for an e-commerce platform's product search functionality.

**Purpose:**
The primary goal of this automation suite is to ensure the reliability, performance, security, and usability of the product search feature across various scenarios and browsers.

**Functionality Being Automated:**
The project covers a wide range of product search functionalities, including:
*   **UI-driven tests:**
    *   Searching by exact and partial product names.
    *   Searching by product SKU.
    *   Case-insensitive search queries.
    *   Handling leading/trailing spaces in search terms.
    *   Validating UI elements (search bar, button, placeholder).
    *   Responsive design verification of the search bar.
    *   Keyboard navigation and accessibility.
    *   Display and formatting of search results.
    *   Pagination functionality on search results pages.
    *   Browser back/forward button behavior after search.
    *   Navigation from search results to product detail pages.
*   **API-driven tests:**
    *   Verifying successful product search via the backend API by name and SKU.
    *   Handling scenarios with no API search results.
    *   Validating API error handling for missing query parameters.
*   **Negative and Boundary tests:**
    *   Searching for non-existent products.
    *   Searching with empty or only-space queries.
    *   Handling search queries exceeding maximum length.
*   **Security tests:**
    *   Protection against SQL Injection attempts.
    *   Protection against Cross-Site Scripting (XSS) attempts.
*   **Performance tests:**
    *   Measuring search response times for common and uncommon queries.
*   **Error Handling:**
    *   Displaying user-friendly messages when the backend search service is unavailable (simulated).

**Playwright with TypeScript Usage:**
*   The framework uses **Playwright Test Runner** for its testing capabilities.
*   **TypeScript** ensures type safety, better code organization, and improved maintainability.
*   **Page Object Model (POM)** is implemented for UI interactions, separating page elements and actions from test logic (`src/pages/product-search/ProductSearchPage.ts`).
*   **Custom Fixtures** (`src/fixtures/contexts/ProductSearchTest.ts`) extend Playwright's `test` object to provide reusable page objects (`productSearchPage`) and API helpers (`api`) for tests.
*   **API Helper** (`src/utils/api/APIHelper.ts`) centralizes API request logic for cleaner, more maintainable API tests.
*   **Constants** (`src/utils/constants/app.constants.ts`) manage application URLs, UI messages, selectors, and test data, promoting reusability and easy updates.

**Test Cases, Assertions, and Test Data:**
*   The project includes 31 distinct test cases (TC-PS-001 to TC-PS-031), each targeting a specific aspect of the product search functionality.
*   Assertions are specific to Playwright's `expect` API, validating UI elements' visibility, text content, attributes, URLs, and API response statuses/bodies.
*   Test data is meticulously organized into `valid`, `invalid`, `boundary`, `empty and special character`, and `security` categories, ensuring comprehensive test coverage. This data is managed within `src/utils/constants/app.constants.ts` and explicitly referenced in the test data table.

## 2. Prerequisites

Before you can run the automation tests, ensure you have the following installed:

*   **Node.js:** A JavaScript runtime environment. Playwright requires Node.js. It is recommended to install the latest LTS (Long Term Support) version.
*   **npm (Node Package Manager):** Comes bundled with Node.js. Used to install project dependencies.
*   **Git:** For cloning the project repository.
*   **Code Editor:** Visual Studio Code (VS Code) is highly recommended for its excellent TypeScript and Playwright integration.
*   **Playwright Browsers:** Playwright automatically installs Chromium, Firefox, and WebKit during setup. No manual browser installation is required beyond what Playwright provides.

## 3. Project Setup

Follow these steps to set up the project on your local machine:

1.  **Clone the Repository:**
    Open your terminal or command prompt and clone the project repository using Git:
    ```bash
    git clone <repository-url>
    ```
    Replace `<repository-url>` with the actual URL of your Git repository.

2.  **Navigate to the Project Directory:**
    ```bash
    cd <project-folder>
    ```
    Replace `<project-folder>` with the name of the directory created by the cloning process.

3.  **Install Dependencies:**
    Install all required Node.js packages listed in `package.json`:
    ```bash
    npm install
    ```

4.  **Install Playwright Browsers:**
    Playwright requires specific browser binaries to run tests. Install them using the following command:
    ```bash
    npx playwright install
    ```
    This command downloads and configures Chromium, Firefox, and WebKit browsers.

5.  **Configure Environment Variables:**
    The project uses environment variables for sensitive or environment-specific configurations, such as the `BASE_URL`.
    Create a `.env` file in the root directory of your project (if it doesn't already exist) and populate it with the necessary variables. For example:
    ```
    # .env
    BASE_URL=http://localhost:3000
    # CI=true (Uncomment this line if you want to simulate CI environment locally)
    ```
    Ensure `BASE_URL` points to your application under test. The `dotenv` package (configured in `playwright.config.ts`) will automatically load these variables.

## 4. Project Structure

The project follows a modular and organized structure to enhance maintainability and scalability:

```
.
├── src/                               # Source directory for all core automation components
│   ├── pages/                         # Contains Page Object Model (POM) classes
│   │   └── product-search/            # Page objects specific to the product search feature
│   │       └── ProductSearchPage.ts   # POM for the Product Search Page
│   ├── tests/                         # Holds the executable test scripts and test suites
│   │   └── features/                  # Tests organized by application features
│   │       └── product-search/        # Test specifications for the product search feature
│   │           └── product-search.spec.ts # Main test suite for product search
│   ├── fixtures/                      # Provides reusable test setup, teardown, and contexts
│   │   └── contexts/                  # Custom test contexts extending Playwright's base test
│   │       └── ProductSearchTest.ts   # Custom fixture for ProductSearchPage and APIHelper
│   └── utils/                         # General-purpose utility functions and constants
│       ├── api/                       # Utilities for API interactions (e.g., APIHelper for product search)
│       │   └── APIHelper.ts
│       ├── constants/                 # Stores immutable values like URLs, selectors, UI messages, and test data
│       │   ├── app.constants.ts       # Centralized constant definitions
│       │   ├── enums/                 # (Placeholder) Enumerations for common statuses or types
│       │   └── helpers/               # (Placeholder) Generic helper functions
│       │       └── assertions/        # (Placeholder) Custom assertion helpers
├── config/                            # (Placeholder) Stores Playwright configuration files
│   └── environments/                  # (Placeholder) Environment-specific configuration files
├── test-data/                         # (Placeholder) Externalized test data files
│   └── product-search/                # (Placeholder) Data files specific to product search scenarios
├── reports/                           # Output directory for test execution reports and artifacts
│   └── screenshots/                   # Captured screenshots from test failures
├── playwright.config.ts               # Main Playwright configuration file
└── .env                               # Environment variables for test configuration (e.g., BASE_URL)
```

## 5. Test Configuration

The `playwright.config.ts` file defines the global settings for the Playwright test runner:

*   **`testDir`**: `'./src/tests'` - Specifies the directory where test files are located.
*   **`fullyParallel`**: `true` - Tests will be run in parallel, distributing them across available worker processes.
*   **`forbidOnly`**: `!!process.env.CI` - Prevents tests marked with `.only` from running in CI environments, ensuring all tests are executed.
*   **`retries`**: `process.env.CI ? 2 : 0` - Tests will be retried 2 times in CI environments upon failure; no retries locally.
*   **`workers`**: `process.env.CI ? 1 : undefined` - Limits workers to 1 in CI, runs with all available CPU cores locally (default behavior of `undefined`).
*   **`reporter`**: `'html'` - Generates an interactive HTML report after test execution.
*   **`use`**: Defines common options for all tests:
    *   **`baseURL`**: `process.env.BASE_URL || 'http://localhost:3000'` - The base URL for the application under test, loaded from `.env` or defaulting to `http://localhost:3000`.
    *   **`trace`**: `'on-first-retry'` - Captures a Playwright trace for tests that fail on their first attempt, aiding in debugging.
    *   **`screenshot`**: `'only-on-failure'` - Takes a screenshot automatically only when a test fails.
    *   **`video`**: `'on-first-retry'` - Records a video for tests that fail on their first attempt.
    *   **`extraHTTPHeaders`**: `{'Accept': 'application/json'}` - Sets default HTTP headers for API requests, useful for `APIHelper.ts`.
*   **`projects`**: Defines different test projects to run tests across various browsers and devices:
    *   `chromium`: For desktop Chrome browser.
    *   `firefox`: For desktop Firefox browser.
    *   `webkit`: For desktop Safari browser.
    *   `Mobile Chrome`: For mobile Chrome emulation (Pixel 5).
    *   `Mobile Safari`: For mobile Safari emulation (iPhone 12).
*   **`globalSetup`/`globalTeardown`**: Commented out, indicating they are not currently used but can be uncommented and configured for tasks like seeding data or starting/stopping servers if needed.

## 6. Execute Tests

Here are common commands to execute the Playwright tests:

*   **Run all tests:**
    ```bash
    npx playwright test
    ```

*   **Run tests in headed mode (open browser UI):**
    ```bash
    npx playwright test --headed
    ```

*   **Run a specific test file:**
    ```bash
    npx playwright test src/tests/features/product-search/product-search.spec.ts
    ```

*   **Run specific tests by title regex:**
    ```bash
    npx playwright test -g "TC-PS-001"
    npx playwright test -g "case-insensitive"
    ```

*   **Run tests using Chromium browser:**
    ```bash
    npx playwright test --project=chromium
    ```

*   **Run tests using Firefox browser:**
    ```bash
    npx playwright test --project=firefox
    ```

*   **Run tests using WebKit browser:**
    ```bash
    npx playwright test --project=webkit
    ```

*   **Run tests using Mobile Chrome (Pixel 5) emulation:**
    ```bash
    npx playwright test --project="Mobile Chrome"
    ```

*   **Run tests using Mobile Safari (iPhone 12) emulation:**
    ```bash
    npx playwright test --project="Mobile Safari"
    ```

*   **Run tests using multiple workers (e.g., 4 parallel processes):**
    ```bash
    npx playwright test --workers=4
    ```

*   **Run tests without parallelism:**
    ```bash
    npx playwright test --workers=1
    ```

## 7. Test Data

The project utilizes a structured approach to test data, primarily defined within `src/utils/constants/app.constants.ts`. This ensures test data is centralized, easily manageable, and directly linked to the application's expected behavior.

**What test data is used:**
*   **`PRODUCT_DATA`**: An object containing details (name, SKU, description, price) of various products used for search scenarios. This includes "Laptop Pro X", "Gaming Keyboard RGB", "Wireless Mouse", "External SSD 1TB", "Dell UltraSharp Monitor", "Brand New Gadget", and "RGB Gaming Mouse".
*   **`APP_URLS`**: Defines base URLs and specific API endpoints, ensuring tests navigate to the correct locations.
*   **`UI_MESSAGES`**: Stores expected UI texts like "No results found" or validation messages, making assertions robust against content changes.
*   **`SELECTORS`**: Contains CSS selectors (e.g., `[data-qa="search-input"]`) for UI elements, ensuring stable element location strategies.
*   **`MAX_SEARCH_QUERY_LENGTH`**: A constant defining the maximum allowed length for search queries, used in boundary testing.

**Valid and Invalid Data:**
The test cases cover both valid and invalid search terms:
*   **Valid Data:** Exact product names (`Laptop Pro X`), partial names (`Laptop`), SKUs (`LPX-001`), and multi-keyword queries (`Gaming RGB`). This data is expected to yield positive search results.
*   **Invalid Data:** Non-existent product names (`XYZ NonExistent Product 123`), non-existent API product names (`NonExistentAPIProduct`), or missing API parameters. This data is used to verify error messages or no results scenarios.

**Boundary and Negative Test Data:**
*   **Minimum Length:** An empty string (`''`) is used to test client-side validation for mandatory input fields.
*   **Maximum Length:** Search terms exceeding `MAX_SEARCH_QUERY_LENGTH` (e.g., 110 'A's) are used to verify input truncation or validation.
*   **Empty/Special Characters:** Queries with only spaces (`'   '`), or unsupported special characters (`` `!@#$%^&*()_+ ``), are used to test the system's resilience and graceful handling of unexpected input.

**Security-Related Data:**
Specific data is employed to test security vulnerabilities:
*   **SQL Injection:** Terms like `\' OR \'1\'=\'1` and `\'; DROP TABLE products; --` are used to confirm the application prevents malicious database operations.
*   **Cross-Site Scripting (XSS):** Script payloads such as `<script>alert(\'XSS\')</script>` and `<img src=x onerror=alert(\'XSS\')>` are used to ensure the application sanitizes or escapes user input, preventing script execution.

**Relation to Test Scenarios:**
Each piece of test data is directly mapped to one or more test cases, as detailed in the provided "Test Data" table. For example, `TC-PS-001` uses `Laptop Pro X` to verify exact name search, while `TC-PS-023` uses SQL injection strings to test security. Some scenarios (like `TC-PS-010` and `TC-PS-022`) dynamically mock API responses or rely on the assumption of pre-existing data for comprehensive coverage.

## 8. Assertions and Validation

The automation framework employs a comprehensive set of Playwright assertions to validate application behavior and state. These assertions ensure that the UI behaves as expected and that API responses are correct.

**Key Playwright Validations:**

*   **URL Validation (`expect(page).toHaveURL()`):**
    *   Verifies that the browser navigates to the correct URL after actions (e.g., search results page with query parameters, product detail page).
    *   Examples: `await expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`));`
    *   `await expect(page).toHaveURL(new RegExp(`${APP_URLS.PRODUCT_DETAIL_BASE}.*`));`

*   **Page Title Validation (`expect(page).toHaveTitle()`):**
    *   Ensures the page title is appropriate for the current page.
    *   Example: `await expect(page).toHaveTitle(/home|search|shop/i);`

*   **UI Element Visibility and State Validation (`expect(locator).toBeVisible()`, `toBeEditable()`, `toBeEnabled()`, `toBeFocused()`):**
    *   Confirms critical UI elements like search inputs, buttons, product cards, and messages are present, interactive, and in the expected state.
    *   Examples: `await expect(productSearchPage.searchInput).toBeVisible();`
    *   `await expect(productSearchPage.searchButton).toBeEnabled();`
    *   `await expect(productSearchPage.searchInput).toBeFocused();`
    *   `await expect(productSearchPage.paginationPrevButton).toBeHidden();`

*   **Text Content Validation (`expect(locator).toHaveText()`, `toContainText()`, `not.toContainText()`):**
    *   Checks if elements display the correct text, including product names, SKUs, prices, placeholder texts, and error messages.
    *   Examples: `await expect(productSearchPage.getProductName(productCards.first())).resolves.toBe(PRODUCT_DATA.LAPTOP_PRO_X.name);`
    *   `await expect(productSearchPage.noResultsMessage).toContainText(UI_MESSAGES.NO_RESULTS);`
    *   `await expect(page.locator('body')).not.toContainText(/sql error|database error/i);`

*   **Attribute Validation (`expect(locator).toHaveAttribute()`):**
    *   Confirms elements have expected HTML attributes, such as `placeholder` for input fields or `src` for images.
    *   Example: `await expect(productSearchPage.searchInput).toHaveAttribute('placeholder', /search product|search by name or sku/i);`

*   **Element Count Validation (`expect(locator).toHaveCount()`, `toBeGreaterThanOrEqual()`):**
    *   Verifies the number of displayed items, such as product cards, to confirm search results or the absence of results.
    *   Examples: `await expect(productCards).toHaveCount(1);`
    *   `await expect(productSearchPage.getAllProductCards()).toBeGreaterThanOrEqual(1);`
    *   `await productSearchPage.expectNoProductsDisplayed();` (custom assertion wrapping `toHaveCount(0)`)

*   **Client-Side Validation Message (`expect(locator).toHaveJSProperty('validationMessage', expectedMessage)`):**
    *   Validates native HTML5 client-side validation messages for input fields.
    *   Example: `expect(validationMessage).toContain(UI_MESSAGES.EMPTY_SEARCH_TERM_VALIDATION);`

*   **Input Value Validation (`expect(locator).toHaveValue()`):**
    *   Checks the current value of input fields, ensuring search terms are correctly retained or truncated.
    *   Example: `await expect(productSearchPage.searchInput).toHaveValue(searchTerm);`

*   **API Response Validation (`expect(response.status()).toBe()`, `response.json()`, `toBeInstanceOf(Array)`, `toBeTruthy()`):**
    *   Ensures API calls return the expected HTTP status codes (e.g., 200 OK, 400 Bad Request).
    *   Validates the structure and content of JSON response bodies, including checking for specific products or empty arrays.
    *   Examples: `await expect(response.status()).toBe(200);`
    *   `await api.expectProductInApiResponse(response, PRODUCT_DATA.GAMING_KEYBOARD_RGB.name);`
    *   `expect(jsonResponse).toBeInstanceOf(Array);`

*   **Performance Metric Validation (`expect(duration).toBeLessThan()`):**
    *   Asserts that page load or action durations fall within acceptable performance thresholds.
    *   Example: `expect(duration).toBeLessThan(2000);`

*   **Negative Validations:** Many tests include negative assertions, such as `not.toBeVisible()`, `not.toContainText()`, `not.toHaveCount(0)`, or checking for empty API responses, to confirm that unwanted elements or behaviors are absent.
    *   Examples: `await expect(productSearchPage.noResultsMessage).not.toBeVisible();`
    *   `await expect(page.locator('body')).not.toContainHTML(term);`

## 9. Reports and Debugging

Playwright provides powerful tools for reporting test results and debugging failures.

*   **HTML Report:**
    After test execution, an interactive HTML report is generated in the `playwright-report/` directory. You can open it using:
    ```bash
    npx playwright show-report
    ```
    This report summarizes test runs, lists failed tests, and provides details including screenshots, videos, and traces (if configured and captured).

*   **Screenshots:**
    Configured with `screenshot: 'only-on-failure'` in `playwright.config.ts`, Playwright automatically captures a screenshot for any test that fails, saving it in `reports/screenshots/`. These screenshots are embedded directly into the HTML report.

*   **Videos:**
    Configured with `video: 'on-first-retry'` in `playwright.config.ts`, Playwright records a video of the browser interaction for any test that fails on its first attempt. These videos are invaluable for understanding the exact sequence of events leading to a failure. They are linked in the HTML report.

*   **Traces:**
    Configured with `trace: 'on-first-retry'` in `playwright.config.ts`, Playwright captures a detailed trace for tests that fail on their first attempt. A trace is a comprehensive log of all Playwright operations, network requests, DOM snapshots, and test execution. You can view a trace by clicking the "Trace" button in the HTML report or by running:
    ```bash
    npx playwright show-trace <path-to-trace-zip-file>
    ```

*   **Debugging with Playwright Inspector:**
    To debug tests interactively, you can use the Playwright Inspector. This opens a browser window and a Playwright Inspector panel, allowing you to step through actions, inspect selectors, and see logs.
    ```bash
    npx playwright test --debug
    ```
    You can also use the `page.pause()` method within your test code to pause execution at a specific point and open the Inspector.

*   **Playwright UI Mode:**
    For an enhanced debugging and development experience, Playwright offers a UI mode. This provides a graphical interface to run, debug, and develop tests, complete with a test explorer, trace viewer, and step-by-step execution.
    ```bash
    npx playwright test --ui
    ```

## 10. CI/CD Execution

While there is no explicit CI/CD configuration file provided in the artifacts, the `playwright.config.ts` file includes settings that are optimized for Continuous Integration (CI) environments:

*   **`forbidOnly: !!process.env.CI`**: Ensures that tests marked with `.only` are not accidentally committed and run in CI, forcing all relevant tests to execute.
*   **`retries: process.env.CI ? 2 : 0`**: Configures test retries specifically for CI builds to handle flaky tests gracefully.
*   **`workers: process.env.CI ? 1 : undefined`**: Limits the number of parallel workers in CI, which can be important for resource management on shared CI runners.

To integrate these tests into a CI/CD pipeline, you would typically:
1.  **Install Node.js and npm**: Configure your CI runner to have Node.js and npm installed.
2.  **Install Dependencies**: Run `npm install` to install project dependencies.
3.  **Install Playwright Browsers**: Run `npx playwright install --with-deps` (if on Linux container) or `npx playwright install` to set up browsers.
4.  **Set Environment Variables**: Define `BASE_URL` (and potentially `CI=true`) as environment variables within your CI/CD pipeline settings.
5.  **Execute Tests**: Run `npx playwright test` as a build step.
6.  **Publish Reports**: Configure a step to archive and publish the `playwright-report/` directory as a build artifact, allowing easy access to test results.

## 11. Troubleshooting

Here's guidance for common issues you might encounter:

*   **Browser Installation Issues (`Browser is not installed` errors):**
    *   **Solution:** Rerun `npx playwright install`. If on a Linux CI environment, `npx playwright install --with-deps` might be necessary to install system dependencies. Check network connectivity for downloads.

*   **Locator Failures (`TimeoutError: locator.click() failed` or `locator.isVisible() failed`):**
    *   **Cause:** The target element was not found or not in an interactive state within the default timeout.
    *   **Solution:**
        1.  **Use Playwright Inspector:** Run `npx playwright test --debug` or `npx playwright test --ui` to step through the test and visually inspect the element.
        2.  **Verify Selector:** Ensure the selector in `src/utils/constants/app.constants.ts` is correct and robust (e.g., using `data-qa` attributes).
        3.  **Add Waits:** Use explicit waits like `page.waitForSelector()`, `locator.waitFor()`, or `page.waitForLoadState('networkidle')` if the page needs more time to load or an element appears asynchronously.
        4.  **Increase Timeout:** Temporarily increase the action timeout (e.g., `await locator.click({ timeout: 10000 });`) or the global timeout in `playwright.config.ts` if the application is generally slow.

*   **Timeout Errors (`Test timeout of 30000ms exceeded`):**
    *   **Cause:** The entire test, or a specific action, took longer than the configured timeout.
    *   **Solution:**
        1.  **Optimize Tests:** Refactor slow steps, use more efficient locators, or perform actions more directly.
        2.  **Increase Test Timeout:** Adjust `timeout` in `playwright.config.ts` or for a specific test (`test.setTimeout(60000)`).
        3.  **Check Network/Application Performance:** Slow tests might indicate slow application response times or network issues.

*   **Environment/Configuration Issues (`baseURL is not defined` or incorrect URL):**
    *   **Cause:** The `.env` file is missing, or `BASE_URL` is not correctly set.
    *   **Solution:**
        1.  **Verify `.env`:** Ensure `BASE_URL` is correctly defined in the `.env` file at the project root.
        2.  **Restart Test Runner:** Sometimes, changes to `.env` require restarting the test runner.
        3.  **Check `playwright.config.ts`:** Confirm `dotenv.config()` is called correctly and `baseURL` is referencing `process.env.BASE_URL`.

*   **Test Data Problems (Tests failing due to incorrect expected data):**
    *   **Cause:** The data in `src/utils/constants/app.constants.ts` no longer matches the application's actual data, or mock responses are incorrect.
    *   **Solution:**
        1.  **Update Constants:** Review `PRODUCT_DATA`, `UI_MESSAGES`, etc., in `app.constants.ts` and update them to reflect the current application state.
        2.  **Inspect Application:** Manually verify the expected data on the application under test.
        3.  **Review Mocks:** For tests using `page.route()` (like TC-PS-010, TC-PS-022, TC-PS-027, TC-PS-028), ensure the mocked responses correctly simulate the desired scenario.

*   **Parallel Execution Issues (Tests pass when run individually but fail in parallel):**
    *   **Cause:** Race conditions, shared state, or dependencies between tests that assume sequential execution.
    *   **Solution:**
        1.  **Run with `--workers=1`:** Execute tests sequentially to confirm if parallelism is the issue.
        2.  **Isolate Tests:** Ensure each test is independent and sets up its own state. Avoid relying on global variables or modifications made by other tests.
        3.  **Use `test.beforeEach` and `test.afterEach`:** Clean up or set up unique data for each test.
        4.  **Review Fixtures:** Ensure custom fixtures are correctly scoped (`{ page }` vs `{ test }`) to provide isolated environments.

*   **Failed Assertions (Test fails but the UI/API looks correct):**
    *   **Cause:** Assertion logic might be flawed, or there might be subtle differences not immediately obvious.
    *   **Solution:**
        1.  **Detailed Debugging:** Use Playwright Inspector (`--debug` or `--ui`) or traces to see the exact state of the DOM and network at the point of failure.
        2.  **Log Values:** Add `console.log()` statements to output actual values before assertions.
        3.  **Refine Assertions:** Ensure assertions are specific enough but not overly brittle. For example, use `toContainText()` for partial matches instead of `toHaveText()` for exact text where minor variations are acceptable.

## 12. Execution Flow

The automation project's execution follows a structured, modular flow:

1.  **Environment Setup & Configuration:**
    *   Node.js, npm, and Playwright browsers are installed.
    *   `playwright.config.ts` defines global settings like `baseURL`, browser projects, and reporting.
    *   `.env` file is loaded for environment-specific variables like `BASE_URL`.

2.  **Test Data Preparation:**
    *   `src/utils/constants/app.constants.ts` provides centralized data:
        *   `APP_URLS`: Target application endpoints.
        *   `SELECTORS`: UI element locators.
        *   `UI_MESSAGES`: Expected text messages.
        *   `PRODUCT_DATA`: Specific product information for test scenarios.
        *   `MAX_SEARCH_QUERY_LENGTH`: Boundary value for search input.
    *   For certain scenarios (TC-PS-010, TC-PS-022, TC-PS-027, TC-PS-028), API responses are mocked within tests using `page.route()` to simulate specific backend behaviors or data.

3.  **Test Execution:**
    *   The Playwright Test Runner is invoked (e.g., `npx playwright test`).
    *   It reads `playwright.config.ts` to determine which tests to run and on which browsers/devices.
    *   Tests are executed in parallel by default, distributing workload across worker processes.

4.  **Application Interaction (Page Objects / API Helper):**
    *   Each test (`src/tests/features/product-search/product-search.spec.ts`) uses custom fixtures (`ProductSearchTest.ts`) to access:
        *   **`productSearchPage` (Page Object Model):** Methods in `ProductSearchPage.ts` encapsulate UI interactions (e.g., `navigateToHomePage()`, `search()`, `clickPaginationLink()`). This abstracts the low-level Playwright API from test logic.
        *   **`api` (API Helper):** Methods in `APIHelper.ts` handle direct API calls (e.g., `searchProducts()`), returning API responses for validation.
    *   Test steps perform actions on the UI or make API requests through these helper classes.

5.  **Validations & Assertions:**
    *   After interactions, `expect` statements from Playwright are used to verify the application's state.
    *   These include UI element checks (visibility, text, attributes, focus), URL validations, API response status and body content checks, and performance metrics.
    *   Custom assertion methods within `ProductSearchPage` and `APIHelper` (e.g., `expectProductToBeDisplayed()`, `expectEmptyApiResponse()`) provide higher-level, business-logic-driven validations.

6.  **Test Result:**
    *   Each test passes or fails based on the evaluation of its assertions.

7.  **Report Generation:**
    *   Upon completion, Playwright generates an HTML report (`playwright-report/`).
    *   For failing tests, screenshots (`reports/screenshots/`), videos, and traces are captured and linked in the report, providing rich debugging information.

8.  **Debugging & Analysis:**
    *   Developers and QA engineers can use the HTML report, Playwright Inspector (`--debug` or `--ui`), or trace viewer to analyze test failures, identify root causes, and fix issues efficiently.

## 13. Useful Commands

Here is a quick reference for common Playwright commands:

| Command                                                                 | Description                                                                                             |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `npm install`                                                           | Installs all project dependencies.                                                                      |
| `npx playwright install`                                                | Installs Playwright's browser binaries (Chromium, Firefox, WebKit).                                     |
| `npx playwright test`                                                   | Runs all tests in the project.                                                                          |
| `npx playwright test --headed`                                          | Runs all tests with browser UI visible.                                                                 |
| `npx playwright test src/tests/features/product-search/product-search.spec.ts` | Runs tests from a specific file.                                                                        |
| `npx playwright test -g "TC-PS-001"`                                    | Runs tests matching a specific pattern in their title (e.g., a test case ID).                           |
| `npx playwright test --project=chromium`                                | Runs tests only on Chromium. (Use `"Mobile Chrome"` or `"Mobile Safari"` for mobile emulation projects). |
| `npx playwright test --workers=4`                                       | Runs tests using 4 parallel worker processes.                                                           |
| `npx playwright test --ui`                                              | Opens the Playwright UI for interactive test development and debugging.                                 |
| `npx playwright test --debug`                                           | Runs tests in debug mode, opening Playwright Inspector.                                                 |
| `npx playwright show-report`                                            | Opens the latest HTML test report in your browser.                                                      |
| `npx playwright show-trace <path-to-trace.zip>`                         | Opens a captured Playwright trace file for detailed debugging.                                          |