# Playwright Automation Execution Guide

This guide provides comprehensive instructions for setting up, configuring, executing, and understanding the Playwright TypeScript automation project. It's designed for automation engineers to quickly get started with the framework and effectively manage test execution.

## 1. Project Overview

This automation project leverages **Playwright with TypeScript** to perform robust end-to-end (E2E) UI and API testing. The primary purpose is to ensure the quality and reliability of key functionalities within a web application.

The framework is structured to be scalable and maintainable, following the Page Object Model (POM) design pattern, custom fixtures, and centralized test data management.

**Key Functionality Automated:**

*   **Customer Login Module:**
    *   Successful login with valid credentials.
    *   Error handling for invalid login attempts.
    *   Validation of mandatory fields (email, password).
    *   Navigation to the "Forgot Password" page.
*   **Product Search Functionality:**
    *   Search by exact and partial product names.
    *   Case-insensitive search for names and SKUs.
    *   Search by exact SKU.
    *   Handling of non-existent products ("No results found").
    *   Input validation for empty, space-only, and excessively long queries.
    *   Graceful handling of special characters, including security checks (SQL Injection, XSS).
    *   Accessibility checks for the search bar (keyboard navigation).
    *   Performance measurements for search response times.
    *   Pagination on search results.
    *   Browser back/forward button functionality after search.
    *   Integration with product detail pages from search results.
*   **API Testing (Product Search):**
    *   Successful API search by product name and SKU.
    *   API response for no matching products.
    *   API endpoint handling of missing query parameters.
    *   Simulated error handling for unavailable search service.

The project demonstrates a professional approach to test automation, integrating well-defined test cases, clear assertions, and structured test data to cover various scenarios from functional to security and performance.

## 2. Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Node.js**: A JavaScript runtime environment. (Installation via official website or package manager is recommended).
*   **npm**: Node Package Manager, which comes bundled with Node.js.
*   **VS Code** or any other preferred code editor.
*   **Git**: For cloning the project repository.
*   **Playwright**: Managed by npm, it will be installed as a project dependency.
*   **Browser Dependencies**: Playwright requires browser binaries. These will be installed automatically with the `npx playwright install` command.

## 3. Project Setup

