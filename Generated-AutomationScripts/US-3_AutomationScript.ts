```typescript
// playwright.config.ts
// Located at: src/config/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from .env file.
 * For more information, see https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '../../src/tests/e2e', // Adjust to point to the e2e tests
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
    ['html', { outputFolder: '../../reports/html-report', open: 'never' }],
    ['allure-playwright', { outputFolder: '../../reports/allure-results', testCaseNewerThan: 2000 }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000', // Replace with your application's base URL
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Headless mode for CI/CD */
    headless: process.env.CI ? true : false,
    /* Screenshots on failure */
    screenshot: 'only-on-failure',
    /* Video recording */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
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
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

```

```typescript
// src/constants/selectors.ts

export const SELECTORS = {
  // Login Page
  LOGIN: {
    EMAIL_INPUT: '#email',
    PASSWORD_INPUT: '#password',
    LOGIN_BUTTON: 'button[type="submit"]',
    ERROR_MESSAGE: '[data-test="login-error-message"]',
    FORGOT_PASSWORD_LINK: '[data-test="forgot-password-link"]',
    USERNAME_VALIDATION_MESSAGE: '[data-test="email-validation-message"]',
    PASSWORD_VALIDATION_MESSAGE: '[data-test="password-validation-message"]',
    LOGIN_PAGE_TITLE: 'h1', // Assuming a title on the login page
  },
  // Dashboard Page
  DASHBOARD: {
    WELCOME_MESSAGE: '[data-test="dashboard-welcome-message"]',
    DASHBOARD_HEADER: 'h1', // Assuming a main header on the dashboard
  },
  // Forgot Password Page
  FORGOT_PASSWORD: {
    PAGE_TITLE: 'h1', // Assuming a title on the forgot password page
    EMAIL_INPUT: '#forgot-password-email',
    SUBMIT_BUTTON: 'button[type="submit"]',
  },
};

```

```typescript
// src/constants/errorMessages.ts

export const ERROR_MESSAGES = {
  LOGIN: {
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    USERNAME_REQUIRED: 'Email is required.',
    PASSWORD_REQUIRED: 'Password is required.',
  },
  // Add other module error messages here if needed
  COMMON: {
    PAGE_NOT_FOUND: '404 - Page Not Found',
  },
};

```

```json
// src/test-data/customer/validCredentials.json

{
  "username": "customer@example.com",
  "password": "Password123!"
}

```

```json
// src/test-data/customer/invalidCredentials.json

{
  "username": "wrong@example.com",
  "password": "WrongPassword!"
}

```

```typescript
// src/pages/common/BasePage.ts

import { Page, expect } from '@playwright/test';
import { SELECTORS } from '../../constants/selectors';

/**
 * BasePage class provides common functionalities and methods
 * that can be inherited by all other Page Object Model (POM) classes.
 * This helps in reducing code duplication and maintaining consistency.
 */
export default class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a specific path relative to the base URL.
   * @param path The path to navigate to (e.g., '/login', '/dashboard').
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Verifies if the current URL matches the expected URL.
   * @param expectedUrl The full or partial URL to expect.
   */
  async verifyUrl(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expectedUrl));
  }

  /**
   * Verifies if a specific element is visible on the page.
   * @param selector The CSS selector of the element to verify.
   * @param errorMessage Custom error message if the element is not visible.
   */
  async verifyElementVisibility(selector: string, errorMessage?: string): Promise<void> {
    await expect(this.page.locator(selector), errorMessage || `Element with selector "${selector}" should be visible`).toBeVisible();
  }

  /**
   * Waits for a network request with a specific URL to finish.
   * @param urlPattern A regex pattern to match the request URL.
   * @param timeout The maximum time in milliseconds to wait for the request.
   */
  async waitForRequest(urlPattern: RegExp, timeout: number = 10000): Promise<void> {
    await this.page.waitForResponse(urlPattern, { timeout });
  }
}

```

