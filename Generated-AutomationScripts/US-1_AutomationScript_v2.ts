```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv'; // Import dotenv
import path from 'path';

// Read from .env file for local development or CI/CD environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Path to your test files, relative to the project root
  testDir: './tests',
  // Output directory for test results (reports, screenshots, videos)
  outputDir: './reports',
  
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
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Default if not in .env

    /* Collect trace when retrying the first time. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video recording on first retry */
    video: 'on-first-retry',
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
});
```
```typescript
// src/constants/app.constants.ts

/**
 * Application-wide constants including URLs, titles, and default timeouts.
 * These values can be overridden by environment variables or specific test configurations.
 */
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Page titles and texts for assertions
export const LOGIN_PAGE_TITLE = 'Login to Sales App';
export const DASHBOARD_PAGE_TITLE = 'Sales Dashboard';
export const DASHBOARD_WELCOME_TEXT = 'Welcome, Salesman!';
export const LOGIN_ERROR_MESSAGE = 'Invalid username or password';
export const USERNAME_REQUIRED_ERROR = 'Username is required';
export const PASSWORD_REQUIRED_ERROR = 'Password is required';

// Locators for common elements (can be defined here or within Page Objects)
export const COMMON_ELEMENT_TIMEOUT = 10 * 1000; // 10 seconds

// API endpoints (if any API tests were to be included later)
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
export const LOGIN_API_ENDPOINT = `${API_BASE_URL}/auth/login`;
export const CREATE_ORDER_API_ENDPOINT = `${API_BASE_URL}/orders`;
```
```typescript
// src/types/user.types.ts

/**
 * Defines the structure for user credentials used in tests.
 */
export interface UserCredentials {
  username: string;
  password: string;
  role: 'salesman' | 'admin' | 'customer' | 'invalid'; // Example roles
}
```
```json
// test-data/users.json
[
  {
    "username": "salesman1",
    "password": "Password123",
    "role": "salesman"
  },
  {
    "username": "salesman2",
    "password": "Password456",
    "role": "salesman"
  },
  {
    "username": "admin1",
    "password": "AdminPassword",
    "role": "admin"
  },
  {
    "username": "invaliduser",
    "password": "WrongPassword",
    "role": "invalid"
  }
]
```
```typescript
// src/pages/authentication/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BASE_URL, LOGIN_PAGE_TITLE, LOGIN_ERROR_MESSAGE, USERNAME_REQUIRED_ERROR, PASSWORD_REQUIRED_ERROR } from '../../constants/app.constants';

/**
 * Represents the Login Page of the application.
 * Provides methods to interact with login elements and verify login page state.
 */
export default class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator; // Generic error message for invalid credentials
  private readonly usernameErrorMessage: Locator; // Specific error for username validation
  private readonly passwordErrorMessage: Locator; // Specific error for password validation

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message-banner'); // Adjust selector as per your app
    this.usernameErrorMessage = page.locator('#username-error'); // Adjust selector as per your app
    this.passwordErrorMessage = page.locator('#password-error'); // Adjust selector as per your app
  }

  /**
   * Navigates to the login page.
   */
  async navigate(): Promise<void> {
    await this.page.goto(BASE_URL);
    await expect(this.page).toHaveTitle(LOGIN_PAGE_TITLE);
  }

  /**
   * Performs a login attempt with the given username and password.
   * @param username The username to enter.
   * @param password The password to enter.
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Verifies that the login page is currently displayed.
   * Asserts the page title and visibility of key login elements.
   */
  async verifyLoginPageDisplayed(): Promise<void> {
    await expect(this.page).toHaveTitle(LOGIN_PAGE_TITLE);
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Retrieves the text of the generic error message displayed on the login page.
   * @returns A promise that resolves to the error message text.
   */
  async getErrorMessageText(): Promise<string | null> {
    await expect(this.errorMessage).toBeVisible();
    return this.errorMessage.textContent();
  }

  /**
   * Verifies that the generic error message for invalid credentials is displayed.
   */
  async verifyInvalidCredentialsError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(LOGIN_ERROR_MESSAGE);
  }

  /**
   * Verifies that the username required error message is displayed.
   */
  async verifyUsernameRequiredError(): Promise<void> {
    await expect(this.usernameErrorMessage).toBeVisible();
    await expect(this.usernameErrorMessage).toHaveText(USERNAME_REQUIRED_ERROR);
  }

  /**
   * Verifies that the password required error message is displayed.
   */
  async verifyPasswordRequiredError(): Promise<void> {
    await expect(this.passwordErrorMessage).toBeVisible();
    await expect(this.passwordErrorMessage).toHaveText(PASSWORD_REQUIRED_ERROR);
  }
}
```
```typescript
// src/pages/dashboard/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { DASHBOARD_PAGE_TITLE, DASHBOARD_WELCOME_TEXT } from '../../constants/app.constants';

/**
 * Represents the Dashboard Page of the application.
 * This page is displayed after a successful login.
 * Provides methods to interact with dashboard elements and verify its state.
 */
export default class DashboardPage {
  private readonly page: Page;
  private readonly welcomeMessage: Locator;
  private readonly createOrderButton: Locator;
  private readonly logoutButton: Locator; // Assuming a logout button exists

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('.welcome-message'); // Adjust selector as per your app
    this.createOrderButton = page.locator('button:has-text("Create Order")'); // Adjust selector
    this.logoutButton = page.locator('button:has-text("Logout")'); // Adjust selector
  }

  /**
   * Verifies that the dashboard page is currently displayed.
   * Asserts the page title and visibility of key dashboard elements.
   */
  async verifyDashboardDisplayed(): Promise<void> {
    await expect(this.page).toHaveTitle(DASHBOARD_PAGE_TITLE);
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.welcomeMessage).toHaveText(DASHBOARD_WELCOME_TEXT);
    await expect(this.createOrderButton).toBeVisible();
    await expect(this.logoutButton).toBeVisible(); // Ensure logout is available
  }

  /**
   * Clicks the 'Create Order' button on the dashboard.
   */
  async clickCreateOrderButton(): Promise<void> {
    await this.createOrderButton.click();
  }

  /**
   * Retrieves the welcome message text from the dashboard.
   * @returns A promise that resolves to the welcome message text.
   */
  async getWelcomeMessageText(): Promise<string | null> {
    return this.welcomeMessage.textContent();
  }
}
```
```typescript
// tests/authentication/login.spec.ts
import { test, expect } from '@playwright/test';
import LoginPage from '../../src/pages/authentication/LoginPage';
import DashboardPage from '../../src/pages/dashboard/DashboardPage';
import { BASE_URL, LOGIN_PAGE_TITLE, DASHBOARD_PAGE_TITLE, LOGIN_ERROR_MESSAGE, USERNAME_REQUIRED_ERROR, PASSWORD_REQUIRED_ERROR } from '../../src/constants/app.constants';
import * as userData from '../../test-data/users.json';
import { UserCredentials } from '../../src/types/user.types';

test.describe('Salesman Login Functionality', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  const salesman: UserCredentials = userData.find(user => user.role === 'salesman')!;
  const invalidUser: UserCredentials = userData.find(user => user.role === 'invalid')!;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('TC001_Verify_LoginPage_Opens_Successfully - Login page should open', async ({ page }) => {
    // Acceptance Criteria 1: Login page should open.
    // Precondition: `loginPage.navigate()` in beforeEach ensures navigation.
    
    // Verify that the URL is the base URL
    await expect(page).toHaveURL(BASE_URL);
    // Verify the page title
    await expect(page).toHaveTitle(LOGIN_PAGE_TITLE);
    // Verify key login elements are visible
    await loginPage.verifyLoginPageDisplayed();
  });

  test('TC002_Successful_Login_with_Valid_Salesman_Credentials - Valid username/password should login successfully', async ({ page }) => {
    // Acceptance Criteria 2: Valid username/password should login successfully.
    // Acceptance Criteria 3: Dashboard should be displayed.

    // Perform login with valid salesman credentials
    await loginPage.login(salesman.username, salesman.password);

    // Expect successful navigation to the dashboard
    await expect(page).not.toHaveURL(BASE_URL); // Should be redirected away from login page
    await expect(page).toHaveTitle(DASHBOARD_PAGE_TITLE); // Verify dashboard title

    // Verify dashboard elements are displayed, indicating successful login
    await dashboardPage.verifyDashboardDisplayed();
    const welcomeText = await dashboardPage.getWelcomeMessageText();
    expect(welcomeText).toContain('Welcome, Salesman!'); // Specific welcome message
  });

  test('TC003_Failed_Login_with_Invalid_Credentials - Should show error for invalid username/password', async ({ page }) => {
    // Acceptance Criteria: Login fails with invalid credentials.

    // Attempt login with invalid credentials
    await loginPage.login(invalidUser.username, invalidUser.password);

    // Expect to remain on the login page
    await expect(page).toHaveURL(BASE_URL);
    await expect(page).toHaveTitle(LOGIN_PAGE_TITLE);

    // Verify an error message is displayed
    await loginPage.verifyInvalidCredentialsError();
    const errorMessageText = await loginPage.getErrorMessageText();
    expect(errorMessageText).toBe(LOGIN_ERROR_MESSAGE); // Check specific error text
  });

  test('TC004_Failed_Login_with_Empty_Username - Should show error when username is empty', async ({ page }) => {
    // Acceptance Criteria: Login fails if username is empty.

    // Attempt login with empty username and valid password
    await loginPage.login('', salesman.password);

    // Expect to remain on the login page
    await expect(page).toHaveURL(BASE_URL);
    await expect(page).toHaveTitle(LOGIN_PAGE_TITLE);

    // Verify an error message for username is displayed (field specific or generic)
    // This depends on whether the application validates empty fields client-side or server-side.
    // Assuming client-side validation for this example.
    await loginPage.verifyUsernameRequiredError();
  });

  test('TC005_Failed_Login_with_Empty_Password - Should show error when password is empty', async ({ page }) => {
    // Acceptance Criteria: Login fails if password is empty.

    // Attempt login with valid username and empty password
    await loginPage.login(salesman.username, '');

    // Expect to remain on the login page
    await expect(page).toHaveURL(BASE_URL);
    await expect(page).toHaveTitle(LOGIN_PAGE_TITLE);

    // Verify an error message for password is displayed (field specific or generic)
    // Assuming client-side validation for this example.
    await loginPage.verifyPasswordRequiredError();
  });
});
```
```bash
# .env
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api
# Add any other sensitive or environment-specific variables here
# For example, if you had different URLs for QA, Staging, etc.
# QA_BASE_URL=https://qa.myapp.com
```