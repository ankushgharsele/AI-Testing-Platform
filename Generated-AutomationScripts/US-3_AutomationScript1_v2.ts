```typescript
// playwright.config.ts
// This file contains the main Playwright configuration.
// It imports environment-specific configurations and defines global settings.

import { defineConfig, devices } from '@playwright/test';
import { devConfig } from './config/environments/dev.config'; // Default to dev environment

/**
 * Read environment variables from .env file.
 * For example, process.env.CI_BUILD_ID.
 */
require('dotenv').config();

// Determine the base URL based on environment variable or default to dev config
const baseURL = process.env.BASE_URL || devConfig.baseURL;

export default defineConfig({
  testDir: './src/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    // You can uncomment the Allure reporter if Allure is configured
    // ['allure-playwright', { outputFolder: 'reports/allure-results' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: baseURL,

    /* Collect traces on first retry and failures to assist with debugging. */
    trace: 'on-first-retry',

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on first retry and failures */
    video: 'on-first-retry',
  },

  /* Configure projects for different browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

// src/config/environments/dev.config.ts
// This file defines environment-specific configurations for the development environment.

interface EnvironmentConfig {
  baseURL: string;
  // Add other dev-specific configurations here if needed
}

export const devConfig: EnvironmentConfig = {
  baseURL: 'https://www.example.com/login', // Placeholder for the actual login URL
};

// src/constants/selectors.ts
// This file defines all application-wide selectors using 'data-testid' attributes for robustness.

export const Selectors = {
  // Login Page Selectors
  LOGIN: {
    USERNAME_FIELD: '[data-testid="username-field"]',
    PASSWORD_FIELD: '[data-testid="password-field"]',
    LOGIN_BUTTON: '[data-testid="login-button"]',
    ERROR_MESSAGE: '[data-testid="error-message"]',
    FORGOT_PASSWORD_LINK: '[data-testid="forgot-password-link"]',
    USERNAME_REQUIRED_ERROR: '[data-testid="username-required-error"]', // Specific error for blank username
    PASSWORD_REQUIRED_ERROR: '[data-testid="password-required-error"]', // Specific error for blank password
  },
  // Dashboard Page Selectors
  DASHBOARD: {
    WELCOME_MESSAGE: '[data-testid="welcome-message"]',
    DASHBOARD_TITLE: '[data-testid="dashboard-title"]', // A generic title or heading on the dashboard
  },
  // Forgot Password Page Selectors
  FORGOT_PASSWORD: {
    PAGE_TITLE: '[data-testid="forgot-password-page-title"]',
  },
};


// src/constants/errorMessages.ts
// This file stores all application-wide error messages for consistent assertions.

export const ErrorMessages = {
  LOGIN: {
    INVALID_CREDENTIALS: 'Invalid username or password.',
    USERNAME_REQUIRED: 'Username is required.',
    PASSWORD_REQUIRED: 'Password is required.',
  },
  // Add other modules' error messages here
};

// src/constants/timeouts.ts
// This file defines standard timeout durations used across the framework.

export const Timeouts = {
  DEFAULT_NAVIGATION: 30000, // 30 seconds
  ELEMENT_VISIBILITY: 10000, // 10 seconds
  API_REQUEST: 20000, // 20 seconds
};


// src/pages/common/BasePage.ts
// This is a base class for all Page Object Models (POMs) to share common functionalities.

import { Page } from '@playwright/test';
import { Timeouts } from '../../constants/timeouts';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a specific URL.
   * @param path The path relative to the base URL or a full URL.
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path, { timeout: Timeouts.DEFAULT_NAVIGATION });
  }

  /**
   * Waits for the network to be idle, useful after form submissions or navigation.
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: Timeouts.DEFAULT_NAVIGATION });
  }

  /**
   * Verifies if the page is currently loaded and visible.
   * This method should be implemented by each specific page object.
   * @returns A promise that resolves to true if the page is loaded, false otherwise.
   */
  abstract isLoaded(): Promise<boolean>;
}


// src/pages/customer/LoginPage.ts
// This file implements the Page Object Model for the Customer Login page.

import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Selectors } from '../../constants/selectors';
import { ErrorMessages } from '../../constants/errorMessages';
import { Timeouts } from '../../constants/timeouts';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates directly to the login page.
   */
  async navigate(): Promise<void> {
    await this.navigateTo('/');
  }

  /**
   * Fills the username field.
   * @param username The username to enter.
   */
  async fillUsername(username: string): Promise<void> {
    await this.page.fill(Selectors.LOGIN.USERNAME_FIELD, username);
  }

  /**
   * Fills the password field.
   * @param password The password to enter.
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.fill(Selectors.LOGIN.PASSWORD_FIELD, password);
  }

  /**
   * Clicks the login button.
   */
  async clickLoginButton(): Promise<void> {
    await this.page.click(Selectors.LOGIN.LOGIN_BUTTON);
  }

  /**
   * Performs a complete login action with given credentials.
   * @param username The username to use for login.
   * @param password The password to use for login.
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Gets the text of the error message displayed on the login page.
   * @returns The error message text.
   */
  async getErrorMessage(): Promise<string | null> {
    const errorMessageLocator = this.page.locator(Selectors.LOGIN.ERROR_MESSAGE);
    await errorMessageLocator.waitFor({ state: 'visible', timeout: Timeouts.ELEMENT_VISIBILITY });
    return errorMessageLocator.textContent();
  }

  /**
   * Gets the text of the username required validation message.
   * This assumes an explicit error message element, not browser default validation.
   * @returns The validation message text.
   */
  async getUsernameRequiredMessage(): Promise<string | null> {
    const locator = this.page.locator(Selectors.LOGIN.USERNAME_REQUIRED_ERROR);
    await locator.waitFor({ state: 'visible', timeout: Timeouts.ELEMENT_VISIBILITY });
    return locator.textContent();
  }

  /**
   * Gets the text of the password required validation message.
   * This assumes an explicit error message element, not browser default validation.
   * @returns The validation message text.
   */
  async getPasswordRequiredMessage(): Promise<string | null> {
    const locator = this.page.locator(Selectors.LOGIN.PASSWORD_REQUIRED_ERROR);
    await locator.waitFor({ state: 'visible', timeout: Timeouts.ELEMENT_VISIBILITY });
    return locator.textContent();
  }

  /**
   * Clicks the 'Forgot Password?' link.
   */
  async clickForgotPasswordLink(): Promise<void> {
    await this.page.click(Selectors.LOGIN.FORGOT_PASSWORD_LINK);
  }

  /**
   * Verifies if the login page is currently loaded and visible.
   * @returns A promise that resolves to true if the login button is visible.
   */
  async isLoaded(): Promise<boolean> {
    const isVisible = await this.page.locator(Selectors.LOGIN.LOGIN_BUTTON).isVisible();
    return isVisible;
  }
}


// src/pages/customer/DashboardPage.ts
// This file implements the Page Object Model for the Customer Dashboard page.

import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Selectors } from '../../constants/selectors';
import { Timeouts } from '../../constants/timeouts';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Gets the text of the welcome message on the dashboard.
   * @returns The welcome message text.
   */
  async getWelcomeMessage(): Promise<string | null> {
    const welcomeMessageLocator = this.page.locator(Selectors.DASHBOARD.WELCOME_MESSAGE);
    await welcomeMessageLocator.waitFor({ state: 'visible', timeout: Timeouts.ELEMENT_VISIBILITY });
    return welcomeMessageLocator.textContent();
  }

  /**
   * Verifies if the dashboard page is currently loaded and visible.
   * Asserts for the presence of a key element on the dashboard, e.g., a welcome message or title.
   * @returns A promise that resolves to true if the dashboard is loaded.
   */
  async isLoaded(): Promise<boolean> {
    const isVisible = await this.page.locator(Selectors.DASHBOARD.DASHBOARD_TITLE).isVisible();
    // Also check if the URL matches expected dashboard URL
    // await expect(this.page).toHaveURL(/dashboard/); // Example dashboard URL pattern
    return isVisible;
  }
}

// src/helpers/assertionHelper.ts
// This file provides reusable assertion functions to keep tests clean and readable.

import { Page, Locator, expect } from '@playwright/test';

export class AssertionHelper {
  constructor(private page: Page) {}

  /**
   * Asserts that an element is visible on the page.
   * @param selector The CSS selector or Locator of the element.
   * @param message Optional message for the assertion.
   */
  async assertElementIsVisible(selector: string | Locator, message?: string): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator, message || `Element with selector "${selector}" should be visible`).toBeVisible();
  }

  /**
   * Asserts that an element contains the expected text.
   * @param selector The CSS selector or Locator of the element.
   * @param expectedText The text expected to be in the element.
   * @param message Optional message for the assertion.
   */
  async assertElementContainsText(selector: string | Locator, expectedText: string, message?: string): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator, message || `Element with selector "${selector}" should contain text "${expectedText}"`).toContainText(expectedText);
  }

  /**
   * Asserts that the current page URL matches the expected URL.
   * @param expectedUrl The expected URL string or regex pattern.
   * @param message Optional message for the assertion.
   */
  async assertPageUrl(expectedUrl: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message || `Page URL should match "${expectedUrl}"`).toHaveURL(expectedUrl);
  }

  /**
   * Asserts that an element is hidden or not present on the page.
   * @param selector The CSS selector or Locator of the element.
   * @param message Optional message for the assertion.
   */
  async assertElementIsHidden(selector: string | Locator, message?: string): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator, message || `Element with selector "${selector}" should be hidden`).toBeHidden();
  }

  /**
   * Asserts that an element has a specific value (for input fields).
   * @param selector The CSS selector or Locator of the input element.
   * @param expectedValue The expected value of the input field.
   * @param message Optional message for the assertion.
   */
  async assertInputValue(selector: string | Locator, expectedValue: string, message?: string): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator, message || `Input with selector "${selector}" should have value "${expectedValue}"`).toHaveValue(expectedValue);
  }
}


// src/helpers/browserHelper.ts
// This file provides reusable helper functions for browser-level interactions.

import { Page } from '@playwright/test';
import { Timeouts } from '../constants/timeouts';

export class BrowserHelper {
  constructor(private page: Page) {}

  /**
   * Navigates the browser to a specified URL.
   * @param url The URL to navigate to.
   * @param timeout Optional timeout for navigation, defaults to DEFAULT_NAVIGATION.
   */
  async navigateTo(url: string, timeout: number = Timeouts.DEFAULT_NAVIGATION): Promise<void> {
    await this.page.goto(url, { timeout: timeout });
  }

  /**
   * Reloads the current page.
   * @param timeout Optional timeout for reload, defaults to DEFAULT_NAVIGATION.
   */
  async reloadPage(timeout: number = Timeouts.DEFAULT_NAVIGATION): Promise<void> {
    await this.page.reload({ timeout: timeout });
  }

  /**
   * Waits for a specific network event (e.g., 'networkidle', 'load', 'domcontentloaded').
   * @param status The load state to wait for.
   * @param timeout Optional timeout, defaults to DEFAULT_NAVIGATION.
   */
  async waitForLoadState(status: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle', timeout: number = Timeouts.DEFAULT_NAVIGATION): Promise<void> {
    await this.page.waitForLoadState(status, { timeout: timeout });
  }

  /**
   * Waits for a specific URL to be reached after an action.
   * @param url The URL string or regex pattern to wait for.
   * @param timeout Optional timeout.
   */
  async waitForUrl(url: string | RegExp, timeout: number = Timeouts.DEFAULT_NAVIGATION): Promise<void> {
    await this.page.waitForURL(url, { timeout: timeout });
  }

  /**
   * Clears all browser cookies.
   */
  async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }

  /**
   * Takes a screenshot of the current page.
   * @param path The file path to save the screenshot.
   */
  async takeScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path: path });
  }
}


// src/helpers/elementHelper.ts
// This file provides reusable helper functions for common element interactions.

import { Page, Locator } from '@playwright/test';
import { Timeouts } from '../constants/timeouts';

export class ElementHelper {
  constructor(private page: Page) {}

  /**
   * Clicks an element.
   * @param selector The CSS selector or Locator of the element to click.
   * @param timeout Optional timeout for the click action, defaults to ELEMENT_VISIBILITY.
   */
  async click(selector: string | Locator, timeout: number = Timeouts.ELEMENT_VISIBILITY): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.click({ timeout: timeout });
  }

  /**
   * Fills an input field with the given text.
   * @param selector The CSS selector or Locator of the input field.
   * @param value The text to fill into the field.
   * @param timeout Optional timeout, defaults to ELEMENT_VISIBILITY.
   */
  async fill(selector: string | Locator, value: string, timeout: number = Timeouts.ELEMENT_VISIBILITY): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.fill(value, { timeout: timeout });
  }

  /**
   * Retrieves the text content of an element.
   * @param selector The CSS selector or Locator of the element.
   * @param timeout Optional timeout, defaults to ELEMENT_VISIBILITY.
   * @returns The text content of the element, or null if not found.
   */
  async getText(selector: string | Locator, timeout: number = Timeouts.ELEMENT_VISIBILITY): Promise<string | null> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible', timeout: timeout });
    return locator.textContent();
  }

  /**
   * Checks if an element is visible.
   * @param selector The CSS selector or Locator of the element.
   * @param timeout Optional timeout, defaults to ELEMENT_VISIBILITY.
   * @returns True if the element is visible, false otherwise.
   */
  async isVisible(selector: string | Locator, timeout: number = Timeouts.ELEMENT_VISIBILITY): Promise<boolean> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Waits for an element to become visible.
   * @param selector The CSS selector or Locator of the element.
   * @param timeout Optional timeout, defaults to ELEMENT_VISIBILITY.
   */
  async waitForElementVisible(selector: string | Locator, timeout: number = Timeouts.ELEMENT_VISIBILITY): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible', timeout: timeout });
  }

  /**
   * Gets the value of an input element.
   * @param selector The CSS selector or Locator of the input element.
   * @param timeout Optional timeout, defaults to ELEMENT_VISIBILITY.
   * @returns The value of the input element, or null if not found.
   */
  async getInputValue(selector: string | Locator, timeout: number = Timeouts.ELEMENT_VISIBILITY): Promise<string | null> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible', timeout: timeout });
    return locator.inputValue();
  }
}

// test-data/customer/validCredentials.json
{
  "username": "test@example.com",
  "password": "Password123!"
}

// test-data/customer/invalidCredentials.json
{
  "username": "wrong@example.com",
  "password": "WrongPassword123!"
}

// src/tests/e2e/customer/login.e2e.spec.ts
// This file contains end-to-end tests for the customer login functionality.

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/customer/LoginPage';
import { DashboardPage } from '../../../pages/customer/DashboardPage';
import { Selectors } from '../../../constants/selectors';
import { ErrorMessages } from '../../../constants/errorMessages';
import { AssertionHelper } from '../../../helpers/assertionHelper';

// Import test data
import * as validCredentials from '../../../../test-data/customer/validCredentials.json';
import * as invalidCredentials from '../../../../test-data/customer/invalidCredentials.json';

test.describe('US-003 - Customer Login Module', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let assert: AssertionHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    assert = new AssertionHelper(page);

    // Navigate to the login page before each test
    await loginPage.navigate();
    await expect(loginPage.isLoaded()).resolves.toBe(true); // Ensure login page is loaded
  });

  // TC001 - Login with Valid Credentials
  test('TC001_Verify customer can login with valid credentials and access dashboard', async ({ page }) => {
    await test.step('Enter valid username and password', async () => {
      await loginPage.fillUsername(validCredentials.username);
      await loginPage.fillPassword(validCredentials.password);
    });

    await test.step('Click Login button', async () => {
      await loginPage.clickLoginButton();
    });

    await test.step('Verify Dashboard is displayed after successful login', async () => {
      // Assuming a successful login redirects to '/dashboard' or similar
      await assert.assertPageUrl(/dashboard/, 'Page should navigate to the dashboard URL');
      await expect(dashboardPage.isLoaded()).resolves.toBe(true);
      await assert.assertElementIsVisible(Selectors.DASHBOARD.WELCOME_MESSAGE, 'Welcome message should be visible on dashboard');
      await assert.assertElementContainsText(
        Selectors.DASHBOARD.WELCOME_MESSAGE,
        'Welcome', // Assuming the welcome message contains "Welcome"
        'Welcome message text should be correct'
      );
    });
  });

  // TC002 - Login with Invalid Credentials
  test('TC002_Verify error message is shown for invalid login credentials', async () => {
    await test.step('Enter invalid username and password', async () => {
      await loginPage.fillUsername(invalidCredentials.username);
      await loginPage.fillPassword(invalidCredentials.password);
    });

    await test.step('Click Login button', async () => {
      await loginPage.clickLoginButton();
    });

    await test.step('Verify error message is displayed', async () => {
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBe(ErrorMessages.LOGIN.INVALID_CREDENTIALS);
      await assert.assertElementIsVisible(Selectors.LOGIN.ERROR_MESSAGE, 'Error message should be visible');
    });
  });

  // TC003 - Blank Username
  test('TC003_Verify validation message when username field is left blank', async () => {
    await test.step('Leave username blank and enter password', async () => {
      await loginPage.fillUsername(''); // Ensure field is explicitly empty
      await loginPage.fillPassword(validCredentials.password);
    });

    await test.step('Click Login button', async () => {
      // We expect the form submission to be prevented or an error message to appear
      await loginPage.clickLoginButton();
    });

    await test.step('Verify username validation message is displayed', async () => {
      // Assuming the application shows a specific error message for blank username
      const validationMessage = await loginPage.getUsernameRequiredMessage();
      expect(validationMessage).toBe(ErrorMessages.LOGIN.USERNAME_REQUIRED);
      await assert.assertElementIsVisible(Selectors.LOGIN.USERNAME_REQUIRED_ERROR, 'Username required error should be visible');
    });
  });

  // TC004 - Blank Password
  test('TC004_Verify validation message when password field is left blank', async () => {
    await test.step('Enter username and leave password blank', async () => {
      await loginPage.fillUsername(validCredentials.username);
      await loginPage.fillPassword(''); // Ensure field is explicitly empty
    });

    await test.step('Click Login button', async () => {
      // We expect the form submission to be prevented or an error message to appear
      await loginPage.clickLoginButton();
    });

    await test.step('Verify password validation message is displayed', async () => {
      // Assuming the application shows a specific error message for blank password
      const validationMessage = await loginPage.getPasswordRequiredMessage();
      expect(validationMessage).toBe(ErrorMessages.LOGIN.PASSWORD_REQUIRED);
      await assert.assertElementIsVisible(Selectors.LOGIN.PASSWORD_REQUIRED_ERROR, 'Password required error should be visible');
    });
  });

  // TC005 - Forgot Password
  test('TC005_Verify Forgot Password link navigates to the correct page', async ({ page }) => {
    await test.step('Click Forgot Password link', async () => {
      await loginPage.clickForgotPasswordLink();
    });

    await test.step('Verify Forgot Password page opens', async () => {
      // Assuming the Forgot Password page URL contains '/forgot-password'
      await assert.assertPageUrl(/forgot-password/, 'Page should navigate to the Forgot Password URL');
      // Verify a key element on the Forgot Password page is visible
      await assert.assertElementIsVisible(Selectors.FORGOT_PASSWORD.PAGE_TITLE, 'Forgot password page title should be visible');
      await assert.assertElementContainsText(Selectors.FORGOT_PASSWORD.PAGE_TITLE, 'Forgot Your Password?', 'Forgot password page title text should be correct');
    });
  });
});
```