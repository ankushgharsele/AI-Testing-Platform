# Playwright Automation Execution Guide

This guide provides comprehensive instructions for setting up, configuring, executing, and understanding the Playwright TypeScript automation project. It covers the project's purpose, structure, configuration, test execution, reporting, and debugging, adhering strictly to the provided project artifacts.

## 1. Project Overview

This automation project leverages **Playwright** with **TypeScript** to provide a robust framework for End-to-End (E2E), API, performance, security, and accessibility testing. Its primary purpose is to ensure the quality and reliability of a web application, specifically focusing on Retailer Management functionalities and a generic Product Search feature.

Key functionalities automated include:
*   **User Authentication (E2E)**: Login process for different user roles (e.g., 'salesman') with persistent session management.
*   **Retailer Management (E2E)**:
    *   Successful creation of new retailer records with mandatory details.
    *   Negative testing for retailer creation, including missing mandatory fields, invalid email formats, and duplicate retailer codes.
*   **Product Search (E2E & API)**:
    *   Comprehensive testing of product search functionality by exact name, partial name, SKU (case-insensitive where applicable).
    *   Validation of "no results found" scenarios for non-existent, empty, or space-only queries.
    *   UI/UX aspects like search bar visibility, placeholder text, button functionality, and keyboard navigation.
    *   Integration tests for navigation to product detail pages from search results.
    *   API-level verification of search endpoints, including error handling for missing query parameters.
    *   Security testing to prevent SQL Injection and Cross-Site Scripting (XSS) attacks.
    *   Basic performance measurement for search response times.
    *   Accessibility checks for keyboard navigation.
    *   Browser history (back/forward) functionality after searches.

The framework utilizes custom Playwright test fixtures, a Page Object Model (POM) for UI interactions, and dynamically generated test data to enhance maintainability, reusability, and test reliability. Assertions are made using Playwright's `expect` API to validate application behavior at both the UI and API levels.

## 2. Prerequisites

Before setting up and executing the automation project, ensure the following software is installed on your system:

*   **Node.js**: A JavaScript runtime environment. It is recommended to use an LTS (Long Term Support) version.
*   **npm**: Node Package Manager, which comes bundled with Node.js. Used for installing project dependencies.
*   **Git**: A version control system to clone the project repository.
*   **VS Code (Recommended)** or any other compatible code editor for developing and debugging tests.
*   **Playwright**: The Playwright test runner and libraries. This will be installed as part of the project setup.
*   **Browser Dependencies**: Playwright automatically downloads necessary browser binaries (Chromium, Firefox, WebKit) during installation.

## 3. Project Setup

Follow these steps to set up the project locally:

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    ```
    Replace `<repository-url>` with the actual URL of your Git repository.

2.  **Navigate to the Project Directory**:
    ```bash
    cd playwright-framework
    ```
    Replace `playwright-framework` with the actual name of your project folder if it differs.

3.  **Install Dependencies**:
    Install all required Node.js packages, including Playwright itself:
    ```bash
    npm install
    ```

4.  **Install Playwright Browser Binaries**:
    Playwright needs browser binaries to run tests. This command will download them:
    ```bash
    npx playwright install
    ```
    To install specific browsers, e.g., only Chromium:
    ```bash
    npx playwright install chromium
    ```

5.  **Environment Configuration**:
    The project uses `dotenv` to manage environment-specific configurations. Create `.env` files in the project root based on the environment you wish to run tests against. For example, for the `qa` environment, create a file named `.env.qa`.
    Example `.env.qa` content:
    ```
    NODE_ENV=qa
    APP_BASE_URL=https://retailer-portal.qa.example.com
    API_BASE_URL=https://retailer-api.qa.example.com/v1
    ```
    The `playwright.config.ts` will automatically load `.env.test` by default if `NODE_ENV` is not explicitly set, or `.env.qa` if `NODE_ENV=qa`.

## 4. Project Structure

The project follows a well-organized structure to separate concerns and enhance maintainability:

```
.github/                 # Contains GitHub Actions workflows for CI/CD.
playwright-framework/    # Global Playwright setup files.
  ├── auth.setup.ts      # Script for authenticating and saving user session state.
  └── global.setup.ts    # Global setup script (currently empty, but reserved for future use).
