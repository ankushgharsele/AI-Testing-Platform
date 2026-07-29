```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { AppConfig } from './src/config/app.config';

/**
 * Read environment variables from .env file.
 * For more information, see https://github.com/motdotla/dotenv
 */
require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Directory where tests are located
  testDir: './src/tests/e2e',
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: AppConfig.baseURL,
    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
    // Set a default timeout for all test operations
    actionTimeout: AppConfig.defaultTimeout,
    navigationTimeout: AppConfig.defaultTimeout,
    // Run tests in headless mode on CI, otherwise show browser for local debugging
    headless: process.env.CI ? true : false,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});

```
```dotenv
# .env
# Environment variables for Playwright tests
# Rename this file to .env and fill in actual values.
# IMPORTANT: Do not commit sensitive data to version control.

# Base URL of the application under test
BASE_URL=https://www.example.com

# Valid salesman credentials for testing
SALESMAN_USERNAME=salesman
SALESMAN_PASSWORD=password123

```
```typescript
// src/config/app.config.ts
/**
 * Application configuration settings.
 * This file centralizes URLs and other environment-specific configurations.
 * Sensitive data should be loaded from environment variables (e.g., via .env file).
 */
export const AppConfig = {
    // Base URL of the application under test. Defaults to a placeholder if not set.
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Update with your actual application URL

    // Default timeout for Playwright actions and navigation in milliseconds.
    defaultTimeout: 30000,

    // Valid salesman credentials for login. Loaded from environment variables for security.
    validSalesmanUsername: process.env.SALESMAN_USERNAME || 'default_salesman', // Placeholder for local dev
    validSalesmanPassword: process.env.SALESMAN_PASSWORD || 'default_password',   // Placeholder for local dev

    // Invalid credentials for negative login tests.
    invalidUsername: 'invalid_user',
    invalidPassword: 'invalid_password',
};

```
```typescript
// src/pages/base/BasePage.ts
import { Page, Locator } from '@playwright/test';

/**
 * BasePage provides common functionalities and methods for all Page Object Models (POMs).
 * This class includes generic actions like navigation, waiting for page load,
 * and common locator retrieval methods.
 */
export class BasePage {
    readonly page: Page;

    /**
     * Constructor for BasePage.
     * @param page The Playwright Page object.
     */
    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigates the browser to the specified URL.
     * @param url The URL to navigate to.
     */
    async goto(url: string): Promise<void> {
        await this.page.goto(url);
    }

    /**
     * Waits for the page to reach a 'networkidle' state, indicating that
     * network activity has subsided. This is often useful after navigation or actions.
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Returns a Locator for an element matching the given test ID attribute.
     * Assumes elements use 'data-testid' for unique identification.
     * @param testId The value of the 'data-testid' attribute.
     * @returns A Playwright Locator.
     */
    getByTestId(testId: string): Locator {
        return this.page.getByTestId(testId);
    }

    /**
     * Returns a Locator for an element containing the specified text.
     * Useful for interacting with buttons, labels, or text content.
     * @param text The exact or partial text content of the element.
     * @returns A Playwright Locator.
     */
    getByText(text: string | RegExp): Locator {
        return this.page.getByText(text);
    }

    /**
     * Returns a Locator for an element by its ARIA role and optional accessible name.
     * Enhances accessibility-driven testing.
     * @param role The ARIA role (e.g., 'button', 'textbox', 'heading').
     * @param name Optional accessible name (text content, label, or aria-label).
     * @returns A Playwright Locator.
     */
    getByRole(role: string, name?: string | RegExp): Locator {
        return this.page.getByRole(role, name ? { name } : undefined);
    }
}

```
```typescript
// src/pages/sales/LoginPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { AppConfig } from '../../config/app.config';

/**
 * LoginPage Page Object Model (POM) represents the login page of the application.
 * It contains selectors and methods to interact with elements on the login page.
 */
export class LoginPage extends BasePage {
    // Selectors for elements on the login page
    private readonly usernameInput = this.page.locator('#username'); // Assuming input field has id="username"
    private readonly passwordInput = this.page.locator('#password'); // Assuming input field has id="password"
    private readonly loginButton = this.page.getByRole('button', { name: 'Login' }); // Assuming a button with accessible name 'Login'
    private readonly errorMessage = this.page.locator('.error-message'); // Assuming an element with class 'error-message' for login failures

    /**
     * Constructor for LoginPage.
     * @param page The Playwright Page object.
     */
    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigates directly to the application's login page and asserts its readiness.
     * Corresponds to Acceptance Criteria 1: Login page should open.
     */
    async gotoLoginPage(): Promise<void> {
        await this.goto(AppConfig.baseURL + '/login'); // Constructing the full login URL
        await this.waitForPageLoad();

        // Assert that the login page title is correct and key elements are visible
        await expect(this.page).toHaveTitle(/Login|Sign In/i); // Title might be 'Login' or 'Sign In'
        await expect(this.page).toHaveURL(new RegExp(`${AppConfig.baseURL}/login`)); // Verify current URL
        await expect(this.usernameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }

    /**
     * Performs the login action by filling in credentials and clicking the login button.
     * @param username The username to enter.
     * @param password The password to enter.
     */
    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await this.waitForPageLoad(); // Wait for navigation or content to load after login attempt
    }

    /**
     * Retrieves the text of the error message displayed on the login page.
     * @returns A promise that resolves to the error message text, or null if not found.
     */
    async getErrorMessage(): Promise<string | null> {
        // Wait for the error message to be visible before attempting to get its text
        await this.errorMessage.waitFor({ state: 'visible' });
        return await this.errorMessage.textContent();
    }
}

```
```typescript
// src/pages/sales/DashboardPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { AppConfig } from '../../config/app.config';

/**
 * DashboardPage Page Object Model (POM) represents the dashboard page of the application,
 * which should be displayed after a successful login.
 * It contains selectors and methods to verify elements on the dashboard.
 */
export class DashboardPage extends BasePage {
    // Selector for a unique element on the dashboard, confirming its presence
    private readonly dashboardHeader = this.page.getByRole('heading', { name: 'Sales Dashboard' }); // Example: An h1 tag with 'Sales Dashboard' text
    private readonly createOrderButton = this.page.getByRole('button', { name: 'Create New Order' }); // An element indicating the ability to create orders

    /**
     * Constructor for DashboardPage.
     * @param page The Playwright Page object.
     */
    constructor(page: Page) {
        super(page);
    }

    /**
     * Verifies that the dashboard page is currently displayed by checking its URL and key elements.
     * Corresponds to Acceptance Criteria 3: Dashboard should be displayed.
     * @returns A promise that resolves to true if the dashboard is displayed successfully.
     */
    async isDashboardDisplayed(): Promise<boolean> {
        // Assert that the current URL matches the expected dashboard URL
        await expect(this.page).toHaveURL(new RegExp(`${AppConfig.baseURL}/dashboard`));

        // Assert that the main dashboard header is visible
        await expect(this.dashboardHeader).toBeVisible();

        // Assert that elements related to the user story (creating orders) are visible
        await expect(this.createOrderButton).toBeVisible();

        return true;
    }
}

```
```typescript
// src/tests/e2e/sales/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/sales/LoginPage';
import { DashboardPage } from '../../../pages/sales/DashboardPage';
import { AppConfig } from '../../../config/app.config';

/**
 * Test suite for Salesman Login functionality.
 * This suite covers the user story: "As a Salesman, I want to login into the application
 * so that I can create orders."
 */
test.describe('Salesman Login Functionality', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    // Before each test, initialize page objects and navigate to the login page.
    // This ensures a clean state for every test case.
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        await loginPage.gotoLoginPage(); // Calls method that verifies Acceptance Criteria 1
    });

    /**
     * Test Case: Verify the login page opens correctly.
     * This directly addresses Acceptance Criteria 1: "Login page should open."
     */
    test('should successfully open the login page', async () => {
        // Explicit assertion for clarity, though already checked within gotoLoginPage()
        await expect(loginPage.page).toHaveTitle(/Login|Sign In/i);
        await expect(loginPage.page).toHaveURL(new RegExp(`${AppConfig.baseURL}/login`));
        console.log(`Test 'should successfully open the login page' passed. Current URL: ${loginPage.page.url()}`);
    });

    /**
     * Test Case: Verify a salesman can log in successfully with valid credentials
     * and is redirected to the dashboard.
     * This addresses Acceptance Criteria 2: "Valid username/password should login successfully."
     * And Acceptance Criteria 3: "Dashboard should be displayed."
     */
    test('should allow a salesman to login successfully with valid credentials and navigate to the dashboard', async () => {
        // Perform login using the valid salesman credentials from AppConfig
        await loginPage.login(AppConfig.validSalesmanUsername, AppConfig.validSalesmanPassword);

        // Assert that the dashboard is displayed, confirming successful login and navigation
        // The isDashboardDisplayed method encapsulates multiple assertions for the dashboard state
        await expect(dashboardPage.isDashboardDisplayed()).resolves.toBeTruthy();
        console.log(`Test 'should allow a salesman to login successfully...' passed. Current URL: ${dashboardPage.page.url()}`);
    });

    /**
     * Negative Test Case: Verify login fails and an error message is displayed
     * when invalid credentials are provided.
     * This enhances the robustness of the login feature by testing edge cases.
     */
    test('should display an error message for invalid credentials', async () => {
        // Attempt login with invalid credentials from AppConfig
        await loginPage.login(AppConfig.invalidUsername, AppConfig.invalidPassword);

        // Expect an error message to be visible and contain specific text
        const errorMessageText = await loginPage.getErrorMessage();
        expect(errorMessageText).toContain('Invalid username or password'); // Adjust expected message as per application
        // Expect to remain on the login page or be redirected back to it
        await expect(loginPage.page).toHaveURL(new RegExp(`${AppConfig.baseURL}/login`));
        console.log(`Test 'should display an error message for invalid credentials' passed. Error: "${errorMessageText}"`);
    });
});

```