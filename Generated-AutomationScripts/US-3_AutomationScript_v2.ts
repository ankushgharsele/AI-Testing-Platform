```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config({ path: path.resolve(__dirname, 'config', 'environments', 'dev.config.ts') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
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
    ['html', { open: 'never' }], // HTML reporter for local debugging
    ['list'], // Console list reporter
    ['allure-playwright', { outputFolder: 'reports/allure-results' }] // Allure reporter for detailed reports
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Default to a local URL if not set
    /* Collect a screenshot for each test failure. */
    screenshot: 'only-on-failure',
    /* Record video for each test. */
    video: 'on-first-retry',
    /* Trace New Step for each test. See https://playwright.dev/docs/trace-viewer */
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
// src/config/environments/dev.config.ts
// This file is loaded by dotenv in playwright.config.ts
// for local development environment variables.

// Example:
// process.env.BASE_URL = 'http://localhost:3000';
// process.env.API_URL = 'http://localhost:8080/api';

// For this specific test, we'll ensure BASE_URL is set,
// though it can also be provided directly in playwright.config.ts or via command line.
// If you run `npx playwright test --project=chromium --headed --base-url="http://example.com"`,
// the command line argument will override this.
```

```typescript
// src/constants/selectors.ts

/**
 * Defines a collection of Playwright selectors for various elements
 * across the application, organized by page or module.
 * Using data-test-id is a recommended practice for robust test automation.
 */
export const selectors = {
  // Login Page Selectors
  login: {
    emailInput: '[data-test-id="email-input"]',
    passwordInput: '[data-test-id="password-input"]',
    loginButton: '[data-test-id="login-button"]',
    errorMessage: '[data-test-id="error-message"]',
    emailValidationError: '[data-test-id="email-error"]',
    passwordValidationError: '[data-test-id="password-error"]',
    forgotPasswordLink: '[data-test-id="forgot-password-link"]',
  },
  // Dashboard Page Selectors
  dashboard: {
    dashboardHeader: '[data-test-id="dashboard-header"]', // Example: "Welcome to your Dashboard"
  },
  // Forgot Password Page Selectors
  forgotPassword: {
    pageTitle: '[data-test-id="forgot-password-title"]', // Example: "Forgot Your Password?"
    emailInput: '[data-test-id="forgot-email-input"]',
    submitButton: '[data-test-id="forgot-password-submit-button"]',
  },
};
```

```typescript
// src/constants/errorMessages.ts

/**
 * Defines a collection of expected error messages and validation texts
 * used throughout the application for assertions in tests.
 */
export const errorMessages = {
  // Login Page Error Messages
  login: {
    invalidCredentials: 'Invalid email or password. Please try again.',
    emailRequired: 'Email is required.',
    passwordRequired: 'Password is required.',
  },
  // Forgot Password Page Error Messages (if any)
  forgotPassword: {
    emailInvalid: 'Please enter a valid email address.',
  },
  // Generic / API error messages (if applicable)
  generic: {
    somethingWentWrong: 'Something went wrong. Please try again later.',
  }
};
```

```json
// test-data/customer/validCredentials.json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

```json
// test-data/customer/invalidCredentials.json
{
  "email": "invalid@example.com",
  "password": "WrongPassword"
}
```

```typescript
// src/pages/common/BasePage.ts
import { Page, BrowserContext } from '@playwright/test';

/**
 * BasePage class provides common functionalities and properties
 * that can be inherited by all other Page Object Model classes.
 * This helps in reducing code duplication and centralizing common actions.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly baseURL: string;

  /**
   * Initializes a new instance of the BasePage.
   * @param page The Playwright Page object.
   * @param baseURL The base URL of the application, typically from the Playwright config.
   */
  constructor(page: Page, baseURL: string) {
    this.page = page;
    this.context = page.context();
    this.baseURL = baseURL;
  }

  /**
   * Navigates the browser to a specific URL relative to the baseURL.
   * @param path The path to append to the base URL.
   */
  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`);
  }

  /**
   * Waits for a network request with a specific URL to finish.
   * Useful for ensuring data is loaded after an action.
   * @param urlSubstring A substring of the URL to wait for.
   */
  async waitForNetworkIdle(urlSubstring: string = ''): Promise<void> {
    await this.page.waitForResponse(response =>
      response.url().includes(urlSubstring) && response.status() === 200
    );
  }

  /**
   * Abstract method to check if the page is loaded.
   * Each concrete page object must implement this to define
   * what makes the page "loaded" (e.g., specific element visible).
   */
  abstract isLoaded(): Promise<void>;
}
```