src/                     # Core automation framework source code.
  ├── config/            # Manages application configuration and environment-specific settings.
  │   ├── environments/  # Specific configuration files for different environments (dev, qa).
  │   │   ├── dev.config.ts
  │   │   └── qa.config.ts
  │   └── index.ts       # Central entry point for accessing application configurations.
  ├── constants/         # Stores immutable values, enumerations, and magic strings.
  ├── fixtures/          # Defines custom Playwright test fixtures for reusable setup/teardown logic.
  │   ├── api.fixture.ts # Custom fixture for API test contexts (implied by API tests, not explicitly provided but structure shows intent)
  │   └── base.fixture.ts# Base custom fixture providing PageManager and extending Playwright's test.
  ├── helpers/           # Provides generic, reusable helper functions (e.g., assertions, date utils).
  │   ├── assertions.helper.ts
  │   └── date.helper.ts
  ├── pages/             # Implements the Page Object Model (POM) for UI interactions.
  │   ├── auth/          # Page objects for authentication-related flows.
  │   │   └── LoginPage.ts
  │   ├── common/        # Common UI components (e.g., headers, footers).
  │   │   └── HeaderComponent.ts
  │   ├── retailers/     # Page objects for retailer management features.
  │   │   └── CreateRetailerPage.ts
  │   └── PageManager.ts # Central manager to instantiate and access all page objects.
  ├── test-data/         # Repository for static and dynamically generated test data.
  │   ├── retailers/     # Test data specific to retailer features.
  │   │   └── newRetailer.ts
  │   ├── schemas/       # JSON schemas for API response validation.
  │   └── users.json     # Static user credentials for authentication.
  ├── types/             # TypeScript definitions for custom types and interfaces.
  └── utils/             # Contains general utility functions (e.g., API, browser, string utilities).
      ├── api.utils.ts
      ├── browser.utils.ts
      └── string.utils.ts
tests/                   # Contains all test scripts, organized by type (E2E, API, Performance).
  ├── api/               # API-level tests.
  │   └── retailers/
  │       └── createRetailer.api.spec.ts # Example API test for creating a retailer.
  ├── e2e/               # End-to-end UI tests.
  │   ├── auth/
  │   │   └── login.spec.ts            # E2E test for user login.
  │   ├── retailers/
  │   │   └── createRetailer.spec.ts   # E2E test for creating a retailer.
  │   └── features/product-search/
  │       └── product-search.spec.ts   # E2E test for product search functionality.
  └── performance/       # Placeholder for performance tests.
reports/                 # Directory for generated test reports and artifacts.
  ├── html/              # Playwright HTML reports.
  ├── json/              # Raw JSON test results.
  └── allure-results/    # Allure report data.