```typescript
// src/pages/customer/LoginPage.ts

import { Page, expect } from '@playwright/test';
import BasePage from '../common/BasePage';
import { SELECTORS } from '../../constants/selectors';

/**
 * LoginPage represents the Customer Login page and contains methods
 * to interact with elements on this page.
 */
export default class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates directly to the login page.
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigate('/login'); // Assuming '/login' is the path to the login page
    await expect(this.page.locator(SELECTORS.LOGIN.LOGIN_PAGE_TITLE)).toHaveText('Customer Login'); // Verify page title
  }

  /**
   * Fills in the username and password fields and clicks the login button.
   * @param username The email address to enter.
   * @param password The password to enter.
   */
  async login(username: string, password: string): Promise<void> {
    await this.page.fill(SELECTORS.LOGIN.EMAIL_INPUT, username);
    await this.page.fill(SELECTORS.LOGIN.PASSWORD_INPUT, password);
    await this.page.click(SELECTORS.LOGIN.LOGIN_BUTTON);
  }

  /**
   * Retrieves the text of the main error message displayed on the login page.
   * @returns The error message text.
   */
  async getErrorMessage(): Promise<string | null> {
    const errorLocator = this.page.locator(SELECTORS.LOGIN.ERROR_MESSAGE);
    await expect(errorLocator).toBeVisible();
    return errorLocator.textContent();
  }

  /**
   * Retrieves the validation message for the username field.
   * This might be a custom element or a browser's native validation message.
   * @returns The username validation message text.
   */
  async getUsernameValidationMessage(): Promise<string | null> {
    const validationLocator = this.page.locator(SELECTORS.LOGIN.USERNAME_VALIDATION_MESSAGE);
    await expect(validationLocator).toBeVisible();
    return validationLocator.textContent();
  }

  /**
   * Retrieves the validation message for the password field.
   * @returns The password validation message text.
   */
  async getPasswordValidationMessage(): Promise<string | null> {
    const validationLocator = this.page.locator(SELECTORS.LOGIN.PASSWORD_VALIDATION_MESSAGE);
    await expect(validationLocator).toBeVisible();
    return validationLocator.textContent();
  }

  /**
   * Clicks the 'Forgot Password' link.
   */
  async clickForgotPassword(): Promise<void> {
    await this.page.click(SELECTORS.LOGIN.FORGOT_PASSWORD_LINK);
  }

  /**
   * Verifies if the login page is currently displayed.
   */
  async isLoginPageDisplayed(): Promise<void> {
    await expect(this.page.locator(SELECTORS.LOGIN.LOGIN_PAGE_TITLE)).toHaveText('Customer Login');
    await expect(this.page.locator(SELECTORS.LOGIN.LOGIN_BUTTON)).toBeVisible();
  }
}

```

```typescript
// src/pages/customer/DashboardPage.ts

import { Page, expect } from '@playwright/test';
import BasePage from '../common/BasePage';
import { SELECTORS } from '../../constants/selectors';

/**
 * DashboardPage represents the Customer Dashboard page and contains methods
 * to interact with elements specific to this page.
 */
export default class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verifies if the dashboard is visible by checking for a unique element on the page.
   * @returns A boolean indicating if the dashboard is visible.
   */
  async isDashboardVisible(): Promise<void> {
    await expect(this.page.locator(SELECTORS.DASHBOARD.DASHBOARD_HEADER)).toHaveText('Dashboard', { timeout: 10000 }); // Assuming a 'Dashboard' title
    await expect(this.page.locator(SELECTORS.DASHBOARD.WELCOME_MESSAGE)).toBeVisible(); // Assuming a welcome message
  }

  /**
   * Verifies if the current URL is the dashboard URL.
   */
  async verifyDashboardUrl(): Promise<void> {
    await this.verifyUrl('/dashboard'); // Assuming '/dashboard' is the path for the dashboard
  }
}

```