Follow these steps to set up the project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```
    (Replace `<repository-url>` with the actual Git repository URL and `<project-folder>` with the desired project directory name.)

2.  **Install dependencies:**
    Navigate to the root of the cloned project and install all required Node.js packages:
    ```bash
    npm install
    ```

3.  **Install Playwright browser binaries:**
    Playwright needs browser binaries to run tests. Install them using the following command:
    ```bash
    npx playwright install
    ```

## 4. Project Structure

The project follows a well-organized structure to enhance maintainability and scalability:

```
.
├── playwright.config.ts
├── src
│   ├── api
│   │   ├── authApiClient.ts
│   │   └── config
│   │   └── config
│   │       ├── environment.ts
│   │       ├── environmentConfig.ts
│   │       ├── dev.ts
│   │       ├── qa.ts
│   │       └── prod.ts
│   ├── constants
│   │   ├── apiEndpoints.ts
│   │   ├── errorMessages.ts
│   │   └── routes.ts
│   ├── fixtures
│   │   └── customFixtures.ts
│   ├── helpers
│   │   ├── navigationHelpers.ts
│   │   └── uiInteractionHelpers.ts
│   ├── pages
│   │   ├── base
│   │   │   └── BasePage.ts
│   │   ├── customer
│   │   │   ├── DashboardPage.ts
│   │   │   └── LoginPage.ts
│   │   └── common
│   │       └── HeaderComponent.ts
│   ├── test-data
│   │   ├── customer
│   │   │   └── loginData.ts
│   │   └── sharedData.ts
│   └── utils
│       ├── dataGenerator.ts
│       ├── logger.ts
│       └── playwrightUtils.ts
├── tests
│   ├── api
│   │   └── customerApi.spec.ts
│   ├── e2e
│   │   └── customer
│   │       ├── customerLogin.spec.ts
│   │       └── smoke.spec.ts
│   └── component
│       └── loginForm.spec.ts
├── reports
│   ├── screenshots
│   ├── videos
│   └── test-results
└── tsconfig.json
```

**Folder Descriptions:**

*   `playwright.config.ts`: The main Playwright configuration file, defining test environments, reporters, and general settings.
*   `src/api`: Modules for interacting with backend APIs, useful for setting up test data or bypassing UI steps.
*   `src/config`: Manages environment-specific configurations (e.g., `dev.ts`, `qa.ts`, `prod.ts`), including `environmentConfig.ts` which provides the `baseURL`.
*   `src/constants`: Stores application-wide static values, messages, and API endpoints for easy management and reuse.
*   `src/fixtures`: Defines custom Playwright test fixtures to extend the default `TestInfo` context with page objects or other utilities.
*   `src/helpers`: Contains reusable utility functions that facilitate common automation tasks or complex UI interactions.
*   `src/pages`: Implements the Page Object Model (POM) for UI components and pages, promoting reusability and maintainability of selectors and interactions.
*   `src/test-data`: Centralizes various data sets used as inputs for test scenarios, separating data from test logic.
*   `src/utils`: Provides generic, framework-agnostic utility functions (e.g., data generation, logging).
*   `tests/api`: Houses test suites specifically for validating API endpoints.
*   `tests/e2e`: Contains end-to-end test suites simulating full user journeys through the application UI. The `customer/customerLogin.spec.ts` and `smoke.spec.ts` files reside here.
*   `tests/component`: Includes tests focused on individual UI components (e.g., `loginForm.spec.ts`).
*   `reports`: Directory for storing generated test reports (e.g., HTML report).
*   `screenshots`: Stores screenshots taken during test execution, especially on failures.
*   `videos`: Stores video recordings of test runs.
*   `test-results`: Contains raw test artifacts like traces and intermediate results.
*   `tsconfig.json`: TypeScript configuration file.

## 5. Test Configuration

The project's test configuration is primarily managed through `playwright.config.ts` and `src/config/environment/environmentConfig.ts`.

**Base URL Configuration:**
The `baseURL` for the application is dynamically retrieved from `src/config/environment/environmentConfig.ts`. This allows easy switching between environments without modifying test code.

```typescript
// src/config/environment/environmentConfig.ts
export const envConfig = {
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', // Default if not set
  // Add other environment variables as needed
};
```
This means the `baseURL` for all page navigations (`BasePage.goto()`) will use `http://localhost:3000` by default, or an overridden URL if `PLAYWRIGHT_BASE_URL` environment variable is set.

**Default Playwright Configuration (Inferred):**

As a specific `playwright.config.ts` is not fully provided in the generated artifacts, the framework relies on Playwright's default settings and the environment configuration:

*   **Browser Projects:** By default, Playwright will run tests across Chromium, Firefox, and WebKit unless specified otherwise in `playwright.config.ts`.
*   **Workers:** Playwright typically runs tests in parallel using a number of workers equal to 50% of the number of CPU cores, ensuring efficient execution. This can be configured in `playwright.config.ts` or overridden via CLI (`--workers`).
*   **Retries:** No explicit retries are configured in the provided `playwright.config.ts` example. By default, tests will not retry on failure.
*   **Timeout:** The default test timeout in Playwright is 30 seconds. Specific actions might have their own timeouts (e.g., `expectElementToBeVisible` has a default of 5 seconds).
*   **Screenshots:** Screenshots are typically captured on test failures by default when using standard Playwright reporters.
*   **Videos:** Video recordings are typically off by default but can be enabled for debugging.
*   **Traces:** Tracing is off by default but can be enabled to capture detailed logs and interactions for debugging.
*   **Reporters:** Playwright uses the `list` reporter by default, which prints test results to the console. The HTML reporter can be explicitly configured or generated post-execution.