playwright.config.ts     # Main Playwright configuration file.
```

## 5. Test Configuration

The `playwright.config.ts` file is the central configuration for all Playwright tests.

*   **`testDir: './tests'`**: Specifies that test files are located in the `./tests` directory.
*   **`fullyParallel: true`**: Allows tests to run in parallel to speed up execution.
*   **`forbidOnly: !!process.env.CI`**: Fails the build on CI environments if `test.only` is accidentally committed.
*   **`retries: process.env.CI ? 2 : 0`**: Retries failed tests 2 times on CI, but not locally.
*   **`workers: process.env.CI ? 1 : undefined`**: Runs tests with a single worker on CI (to avoid resource contention), uses default (or `fullyParallel`) workers locally.
*   **`baseURL: baseURL`**: The base URL for the application, dynamically loaded from `src/config/index.ts` based on `NODE_ENV`.
*   **`trace: 'on-first-retry'`**: Captures traces (steps, screenshots, network logs) for tests that fail on their first attempt, helping debug flaky tests.
*   **`screenshot: 'only-on-failure'`**: Captures a screenshot only when a test fails.
*   **`storageState: path.join(__dirname, 'playwright/.auth/user.json')`**: Specifies the path to store and reuse authentication state across tests. This is generated by the `setup` project.
*   **`reporter`**: Configured to generate multiple types of reports:
    *   `list`: Console output during execution.
    *   `html`: An interactive HTML report in `reports/html`.
    *   `json`: Raw JSON results in `reports/json/results.json`.
    *   `allure-playwright`: For detailed, interactive Allure reports in `reports/allure-results`.
*   **`projects`**: Organizes tests into different logical groups:
    *   **`name: 'setup'`**: A special project that runs `playwright-framework/auth.setup.ts` once to handle user authentication and save the session state to `playwright/.auth/user.json`. Other projects depend on this.
    *   **`name: 'chromium'`**: Runs E2E tests in Google Chrome. It depends on the `setup` project and reuses the saved authentication state.
    *   **`name: 'firefox'`**: Runs E2E tests in Mozilla Firefox, also depending on `setup` and reusing authentication.
    *   **`name: 'webkit'`**: Runs E2E tests in Apple WebKit, also depending on `setup` and reusing authentication.
    *   **`name: 'api'`**: Runs API tests from `./tests/api`. It has its own `baseURL` (`process.env.API_BASE_URL || baseURL`) and typically doesn't require UI-based authentication state.
*   **Environment Configuration (`src/config/index.ts`)**: The framework dynamically loads `baseURL` and `apiBaseURL` from environment-specific configuration files (e.g., `qa.config.ts`, `dev.config.ts`) based on the `NODE_ENV` environment variable. If `NODE_ENV` is not set or not recognized, it defaults to `qa`.

## 6. Execute Tests

Tests can be executed using various Playwright CLI commands.

**Important**: To run tests against a specific environment (e.g., QA, Development), you must set the `NODE_ENV` environment variable before running the `npx playwright test` command. This will load the correct `baseURL` and `apiBaseURL` from the `src/config` directory.

### Run All Tests

To execute all tests defined in the `tests` directory across all configured browser projects and API projects:

```bash
# Run against the QA environment (default if no NODE_ENV)
# Ensure your .env.qa or .env.test file is configured
npx playwright test
```

### Run in Headed Mode (with UI visibility)

To see the browser UI during test execution, which is useful for debugging:

```bash
npx playwright test --headed
```

### Run a Specific Test File

To execute tests from a single test file:

```bash
# Example for E2E Retailer creation test
npx playwright test tests/e2e/retailers/createRetailer.spec.ts

# Example for E2E Product Search tests
npx playwright test tests/e2e/features/product-search/product-search.spec.ts
```

### Run Tests by Project

To run tests only for a specific browser or API project:

```bash
# Run E2E tests using Chromium browser
npx playwright test --project=chromium

# Run E2E tests using Firefox browser
npx playwright test --project=firefox

# Run E2E tests using WebKit browser
npx playwright test --project=webkit

# Run API tests only
npx playwright test --project=api
```

### Run Tests with Multiple Workers

By default, Playwright runs tests in parallel. You can explicitly control the number of workers:

```bash
# Run tests using 4 parallel workers
npx playwright test --workers=4
```

### Run Tests on a Specific Environment

To specify the environment (e.g., `development`, `qa`), set the `NODE_ENV` environment variable. This will load the corresponding configuration from `src/config/environments/`:

```bash
# On Linux/macOS
NODE_ENV=development npx playwright test --project=chromium

# On Windows (Command Prompt)
set NODE_ENV=development && npx playwright test --project=chromium