```typescript
// src/pages/customer/LoginPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { selectors } from '../../constants/selectors';
import { errorMessages } from '../../constants/errorMessages';

/**
 * Represents the Customer Login Page of the application.
 * Implements Page Object Model for interacting with login elements.
 */
export class LoginPage extends BasePage {
  constructor(page: Page, baseURL: string) {
    super(page, baseURL);
  }

  /**
   * Navigates to the login page.
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigate('/login'); // Assuming '/login' is the path to the login page
    await this.isLoaded();
  }

  /**
   * Checks if the login page is loaded by asserting the visibility of the email input.
   */
  async isLoaded(): Promise<void> {
    await expect(this.page.locator(selectors.login.emailInput)).toBeVisible();
    await expect(this.page.locator(selectors.login.passwordInput)).toBeVisible();
    await expect(this.page.locator(selectors.login.loginButton)).toBeVisible();
  }

  /**
   * Enters the provided email into the username field.
   * @param email The email to enter.
   */
  async enterEmail(email: string): Promise<void> {
    await this.page.locator(selectors.login.emailInput).fill(email);
  }

  /**
   * Enters the provided password into the password field.
   * @param password The password to enter.
   */
  async enterPassword(password: string): Promise<void> {
    await this.page.locator(selectors.login.passwordInput).fill(password);
  }

  /**
   * Clicks the login button.
   */
  async clickLoginButton(): Promise<void> {
    await this.page.locator(selectors.login.loginButton).click();
  }

  /**
   * Performs the login operation.
   * @param email The customer's email.
   * @param password The customer's password.
   */
  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Retrieves the main error message displayed on the login page.
   * @returns The text content of the error message.
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.page.locator(selectors.login.errorMessage).textContent();
  }

  /**
   * Clicks the 'Forgot Password' link.
   */
  async clickForgotPasswordLink(): Promise<void> {
    await this.page.locator(selectors.login.forgotPasswordLink).click();
  }

  /**
   * Asserts that the invalid credentials error message is displayed.
   */
  async verifyInvalidCredentialsErrorMessage(): Promise<void> {
    const errorLocator = this.page.locator(selectors.login.errorMessage);
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toHaveText(errorMessages.login.invalidCredentials);
  }

  /**
   * Asserts that the email required validation message is displayed.
   */
  async verifyEmailRequiredValidationMessage(): Promise<void> {
    const emailErrorLocator = this.page.locator(selectors.login.emailValidationError);
    await expect(emailErrorLocator).toBeVisible();
    await expect(emailErrorLocator).toHaveText(errorMessages.login.emailRequired);
  }

  /**
   * Asserts that the password required validation message is displayed.
   */
  async verifyPasswordRequiredValidationMessage(): Promise<void> {
    const passwordErrorLocator = this.page.locator(selectors.login.passwordValidationError);
    await expect(passwordErrorLocator).toBeVisible();
    await expect(passwordErrorLocator).toHaveText(errorMessages.login.passwordRequired);
  }

  /**
   * Asserts that the 'Forgot Password' link is visible.
   */
  async verifyForgotPasswordLinkIsVisible(): Promise<void> {
    await expect(this.page.locator(selectors.login.forgotPasswordLink)).toBeVisible();
  }
}
```

