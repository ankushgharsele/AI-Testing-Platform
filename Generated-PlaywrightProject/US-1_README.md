# Playwright Automation Framework

This document provides a comprehensive guide for understanding, installing, executing, and contributing to the Playwright automation framework. This framework is designed to facilitate robust, reliable, and efficient end-to-end and API testing for our applications across various browsers and environments.

## Table of Contents

1.  [Framework Overview](#framework-overview)
2.  [Folder Structure](#folder-structure)
3.  [Installation](#installation)
4.  [Execution Steps](#execution-steps)
5.  [npm Commands](#npm-commands)
6.  [Playwright Commands](#playwright-commands)
7.  [Reporting](#reporting)
8.  [Best Practices](#best-practices)

---

## 1. Framework Overview

This Playwright automation framework leverages Microsoft Playwright for reliable end-to-end testing of web applications. It is built to support a robust, scalable, and maintainable testing solution across various browsers (Chromium, Firefox, WebKit) and environments.

**Key Features:**

*   **Cross-Browser Compatibility:** Execute tests seamlessly on Chromium, Firefox, and WebKit.
*   **Parallel Execution:** Maximize efficiency by running tests concurrently.
*   **Reliable Assertions:** Utilizes Playwright's built-in `expect` library for robust assertions.
*   **Rich Reporting:** Generates comprehensive test reports including screenshots, videos, and trace files for failed tests.
*   **CI/CD Integration:** Designed for easy integration into Continuous Integration/Continuous Deployment pipelines.
*   **Page Object Model (POM):** Encourages a structured approach for UI interaction, enhancing maintainability and readability.
*   **TypeScript/JavaScript Support:** Developed with best practices for either language, ensuring type safety and code quality.

## 2. Folder Structure

The framework is organized into logical directories to ensure maintainability, scalability, and clarity. Key directories typically include:

*   `tests/`: Contains all test specification files (e.g., `.spec.ts` or `.spec.js`). This directory is usually further subdivided by test type (e.g., `e2e/`, `api/`, `component/`) or feature area to improve organization.
*   `pages/`: Houses Page Object Model (POM) classes, abstracting UI interactions and element selectors into reusable components. This promotes reusability and reduces code duplication.
*   `fixtures/`: Stores test data, custom Playwright fixtures, or setup/teardown scripts that can be injected into tests.
*   `utils/`: Contains helper functions, custom assertions, or common utility methods used across the tests (e.g., date formatters, API clients).
*   `configs/`: Holds Playwright configuration files (`playwright.config.ts`) and environment-specific settings.
*   `reporters/`: For custom reporter configurations or specialized output if standard reporters are insufficient.
*   `artifacts/`: Where test artifacts such as screenshots, videos, and trace files are stored post-execution. This directory is typically ignored by version control.

## 3. Installation

To set up the Playwright automation framework on your local machine, follow these steps:

1.  **Prerequisites:**
    *   Ensure Node.js (LTS version recommended) is installed. You can download it from [nodejs.org](https://nodejs.org/).
    *   `npm` (Node Package Manager) is typically installed with Node.js. Verify with `npm -v`.

2.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
    Replace `<repository-url>` with the actual URL of your Git repository and `<repository-name>` with the name of the cloned directory.

3.  **Install Dependencies:**
    Navigate to the project root directory and install all required Node.js packages:
    ```bash
    npm install
    ```
    This command downloads and installs Playwright and all other project dependencies specified in `package.json`.

4.  **Install Playwright Browsers:**
    Playwright requires specific browser binaries. Install them using the Playwright CLI:
    ```bash
    npx playwright install
    ```
    This command installs Chromium, Firefox, and WebKit browsers. You can also specify individual browsers, e.g., `npx playwright install chromium`.

## 4. Execution Steps

Tests can be executed from the command line. The `playwright.config.ts` file defines the default behavior, browsers, and reporting options.

1.  **Run All Tests:**
    To execute all tests defined in the `tests/` directory:
    ```bash
    npm test
    ```
    or directly via Playwright CLI:
    ```bash
    npx playwright test
    ```

2.  **Run Tests on Specific Browsers:**
    To run tests on a specific browser (e.g., Chromium):
    ```bash
    npx playwright test --project=chromium
    ```
    You can specify multiple projects:
    ```bash
    npx playwright test --project=chromium --project=firefox
    ```

3.  **Run a Specific Test File:**
    To run tests from a single file:
    ```bash
    npx playwright test tests/e2e/login.spec.ts
    ```

4.  **Run Tests Matching a Title/Name:**
    To run tests whose `test()` or `describe()` title contains a specific substring:
    ```bash
    npx playwright test -g "Login Functionality"
    ```

5.  **Run Tests in UI Mode:**
    To open Playwright's UI mode for interactive debugging, step-by-step execution, and test inspection:
    ```bash
    npx playwright test --ui
    ```

6.  **Run Tests with Debugger (VS Code):**
    For advanced debugging, you can use VS Code's debugger. Set breakpoints in your test files and run the tests with the debugger attached. Refer to `.vscode/launch.json` for specific configurations.

## 5. npm Commands

The `package.json` file defines a set of convenience scripts for common tasks:

*   `npm test`: Executes all tests using the default configuration (`npx playwright test`).
*   `npm run test:e2e`: Runs end-to-end tests (if configured to target specific test types).
*   `npm run test:api`: Runs API tests (if configured).
*   `npm run test:ui`: Launches the Playwright UI mode for interactive testing (`npx playwright test --ui`).
*   `npm run test:report`: Opens the latest HTML test report in your browser (`npx playwright show-report`).
*   `npm run lint`: Runs static code analysis to enforce code style and catch potential errors.
*   `npm run format`: Automatically formats code using Prettier or a similar tool.

## 6. Playwright Commands

Beyond basic execution, Playwright provides powerful command-line tools:

*   `npx playwright install [browser]`: Installs browser binaries.
    *   `npx playwright install`: Installs all default browsers (Chromium, Firefox, WebKit).
    *   `npx playwright install chromium`: Installs only Chromium.
*   `npx playwright test [options]`: Runs tests (as detailed in Execution Steps).
*   `npx playwright show-report [path]`: Opens the HTML test report. By default, it opens the report from `playwright-report/`.
*   `npx playwright codegen [url]`: Generates Playwright test code by recording user interactions in a browser. This is useful for quickly bootstrapping new tests.
    *   `npx playwright codegen https://example.com`
*   `npx playwright test --debug`: Runs tests with Playwright's inspector, allowing you to step through tests, examine locators, and debug.
*   `npx playwright test --list`: Lists all tests without running them.

## 7. Reporting

The framework generates comprehensive test reports to provide insights into test execution results.

*   **HTML Reporter (Default):**
    *   After each test run, Playwright generates an interactive HTML report by default, typically located in the `playwright-report/` directory.
    *   This report provides a detailed breakdown of each test, including:
        *   Test status (Passed, Failed, Skipped).
        *   Duration.
        *   Error messages and stack traces for failed tests.
        *   Screenshots taken automatically on failure (or optionally for all steps).
        *   Videos of test execution (optional).
        *   Playwright Traces, offering a timeline view of actions, network requests, and DOM snapshots (optional).
    *   To view the latest report, execute:
        ```bash
        npm run test:report
        # or
        npx playwright show-report
        ```

*   **Other Reporters:**
    The `playwright.config.ts` file can be configured to include additional reporters such as:
    *   `list`: Prints test results to the console.
    *   `dot`: Prints a dot for each test.
    *   `json`: Generates a JSON file with test results, useful for programmatic processing.
    *   `junit`: Generates JUnit XML reports, commonly used for CI/CD pipeline integration.
    *   `allure-playwright`: For integrating with the Allure Report framework, providing rich, interactive reports. (Requires additional installation and configuration).

## 8. Best Practices

Adhering to best practices ensures the framework remains robust, maintainable, and scalable.

1.  **Page Object Model (POM):**
    *   Implement POM for all UI interactions. Each page or significant component should have its own Page Object class located in the `pages/` directory.
    *   Page Objects should encapsulate element selectors and interactions, making tests more readable and resilient to UI changes.

2.  **Clear and Concise Test Names:**
    *   Use descriptive test titles (e.g., `test('should allow a user to log in with valid credentials')`) that clearly indicate the purpose of the test.
    *   Organize tests logically using `describe()` blocks to group related tests.

3.  **Robust Locators:**
    *   Prioritize Playwright's recommended locators: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId`.
    *   Avoid brittle CSS or XPath selectors where possible. If necessary, use `data-testid` attributes for reliable element identification.

4.  **Reusable Components/Fixtures:**
    *   Create reusable functions and custom fixtures (`fixtures/`) for common setup, teardown, or complex interactions.
    *   Abstract complex logic into utility functions (`utils/`) to keep test files clean and focused on assertions.

5.  **Environment Configuration:**
    *   Manage environment-specific variables (e.g., base URLs, credentials) using Playwright's configuration (`playwright.config.ts`) and potentially environment variables (`.env` files) to ensure tests can run in different environments (dev, staging, production).

6.  **Parallel Execution & Sharding:**
    *   Leverage Playwright's parallel execution capabilities (`workers` in `playwright.config.ts`) to speed up test runs.
    *   Consider sharding for very large test suites in CI/CD environments.

7.  **Assertions and Retries:**
    *   Use Playwright's built-in `expect` library for all assertions, as it includes auto-waiting capabilities.
    *   Understand and utilize Playwright's auto-retries for actions and assertions to reduce flakiness. Configure `retries` in `playwright.config.ts` for flaky tests.

8.  **Error Handling and Debugging:**
    *   Familiarize yourself with Playwright's debugging tools (UI mode, trace viewer, `codegen`, `pw.pause()`).
    *   Ensure meaningful error messages are logged for easier debugging.

9.  **Continuous Integration (CI):**
    *   Integrate the test suite into your CI pipeline (e.g., Jenkins, GitLab CI, GitHub Actions) to run tests automatically on code pushes or pull requests.
    *   Configure CI to publish test reports (e.g., JUnit XML, Allure) for visibility.

10. **Code Reviews:**
    *   All new test code should undergo thorough code reviews to ensure quality, adherence to best practices, and maintainability.

---