# On Windows (PowerShell)
$env:NODE_ENV="development"; npx playwright test --project=chromium
```

## 7. Test Data

The project utilizes a mix of static and dynamically generated test data to ensure comprehensive test coverage and reduce data collision issues.

### Authentication Data (`src/test-data/users.json`)

*   **Salesman Credentials**: `username: salesman@example.com`, `password: SalesmanPassword123`. Used by `auth.setup.ts` to log in and establish a persistent session for E2E tests.
*   **Admin Credentials**: `username: admin@example.com`, `password: AdminPassword123`. Available but currently unused in the provided test scripts.

### Retailer Test Data (`src/test-data/retailers/newRetailer.ts`)

*   **Dynamic Data Generation**: The `generateNewRetailerData()` function uses `faker-js` to create unique and realistic retailer details (name, code, email, phone, address, etc.) for each test run. This is crucial for tests like `TC-RET-001` to ensure unique retailer creations and avoid collisions.
*   **Valid Data**: The `generateNewRetailerData` function produces valid data that meets typical input requirements.
*   **Invalid Data**:
    *   **Empty String**: `TC-RET-002` tests an empty "Retailer Name" to trigger a client-side validation error: "Retailer Name is required."
    *   **Invalid Email Format**: `TC-RET-003` uses `invalid-email-format` to test email validation: "Please enter a valid email address."
    *   **Duplicate Code**: `TC-RET-004` simulates a server-side error by attempting to create a retailer with an `existing retailer's code`, expecting the message: "Retailer code already exists. Please use a unique code."

### Product Search Test Data (Implied by `product-search.spec.ts` from constants)

The `product-search.spec.ts` file extensively uses predefined product data (e.g., `PRODUCT_DATA.LAPTOP_PRO_X`, `PRODUCT_DATA.WIRELESS_MOUSE`) and UI messages (`UI_MESSAGES.GENERIC_ERROR`) imported from constants (e.g., `app.constants.ts`).

*   **Valid Search Queries**:
    *   **Exact Matches**: `Laptop Pro X`, `LPX-001` (SKU).
    *   **Partial Matches**: `Laptop`.
    *   **Case-Insensitive**: `laptop pro x`, `lpx-001`.
    *   **Multiple Keywords**: `Gaming RGB`, `RGB Gaming`.
    *   **Special Characters**: `Dell UltraSharp Monitor`.
    *   **Leading/Trailing Spaces**: `  Wireless Mouse  ` (expected to be trimmed).
*   **Invalid Search Queries**:
    *   **Non-existent Product**: `XYZ NonExistent Product 123` (expected: "No results found").
    *   **Empty String**: `""` (expected: "No results found", URL remains home).
    *   **Only Spaces**: `"   "` (expected: "No results found", URL remains home if trimmed).
    *   **Missing Query Parameter (API)**: API call without query (expected: 400 Bad Request, "Query parameter required").
*   **Boundary Values**:
    *   **Max Length**: Search queries are truncated at `MAX_SEARCH_QUERY_LENGTH` (e.g., 100 characters) to test input field limits.
    *   **Invalid Length**: Exceeding max length (e.g., `A`.repeat(101)) results in truncation and search with the valid length.
*   **Security-Related Data**:
    *   **SQL Injection Attempts**: `' OR '1'='1`, `'; DROP TABLE products; --`, `SLEEP(5)`. Tests assert that these do not cause errors or unintended data exposure/manipulation.
    *   **XSS Attack Attempts**: `<script>alert('XSS')</script>`, `<img src=x onerror=alert('XSS')>`. Tests assert that these are rendered as plain text and do not execute JavaScript.

## 8. Assertions and Validation

The framework utilizes Playwright's powerful `expect` API for a wide range of validations across UI and API tests.

### Common UI Validations (`createRetailer.spec.ts`, `product-search.spec.ts`)

*   **URL Validation**:
    *   `expect(page).toHaveURL(/.*\/login/)`
    *   `expect(page).toHaveURL(/.*\/retailers\/create/)`
    *   `expect(page).toHaveURL(new RegExp(`${APP_URLS.HOME}\\?query=${encodeURIComponent(searchTerm)}`))`
*   **Page Title Validation**:
    *   `expect(page).toHaveTitle(/home|shop|store/i)`
    *   `expect(page).toHaveTitle(new RegExp(`search results for ${searchTerm}|${searchTerm} - mystore`,'i'))`
