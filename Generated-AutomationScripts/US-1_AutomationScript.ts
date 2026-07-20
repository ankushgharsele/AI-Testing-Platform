```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './src/constants/app.constants';

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
    baseURL: BASE_URL,

    /* Collect traces on failure. See https://playwright.dev/docs/trace-viewer */
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
/**
 * @fileoverview Application-wide constants including URLs, paths, and titles.
 */

// Base URL for the application under test.
// In a real scenario, this would likely be set via environment variables.
export const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// Specific paths for key application pages.
export const LOGIN_PATH = '/login';
export const DASHBOARD_PATH = '/dashboard';

// Expected titles for key application pages.
export const LOGIN_PAGE_TITLE = 'Login to Sales Portal';
export const DASHBOARD_PAGE_TITLE = 'Sales Dashboard';

// Timeout values for various operations (in milliseconds).
export const DEFAULT_TIMEOUT = 10000; // 10 seconds
export const LONG_TIMEOUT = 30000;    // 30 seconds
```

```typescript
// src/types/user.types.ts
/**
 * @fileoverview TypeScript type definitions for user-related data.
 */

/**
 * Interface representing user login credentials.
 */
export interface UserCredentials {
  username: string;
  password: string;
}

/**
 * Interface representing a generic user profile (can be extended).
 */
export interface UserProfile {
  id: string;
  username: string;
  role: string;
  email: string;
}
```

```typescript
// src/pages/authentication/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { LOGIN_PATH, LOGIN_PAGE_TITLE, DASHBOARD_PATH, DASHBOARD_PAGE_TITLE } from '../../constants/app.constants';
import { UserCredentials } from '../../types/user.types';

/**
 * Page Object Model for the Login Page.
 * Encapsulates the selectors and actions for the login functionality.
 */
export class LoginPage {
  private readonly page: Page;

  // Locators for login page elements
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly dashboardHeader: Locator; // A common element on the dashboard page

  /**
   * Initializes the LoginPage POM.
   * @param page Playwright Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username') || page.locator('#username');
    this.passwordInput = page.getByLabel('Password') || page.locator('#password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.error-message'); // Common class for error messages
    this.dashboardHeader = page.getByRole('heading', { name: 'Sales Dashboard' }); // Specific to Dashboard
  }

  /**
   * Navigates to the login page.
   * Asserts that the page title is correct.
   */
  async navigateTo(): Promise<void> {
    await this.page.goto(LOGIN_PATH);
    await expect(this.page).toHaveTitle(LOGIN_PAGE_TITLE);
  }

  /**
   * Enters username and password, then clicks the login button.
   * @param credentials UserCredentials object containing username and password.
   */
  async login(credentials: UserCredentials): Promise<void> {
    if (credentials.username) {
      await this.usernameInput.fill(credentials.username);
    }
    if (credentials.password) {
      await this.passwordInput.fill(credentials.password);
    }
    await this.loginButton.click();
  }

  /**
   * Asserts that the login page elements are visible.
   */
  async verifyLoginPageElements(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveTitle(LOGIN_PAGE_TITLE);
  }

  /**
   * Retrieves the text of the error message displayed on the page.
   * @returns The error message text.
   */
  async getErrorMessageText(): Promise<string | null> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return this.errorMessage.textContent();
  }

  /**
   * Asserts that the dashboard is displayed by checking its URL and a unique element.
   */
  async verifyDashboardIsDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/.*dashboard/); // Assumes dashboard path ends with /dashboard
    await expect(this.page).toHaveTitle(DASHBOARD_PAGE_TITLE);
    await expect(this.dashboardHeader).toBeVisible();
  }

  /**
   * Asserts that the login page is currently displayed.
   */
  async verifyLoginPageIsDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/.*login/);
    await expect(this.page).toHaveTitle(LOGIN_PAGE_TITLE);
    await expect(this.loginButton).toBeVisible(); // Ensure a key login element is still there
  }
}
```

```json
// test-data/salesman-login-data.json
{
  "validSalesman": {
    "username": "salesman1",
    "password": "Password123"
  },
  "invalidPasswordSalesman": {
    "username": "salesman1",
    "password": "WrongPassword"
  },
  "emptyUsernameSalesman": {
    "username": "",
    "password": "Password123"
  },
  "emptyPasswordSalesman": {
    "username": "salesman1",
    "password": ""
  },
  "nonExistentUser": {
    "username": "nonexistent",
    "password": "AnyPassword"
  },
  "expectedErrorMessages": {
    "invalidCredentials": "Invalid username or password.",
    "usernameRequired": "Username is required.",
    "passwordRequired": "Password is required."
  }
}
```

