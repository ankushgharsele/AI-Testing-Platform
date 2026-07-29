# Playwright Automation Execution Guide

This guide provides comprehensive instructions for setting up, configuring, executing, and troubleshooting the Playwright TypeScript automation project. It is designed for QA engineers, developers, and other stakeholders involved in testing the application.

## 1. Project Overview

This automation project leverages Playwright with TypeScript to provide robust and scalable automated testing for critical web application functionalities. The primary goals include ensuring the stability and correctness of user interactions and API integrations.

**Key Functionalities Automated:**

*   **Salesman Login Functionality:** Covers positive login scenarios with valid credentials and negative scenarios for invalid credentials. This ensures users can securely access the application.
*   **Product Search Functionality:** Comprehensive testing of the product search feature, including:
    *   Searching by exact and partial product names and SKUs (case-insensitive where applicable).
    *   Handling scenarios with no matching results, empty, or space-only queries.
    *   Validating input for maximum length and supported/unsupported characters.
    *   Verifying UI elements, keyboard navigation, and browser history integration.
    *   API-level validation for search endpoints, including error handling for missing parameters.
    *   Security testing against SQL Injection and Cross-Site Scripting (XSS) attempts.
    *   Performance measurement of search response times.
    *   Pagination functionality on search results pages.
    *   Integration with product detail pages.

The project utilizes Playwright's rich API for browser automation, TypeScript for type safety and maintainability, and a structured Page Object Model (POM) approach to organize test code and selectors efficiently. Test cases are detailed, and assertions validate expected behavior across UI and API layers, using a variety of test data, including valid, invalid, boundary, and security-focused inputs.

## 2. Prerequisites

Before you begin, ensure you have the following software installed on your machine:

*   **Node.js & npm:** Playwright requires Node.js. It is recommended to use an LTS version. `npm` (Node Package Manager) is included with Node.js.
    *   You can download Node.js from [nodejs.org](https://nodejs.org/).
*   **Code Editor:** A powerful code editor like [Visual Studio Code](https://code.visualstudio.com/) is recommended for a better development experience.
*   **Git:** For cloning the repository and managing version control.
    *   You can download Git from [git-scm.com](https://git-scm.com/).
*   **Playwright Browser Dependencies:** Playwright will automatically download the necessary browsers (Chromium, Firefox, WebKit) upon first installation, but some system dependencies might be required depending on your OS.

## 3. Project Setup

Follow these steps to get the automation project up and running on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```
    *(Replace `<repository-url>` with the actual URL of your Git repository and `<project-folder>` with the name of the cloned directory.)*

2.  **Install Dependencies:**
    Install all required Node.js packages using npm:
    ```bash
    npm install
    ```

3.  **Install Playwright Browsers:**
    Playwright needs to download browser binaries. Execute the following command:
    ```bash
    npx playwright install
    ```
    This will install Chromium, Firefox, and WebKit, as configured in `playwright.config.ts`.

4.  **Configure Environment Variables:**
    Create a `.env` file in the project root by copying the provided `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Then, open the newly created `.env` file and update the variables with your actual application URL and credentials:
    ```dotenv
    # .env
    BASE_URL=https://your-application-url.com
    SALESMAN_USERNAME=your_salesman_username
    SALESMAN_PASSWORD=your_salesman_password
    ```
    **Important:** Do not commit `.`env` file to version control as it contains sensitive information.

## 4. Project Structure

The project follows a well-defined structure to ensure maintainability, scalability, and clarity:

```
├── node_modules/                 # Directory where all Node.js module dependencies are installed.
├── playwright-report/            # Contains the default Playwright HTML reports generated after test execution.
├── screenshots/                  # Stores screenshots captured during test failures or specific test steps.
├── test-results/                 # Holds artifacts from test runs, such as traces, videos, and detailed snapshots.
├── .env                          # Environment variables for different test environments or configurations.
├── .gitignore                    # Specifies intentionally untracked files and directories to ignore by Git.
├── package.json                  # Defines project metadata, scripts, and lists all dependencies.
├── tsconfig.json                 # TypeScript compiler configuration for the entire project.
├── playwright.config.ts          # The main Playwright configuration file, defining projects, reporters, and settings.
└── src/                          # Primary directory for all automation framework source code and components.
    ├── api/                      # Encapsulates API client definitions and related utilities for direct backend interactions.
    ├── components/               # Reusable UI component models for interacting with complex, generic UI elements.
    ├── config/                   # Environment-specific configuration settings and values (e.g., `app.config.ts`).
    ├── constants/                # Global constants, enumerations, and fixed values used across the framework (e.g., `app.constants.ts` implied).
    ├── fixtures/                 # Custom Playwright test fixtures for robust test setup, teardown, and data provisioning.
    ├── helpers/                  # Collection of generic utility functions and common methods used throughout the framework.
    ├── pages/                    # Page Object Models (POMs) representing distinct web pages or major application sections.
    │   ├── base/                 # Base Page Object class providing common functionalities for all derived page objects.
    │   ├── common/               # Page objects or fragments for elements present across multiple application pages.
    │   └── sales/                # Page Object Models specifically for the Sales module (e.g., `LoginPage`, `DashboardPage`).
    ├── reports/                  # Stores custom generated test reports or aggregated results beyond Playwright's default.
    ├── test-data/                # Repository for static or dynamically generated test data used in test scenarios.
    │   └── sales/                # Test data files specifically tailored for the Sales module.
    ├── tests/                    # Directory containing all Playwright test specifications and test suites.
    │   ├── api/                  # Tests designed to validate the functionality and integrity of application APIs.
    │   ├── e2e/                  # End-to-End tests simulating complete user journeys and application workflows.
    │   │   └── sales/            # E2E tests dedicated to the Sales module (e.g., `login.spec.ts`).
    │   ├── features/product-search/ # (Inferred from assertions, contains `product-search.spec.ts` for product search features)
    │   └── unit/                 # (Optional) Placeholder for unit tests of framework components.
    ├── types/                    # Custom TypeScript type definitions and interfaces for improved type safety.
    └── utils/                    # General utility functions for logging, file operations, data manipulation, etc.
```

## 5. Test Configuration

The `playwright.config.ts` file centralizes the configuration for the entire test project:

*   **Test Directory:** Tests are located in the `./src/tests/e2e` directory.
*   **Parallel Execution:** Tests are configured to run in parallel by default (`fullyParallel: true`).
*   **CI Behavior:**
    *   `forbidOnly`: Fails the build if `test.only` is present on CI environments.
    *   `retries`: Tests are retried 2 times on CI, zero locally.
    *   `workers`: On CI, tests run with 1 worker to ensure stable environments; otherwise, `undefined` allows Playwright to determine optimal worker count.
*   **Reporter:** Uses the built-in HTML reporter (`reporter: 'html'`).
*   **Base URL:** The `baseURL` is dynamically loaded from `AppConfig.baseURL`, which in turn reads from the `BASE_URL` environment variable in your `.env` file, falling back to `http://localhost:3000` if not set.
*   **Timeouts:**
    *   `actionTimeout`: 30000 milliseconds (30 seconds) for all user interactions.
    *   `navigationTimeout`: 30000 milliseconds (30 seconds) for page navigations.
*   **Headless Mode:** Tests run in headless mode on CI (`process.env.CI` is true); otherwise, browsers are shown for local debugging (`headless: false`).
*   **Traces:** A trace is collected on the first retry of a failed test (`trace: 'on-first-retry'`) to aid debugging.
*   **Browser Projects:** Tests are configured to run across three major browsers:
    *   `chromium`: For Chrome and Edge compatibility.
    *   `firefox`: For Mozilla Firefox compatibility.
    *   `webkit`: For Apple Safari compatibility.
*   **Environment Configuration:** `src/config/app.config.ts` centralizes application-specific settings, including `baseURL`, `defaultTimeout`, and credentials (`validSalesmanUsername`, `validSalesmanPassword`), which are loaded from `.env`.

## 6. Execute Tests

Here are common commands to execute tests in this Playwright project:

*   **Run all tests:**
    ```bash
    npx playwright test
    ```

*   **Run all tests in headed mode (browser UI visible):**
    ```bash
    npx playwright test --headed
    ```

*   **Run a specific test file:**
    ```bash
    npx playwright test src/tests/e2e/sales/login.spec.ts
    ```
    *(For example, to run the salesman login tests.)*

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

*   **Run tests with a specific number of workers (e.g., 4):**
    ```bash
    npx playwright test --workers=4
    ```

*   **Run tests matching a specific grep pattern (e.g., all "PAT Creation" tests):**
    ```bash
    npx playwright test --grep "PAT Creation"
    ```

*   **Run tests by specific test case ID (e.g., "TC-PS-001"):**
    ```bash
    npx playwright test --grep "TC-PS-001"
    ```

## 7. Test Data

The project utilizes a comprehensive set of test data to cover various scenarios, including valid, invalid, boundary, and security-related conditions. This data is designed to align with the test case specifications and ensure thorough validation.

**Types of Test Data Used:**

*   **Valid Data:**
    *   **Login Credentials:** Configured in `.env` (e.g., `SALESMAN_USERNAME`, `SALESMAN_PASSWORD`) for successful application login.
    *   **PAT Creation:** Various "PAT Note" names (`TestToken_ReadRepo`, `TestToken_MultiScope_Project`), different scopes (`repo`, `user:email`, `public_repo`, `read:org`, `gist`, `admin:repo_hook`, `workflow`), and expiration settings (`No expiration`, `7 days`, `90 days`, `Custom date`) for positive PAT generation tests.
    *   **Product Search:** Exact product names (`Laptop Pro X`), partial names (`Laptop`), SKUs (`LPX-001`), and multi-keyword queries (`Gaming RGB`) to verify search accuracy.
    *   **API Strings:** Placeholder PAT strings for successful API authentication.
    *   **Product Catalog:** Detailed product information (name, SKU, price, description) for `Laptop Pro X`, `Wireless Mouse`, `Dell UltraSharp Monitor`, `Gaming Keyboard RGB`, `External SSD 1TB`, `RGB Gaming Mouse`, and `Brand New Gadget X` (simulated for catalog updates).

*   **Invalid Data:**
    *   **Login Credentials:** `invalid_user`, `invalid_password` to test negative login scenarios and error message display.
    *   **PAT Creation:** Empty PAT Note (`""`), no scope selected (`(none selected)`), and past expiration dates (`Custom date` e.g., yesterday's date) to validate error handling.
    *   **Product Search:** Non-existent product names (`XYZ NonExistent Product 123`, `NonExistentAPIProduct`) for "no results found" scenarios.
    *   **API Parameters:** Missing query parameters for API endpoints to verify `400 Bad Request` responses.
    *   **PAT Strings:** `ghp_invalidtokenstring`, `ghp_toolong...` for testing API calls with malformed or invalid tokens, expecting `401 Unauthorized` or `403 Forbidden`.

*   **Boundary Values:**
    *   **PAT Note Length:** A 255-character string (`A`.repeat(255)) to verify maximum length handling.
    *   **Search Query Length:** A string exceeding the `MAX_SEARCH_QUERY_LENGTH` (e.g., `A`.repeat(265)) to test truncation and input field behavior.
    *   **Empty/Spaces Search:** Empty string `""` and multiple spaces `"   "` to test input validation and search behavior.

*   **Empty and Special Character Data:**
    *   **Search Terms:** Terms with leading/trailing spaces (`  Wireless Mouse  `), supported special characters (`Dell UltraSharp Monitor`), unsupported/unsafe special characters (`` `!@#$%^&*()_+ ``) to ensure robustness.
    *   **PAT Note:** Unicode (`日本語テストトークン`) and emoji (`My Token ✨🚀`) characters to verify internationalization support and display.

*   **Security Test Data:**
    *   **SQL Injection:** `' OR '1'='1`, `'; DROP TABLE products; --` as search terms to confirm protection against database attacks.
    *   **XSS Injection:** `<script>alert('XSS')</script>`, `<img src=x onerror=alert('XSS')>` as search terms and PAT notes to verify input sanitization and prevent script execution.
    *   **Revoked/Expired PATs:** Specific placeholder tokens for revoked/expired PATs (`ghp_revoked...`, `ghp_expired...`) to test API authentication failures.

*   **Additional Scenario Data:**
    *   **Pre-existing PATs:** `Active_Repo_Token`, `Active_Gist_7Day_Token`, `Expired_Login_Token`, `Revoked_Test_Token`, `MultiScopePAT_Dashboard` for listing, managing, and verifying token states.
    *   **Duplicate PAT Name:** `DuplicateTestName` to test the system's handling of non-unique token names.
    *   **UI Messages:** Expected validation messages (`Search query cannot be empty.`) and generic error messages (`Something went wrong. Please try again later.`) to verify UI feedback.

This comprehensive test data strategy ensures that the application's functionality is thoroughly tested under a wide range of conditions, improving the reliability and security of the automated processes.

## 8. Assertions and Validation

The automation project uses Playwright's `expect` assertions to validate the application's behavior at both the UI and API levels. Key types of validations implemented include:

*   **URL Validation:**
    *   `await expect(page).toHaveURL(...)`: Ensures navigation to the correct page or that the URL contains expected parameters (e.g., after a search).
    *   `new RegExp(...)`: Used for flexible URL matching, accommodating query parameters or dynamic paths.

*   **Page Title Validation:**
    *   `await expect(page).toHaveTitle(/Login|Sign In/i)`: Verifies that the page title is as expected, often used to confirm successful page loads.

*   **UI Element Validation:**
    *   `await expect(locator).toBeVisible()`: Checks if an element is present and visible on the page.
    *   `await expect(locator).toBeEditable()`: Confirms an input field can be interacted with.
    *   `await expect(locator).toBeEmpty()`: Verifies an input field has no value.
    *   `await expect(locator).toHaveValue(text)`: Checks the current value of an input field.
    *   `await expect(locator).toBeEnabled()` / `toBeDisabled()`: Validates the interactive state of buttons or input fields.
    *   `await expect(locator).toBeHidden()`: Ensures an element is not visible, common for hidden error messages or non-existent elements.
    *   `await expect(locator).toBeFocused()`: Confirms an element has keyboard focus, critical for accessibility tests.
    *   `await expect(locator).toHaveAttribute(name, value)`: Verifies specific HTML attributes, like `placeholder` or `maxlength`.
    *   `await expect(locator).toHaveCSS(property, value)`: Checks computed CSS properties (e.g., element width for responsiveness).

*   **Text Content Validation:**
    *   `await expect(locator).toContainText(text)`: Validates that an element's text content includes a specific substring.
    *   `await expect(locator).not.toBeEmpty()`: Ensures an element's text content is not blank.

*   **Success and Error Message Validation:**
    *   `expect(errorMessageText).toContain('Invalid username or password')`: Verifies specific error messages are displayed for negative scenarios.
    *   `await expect(page.locator('text=' + UI_MESSAGES.GENERIC_ERROR)).toBeVisible()`: Confirms the presence of generic error messages.

*   **Positive and Negative Validations:**
    *   Positive assertions (`toBeTruthy()`, `toBeVisible()`, `toHaveCount() > 0`) confirm expected success states.
    *   Negative assertions (`toBeHidden()`, `not.toContainText()`, `not.toContainHTML()`, `toBeInvalid()`) ensure unwanted elements or behaviors are absent.

*   **Count Validation:**
    *   `await expect(locator).toHaveCount(number)`: Checks the number of elements matching a locator.
    *   `await expect(locator).toBeGreaterThanOrEqual(number)`: Used for scenarios where a minimum number of results is expected.

*   **API Response Validation:**
    *   `await expect(response.status()).toBe(200)`: Validates the HTTP status code of API responses.
    *   `await expect(response.headers()['content-type']).toContain('application/json')`: Confirms the response content type.
    *   `const jsonResponse = await response.json()`: Parses and `expect(jsonResponse).toBeInstanceOf(Array|Object)`: Checks the structure of JSON responses.
    *   `expect(jsonResponse.length).toBeGreaterThan(0)` / `expect(jsonResponse).toEqual([])`: Validates the content and size of API response bodies.
    *   `expect(jsonResponse.message).toContain('Query parameter')`: Asserts specific error messages within API responses.

*   **Performance Validation:**
    *   `expect(duration).toBeLessThan(milliseconds)`: Measures the time taken for an action and compares it against a defined threshold.

*   **Security Validations:**
    *   `await expect(page.locator('body')).not.toContainText(/error|exception|sql error/i)`: Ensures no sensitive error messages are exposed on the UI.
    *   `await expect(page.locator('body')).not.toContainHTML(term)`: Verifies that malicious scripts are not rendered as executable HTML.
    *   `page.on('dialog', async dialog => { expect(false, ...).toBeTruthy(); })`: Catches unexpected alert dialogs (e.g., from XSS).

These assertions collectively ensure that the application functions correctly, securely, and efficiently according to its requirements.

## 9. Reports and Debugging

Playwright offers excellent reporting and debugging tools to analyze test failures and execution.

### HTML Report

After running your tests, Playwright automatically generates an HTML report (unless configured otherwise).

*   **Generate and Open Report:**
    ```bash
    npx playwright show-report
    ```
    This command will open the HTML report in your browser, providing a visual overview of your test results, including passing, failing, skipped, and flaky tests. You can click on individual tests to view detailed steps, error messages, and captured artifacts like screenshots, videos, and traces.

### Debugging Options

Playwright provides powerful debugging capabilities:

*   **Playwright Inspector (`--debug`):**
    ```bash
    npx playwright test --debug
    ```
    This command runs your tests in debug mode, launching a browser and opening the Playwright Inspector. The Inspector allows you to:
    *   Step through your test execution line by line.
    *   Inspect locators and see them highlighted in the browser.
    *   Record new locators.
    *   View actionability checks.
    *   Analyze the test trace viewer after a step.

*   **UI Mode (`--ui`):**
    ```bash
    npx playwright test --ui
    ```
    This command launches the Playwright UI mode, which provides an interactive test runner. In UI mode, you can:
    *   Run tests individually, or in groups.
    *   Filter tests by file, project, or title.
    *   View test results in real-time.
    *   Inspect a test's trace, video, and DOM snapshot directly within the UI.
    *   Debug specific test steps, similar to the Inspector.
    *   Interactively write new tests or debug existing ones with time travel debugging.

### Artifacts for Debugging

The project is configured to collect useful artifacts:

*   **Screenshots:** Screenshots are typically captured automatically on test failure and stored in the `screenshots/` directory. These help visualize the UI state at the point of failure.
*   **Videos:** Videos of test runs are saved in the `test-results/` directory by default, especially when `trace: 'on-first-retry'` is enabled. These can provide a full recording of the browser interaction leading up to a failure.
*   **Traces:** Playwright Traces capture all information about a test run, including Playwright API calls, network requests, DOM snapshots, and test code execution. They are generated for retried tests (`trace: 'on-first-retry'`) and stored in `test-results/`. You can open them using `npx playwright show-trace <path-to-trace.zip>` or directly from the HTML report/UI mode.

## 10. CI/CD Execution

While specific CI/CD pipeline configurations are not provided in the artifacts, the Playwright project is set up to be CI/CD friendly.

**Generic Recommendation:**

For CI/CD environments (e.g., GitHub Actions, GitLab CI, Jenkins, Azure DevOps):

1.  **Install Dependencies:** Ensure Node.js and npm are available, and run `npm install` to get project dependencies.
2.  **Install Browsers:** Execute `npx playwright install --with-deps` to install browsers and their system dependencies.
3.  **Set Environment Variables:** Configure your CI/CD pipeline to provide the necessary environment variables (e.g., `BASE_URL`, `SALESMAN_USERNAME`, `SALESMAN_PASSWORD`) as secrets. Playwright's `playwright.config.ts` uses `process.env.CI` to apply CI-specific settings (e.g., `retries: 2`, `workers: 1`, `headless: true`).
4.  **Execute Tests:** Run the tests using the primary command:
    ```bash
    npx playwright test
    ```
    This command will run tests headless, with retries on failure, and generate an HTML report.
5.  **Publish Reports:** Configure your CI/CD pipeline to publish the `playwright-report/` directory as a build artifact, allowing easy access to test results and traces.

## 11. Troubleshooting

Here's guidance for common issues you might encounter:

*   **Browser Installation Issues:**
    *   **Problem:** Browsers fail to install or tests cannot launch them.
    *   **Solution:** Run `npx playwright install --with-deps` to ensure all system dependencies are installed. Check Playwright's official documentation for OS-specific prerequisites.

*   **Locator Failures (`Locator.click() failed` or `Locator.isVisible() failed`):**
    *   **Problem:** Playwright cannot find or interact with a UI element.
    *   **Solution:**
        *   Use `npx playwright test --debug` to launch the Playwright Inspector and visually verify if the locator is correct and the element is present/visible on the page.
        *   Check the element's state (e.g., is it disabled, hidden behind another element?).
        *   Review screenshots and videos from the test report for visual cues.
        *   Ensure the page has fully loaded using `await page.waitForLoadState('networkidle')` or specific `waitFor` conditions.

*   **Timeout Errors (`Timeout exceeded`):**
    *   **Problem:** An action (click, fill) or navigation takes longer than the configured timeout.
    *   **Solution:**
        *   Inspect the test flow using `--debug` or traces to understand where the delay occurs.
        *   Increase `actionTimeout` or `navigationTimeout` in `playwright.config.ts` if the application is genuinely slow, or for specific actions `locator.click({ timeout: 10000 })`.
        *   Ensure `await page.waitForPageLoad()` (or similar `waitForLoadState`) is called after navigation or significant UI updates.
        *   Check network requests in the trace viewer to identify slow API calls.

*   **Environment/Configuration Issues:**
    *   **Problem:** Tests fail due to incorrect URLs, credentials, or other environment-specific settings.
    *   **Solution:**
        *   Verify your `.env` file is correctly set up with the `BASE_URL`, `SALESMAN_USERNAME`, and `SALESMAN_PASSWORD`.
        *   Ensure `playwright.config.ts` is correctly pointing to `AppConfig.baseURL` and other configurations.
        *   Double-check that `AppConfig` values are being loaded correctly, especially `process.env` variables.

*   **Test Data Problems:**
    *   **Problem:** Tests fail because the data used is incorrect, missing, or causes unexpected behavior.
    *   **Solution:**
        *   Review the "Test Data" section in this guide and the test case pre-conditions.
        *   Confirm that the `SALESMAN_USERNAME` and `SALESMAN_PASSWORD` in your `.env` are valid for the `BASE_URL` being tested.
        *   For product search tests, ensure the `PRODUCT_DATA` in your application's backend or frontend matches the test data used in the tests.

*   **Parallel Execution Issues (Flakiness):**
    *   **Problem:** Tests pass locally but fail intermittently on CI when run in parallel, or vice-versa.
    *   **Solution:**
        *   Try running tests with `npx playwright test --workers=1` to isolate if the issue is concurrency-related.
        *   Ensure test cases are independent and do not share or modify global state (e.g., login status, database entries) without proper isolation or cleanup using `test.beforeEach` / `test.afterEach` hooks.
        *   Utilize `page.route` for API mocking where external dependencies might cause flakiness.

*   **Failed Assertions (Unexpected Behavior):**
    *   **Problem:** An `expect()` assertion fails, indicating the application behaves differently than expected.
    *   **Solution:**
        *   Use `--debug` or `--ui` to step through the test and observe the application's state.
        *   Examine the generated screenshots, videos, and traces in the HTML report for visual evidence and network activity.
        *   Compare the actual result with the `Expected Result` described in the test case documentation. This might indicate a bug in the application or an outdated test.

## 12. Execution Flow

The automation project's execution flow is structured to provide a clear and maintainable testing process:

1.  **Test Configuration:** Playwright loads its global configuration from `playwright.config.ts` and application-specific settings from `src/config/app.config.ts`, including environment variables from `.env`. This dictates browser types, timeouts, retries, and base URLs.
2.  **Test Data Preparation:** Test data, defined in the "Test Data" section, `src/config/app.config.ts` (for credentials), and potentially constants (for product search terms/details), is made available to the tests. For some tests (like `PAT-CRT-001`), dynamic data is generated during execution.
3.  **Test Execution:** Playwright orchestrates the execution of test files (`.spec.ts` files) based on the chosen command (all tests, specific file, specific project).
4.  **Page Objects / Application Interaction:**
    *   Tests utilize Page Object Models (POMs) located in `src/pages/`.
    *   Each POM (e.g., `LoginPage`, `DashboardPage`) encapsulates selectors and methods specific to a particular page or UI component.
    *   The `BasePage` in `src/pages/base` provides common functionalities like navigation (`goto`), waiting for page loads (`waitForPageLoad`), and generic locator retrieval (`getByTestId`, `getByText`, `getByRole`).
    *   Tests call these POM methods to interact with the application's UI (e.g., `loginPage.login(username, password)`).
    *   For API tests, `src/api/` (implied from product search test) provides clients for direct backend interactions.
5.  **Assertions:** After each interaction, `expect` assertions (as detailed in Section 8) are used to validate the state of the UI, API responses, and application behavior against expected outcomes.
6.  **Test Result:** Each assertion contributes to the overall pass/fail status of a test. Playwright provides immediate console feedback.
7.  **Report Generation:** Upon completion (or failure), Playwright generates an HTML report (`playwright-report/`), along with optional artifacts like screenshots, videos, and traces (`test-results/`), providing a detailed overview of the test run.

## 13. Useful Commands

Here is a quick reference for common Playwright commands:

*   **Install Node.js dependencies:**
    ```bash
    npm install
    ```
*   **Install Playwright browser binaries:**
    ```bash
    npx playwright install
    ```
*   **Run all tests:**
    ```bash
    npx playwright test
    ```
*   **Run tests in headed mode (browser visible):**
    ```bash
    npx playwright test --headed
    ```
*   **Run a specific test file:**
    ```bash
    npx playwright test src/tests/e2e/sales/login.spec.ts
    ```
*   **Run tests on a specific browser (e.g., Chromium):**
    ```bash
    npx playwright test --project=chromium
    ```
*   **Run tests matching a grep pattern:**
    ```bash
    npx playwright test --grep "Product Search Functionality"
    ```
*   **Run tests with the Playwright Inspector for debugging:**
    ```bash
    npx playwright test --debug
    ```
*   **Launch Playwright UI for interactive testing and debugging:**
    ```bash
    npx playwright test --ui
    ```
*   **Open the generated HTML test report:**
    ```bash
    npx playwright show-report
    ```
*   **Run tests in CI mode (headless, retries=2, workers=1):**
    ```bash
    CI=true npx playwright test
    ```
    *(Note: The `CI=true` prefix is for Linux/macOS. For Windows PowerShell, use `$env:CI="true"; npx playwright test`)*