```typescript
// src/pages/customer/ForgotPasswordPage.ts
// This page object is created to support TC005, verifying navigation.

import { Page, expect } from '@playwright/test';
import BasePage from '../common/BasePage';
import { SELECTORS } from '../../constants/selectors';

/**
 * ForgotPasswordPage represents the Forgot Password page and contains methods
 * to interact with elements specific to this page.
 */
export default class ForgotPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verifies if the Forgot Password page is displayed by checking for its title.
   */
  async isForgotPasswordPageDisplayed(): Promise<void> {
    await expect(this.page.locator(SELECTORS.FORGOT_PASSWORD.PAGE_TITLE)).toHaveText('Forgot Password');
    await expect(this.page.locator(SELECTORS.FORGOT_PASSWORD.EMAIL_INPUT)).toBeVisible();
    await expect(this.page.locator(SELECTORS.FORGOT_PASSWORD.SUBMIT_BUTTON)).toBeVisible();
  }

  /**
   * Verifies if the current URL is the forgot password URL.
   */
  async verifyForgotPasswordUrl(): Promise<void> {
    await this.verifyUrl('/forgot-password'); // Assuming '/forgot-password' is the path
  }
}

```

```typescript
// src/tests/e2e/customer/login.e2e.spec.ts

import { test, expect } from '@playwright/test';
import LoginPage from '../../../pages/customer/LoginPage';
import DashboardPage from '../../../pages/customer/DashboardPage';
import ForgotPasswordPage from '../../../pages/customer/ForgotPasswordPage';
import { ERROR_MESSAGES } from '../../../constants/errorMessages';
import validCredentials from '../../../test-data/customer/validCredentials.json';
import invalidCredentials from '../../../test-data/customer/invalidCredentials.json';

// Use a describe block to group tests related to customer login
test.describe('US-003 Customer Login Functionality', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let forgotPasswordPage: ForgotPasswordPage;

  // Before each test, initialize page objects and navigate to the login page
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    forgotPasswordPage = new ForgotPasswordPage(page);
    await loginPage.navigateToLoginPage();
  });

  test('TC001 - Should successfully log in with valid credentials', async () => {
    await test.step('Enter valid username and password', async () => {
      await loginPage.login(validCredentials.username, validCredentials.password);
    });

    await test.step('Verify user is redirected to Dashboard', async () => {
      await dashboardPage.verifyDashboardUrl();
      await dashboardPage.isDashboardVisible();
    });
  });

  test('TC002 - Should display an error message with invalid credentials', async () => {
    await test.step('Enter invalid username and password', async () => {
      await loginPage.login(invalidCredentials.username, invalidCredentials.password);
    });

    await test.step('Verify error message is displayed and user remains on login page', async () => {
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain(ERROR_MESSAGES.LOGIN.INVALID_CREDENTIALS);
      await loginPage.isLoginPageDisplayed(); // Ensure still on login page
    });
  });

  test('TC003 - Should display validation message for blank username', async () => {
    await test.step('Leave username blank and enter a password', async () => {
      await loginPage.login('', 'anypassword');
    });

    await test.step('Verify username validation message is displayed', async () => {
      const validationMessage = await loginPage.getUsernameValidationMessage();
      expect(validationMessage).toContain(ERROR_MESSAGES.LOGIN.USERNAME_REQUIRED);
      await loginPage.isLoginPageDisplayed(); // Ensure still on login page
    });
  });

  test('TC004 - Should display validation message for blank password', async () => {
    await test.step('Enter a username and leave password blank', async () => {
      await loginPage.login('test@example.com', '');
    });

    await test.step('Verify password validation message is displayed', async () => {
      const validationMessage = await loginPage.getPasswordValidationMessage();
      expect(validationMessage).toContain(ERROR_MESSAGES.LOGIN.PASSWORD_REQUIRED);
      await loginPage.isLoginPageDisplayed(); // Ensure still on login page
    });
  });

  test('TC005 - Should navigate to Forgot Password page', async () => {
    await test.step('Click the "Forgot Password" link', async () => {
      await loginPage.clickForgotPassword();
    });

    await test.step('Verify "Forgot Password" page opens', async () => {
      await forgotPasswordPage.verifyForgotPasswordUrl();
      await forgotPasswordPage.isForgotPasswordPageDisplayed();
    });
  });
});
```