```typescript
// tests/authentication/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/authentication/LoginPage';
import loginData from '../../test-data/salesman-login-data.json';
import { LOGIN_PAGE_TITLE, DASHBOARD_PAGE_TITLE } from '../../src/constants/app.constants';

test.describe('Salesman Login Functionality', () => {
  let loginPage: LoginPage;

  // Before each test, initialize LoginPage and navigate to the login page.
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  // Acceptance Criteria 1: Login page should open.
  test('AC1_verifyLoginPageOpensSuccessfully', async () => {
    await test.step('Assert that the login page title is correct', async () => {
      await expect(loginPage.page).toHaveTitle(LOGIN_PAGE_TITLE);
    });
    await test.step('Assert that essential login page elements are visible', async () => {
      await loginPage.verifyLoginPageElements();
    });
  });

  // Acceptance Criteria 2 & 3: Valid username/password should login successfully, Dashboard should be displayed.
  test('AC2_AC3_successfulLoginWithValidCredentials', async () => {
    await test.step('Perform login with valid salesman credentials', async () => {
      await loginPage.login(loginData.validSalesman);
    });
    await test.step('Verify that the user is redirected to the dashboard page', async () => {
      await loginPage.verifyDashboardIsDisplayed();
      await expect(loginPage.page).toHaveTitle(DASHBOARD_PAGE_TITLE);
    });
  });

  test('TC_003_loginWithInvalidPassword', async () => {
    await test.step('Attempt to login with a valid username and an invalid password', async () => {
      await loginPage.login(loginData.invalidPasswordSalesman);
    });
    await test.step('Verify that an error message for invalid credentials is displayed', async () => {
      const errorMessage = await loginPage.getErrorMessageText();
      expect(errorMessage).toContain(loginData.expectedErrorMessages.invalidCredentials);
    });
    await test.step('Verify that the user remains on the login page', async () => {
      await loginPage.verifyLoginPageIsDisplayed();
    });
  });

  test('TC_004_loginWithEmptyUsername', async () => {
    await test.step('Attempt to login with an empty username and a valid password', async () => {
      await loginPage.login(loginData.emptyUsernameSalesman);
    });
    await test.step('Verify that an error message for empty username is displayed', async () => {
      // Depending on UI, this might be an inline message or a general error.
      // For this example, we assume an inline or general error.
      const errorMessage = await loginPage.getErrorMessageText();
      expect(errorMessage).toContain(loginData.expectedErrorMessages.usernameRequired);
    });
    await test.step('Verify that the user remains on the login page', async () => {
      await loginPage.verifyLoginPageIsDisplayed();
    });
  });

  test('TC_005_loginWithEmptyPassword', async () => {
    await test.step('Attempt to login with a valid username and an empty password', async () => {
      await loginPage.login(loginData.emptyPasswordSalesman);
    });
    await test.step('Verify that an error message for empty password is displayed', async () => {
      const errorMessage = await loginPage.getErrorMessageText();
      expect(errorMessage).toContain(loginData.expectedErrorMessages.passwordRequired);
    });
    await test.step('Verify that the user remains on the login page', async () => {
      await loginPage.verifyLoginPageIsDisplayed();
    });
  });

  test('TC_006_loginWithEmptyUsernameAndPassword', async () => {
    await test.step('Attempt to login with both username and password fields empty', async () => {
      // Passing empty strings for both, LoginPage handles the conditional fill
      await loginPage.login({ username: '', password: '' });
    });
    await test.step('Verify that error messages for both empty username and password are displayed', async () => {
      // Assuming a single consolidated error or multiple inline errors.
      // For this example, we check if both error messages are contained within the general error text.
      const errorMessage = await loginPage.getErrorMessageText();
      expect(errorMessage).toContain(loginData.expectedErrorMessages.usernameRequired);
      expect(errorMessage).toContain(loginData.expectedErrorMessages.passwordRequired);
    });
    await test.step('Verify that the user remains on the login page', async () => {
      await loginPage.verifyLoginPageIsDisplayed();
    });
  });
});
```