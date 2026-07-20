```typescript
import { test, expect, Page } from '@playwright/test';

// --- Assumed Page Object Selectors (for enterprise clarity without generating actual PO files) ---
const LoginSelectors = {
  usernameInput: '[data-test-id="username-input"]',
  passwordInput: '[data-test-id="password-input"]',
  loginButton: '[data-test-id="login-button"]',
  errorMessage: '[data-test-id="login-error-message"]',
  dashboardTitle: '[data-test-id="dashboard-header"]',
};

// --- Assumed Test Data (for enterprise clarity) ---
const TestData = {
  validUsername: 'salesman@example.com',
  validPassword: 'Password123!',
  invalidUsername: 'invalid@example.com',
  invalidPassword: 'WrongPassword!',
  loginPageUrl: '/login', // Assumes baseURL is configured in playwright.config.ts
  dashboardPageUrl: '/dashboard',
  usernameRequiredError: 'Username is required.',
  passwordRequiredError: 'Password is required.',
  invalidCredentialsError: 'Invalid username or password.',
};

// --- Reusable Methods (Helper function for common login actions) ---
async function performLogin(page: Page, username?: string, password?: string) {
  if (username) {
    await page.fill(LoginSelectors.usernameInput, username);
  }
  if (password) {
    await page.fill(LoginSelectors.passwordInput, password);
  }
  await page.click(LoginSelectors.loginButton);
}

// --- Test Suite for Salesman Login (US-001) ---
test.describe('US-001 - Salesman Login Functionality', () => {

  // --- Hooks ---
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto(TestData.loginPageUrl);
    await expect(page).toHaveURL(/.*login/); // Ensure we are on the login page
    await expect(page.locator(LoginSelectors.usernameInput)).toBeVisible();
    await expect(page.locator(LoginSelectors.passwordInput)).toBeVisible();
    await expect(page.locator(LoginSelectors.loginButton)).toBeVisible();
  });

  // --- Positive Scenarios ---

  test('US-001-TC-001 | @smoke @regression @positive | Verify Login Page Opens Correctly', async ({ page }) => {
    await test.step('1. Assert current URL is the login page', async () => {
      await expect(page).toHaveURL(/.*login/);
    });

    await test.step('2. Assert username input field is visible', async () => {
      await expect(page.locator(LoginSelectors.usernameInput)).toBeVisible();
      await expect(page.locator(LoginSelectors.usernameInput)).toBeEnabled();
    });

    await test.step('3. Assert password input field is visible', async () => {
      await expect(page.locator(LoginSelectors.passwordInput)).toBeVisible();
      await expect(page.locator(LoginSelectors.passwordInput)).toBeEnabled();
    });

    await test.step('4. Assert login button is visible and enabled', async () => {
      await expect(page.locator(LoginSelectors.loginButton)).toBeVisible();
      await expect(page.locator(LoginSelectors.loginButton)).toBeEnabled();
    });
  });

  test('US-001-TC-002 | @smoke @regression @positive | Verify Login with Valid Credentials is Successful', async ({ page }) => {
    await test.step('1. Enter valid username and password', async () => {
      await performLogin(page, TestData.validUsername, TestData.validPassword);
    });

    await test.step('2. Assert user is redirected to the dashboard page', async () => {
      await expect(page).toHaveURL(/.*dashboard/);
    });

    await test.step('3. Assert dashboard title or a key dashboard element is visible', async () => {
      await expect(page.locator(LoginSelectors.dashboardTitle)).toBeVisible();
      await expect(page.locator(LoginSelectors.dashboardTitle)).toHaveText('Dashboard'); // Assuming a title 'Dashboard'
    });
  });

  // --- Negative Scenarios ---

  test('US-001-TC-003 | @regression @negative | Verify Login Fails with Invalid Username', async ({ page }) => {
    await test.step('1. Enter invalid username and valid password', async () => {
      await performLogin(page, TestData.invalidUsername, TestData.validPassword);
    });

    await test.step('2. Assert an error message is displayed', async () => {
      const errorMessageLocator = page.locator(LoginSelectors.errorMessage);
      await expect(errorMessageLocator).toBeVisible();
      await expect(errorMessageLocator).toHaveText(TestData.invalidCredentialsError);
    });

    await test.step('3. Assert user remains on the login page', async () => {
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator(LoginSelectors.dashboardTitle)).not.toBeVisible();
    });
  });

  test('US-001-TC-004 | @regression @negative | Verify Login Fails with Invalid Password', async ({ page }) => {
    await test.step('1. Enter valid username and invalid password', async () => {
      await performLogin(page, TestData.validUsername, TestData.invalidPassword);
    });

    await test.step('2. Assert an error message is displayed', async () => {
      const errorMessageLocator = page.locator(LoginSelectors.errorMessage);
      await expect(errorMessageLocator).toBeVisible();
      await expect(errorMessageLocator).toHaveText(TestData.invalidCredentialsError);
    });

    await test.step('3. Assert user remains on the login page', async () => {
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator(LoginSelectors.dashboardTitle)).not.toBeVisible();
    });
  });

  test('US-001-TC-005 | @regression @negative | Verify Login Fails with Empty Username', async ({ page }) => {
    await test.step('1. Attempt to login with empty username and valid password', async () => {
      await performLogin(page, '', TestData.validPassword);
    });

    await test.step('2. Assert an error message indicating missing username is displayed', async () => {
      const errorMessageLocator = page.locator(LoginSelectors.errorMessage);
      await expect(errorMessageLocator).toBeVisible();
      // This assertion might need adjustment based on actual application behavior (e.g., HTML5 validation message vs. custom error)
      await expect(errorMessageLocator).toHaveText(TestData.usernameRequiredError);
    });

    await test.step('3. Assert user remains on the login page', async () => {
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator(LoginSelectors.dashboardTitle)).not.toBeVisible();
    });
  });

  test('US-001-TC-006 | @regression @negative | Verify Login Fails with Empty Password', async ({ page }) => {
    await test.step('1. Attempt to login with valid username and empty password', async () => {
      await performLogin(page, TestData.validUsername, '');
    });

    await test.step('2. Assert an error message indicating missing password is displayed', async () => {
      const errorMessageLocator = page.locator(LoginSelectors.errorMessage);
      await expect(errorMessageLocator).toBeVisible();
      // This assertion might need adjustment based on actual application behavior
      await expect(errorMessageLocator).toHaveText(TestData.passwordRequiredError);
    });

    await test.step('3. Assert user remains on the login page', async () => {
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator(LoginSelectors.dashboardTitle)).not.toBeVisible();
    });
  });

  test('US-001-TC-007 | @regression @negative | Verify Login Fails with Empty Username and Password', async ({ page }) => {
    await test.step('1. Attempt to login with both username and password empty', async () => {
      await performLogin(page, '', ''); // Pass empty strings explicitly
    });

    await test.step('2. Assert an error message is displayed (could be for username or a general error)', async () => {
      const errorMessageLocator = page.locator(LoginSelectors.errorMessage);
      await expect(errorMessageLocator).toBeVisible();
      // The exact error message here depends on which validation triggers first or if a combined message is shown
      await expect(errorMessageLocator).toContainText('required'); // General check
    });

    await test.step('3. Assert user remains on the login page', async () => {
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator(LoginSelectors.dashboardTitle)).not.toBeVisible();
    });
  });
});
```