*   **UI Element Visibility/State Validation**:
    *   `expect(locator).toBeVisible()`: Checks if an element is present in the DOM and visible.
    *   `expect(locator).not.toBeVisible()`: Checks if an element is not visible.
    *   `expect(locator).toBeEditable()`: Checks if an input field is editable.
    *   `expect(locator).toBeEnabled()`: Checks if a button or input is enabled.
    *   `expect(locator).toBeEmpty()`: Checks if an input field is empty.
    *   `expect(locator).toBeFocused()`: Checks if an element currently has focus.
    *   `expect(locator).toBeHidden()`: Checks if an element is hidden.
*   **Text and Value Validation**:
    *   `expect(locator).toHaveValue(expectedValue)`: Checks the current value of an input.
    *   `expect(locator).toContainText(expectedText)`: Checks if an element contains specific text.
    *   `expect(locator).toHaveText(expectedText)`: Checks for exact text match.
    *   `expect(locator).toMatch(/^\$\d+(\.\d{2})?$/)`: Regex for price format.
*   **Attribute Validation**:
    *   `expect(locator).toHaveAttribute('placeholder', /search product/i)`: Checks for placeholder text.
    *   `expect(locator).toHaveAttribute('aria-invalid', 'true')`: Checks ARIA attributes for validation state.
    *   `expect(locator).toHaveAttribute('data-qa', 'product-card')`
*   **Count Validation**:
    *   `expect(locator).toHaveCount(expectedCount)`: Checks the number of matching elements.
    *   `expect(locator).toBeGreaterThanOrEqual(minCount)`: Checks if count is at least a minimum value.
*   **Positive Validations**:
    *   Successful login: Verification of dashboard elements (`h1` with "Dashboard", "Welcome" text).
    *   Successful retailer creation: `pageManager.createRetailerPage.verifyRetailerCreationSuccess('Retailer created successfully!')` and redirection to retailer detail page.
    *   Successful product search: `productSearchPage.expectProductToBeDisplayed()`, product card details, correct URL and title.
*   **Negative Validations**:
    *   Login error: `pageManager.loginPage.verifyErrorMessageVisible('Invalid credentials.')`.
    *   Retailer creation validation errors: `pageManager.createRetailerPage.verifyFieldErrorMessage(...)` for missing name, invalid email, duplicate code.
    *   "No results found" for invalid searches: `productSearchPage.expectNoProductsDisplayed()`, `productSearchPage.expectNoResultsMessageToBeDisplayed()`.
    *   No unexpected errors: `expect(page.locator('body')).not.toContainText(/sql error|database error/i)` for security tests.

### API Validations (`product-search.spec.ts`)

*   **Status Code Validation**: `expect(response.status()).toBe(200)` or `expect(response.status()).toBe(400)`.
*   **Response Header Validation**: `expect(response.headers()['content-type']).toContain('application/json')`.
*   **Response Body Validation**:
    *   `api.expectProductInApiResponse(response, productName)`: Custom assertion to check if a specific product exists in the JSON response.
    *   `api.expectEmptyApiResponse(response)`: Custom assertion for empty results.
    *   `expect(jsonResponse.length).toBeGreaterThanOrEqual(1)`: Validating the number of items in an array response.
    *   `expect(jsonResponse.message).toBeDefined()`: Checking for error message presence.
*   **Performance Validations**:
    *   `expect(duration).toBeLessThan(2000)`: Asserting that an action completes within an acceptable time threshold.

## 9. Reports and Debugging

Playwright provides robust reporting and debugging tools.

### Viewing HTML Reports

After tests run, an HTML report is generated in the `reports/html` directory. To view it:

```bash
npx playwright show-report
```
This command will open the latest HTML report in your browser, providing a visual overview of test results, including steps, durations, and any attached screenshots or traces.

### Allure Reports