**Custom Fixtures:**
The framework utilizes custom fixtures defined in `src/fixtures/customerFixtures.ts` to provide pre-initialized Page Object Model instances (`loginPage`, `dashboardPage`) directly to test functions, simplifying test setup and improving code readability.

## 6. Execute Tests

Tests can be executed using various Playwright CLI commands.

**Set Base URL (Optional, but recommended for non-default environments):**
You can override the default `baseURL` by setting the `PLAYWRIGHT_BASE_URL` environment variable before running tests:
```bash
PLAYWRIGHT_BASE_URL=https://your-qa-env.com npx playwright test
```
Or, for a quick local run:
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

**Common Execution Commands:**

*   **Run all tests:**
    ```bash
    npx playwright test
    ```

*   **Run all tests in headed mode (browser visible):**
    ```bash
    npx playwright test --headed
    ```

*   **Run a specific test file:**
    To run the Customer Login tests:
    ```bash
    npx playwright test tests/e2e/customer/customerLogin.spec.ts
    ```

*   **Run a specific test by its title:**
    ```bash
    npx playwright test -g "Should successfully log in with valid credentials"
    ```

*   **Run tests using a specific browser (e.g., Chromium):**
    ```bash
    npx playwright test --project=chromium
    ```

*   **Run tests using Firefox:**
    ```bash
    npx playwright test --project=firefox
    ```

*   **Run tests using WebKit:**
    ```bash
    npx playwright test --project=webkit
    ```

*   **Run tests using multiple workers (e.g., 4 parallel workers):**
    ```bash
    npx playwright test --workers=4
    ```

*   **Run tests and generate HTML report:**
    ```bash
    npx playwright test --reporter=html
    ```

## 7. Test Data

The project centrally manages test data to promote reusability and separation of concerns.

**Location:**
Test data is organized in the `src/test-data` directory, specifically `src/test-data/customer/loginData.ts` for login scenarios. Error messages are defined in `src/constants/errorMessages.ts`.

**Types of Test Data Used:**

*   **Valid Data:**
    *   **Customer Login:** `testcustomer@example.com` and `Password123!` for successful login.
    *   **Product Search:** Exact product names like `Laptop Pro X`, partial names like `Laptop`, and SKUs like `LPX-001`. Includes case-insensitive variations and terms with supported special characters (e.g., `Product-Name-Hyphenated`).
    *   **API Search:** Specific product names (e.g., `RGB Gaming Keyboard`) and SKUs (e.g., `WM-456`) for API calls.
*   **Invalid Data:**
    *   **Customer Login:** `wrong@example.com` and `WrongPassword!` to trigger invalid credential error messages.
    *   **Product Search:** `XYZ NonExistent Product 123` or `NonexistentAPIProduct` to verify "no results found" scenarios.
*   **Boundary Values:**
    *   **Search Query Input:** Testing with `   ` (only spaces) to ensure trimming, and handling queries that reach or exceed the `MAX_SEARCH_QUERY_LENGTH`.