```typescript
// src/pages/customer/DashboardPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { selectors } from '../../constants/selectors';

/**
 * Represents the Customer Dashboard Page of the application.
 * Implements Page Object Model for verifying successful login.
 */
export class DashboardPage extends BasePage {
  constructor(page: Page, baseURL: string) {
    super(page, baseURL);
  }

  /**
   * Checks if the Dashboard page is loaded by asserting the visibility
   * and content of the dashboard header.
   */
  async isLoaded(): Promise<void> {
    const dashboardHeaderLocator = this.page.locator(selectors.dashboard.dashboardHeader);
    await expect(dashboardHeaderLocator).toBeVisible();
    // Assuming the header text indicates a successful login to the dashboard.
    // Adjust the text content based on your application's actual UI.
    await expect(dashboardHeaderLocator).toHaveText(/Welcome to your Dashboard|Dashboard/);
  }

  /**
   * Verifies that the user is currently on the dashboard page.
   * This can be used as a general assertion for successful login redirection.
   */
  async verifyDashboardUrl(): Promise<void> {
    // Assuming the dashboard URL path is '/dashboard'
    await expect(this.page).toHaveURL(`${this.baseURL}/dashboard`);
  }
}
```

```typescript
// src/pages/customer/ForgotPasswordPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { selectors } from '../../constants/selectors';

/**
 * Represents the Forgot Password Page of the application.
 * Implements Page Object Model for interacting with forgot password elements.
 */
export class ForgotPasswordPage extends BasePage {
  constructor(page: Page, baseURL: string) {
    super(page, baseURL);
  }

  /**
   * Checks if the Forgot Password page is loaded by asserting the visibility
   * and content of the page title.
   */
  async isLoaded(): Promise<void> {
    const pageTitleLocator = this.page.locator(selectors.forgotPassword.pageTitle);
    await expect(pageTitleLocator).toBeVisible();
    // Assuming the title text indicates the Forgot Password page.
    await expect(pageTitleLocator).toHaveText(/Forgot Your Password\?|Reset Password/);
  }

  /**
   * Verifies that the user is currently on the forgot password page.
   */
  async verifyForgotPasswordUrl(): Promise<void> {
    // Assuming the forgot password URL path is '/forgot-password'
    await expect(this.page).toHaveURL(`${this.baseURL}/forgot-password`);
  }

  /**
   * Enters the provided email into the email field on the forgot password page.
   * @param email The email to enter.
   */
  async enterEmail(email: string): Promise<void> {
    await this.page.locator(selectors.forgotPassword.emailInput).fill(email);
  }

  /**
   * Clicks the submit button on the forgot password page.
   */
  async clickSubmitButton(): Promise<void> {
    await this.page.locator(selectors.forgotPassword.submitButton).click();
  }
}
```