For more detailed and interactive reports, this project is configured to generate Allure reports.
1.  **Generate Allure results**: These are automatically generated in `reports/allure-results` during test execution due to the `allure-playwright` reporter configured in `playwright.config.ts`.
2.  **Generate and open the Allure report**:
    ```bash
    npm install -g allure-commandline --save-dev # Install Allure CLI if not already
    allure generate reports/allure-results --clean -o reports/allure-report
    allure open reports/allure-report
    ```
    This will compile the results and open the comprehensive Allure report in your browser.

### Debugging Tests

Playwright offers several ways to debug your tests:

*   **Playwright Inspector (`--debug`)**: Opens the Playwright Inspector, a GUI tool that allows you to step through tests, inspect locators, and view action logs.
    ```bash
    npx playwright test --debug
    ```
    You can also use the `PWDEBUG=1` environment variable:
    ```bash
    PWDEBUG=1 npx playwright test tests/e2e/retailers/createRetailer.spec.ts
    ```

*   **Playwright UI Mode (`--ui`)**: Provides a powerful UI for running, debugging, and exploring tests. It allows you to filter tests, retry failed ones, step through execution, and inspect snapshots and traces.
    ```bash
    npx playwright test --ui
    ```

### Screenshots, Videos, and Traces

The `playwright.config.ts` is configured to capture diagnostic artifacts:
*   **Screenshots**: `screenshot: 'only-on-failure'` saves a screenshot to the test-results directory if a test fails.
*   **Traces**: `trace: 'on-first-retry'` captures a detailed trace (including DOM snapshots, network logs, and action steps) for tests that fail on their first attempt. These traces can be viewed using the Playwright Trace Viewer:
    ```bash
    npx playwright show-trace <path-to-trace.zip>
    ```
    (e.g., `npx playwright show-trace test-results/my-test-chromium/trace.zip`)

## 10. CI/CD Execution

The project contains a `.github/` directory, indicating integration with GitHub Actions for Continuous Integration/Continuous Deployment.

When executed in a CI/CD environment (where `process.env.CI` is typically `true`):
*   **`forbidOnly`**: Playwright will fail the build if any `test.only` calls are found, preventing accidental partial test runs in CI.
*   **`retries`**: Failed tests will be retried 2 times to mitigate flaky failures.
*   **`workers`**: Tests will run with a single worker (`workers: 1`) to conserve CI resources and ensure stability, potentially sacrificing some parallelism.
*   **Reporters**: All configured reporters (list, html, json, allure) will generate their respective outputs, which can then be published as build artifacts.

To configure your CI/CD pipeline, you would typically add a step similar to this (example for GitHub Actions):

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    NODE_ENV: qa # Or 'production', depending on your CI environment
    APP_BASE_URL: ${{ secrets.APP_BASE_URL_QA }} # Use secrets for sensitive URLs
    API_BASE_URL: ${{ secrets.API_BASE_URL_QA }}
- name: Upload Playwright Reports
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: reports/html
    retention-days: 30
- name: Get Allure History
  uses: actions/checkout@v3
  if: always()
  continue-on-error: true
  with:
    ref: gh-pages # or a dedicated reports branch
    path: allure-history
- name: Generate Allure Report
  run: |
    npm install -g allure-commandline
    allure generate reports/allure-results --clean -o reports/allure-report
- name: Deploy Allure Report to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  if: always()
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: reports/allure-report
    keep_files: true
    cname: your-report-domain.com