*   **Empty and Special Character Data:**
    *   **Login Fields:** Empty strings for email and password fields to verify browser-level HTML5 validation messages (`Please fill out this field.`).
    *   **Search Query Input:** Empty string for search, as well as unsupported/unsafe special characters like `` `!@#$%^&*()_+ `` to ensure graceful handling and no system errors. Unicode characters like `Réfrigérateur` can also be tested for internationalization support.
*   **Security-Related Data:**
    *   **Search Query Input:** Examples of SQL Injection (`' OR '1'='1'`, `'; DROP TABLE products; --`) and XSS attacks (`<script>alert('XSS')</script>`, `<img src=x onerror=alert('XSS')>`) are used to verify the application's robustness against common web vulnerabilities.
*   **Additional Scenario Data:**
    *   **URLs:** Expected redirect URLs like `/dashboard` and `/forgot-password`.
    *   **UI Messages:** Generic error messages (`An unexpected error occurred. Please try again later.`) and "no results" messages (`No products found for your search query.`).
    *   **Product Catalog Data:** Predefined product objects (e.g., `PRODUCT_DATA.LAPTOP_PRO_X`) are used to simulate product availability and verify search results.

This structured approach ensures comprehensive test coverage and makes it easy to update or expand test data as the application evolves.

## 8. Assertions and Validation

The framework incorporates a variety of Playwright assertions to validate application behavior and state.

**Common Assertions Used:**

*   **URL Validation:**
    *   `await expect(page).toHaveURL(/.*path/);` Ensures navigation to the correct page or section of the application.
    *   `await super.expectPageUrl(this.PATH);` (internal to Page Objects)
*   **UI Element Visibility/State Validation:**
    *   `await expect(element).toBeVisible();` Verifies that a UI element (e.g., button, message, header) is displayed on the page.
    *   `await expect(element).toBeHidden();` Verifies that a UI element is not displayed.
    *   `await expect(element).toBeEnabled();` Checks if an interactive element is enabled.
    *   `await expect(element).toBeEditable();` Checks if an input field is editable.
    *   `await expect(element).toBeFocused();` Verifies if an element currently has focus.
    *   `await expect(element).toBeInvalid();` Used for HTML5 form validation to check if an input field is marked as invalid.
*   **Text Content Validation:**
    *   `await expect(element).toHaveText('Expected Text');` Validates the exact text content of an element, useful for success or error messages.
    *   `await expect(element).toContainText('Partial Text');` Checks if an element's text contains a specific substring.
    *   `await expect(element).not.toContainText('Unexpected Text');` Ensures certain text (e.g., error messages after successful operations) is not present.
    *   `await expect(element).toBeEmpty();` Verifies if an input field is empty.
*   **Input Field Value Validation:**
    *   `await expect(element).toHaveValue('input value');` Validates the current value of an input field.
*   **Attribute Validation:**
    *   `await expect(element).toHaveAttribute('src', expect.any(String));` Checks for the presence and value pattern of an HTML attribute (e.g., image `src`).
    *   `await expect(element).toHaveAttribute('placeholder', /search product/i);` Validates placeholder text using a regex.
*   **Accessibility Validation:**
    *   `await expect(element).toHaveRole('searchbox');` Verifies ARIA roles for accessibility.
*   **Count Validation:**
    *   `await expect(locator).toHaveCount(count);` Checks the number of matching elements.
    *   `await expect(locator).toBeGreaterThanOrEqual(count);` Checks for a minimum number of matching elements.
*   **Positive and Negative Validations:**
    *   **Positive:** Assertions confirming expected successful outcomes (e.g., `expectToBeOnDashboardPage()`, `expectProductToBeDisplayed()`).
    *   **Negative:** Assertions confirming expected error states or absence of data (e.g., `expect(loginPage.errorMessage).toBeVisible()`, `expectNoProductsDisplayed()`, `page.on('dialog', ...)` for XSS).
*   **Performance Metrics:**
    *   `expect(duration).toBeLessThan(threshold);` Used to validate response times for critical actions like search.

These assertions are crucial for verifying both functional correctness and non-functional requirements such as security, performance, and accessibility.

## 9. Reports and Debugging

Playwright offers excellent tools for reporting and debugging your tests.

**Test Reports:**

*   **Show HTML Report:**
    After running tests, you can view a detailed HTML report (if configured, or by running with `--reporter=html`):
    ```bash
    npx playwright show-report
    ```
    This command will open the latest HTML report in your browser, providing a step-by-step breakdown of each test, including logs, screenshots, and videos of failures. The reports are generated in the `reports/` directory.

**Debugging Options:**

*   **Playwright Inspector (`--debug`):**
    This is the most powerful debugging tool. It launches a browser, opens the Playwright Inspector, and pauses test execution. You can step through tests, inspect locators, and interact with the browser.
    ```bash
    npx playwright test --debug
    ```
    You can also use the `PWDEBUG=1` environment variable:
    ```bash
    PWDEBUG=1 npx playwright test
    ```

*   **Playwright UI Mode (`--ui`):**
    The UI mode provides an interactive environment to run, debug, and develop tests. It shows a list of tests, allows stepping through them, and interacting with the browser.
    ```bash
    npx playwright test --ui
    ```

*   **Screenshots:**
    Screenshots are automatically captured on test failures by default when using Playwright's standard reporters. These are stored in the `reports/screenshots/` directory.

*   **Videos:**
    Video recordings of test runs can be enabled in `playwright.config.ts`. If enabled, videos of each test run (or only failed tests) will be saved in the `reports/videos/` directory, providing a visual replay of the test execution.

*   **Traces:**
    Playwright can record a detailed trace of your test, which includes screenshots, DOM snapshots, network requests, and action logs. Traces are invaluable for debugging flaky tests. You can enable them in `playwright.config.ts` (e.g., `trace: 'on-first-retry'`) or via CLI:
    ```bash
    npx playwright test --trace on
    ```
    To view a trace:
    ```bash
    npx playwright show-trace <path-to-trace.zip>
    ```

## 10. CI/CD Execution

**(Optional, as no specific CI/CD configuration is provided in the artifacts)**

For continuous integration/continuous deployment (CI/CD) pipelines, Playwright tests can be easily integrated. The typical approach involves running tests in a headless environment.

A generic CI/CD setup would involve the following steps:

1.  **Checkout Repository:** Get the latest code.
2.  **Install Node.js & npm:** Ensure the correct Node.js version is used.
3.  **Install Dependencies:** Run `npm install`.
4.  **Install Playwright Browsers:** Run `npx playwright install --with-deps`.
5.  **Set Environment Variables:** Configure `PLAYWRIGHT_BASE_URL` and any other environment-specific variables.
6.  **Execute Tests:** Run `npx playwright test --reporter=junit,html`.
7.  **Publish Reports:** Archive and publish the generated HTML reports, screenshots, and videos as build artifacts.

Example command for CI:
```bash
npm install
npx playwright install --with-deps
PLAYWRIGHT_BASE_URL=$CI_BASE_URL npx playwright test --workers=2 --retries=2 --reporter=junit,html
```

## 11. Troubleshooting

Here are some common issues you might encounter and their solutions:

*   **Browser Installation Issues:**
    *   **Problem:** Tests fail with errors like "Browser not found."
    *   **Solution:** Run `npx playwright install` to ensure all necessary browser binaries are installed. For CI environments, use `npx playwright install --with-deps` to install system dependencies for browsers.
*   **Locator Failures:**
    *   **Problem:** An element cannot be found, leading to a "Locator not found" error.
    *   **Solution:**
        *   Use `npx playwright test --debug` or `--ui` to inspect the page and verify locators.
        *   Ensure the page has loaded completely before interacting with elements (e.g., use `page.waitForLoadState('networkidle')`).
        *   Check for dynamic content or asynchronous loading that might require explicit waits or more robust locators.
        *   Verify that the element's visibility is asserted before interaction.
*   **Timeout Errors:**
    *   **Problem:** Tests fail because an action (e.g., `click`, `fill`, `expect`) takes too long.
    *   **Solution:**
        *   Increase the default Playwright action timeout in `playwright.config.ts` (e.g., `use: { actionTimeout: 10000 }`).
        *   Increase specific `expect` timeout if waiting for an element (e.g., `await expect(locator).toBeVisible({ timeout: 15000 });`).
        *   Optimize your test steps to reduce unnecessary waits or complex interactions.
        *   Consider adding `page.waitForLoadState()` before critical interactions.
*   **Environment/Configuration Issues:**
    *   **Problem:** Tests are running against the wrong environment or with incorrect base URLs.
    *   **Solution:**
        *   Verify the `PLAYWRIGHT_BASE_URL` environment variable is correctly set before execution.
        *   Check `src/config/environment/environmentConfig.ts` for the default `baseURL`.
*   **Test Data Problems:**
    *   **Problem:** Tests fail due to incorrect or missing test data.
    *   **Solution:**
        *   Inspect `src/test-data/` to confirm data values match expected application state.
        *   Ensure any required API setup (e.g., user creation via API) is correctly performed before UI tests.
        *   Review error messages in `src/constants/errorMessages.ts` to ensure they align with application messages.
*   **Parallel Execution Issues:**
    *   **Problem:** Tests fail intermittently when run in parallel (`--workers > 1`).
    *   **Solution:**
        *   Ensure tests are independent and do not share mutable state (e.g., unique user data for each test).
        *   Avoid reliance on global state or order of execution.
        *   Consider using Playwright's `test.describe.configure({ mode: 'serial' });` for specific suites that require sequential execution.
*   **Failed Assertions:**
    *   **Problem:** An assertion fails unexpectedly.
    *   **Solution:**
        *   Run the failed test in `--debug` mode to step through and observe the application state at the point of failure.
        *   Examine screenshots and videos from the report for visual evidence.
        *   Check Playwright traces for detailed logs of actions and network requests.

## 12. Execution Flow

The automation framework follows a logical execution flow to ensure comprehensive and reliable testing:

1.  **Test Configuration (`playwright.config.ts`, `src/config/environment/environmentConfig.ts`):**
    *   Playwright reads the global configuration, including the `baseURL` and other browser settings.
2.  **Test Data (`src/test-data`, `src/constants`):**
    *   Relevant test data (e.g., `loginData`, `errorMessages`) is loaded and prepared for use in test scenarios.
3.  **Test Execution (`tests/e2e`, `tests/api`, `tests/component`):**
    *   Playwright launches browsers (or makes API calls) based on the test suites selected.
    *   Custom fixtures (`src/fixtures/customFixtures.ts`) provide pre-initialized Page Object Models to tests.
4.  **Page Objects / Application Interaction (`src/pages`, `src/helpers`):**
    *   Tests interact with the application using methods defined in the Page Object Model classes.
    *   Helper functions facilitate complex UI interactions or common utility tasks.
5.  **Assertions (`@playwright/test` `expect`):**
    *   After each interaction or sequence of actions, assertions are made to validate the application's state, UI elements, data, and messages against expected outcomes.
6.  **Test Result:**
    *   Each test step is marked as pass or fail based on the assertions.
7.  **Report (`reports/`, `screenshots/`, `videos/`, `test-results/`):**
    *   Upon completion, Playwright generates a detailed report, including logs, screenshots, and videos for failed tests, which are stored in the respective output directories.

## 13. Useful Commands

Here is a quick reference for common Playwright commands:

| Command                                                               | Description                                                                   |
| :-------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `npm install`                                                         | Installs all project dependencies.                                            |
| `npx playwright install`                                              | Installs Playwright browser binaries.                                         |
| `npx playwright test`                                                 | Runs all tests in headless mode across all configured browsers.               |
| `npx playwright test --headed`                                        | Runs all tests with the browser UI visible.                                   |
| `npx playwright test tests/e2e/customer/customerLogin.spec.ts`        | Runs tests only from the specified file.                                      |
| `npx playwright test -g "Should successfully log in"`                 | Runs tests matching the given title substring.                                |
| `npx playwright test --project=chromium`                              | Runs tests only on Chromium. (Replace `chromium` with `firefox` or `webkit`). |
| `npx playwright test --workers=4`                                     | Runs tests using 4 parallel workers.                                          |
| `npx playwright test --debug`                                         | Runs tests with Playwright Inspector for debugging.                           |
| `npx playwright test --ui`                                            | Launches Playwright UI mode for interactive debugging and development.        |
| `npx playwright test --reporter=html`                                 | Runs tests and generates an HTML report.                                      |
| `npx playwright show-report`                                          | Opens the latest HTML test report in your browser.                            |
| `npx playwright show-trace <path-to-trace.zip>`                       | Opens Playwright trace viewer for a specific trace file.                      |
| `PLAYWRIGHT_BASE_URL=https://qa.example.com npx playwright test`      | Sets the `baseURL` environment variable for test execution.                   |