```typescript
// src/tests/e2e/customer/login.e2e.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/customer/LoginPage';
import { DashboardPage } from '../../../pages/customer/DashboardPage';
import { ForgotPasswordPage } from '../../../pages/customer/ForgotPasswordPage';
import validCredentials from '../../../../test-data/customer/validCredentials.json';
import invalidCredentials from '../../../../test-data/customer/invalidCredentials.json';

test.describe('IyBVUy0wMDMgLS Customer Login Module E2E Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let forgotPasswordPage: ForgotPasswordPage;
  const baseURL = process.env.BASE_URL || 'http://localhost:3000'; // Ensure baseURL is consistently used

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page, baseURL);
    dashboardPage = new DashboardPage(page, baseURL);
    forgotPasswordPage = new ForgotPasswordPage(page, baseURL);
    await loginPage.navigateToLoginPage();
  });

  // TC001 - Login with Valid Credentials
  test('TC001 - Should successfully login with valid credentials and redirect to Dashboard', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC001' });
    test.info().annotations.push({ type: 'User Story', description: 'As a customer, I want to log in using my registered email and password, So that I can securely access my account.' });
    test.info().annotations.push({ type: 'Acceptance Criteria', description: '1. Customer should be able to login with valid credentials.' });
    test.info().annotations.push({ type: 'Acceptance Criteria', description: '5. User should be redirected to Dashboard after successful login.' });

    await test.step('Enter valid username', async () => {
      await loginPage.enterEmail(validCredentials.email);
    });
    await test.step('Enter valid password', async () => {
      await loginPage.enterPassword(validCredentials.password);
    });
    await test.step('Click Login button', async () => {
      await loginPage.clickLoginButton();
    });
    await test.step('Verify Dashboard is displayed', async () => {
      await dashboardPage.isLoaded();
      await dashboardPage.verifyDashboardUrl();
    });
    console.log(`Successfully logged in with user: ${validCredentials.email}`);
  });

  // TC002 - Login with Invalid Credentials
  test('TC002 - Should display error message for invalid credentials', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC002' });
    test.info().annotations.push({ type: 'User Story', description: 'As a customer, I want to log in using my registered email and password, So that I can securely access my account.' });
    test.info().annotations.push({ type: 'Acceptance Criteria', description: '2. Invalid username/password should show an error message.' });

    await test.step('Enter invalid username', async () => {
      await loginPage.enterEmail(invalidCredentials.email);
    });
    await test.step('Enter invalid password', async () => {
      await loginPage.enterPassword(invalidCredentials.password);
    });
    await test.step('Click Login button', async () => {
      await loginPage.clickLoginButton();
    });
    await test.step('Verify error message is displayed', async () => {
      await loginPage.verifyInvalidCredentialsErrorMessage();
    });
    console.log('Error message displayed for invalid credentials as expected.');
  });

  // TC003 - Blank Username
  test('TC003 - Should display validation message for blank email field', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC003' });
    test.info().annotations.push({ type: 'User Story', description: 'As a customer, I want to log in using my registered email and password, So that I can securely access my account.' });
    test.info().annotations.push({ type: 'Acceptance Criteria', description: '3. Username and Password fields are mandatory.' });

    await test.step('Leave username blank', async () => {
      await loginPage.enterEmail(''); // Intentionally leave blank
    });
    await test.step('Enter a password', async () => {
      await loginPage.enterPassword(validCredentials.password);
    });
    await test.step('Click Login button', async () => {
      await loginPage.clickLoginButton();
    });
    await test.step('Verify email required validation message is displayed', async () => {
      await loginPage.verifyEmailRequiredValidationMessage();
    });
    console.log('Validation message displayed for blank email field as expected.');
  });

  // TC004 - Blank Password
  test('TC004 - Should display validation message for blank password field', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC004' });
    test.info().annotations.push({ type: 'User Story', description: 'As a customer, I want to log in using my registered email and password, So that I can securely access my account.' });
    test.info().annotations.push({ type: 'Acceptance Criteria', description: '3. Username and Password fields are mandatory.' });

    await test.step('Enter a username', async () => {
      await loginPage.enterEmail(validCredentials.email);
    });
    await test.step('Leave password blank', async () => {
      await loginPage.enterPassword(''); // Intentionally leave blank
    });
    await test.step('Click Login button', async () => {
      await loginPage.clickLoginButton();
    });
    await test.step('Verify password required validation message is displayed', async () => {
      await loginPage.verifyPasswordRequiredValidationMessage();
    });
    console.log('Validation message displayed for blank password field as expected.');
  });

  // TC005 - Forgot Password
  test('TC005 - Should navigate to Forgot Password page', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC005' });
    test.info().annotations.push({ type: 'User Story', description: 'As a customer, I want to log in using my registered email and password, So that I can securely access my account.' });
    test.info().annotations.push({ type: 'Acceptance Criteria', description: '4. Forgot Password link should be available.' });

    await test.step('Verify Forgot Password link is available', async () => {
      await loginPage.verifyForgotPasswordLinkIsVisible();
    });
    await test.step('Click Forgot Password link', async () => {
      await loginPage.clickForgotPasswordLink();
    });
    await test.step('Verify Forgot Password page opens', async () => {
      await forgotPasswordPage.isLoaded();
      await forgotPasswordPage.verifyForgotPasswordUrl();
    });
    console.log('Successfully navigated to Forgot Password page.');
  });
});
```