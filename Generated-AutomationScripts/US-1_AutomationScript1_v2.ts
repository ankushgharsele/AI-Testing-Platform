```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { AppConstants } from './src/constants/app.constants';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: AppConstants.BASE_URL,

    /* Collect traces for all tests, but retry only on first failure. */
    trace: 'on-first-retry',
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

```

```typescript
// src/constants/app.constants.ts
export const AppConstants = {
    // Base URL for the application under test
    BASE_URL: 'https://www.saucedemo.com/',

    // Specific page titles
    LOGIN_PAGE_TITLE: 'Swag Labs',
    DASHBOARD_PAGE_TITLE: 'Swag Labs', // Assuming dashboard also uses this title or a specific header
    
    // URL parts for different sections of the application
    INVENTORY_PAGE_URL_PART: '/inventory.html', // Expected URL part after successful login to dashboard

    // Timeout values in milliseconds
    DEFAULT_TIMEOUT: 10000,
    LONG_TIMEOUT: 30000,

    // User roles (if applicable, can be expanded)
    ROLES: {
        SALESMAN: 'Salesman',
        ADMIN: 'Admin',
    },

    // Default credentials for valid users (for test purposes)
    // In a real enterprise application, these would come from environment variables or a secure vault.
    VALID_SALESMAN_USERNAME: 'standard_user',
    VALID_SALESMAN_PASSWORD: 'secret_sauce',
};

```

```typescript
// src/pages/authentication/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { AppConstants } from '../../constants/app.constants';

/**
 * Represents the Login Page of the application.
 * Implements the Page Object Model (POM) pattern for UI interactions.
 */
export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly appLogo: Locator;

  /**
   * Initializes a new instance of the LoginPage class.
   * @param page The Playwright Page object to interact with.
   */
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.appLogo = page.locator('.app_logo');
  }

  /**
   * Navigates to the application's login page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Enters the provided username into the username field.
   * @param username The username to enter.
   */
  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Enters the provided password into the password field.
   * @param password The password to enter.
   */
  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the login button.
   */
  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Performs a complete login action with the given credentials.
   * @param username The username for login.
   * @param password The password for login.
   */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Verifies that the login page is currently displayed.
   * This includes checking for the page title and key UI elements.
   */
  async verifyLoginPageIsDisplayed(): Promise<void> {
    await expect(this.page).toHaveTitle(AppConstants.LOGIN_PAGE_TITLE);
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.appLogo).toBeVisible();
    console.log(`Verified: Login page titled "${AppConstants.LOGIN_PAGE_TITLE}" is displayed.`);
  }

  /**
   * Returns the current title of the page.
   * @returns The page title.
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Verifies that an error message is displayed and contains the expected text.
   * @param expectedErrorMessage The expected text content of the error message.
   */
  async verifyErrorMessage(expectedErrorMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedErrorMessage);
    console.log(`Verified: Error message "${expectedErrorMessage}" is displayed.`);
  }
}

```

```json
// test-data/salesman-login-data.json
{
  "validSalesman": {
    "username": "standard_user",
    "password": "secret_sauce"
  },
  "invalidSalesman": {
    "username": "locked_out_user",
    "password": "secret_sauce"
  },
  "invalidCredentials": {
    "username": "wrong_user",
    "password": "wrong_password"
  }
}

```

```typescript
// tests/authentication/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/authentication/LoginPage';
import { AppConstants } from '../../src/constants/app.constants';
import * as salesmanLoginData from '../../test-data/salesman-login-data.json'; // Import test data

/**
 * Test suite for Salesman Login Functionality.
 * This suite covers the acceptance criteria for a salesman logging into the application.
 */
test.describe('Salesman Login Functionality', () => {
  let loginPage: LoginPage;

  // Before each test, initialize the LoginPage object and navigate to the login page.
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    console.log(`Navigated to: ${page.url()}`);
  });

  /**
   * Test Case 1: Verify Login Page Opens Successfully
   * Acceptance Criteria: 1. Login page should open.
   */
  test('should open the login page successfully', async () => {
    // Assert that the login page elements are visible and the title is correct.
    await loginPage.verifyLoginPageIsDisplayed();
    console.log('Test PASSED: Login page opened successfully.');
  });

  /**
   * Test Case 2: Successful Login with Valid Salesman Credentials
   * Acceptance Criteria: 2. Valid username/password should login successfully.
   * Acceptance Criteria: 3. Dashboard should be displayed.
   */
  test('should allow a salesman to login with valid credentials and navigate to the dashboard', async ({ page }) => {
    const { username, password } = salesmanLoginData.validSalesman;

    console.log(`Attempting to login with username: ${username}`);
    // Perform login using valid credentials
    await loginPage.login(username, password);

    // Verify successful redirection to the dashboard page
    await expect(page).toHaveURL(AppConstants.BASE_URL + AppConstants.INVENTORY_PAGE_URL_PART, { timeout: AppConstants.DEFAULT_TIMEOUT });
    await expect(page).toHaveTitle(AppConstants.DASHBOARD_PAGE_TITLE, { timeout: AppConstants.DEFAULT_TIMEOUT });
    await expect(page.locator('.app_logo')).toBeVisible(); // A common element on Swag Labs dashboard
    await expect(page.locator('.title')).toHaveText('Products'); // Specific dashboard title for Swag Labs

    console.log('Test PASSED: Salesman logged in successfully and dashboard is displayed.');
  });

  /**
   * Test Case 3: Login with Invalid Credentials (Negative Test)
   * This scenario validates that the application handles incorrect credentials gracefully.
   */
  test('should not allow login with invalid credentials and display an error message', async ({ page }) => {
    const { username, password } = salesmanLoginData.invalidCredentials;
    const expectedErrorMessage = 'Epic sadface: Username and password do not match any user in this service';

    console.log(`Attempting to login with invalid username: ${username}`);
    // Attempt to login with invalid credentials
    await loginPage.login(username, password);

    // Verify that an error message is displayed
    await loginPage.verifyErrorMessage(expectedErrorMessage);
    
    // Verify that the user remains on the login page
    await expect(page).toHaveURL(AppConstants.BASE_URL);
    await expect(page).toHaveTitle(AppConstants.LOGIN_PAGE_TITLE);

    console.log('Test PASSED: Login failed with invalid credentials as expected, and error message displayed.');
  });

  /**
   * Test Case 4: Login with Locked Out User (Negative Test)
   * This scenario validates that a locked-out user cannot log in.
   */
  test('should display a specific error message for a locked out user', async ({ page }) => {
    const { username, password } = salesmanLoginData.invalidSalesman; // Using 'invalidSalesman' for locked_out_user
    const expectedErrorMessage = 'Epic sadface: Sorry, this user has been locked out.';

    console.log(`Attempting to login with locked-out username: ${username}`);
    // Attempt to login with locked-out user credentials
    await loginPage.login(username, password);

    // Verify that the locked-out error message is displayed
    await loginPage.verifyErrorMessage(expectedErrorMessage);

    // Verify that the user remains on the login page
    await expect(page).toHaveURL(AppConstants.BASE_URL);
    await expect(page).toHaveTitle(AppConstants.LOGIN_PAGE_TITLE);

    console.log('Test PASSED: Login failed for locked out user as expected, and specific error message displayed.');
  });
});
```