# Playwright Automation Project Execution Guide

This guide provides comprehensive instructions for setting up, executing, and troubleshooting the Playwright automation tests for this project.

---

## Project Overview

This Playwright automation project is designed to validate the core login functionality of a web application, specifically addressing **User Story 2: User Login with Test Data**. The tests cover various scenarios, including:

*   **Successful Login:** Verifying that a user with valid credentials can log in and access the protected area, confirming the display of a success message.
*   **Invalid Password:** Testing the login process with a valid username but an incorrect password to ensure appropriate error handling and messages.
*   **Invalid Username:** Verifying the behavior when attempting to log in with an unregistered or invalid username.

The project leverages data-driven testing principles, using distinct test data sets for each scenario to ensure robust coverage and reusability. It aims to provide reliable and efficient regression testing for the authentication module.

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Node.js (LTS version recommended):** Playwright is built on Node.js.
    *   [Download Node.js](https://nodejs.org/en/download/)
*   **VS Code (or any preferred IDE):** An integrated development environment for writing and managing your tests.
    *   [Download VS Code](https://code.visualstudio.com/download)
*   **Git:** For cloning the repository and version control.
    *   [Download Git](https://git-scm.com/downloads)
*   **Playwright (will be installed as part of setup):** The testing framework itself.

## Installation

Follow these steps to set up the project locally:

1.  **Clone the Repository:**
    If you haven't already, clone the project repository from GitHub:
    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```
    (Replace `<repository_url>` and `<project_directory>` with actual values if available, otherwise assume local project creation)

2.  **Install Node.js Dependencies:**
    Navigate to the root directory of your project and install all required Node.js packages, including Playwright:
    ```bash
    npm install
    ```

3.  **Install Playwright Browsers:**
    Playwright needs to download browser binaries (Chromium, Firefox, WebKit). Run this command to install them:
    ```bash
    npx playwright install
    ```

## Execute Tests

You can run your Playwright tests using various commands to suit your needs.

*   **Run All Tests:**
    Execute all tests defined in the `tests` directory.
    ```bash
    npx playwright test
    ```

*   **Run All Tests in Headed Mode:**
    Run tests with a visible browser UI. This is useful for debugging and observing test execution.
    ```bash
    npx playwright test --headed
    ```

*   **Run a Specific Test File:**
    Execute tests only from a particular spec file.
    ```bash
    npx playwright test tests/Login.spec.ts
    ```
    (Replace `tests/Login.spec.ts` with the actual path to your desired test file.)

*   **Run Tests on a Specific Browser:**
    Execute tests targeting a specific browser engine (e.g., Chromium, Firefox, WebKit).
    ```bash
    npx playwright test --project=chromium
    ```
    You can also use `--project=firefox` or `--project=webkit`.

*   **Run Tests with Debugger (VS Code):**
    Open the test file in VS Code, and click the "Debug" button next to a `test()` block or `describe()` block. You can also set breakpoints within your code.

## Generate Report

After test execution, Playwright automatically generates an HTML report (by default). You can view this report using the following command:

```bash
npx playwright show-report
```
This will open the detailed HTML test report in your default browser, providing insights into test results, duration, traces, and more.

## Folder Structure

A typical Playwright project structure promotes organization and maintainability. This project likely adheres to the following conventions:

```
.
├── playwright.config.ts         # Playwright configuration file
├── package.json                 # Node.js project metadata and dependencies
├── package-lock.json            # Exact dependency versions
├── tests/                       # Contains all test files
│   └── Login.spec.ts            # Example test file for login scenarios
├── pages/                       # Page Object Model (POM) files
│   └── LoginPage.ts             # Represents the login page and its interactions
├── utils/                       # Utility functions and helper scripts
│   └── testData.ts              # Stores and manages test data for various scenarios
│   └── CommonHelpers.ts         # General helper functions (e.g., assertions, waits)
├── fixtures/                    # Custom Playwright fixtures for test setup/teardown
│   └── auth.fixture.ts          # Example: Fixture for authenticated user state
└── .gitignore                   # Specifies intentionally untracked files to ignore
```

*   **`playwright.config.ts`**: The main configuration file for Playwright. It defines browsers, test timeouts, reporters, and other global settings for your test runs.
*   **`tests/`**: This directory houses all your test files, typically ending with `.spec.ts` (or `.js`, `.mjs`). Each file usually contains one or more `test()` blocks grouped by `describe()`.
*   **`pages/`**: Implements the Page Object Model (POM) design pattern. Each file in this directory represents a page or a major component of your application, encapsulating its selectors and interactions. For example, `LoginPage.ts` would contain methods like `navigateTo()`, `login(username, password)`, `getErrorMessage()`, etc.
*   **`utils/`**: Contains various helper functions, reusable code snippets, and non-page-specific logic. This might include:
    *   `testData.ts`: For managing and providing test data used across multiple tests.
    *   `CommonHelpers.ts`: General utility functions (e.g., custom assertions, generic wait functions, data generators).
*   **`fixtures/`**: This directory can hold custom Playwright fixtures. Fixtures are a powerful way to set up and tear down test environments (e.g., creating an authenticated user, setting up a database state) or provide reusable test context.

## Troubleshooting

Here are some common issues you might encounter with Playwright and their potential solutions:

1.  **"Browser not found" or "No browser installed"**:
    *   **Issue**: Playwright couldn't find the necessary browser binaries.
    *   **Solution**: Run `npx playwright install` to download and install the browsers. If you're running on a CI/CD environment, ensure the browser installation step is included.

2.  **`page.click()` or `page.fill()` fails due to element not found/visible**:
    *   **Issue**: The element Playwright is trying to interact with is not yet present in the DOM, is not visible, or is covered by another element.
    *   **Solution**:
        *   **Auto-waiting**: Playwright generally auto-waits for elements to be actionable. If it's failing, increase the `timeout` for the specific action or globally in `playwright.config.ts`.
        *   **Explicit waits**: Use `page.waitForSelector()`, `page.waitForLoadState('networkidle')`, or `page.waitForURL()` before performing the action.
        *   **Correct selectors**: Double-check your CSS or XPath selectors. Use Playwright's Codegen (`npx playwright codegen <url>`) or DevTools to verify selectors.

3.  **`Error: expect(received).toBeVisible()` fails**:
    *   **Issue**: An element is present in the DOM but not considered "visible" by Playwright (e.g., `display: none`, `visibility: hidden`, `opacity: 0`, zero-size, or covered).
    *   **Solution**:
        *   Inspect the element in DevTools to understand its visibility properties.
        *   If the element appears later, ensure there's enough time or a proper wait for its visibility.
        *   Sometimes, an element needs to be scrolled into view; Playwright does this automatically for most actions, but manual `locator.scrollIntoViewIfNecessary()` might be an option in rare cases.

4.  **Tests failing intermittently (flaky tests)**:
    *   **Issue**: Tests pass sometimes and fail others without code changes. Often due to race conditions or timing issues.
    *   **Solution**:
        *   **Increase timeouts**: Adjust `actionTimeout`, `navigationTimeout`, or `expect.timeout` in `playwright.config.ts` or for specific actions.
        *   **Use robust locators**: Avoid fragile selectors (e.g., based on dynamic IDs). Prefer `getByRole`, `getByText`, `getByLabel`, or stable `data-testid` attributes.
        *   **Wait for specific conditions**: Instead of generic waits, wait for a specific element to be visible, enabled, or for an API call to complete.
        *   **Retries**: Configure retries in `playwright.config.ts` (`retries: 2`). While not a fix for flakiness, it can help pass flaky tests.

5.  **`TypeError: Cannot read properties of undefined (reading 'page')`**:
    *   **Issue**: You're trying to use `page` or other fixtures outside of a `test()` function or without declaring them correctly in a `test()` signature (`async ({ page }) => { ... }`).
    *   **Solution**: Ensure `page` (or any other fixture) is properly destructured as an argument within your `test()` or `beforeEach`/`afterEach` hooks.

6.  **"Network connection issues"**:
    *   **Issue**: Tests fail due to slow network, unreachable URLs, or SSL certificate errors.
    *   **Solution**:
        *   **Check network connectivity**: Ensure your machine has a stable internet connection if testing against external sites.
        *   **Increase `navigationTimeout`**: If pages load slowly.
        *   **Bypass SSL errors**: For local development or specific environments, you can sometimes use `ignoreHTTPSErrors: true` in `playwright.config.ts` (use with caution in production).

7.  **Resource leaks or slow test runs**:
    *   **Issue**: Tests become progressively slower, or memory usage increases.
    *   **Solution**:
        *   **Close contexts/pages**: Ensure you're not leaving browser contexts or pages open unnecessarily in custom setups. Playwright's `test()` function typically handles this automatically.
        *   **Reset state**: Use `beforeEach` hooks to ensure a clean state before each test.
        *   **Run tests in parallel**: Playwright runs tests in parallel by default, but ensure your `playwright.config.ts` is configured for optimal worker usage (`workers: '50%'` or a specific number).

By following this guide, you should be able to effectively manage and execute the Playwright automation tests within this project.