```

## 11. Troubleshooting

Here are common issues and troubleshooting tips for Playwright automation:

*   **Browser Installation Issues**:
    *   **Problem**: `npx playwright install` fails or browsers are not found.
    *   **Solution**: Ensure you have sufficient disk space and network connectivity. Try running with elevated permissions if on Windows/Linux (`sudo npx playwright install`). Check Playwright's documentation for specific system dependencies (e.g., for Linux).
*   **Locator Failures (`expect(locator).toBeVisible()` fails)**:
    *   **Problem**: Element not found or not visible.
    *   **Solution**:
        *   Use `npx playwright test --debug` or `--ui` to step through the test and visually inspect the page.
        *   Verify the selector using Playwright Inspector or browser developer tools.
        *   Check for dynamic content loading, animations, or race conditions. Use `page.waitForLoadState('networkidle')`, `locator.waitFor()` with custom states, or explicit waits if absolutely necessary (`page.waitForTimeout()`).
        *   Ensure the page object (e.g., `LoginPage`) locator is correctly defined.
*   **Timeout Errors**:
    *   **Problem**: `Timeout of 5000ms exceeded.` or similar.
    *   **Solution**:
        *   Increase the default `timeout` in `playwright.config.ts` (e.g., `timeout: 30000`).
        *   Increase action-specific timeouts (e.g., `await page.click(selector, { timeout: 10000 })`).
        *   Verify network requests are completing. Slow network or backend can cause timeouts.
        *   Ensure the application is not stuck in a loading state.
*   **Environment/Configuration Issues**:
    *   **Problem**: Tests are running against the wrong URL or using incorrect API endpoints.
    *   **Solution**:
        *   Double-check that the `NODE_ENV` environment variable is correctly set before `npx playwright test` (e.g., `NODE_ENV=qa`).
        *   Verify the `.env.<NODE_ENV>` file exists in the project root and contains the correct `APP_BASE_URL` and `API_BASE_URL`.
        *   Ensure `src/config/index.ts` is correctly mapping `NODE_ENV` to the right config file.
*   **Test Data Problems**:
    *   **Problem**: Tests fail due to incorrect or stale data.
    *   **Solution**:
        *   For UI tests, ensure `auth.setup.ts` successfully logs in and saves `storageState`. Check `playwright/.auth/user.json` exists.
        *   Verify static data in `src/test-data/users.json` is correct and up-to-date.
        *   For dynamic data, ensure `faker-js` is correctly generating unique values via `generateNewRetailerData()`.
        *   Check if previous test runs left residual data that interferes with current tests (e.g., duplicate retailer codes). Implement cleanup hooks (`test.afterEach` or `globalTeardown`) if necessary.
*   **Parallel Execution Issues**:
    *   **Problem**: Tests pass individually but fail when run in parallel.
    *   **Solution**:
        *   This often indicates shared state or data dependencies between tests.
        *   Ensure each test is isolated and doesn't affect other tests. Use unique data generation (`faker-js`).
        *   If tests modify the same UI, they might interfere. Restructure tests or use `test.describe.configure({ mode: 'serial' })` for dependent suites.
        *   If `storageState` is causing issues, ensure it's correctly managed per project or context.
*   **Failed Assertions**:
    *   **Problem**: An `expect` statement fails.
    *   **Solution**:
        *   Read the error message carefully; Playwright's `expect` messages are very informative.
        *   Use `--debug` to step to the failing assertion and inspect the page state.
        *   Analyze the captured screenshot and trace file (if enabled) for the failed test.
        *   Compare the actual UI/API response with the expected behavior.

## 12. Execution Flow

The automation project follows a structured execution flow, leveraging Playwright's features for efficiency and reliability:

1.  **Test Configuration Loading**:
    *   `playwright.config.ts` is loaded first.
    *   `dotenv` loads environment variables from `.env.<NODE_ENV>` (e.g., `.env.qa`).
    *   `src/config/index.ts` uses `NODE_ENV` to determine the `baseURL` and `apiBaseURL`.

2.  **Global Setup (`playwright-framework/global.setup.ts` - if implemented)**:
    *   (Currently empty, but would run here) Global prerequisites are performed once before all tests (e.g., database seeding, starting a mock server).

3.  **Authentication Setup (`playwright-framework/auth.setup.ts`)**:
    *   The `setup` project runs `auth.setup.ts`.
    *   A Playwright `page` navigates to the login page (`baseURL + /login`).
    *   The `PageManager` (`src/pages/PageManager.ts`) instantiates `LoginPage` (`src/pages/auth/LoginPage.ts`).
    *   Credentials from `src/test-data/users.json` are used to perform a login.
    *   Post-login, the page navigates to the dashboard (`baseURL + /dashboard`), and success is asserted.
    *   The authenticated session state (cookies, local storage) is saved to `playwright/.auth/user.json`.

4.  **Test Execution (Projects)**:
    *   **Browser Projects (`chromium`, `firefox`, `webkit`)**:
        *   Each browser project depends on the `setup` project.
        *   A new browser context is launched for each test, pre-loaded with the `storageState` from `playwright/.auth/user.json`, meaning tests start in an authenticated state.
        *   For each test (e.g., `createRetailer.spec.ts` or `product-search.spec.ts`):
            *   `test.beforeEach` hooks navigate to a consistent starting point (e.g., dashboard) and assert initial UI state.
            *   Custom fixtures (`src/fixtures/base.fixture.ts`) provide a `PageManager` instance to the test.
            *   Test data is retrieved from `src/test-data` (e.g., `generateNewRetailerData()`) or implied constants.
            *   Page Objects (via `pageManager`) are used to interact with the application UI (e.g., `pageManager.createRetailerPage.fillMandatoryDetails()`).
            *   Assertions (`expect`) validate UI elements, page content, URL, and application behavior (positive and negative scenarios).
            *   `test.step()` calls provide detailed reporting steps.
    *   **API Project (`api`)**:
        *   The `api` project runs tests in `tests/api`.
        *   A dedicated API context (if configured) or the default `request` context is used.
        *   API utility functions (`src/utils/api.utils.ts`) are used to make HTTP requests to `apiBaseURL`.
        *   Assertions validate API response status codes, headers, and JSON body content, sometimes using schemas from `src/test-data/schemas`.

5.  **Test Results and Reporting**:
    *   As tests execute, results are collected by configured reporters.
    *   `list` reporter provides console output.
    *   `html` reporter generates an interactive HTML report in `reports/html`.
    *   `json` reporter saves raw JSON results in `reports/json`.
    *   `allure-playwright` reporter collects data for a rich Allure report in `reports/allure-results`.
    *   Screenshots for failures and traces for retried tests are saved as artifacts.

## 13. Useful Commands

Here's a quick reference for common Playwright commands relevant to this project:

| Command                                                                 | Description                                                                                                                                           |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`                                                           | Installs all project dependencies.                                                                                                                    |
| `npx playwright install`                                                | Downloads necessary browser binaries (Chromium, Firefox, WebKit).                                                                                     |
| `npx playwright test`                                                   | Runs all tests in the project (default environment is `test` or `qa` per `src/config`).                                                               |
| `NODE_ENV=development npx playwright test`                              | Runs all tests against the `development` environment.                                                                                                 |
| `npx playwright test --project=chromium`                                | Runs all E2E tests for the `chromium` browser project.                                                                                                |
| `npx playwright test --project=api`                                     | Runs all API tests.                                                                                                                                   |
| `npx playwright test tests/e2e/retailers/createRetailer.spec.ts`        | Runs a specific test file.                                                                                                                            |
| `npx playwright test --headed`                                          | Runs tests in headed mode, showing the browser UI.                                                                                                    |
| `npx playwright test --debug`                                           | Opens Playwright Inspector for step-by-step debugging.                                                                                                |
| `npx playwright test --ui`                                              | Opens Playwright's UI mode for interactive test exploration and debugging.                                                                            |
| `npx playwright show-report`                                            | Opens the latest Playwright HTML report in your browser.                                                                                              |
| `allure generate reports/allure-results --clean -o reports/allure-report` | Generates the Allure HTML report from collected results. (Requires `allure-commandline` to be installed globally or locally).                           |
| `allure open reports/allure-report`                                     | Opens the generated Allure HTML report in your browser.                                                                                               |
| `npx playwright show-trace test-results/<test-name>-<browser>/trace.zip` | Opens the Playwright Trace Viewer to analyze a specific test trace (useful for debugging flaky tests).                                                |