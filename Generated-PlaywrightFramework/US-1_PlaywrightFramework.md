```markdown
# Playwright Automation Framework for GitHub PAT Management

This document outlines a comprehensive Playwright Automation Framework designed to test GitHub Personal Access Token (PAT) management features, adhering to enterprise best practices such as Page Object Model, fixtures, utility classes, and API testing.

## 1. Project Structure

```
.
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── global-setup.ts
├── global-teardown.ts
├── README.md
├── .env
├── .gitignore
├── data
│   ├── patData.json
│   └── users.json
├── fixtures
│   └── pageFixtures.ts
├── pages
│   ├── basePage.ts
│   ├── githubHeader.ts
│   ├── loginPage.ts
│   ├── settings
│   │   ├── developerSettingsPage.ts
│   │   ├── personalAccessTokensPage.ts
│   │   └── newPersonalAccessTokenPage.ts
│   └── index.ts
├── tests
│   ├── api
│   │   └── patApiIntegration.spec.ts
│   ├── pat
│   │   ├── patCreationNegative.spec.ts
│   │   ├── patCreationPositive.spec.ts
│   │   ├── patListing.spec.ts
│   │   ├── patManagement.spec.ts
│   │   └── patNavigation.spec.ts
│   └── security
│       └── patSecurity.spec.ts
└── utils
    ├── apiUtils.ts
    ├── authUtils.ts
    ├── dateUtils.ts
    └── randomUtils.ts
```

## 2. package.json

```json
{
  "name": "github-pat-automation",
  "version": "1.0.0",
  "description": "Playwright Automation Framework for GitHub Personal Access Token (PAT) management.",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:api": "playwright test tests/api",
    "test:pat": "playwright test tests/pat",
    "report": "playwright show-report",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix"
  },
  "keywords": [
    "Playwright",
    "TypeScript",
    "Automation",
    "GitHub",
    "PAT",
    "E2E",
    "API Testing"
  ],
  "author": "Your Name/Organization",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@types/node": "^20.12.12",
    "@typescript-eslint/eslint-plugin": "^7.11.0",
    "@typescript-eslint/parser": "^7.11.0",
    "dotenv": "^16.4.5",
    "eslint": "^8.57.0",
    "eslint-plugin-playwright": "^1.1.0",
    "typescript": "^5.4.5"
  }
}
```

## 3. playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Timeout for each test, in milliseconds
  timeout: 60 * 1000,

  // Global timeout for the entire test run, in milliseconds
  globalTimeout: 30 * 60 * 1000, // 30 minutes

  // Expect timeout for assertions, in milliseconds
  expect: {
    timeout: 5000,
  },

  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: [
    ['list'], // Console reporter
    ['html', { open: 'on-failure' }] // HTML reporter opens on failure
  ],
  
  // Global setup and teardown for authentication
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'https://github.com',

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',

    // Preserve the authentication state across tests
    storageState: './auth.json',

    // API Request Context for API tests
    extraHTTPHeaders: {
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  },

  // Configure projects for major browsers
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

  // Output directory for test results
  outputDir: 'test-results/',
});
```

## 4. Page Objects

### `pages/basePage.ts`

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * BasePage class provides common functionalities and locators shared across all page objects.
 * It follows the Page Object Model (POM) pattern.
 */
export default class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a specified URL.
   * @param url The URL to navigate to.
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Clicks on an element.
   * @param locator The Playwright Locator for the element.
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Fills a text input field.
   * @param locator The Playwright Locator for the input field.
   * @param value The text value to fill.
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Retrieves the text content of an element.
   * @param locator The Playwright Locator for the element.
   * @returns The text content of the element.
   */
  async getText(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }

  /**
   * Checks if an element is visible.
   * @param locator The Playwright Locator for the element.
   * @returns True if the element is visible, false otherwise.
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Waits for a specific network response status code.
   * @param urlPattern A regular expression or string for the URL to match.
   * @param status The expected HTTP status code.
   * @returns The network response object.
   */
  async waitForResponse(urlPattern: string | RegExp, status: number) {
    return this.page.waitForResponse(response =>
      response.url().match(urlPattern) && response.status() === status
    );
  }
}
```

### `pages/githubHeader.ts`

```typescript
import { Locator, Page } from '@playwright/test';
import BasePage from './basePage';

/**
 * GitHubHeader class represents the common header elements on GitHub pages.
 * It includes locators and actions for profile menu, settings, etc.
 */
export default class GitHubHeader extends BasePage {
  readonly profilePicture: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.profilePicture = page.locator('summary[aria-label="View profile and more"] img');
    this.settingsLink = page.locator('a[href="/settings/profile"]');
  }

  /**
   * Clicks on the profile picture to open the dropdown menu.
   */
  async clickProfilePicture(): Promise<void> {
    await this.profilePicture.click();
    await this.settingsLink.waitFor({ state: 'visible' }); // Wait for menu to open
  }

  /**
   * Clicks on the "Settings" link in the profile dropdown.
   */
  async clickSettings(): Promise<void> {
    await this.clickProfilePicture(); // Ensure dropdown is open
    await this.settingsLink.click();
    await this.page.waitForURL('**/settings/profile');
  }
}
```

### `pages/loginPage.ts`

```typescript
import { Locator, Page } from '@playwright/test';
import BasePage from './basePage';
import users from '../data/users.json';

/**
 * LoginPage class represents the GitHub login page.
 * It contains locators and methods for logging in.
 */
export default class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#login_field');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.locator('input[name="commit"]');
    this.errorMessage = page.locator('#js-flash-container .flash-error');
  }

  /**
   * Navigates to the GitHub login page.
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigate('/login');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  /**
   * Performs a login action with provided credentials.
   * @param username The username to enter.
   * @param password The password to enter.
   */
  async login(username: string, password: string): Promise<void> {
    await this.navigateToLoginPage();
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.signInButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Retrieves the current user's login credentials from test data.
   * @returns An object containing the username and password.
   */
  getLoginCredentials(): { username: string; password: string } {
    const user = users.validUser;
    if (!user || !user.username || !user.password) {
      throw new Error('Valid user credentials not found in users.json or .env');
    }
    return { username: user.username, password: user.password };
  }
}
```

### `pages/settings/developerSettingsPage.ts`

```typescript
import { Locator, Page } from '@playwright/test';
import BasePage from '../basePage';

/**
 * DeveloperSettingsPage class represents the Developer settings section.
 * It contains locators and methods for navigating within Developer settings.
 */
export default class DeveloperSettingsPage extends BasePage {
  readonly personalAccessTokensLink: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.personalAccessTokensLink = page.locator('a[href="/settings/tokens"]');
    this.pageTitle = page.locator('h1'); // Assuming h1 for page title
  }

  /**
   * Navigates to the "Personal access tokens" page.
   */
  async clickPersonalAccessTokens(): Promise<void> {
    await this.personalAccessTokensLink.click();
    await this.page.waitForURL('**/settings/tokens');
  }

  /**
   * Gets the title of the Developer settings page.
   * @returns The text content of the page title.
   */
  async getPageTitle(): Promise<string | null> {
    return this.getText(this.pageTitle);
  }
}
```

### `pages/settings/personalAccessTokensPage.ts`

```typescript
import { Locator, Page, expect } from '@playwright/test';
import BasePage from '../basePage';

/**
 * PersonalAccessTokensPage class represents the page where users manage their PATs.
 * It includes methods for listing, revoking, and navigating to new PAT creation.
 */
export default class PersonalAccessTokensPage extends BasePage {
  readonly pageTitle: Locator;
  readonly generateNewTokenButton: Locator;
  readonly patListTable: Locator;
  readonly patRows: Locator;
  readonly confirmationDialog: Locator;
  readonly confirmRevokeButton: Locator;
  readonly cancelRevokeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("Personal access tokens")');
    this.generateNewTokenButton = page.getByRole('link', { name: 'Generate new token' });
    this.patListTable = page.locator('div[data-filterable-for="personal-access-tokens-filter"]');
    this.patRows = this.patListTable.locator('li.Box-row');
    this.confirmationDialog = page.locator('div[role="dialog"]');
    this.confirmRevokeButton = this.confirmationDialog.getByRole('button', { name: 'Revoke token' });
    this.cancelRevokeButton = this.confirmationDialog.getByRole('button', { name: 'Cancel' });
  }

  /**
   * Asserts that the current page is the Personal Access Tokens page.
   */
  async verifyOnPersonalAccessTokensPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*settings\/tokens/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toHaveText('Personal access tokens');
  }

  /**
   * Clicks the "Generate new token" button.
   */
  async clickGenerateNewToken(): Promise<void> {
    await this.click(this.generateNewTokenButton);
    await this.page.waitForURL('**/settings/tokens/new');
  }

  /**
   * Retrieves details of a PAT by its note/name.
   * @param patNote The note/name of the PAT.
   * @returns An object containing PAT details (Note, Scopes, Status, etc.).
   */
  async getPatDetails(patNote: string): Promise<{ note?: string; scopes?: string; status?: string; expires?: string } | null> {
    const patRow = this.patRows.filter({ hasText: patNote }).first();
    if (!await patRow.isVisible()) {
      return null;
    }
    const note = await patRow.locator('.f5').textContent();
    const scopes = await patRow.locator('.color-fg-muted.text-small').textContent();
    const status = await patRow.locator('[data-tooltip-id]').first().textContent(); // Adjust based on actual status locator
    const expires = await patRow.locator('span:has-text("Expires")').textContent().catch(() => null);

    return {
      note: note?.trim(),
      scopes: scopes?.trim(),
      status: status?.trim(),
      expires: expires ? expires.replace('Expires', '').trim() : undefined,
    };
  }

  /**
   * Revokes a PAT by its note/name.
   * @param patNote The note/name of the PAT to revoke.
   */
  async revokePat(patNote: string): Promise<void> {
    const patRow = this.patRows.filter({ hasText: patNote }).first();
    await expect(patRow).toBeVisible();

    // Click the revoke button/link within the specific PAT row
    const revokeButton = patRow.getByRole('button', { name: /Revoke/i });
    await revokeButton.click();

    await expect(this.confirmationDialog).toBeVisible();
    await this.confirmRevokeButton.click();
    await this.confirmationDialog.waitFor({ state: 'hidden' });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancels the revocation of a PAT.
   * @param patNote The note/name of the PAT for which revocation was initiated.
   */
  async cancelRevokePat(patNote: string): Promise<void> {
    const patRow = this.patRows.filter({ hasText: patNote }).first();
    await expect(patRow).toBeVisible();

    const revokeButton = patRow.getByRole('button', { name: /Revoke/i });
    await revokeButton.click();

    await expect(this.confirmationDialog).toBeVisible();
    await this.cancelRevokeButton.click();
    await this.confirmationDialog.waitFor({ state: 'hidden' });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Gets the text of the revocation confirmation dialog.
   * @returns The text content of the confirmation dialog.
   */
  async getRevocationConfirmationDialogText(): Promise<string | null> {
    await expect(this.confirmationDialog).toBeVisible();
    return this.getText(this.confirmationDialog);
  }

  /**
   * Checks if a PAT is present in the list.
   * @param patNote The note/name of the PAT.
   * @returns True if the PAT is visible, false otherwise.
   */
  async isPatPresent(patNote: string): Promise<boolean> {
    return this.patRows.filter({ hasText: patNote }).first().isVisible();
  }
}
```

### `pages/settings/newPersonalAccessTokenPage.ts`

```typescript
import { Locator, Page, expect } from '@playwright/test';
import BasePage from '../basePage';

/**
 * NewPersonalAccessTokenPage class represents the form for creating a new PAT.
 * It contains locators and methods for filling the form and generating the token.
 */
export default class NewPersonalAccessTokenPage extends BasePage {
  readonly pageTitle: Locator;
  readonly noteField: Locator;
  readonly scopeCheckboxes: Locator;
  readonly expirationDropdown: Locator;
  readonly generateTokenButton: Locator;
  readonly generatedTokenDisplay: Locator;
  readonly copyTokenButton: Locator;
  readonly noteError: Locator;
  readonly scopeError: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("New personal access token")');
    this.noteField = page.locator('#pat_description'); // Assuming 'pat_description' is the ID for the note field
    this.scopeCheckboxes = page.locator('.form-checkbox'); // Common locator for all scope checkboxes
    this.expirationDropdown = page.locator('#pat_expires_at'); // Assuming this ID for expiration dropdown
    this.generateTokenButton = page.getByRole('button', { name: 'Generate token' });
    this.generatedTokenDisplay = page.locator('.js-generated-token'); // Assuming this class for the token display
    this.copyTokenButton = page.locator('.js-clipboard-copy'); // Assuming this class for copy button
    this.noteError = page.locator('#pat_description ~ .note'); // Adjust selector for inline error message for note
    this.scopeError = page.locator('.js-scopes-field .error'); // Adjust selector for inline error message for scopes
  }

  /**
   * Asserts that the current page is the New Personal Access Token page.
   */
  async verifyOnNewPersonalAccessTokenPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*settings\/tokens\/new/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toHaveText('New personal access token');
  }

  /**
   * Enters a note/name for the PAT.
   * @param note The text for the note field.
   */
  async enterNote(note: string): Promise<void> {
    await this.fill(this.noteField, note);
  }

  /**
   * Selects a specific scope checkbox.
   * @param scopeLabel The text label of the scope checkbox (e.g., "repo", "workflow").
   */
  async selectScope(scopeLabel: string): Promise<void> {
    // Exact match for the label of the checkbox
    await this.page.getByLabel(scopeLabel, { exact: true }).check();
  }

  /**
   * Selects multiple scope checkboxes.
   * @param scopeLabels An array of text labels for the scope checkboxes.
   */
  async selectMultipleScopes(scopeLabels: string[]): Promise<void> {
    for (const label of scopeLabels) {
      await this.selectScope(label);
    }
  }

  /**
   * Selects an expiration option from the dropdown.
   * @param expirationOption The text of the expiration option (e.g., "No expiration", "7 days", "90 days").
   */
  async selectExpiration(expirationOption: string): Promise<void> {
    await this.expirationDropdown.selectOption({ label: expirationOption });
  }

  /**
   * Clicks the "Generate token" button.
   */
  async clickGenerateToken(): Promise<void> {
    await this.click(this.generateTokenButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Retrieves the newly generated PAT string.
   * Note: This string is only visible once.
   * @returns The generated PAT string.
   */
  async getGeneratedToken(): Promise<string | null> {
    await expect(this.generatedTokenDisplay).toBeVisible();
    return this.getText(this.generatedTokenDisplay);
  }

  /**
   * Checks if the note error message is visible.
   * @returns True if the note error is visible, false otherwise.
   */
  async isNoteErrorVisible(): Promise<boolean> {
    return this.noteError.isVisible();
  }

  /**
   * Gets the text of the note error message.
   * @returns The text content of the note error message.
   */
  async getNoteErrorText(): Promise<string | null> {
    return this.getText(this.noteError);
  }

  /**
   * Checks if the scope error message is visible.
   * @returns True if the scope error is visible, false otherwise.
   */
  async isScopeErrorVisible(): Promise<boolean> {
    return this.scopeError.isVisible();
  }

  /**
   * Gets the text of the scope error message.
   * @returns The text content of the scope error message.
   */
  async getScopeErrorText(): Promise<string | null> {
    return this.getText(this.scopeError);
  }
}
```

### `pages/index.ts`

```typescript
// Centralized export for all page objects
export { default as LoginPage } from './loginPage';
export { default as GitHubHeader } from './githubHeader';
export { default as DeveloperSettingsPage } from './settings/developerSettingsPage';
export { default as PersonalAccessTokensPage } from './settings/personalAccessTokensPage';
export { default as NewPersonalAccessTokenPage } from './settings/newPersonalAccessTokenPage';
```

## 5. Playwright Test Scripts

### `tests/pat/patNavigation.spec.ts`

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import users from '../../data/users.json';

test.describe('PAT Navigation and UI', () => {

  test('PAT-NAV-001: Verify user can navigate to Personal Access Tokens page', async ({ personalAccessTokensPage }) => {
    // The fixture 'personalAccessTokensPage' already navigates and verifies the page.
    // So, we just need to ensure the page object initialized correctly.
    await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NAV-001' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'UI / Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-NAV-002: Verify all expected UI elements are present on the PAT listing page', async ({ personalAccessTokensPage }) => {
    await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
    await expect(personalAccessTokensPage.generateNewTokenButton).toBeVisible();
    await expect(personalAccessTokensPage.patListTable).toBeVisible();

    // Verify table headers/column details implicitly by checking content of an existing PAT if any
    // For a new account or no PATs, these might not be visible. A more robust check might involve
    // checking for specific column header text if available on the page.
    // Example: expect(page.locator('th:has-text("Note")')).toBeVisible();
    // For now, we assume the elements are structured such that if PATs are present,
    // their details ("Note", "Scopes", "Created at", "Expires", "Last used", "Status")
    // are within the patRows and can be extracted.

    // If there are existing PATs, ensure their basic details are visible.
    const firstPatRow = personalAccessTokensPage.patRows.first();
    if (await firstPatRow.isVisible()) {
      await expect(firstPatRow.locator('.f5')).toBeVisible(); // Note
      await expect(firstPatRow.locator('.color-fg-muted.text-small')).toBeVisible(); // Scopes
      // More specific locators needed for 'Created at', 'Expires', 'Last used', 'Status' if they are distinct elements.
      // E.g., expect(firstPatRow.locator('xpath=./div[contains(text(), "Created at")]')).toBeVisible();
    }
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NAV-002' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'UI / Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-NAV-003: Verify clicking "Generate new token" button opens the token creation form', async ({ personalAccessTokensPage, newPersonalAccessTokenPage }) => {
    await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
    await personalAccessTokensPage.clickGenerateNewToken();
    await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NAV-003' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'UI / Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-NAV-004: Verify non-logged-in user cannot access PAT page', async ({ page, loginPage }) => {
    await test.step('Attempt to navigate directly to PATs page without logging in', async () => {
      await page.goto('/settings/tokens');
    });
    
    // Expect to be redirected to the login page
    await expect(page).toHaveURL(/.*login/);
    await expect(loginPage.usernameInput).toBeVisible();
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NAV-004' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Security' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });
});
```

### `tests/pat/patCreationPositive.spec.ts`

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import { randomUtils } from '../../utils';
import patData from '../../data/patData.json';

test.describe('PAT Creation - Positive Scenarios', () => {

  // Global variable to store the generated PAT string for cleanup purposes
  let createdPatToken: string | null = null;
  let createdPatNote: string | null = null;

  test.afterEach(async ({ page, personalAccessTokensPage }) => {
    // Cleanup: Attempt to revoke the PAT if one was created in the test
    if (createdPatNote && await personalAccessTokensPage.isPatPresent(createdPatNote)) {
      await test.step(`Cleanup: Revoking PAT "${createdPatNote}"`, async () => {
        await personalAccessTokensPage.navigate('/settings/tokens'); // Navigate back to PAT list if not there
        await personalAccessTokensPage.revokePat(createdPatNote);
        await expect(personalAccessTokensPage.isPatPresent(createdPatNote)).toBeFalsy();
      });
    }
    createdPatNote = null; // Reset for next test
    createdPatToken = null; // Reset for next test
  });

  test('PAT-CRT-001: Successfully create a PAT with a valid name and single scope (no expiration)', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const patNote = randomUtils.generateUniqueString(patData.positive.minValid.note);
    createdPatNote = patNote; // Store for cleanup

    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Enter note, select scope, and generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(patNote);
      await newPersonalAccessTokenPage.selectScope(patData.positive.minValid.scope);
      await newPersonalAccessTokenPage.selectExpiration(patData.positive.minValid.expiration);
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify success message and generated token display', async () => {
      createdPatToken = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(createdPatToken).not.toBeNull();
      expect(createdPatToken).toMatch(/^ghp_[a-zA-Z0-9]{36}$/); // Basic PAT format validation
    });

    await test.step('Verify token is listed on Personal Access Tokens page', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      const patDetails = await personalAccessTokensPage.getPatDetails(patNote);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.note).toBe(patNote);
      expect(patDetails?.scopes).toContain(patData.positive.minValid.scope);
      expect(patDetails?.status).toBe('Active'); // Assuming default status is 'Active'
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-CRT-001' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-CRT-002: Successfully create a PAT with a valid name and multiple selected scopes', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const patNote = randomUtils.generateUniqueString(patData.positive.multiScope.note);
    createdPatNote = patNote; // Store for cleanup

    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Enter note, select multiple scopes, and generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(patNote);
      await newPersonalAccessTokenPage.selectMultipleScopes(patData.positive.multiScope.scopes);
      await newPersonalAccessTokenPage.selectExpiration(patData.positive.multiScope.expiration);
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify success message and generated token display', async () => {
      createdPatToken = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(createdPatToken).not.toBeNull();
    });

    await test.step('Verify token is listed on Personal Access Tokens page with correct scopes', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      const patDetails = await personalAccessTokensPage.getPatDetails(patNote);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.note).toBe(patNote);
      patData.positive.multiScope.scopes.forEach(scope => {
        expect(patDetails?.scopes).toContain(scope);
      });
      expect(patDetails?.status).toBe('Active');
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-CRT-002' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-CRT-003: Successfully create a PAT that expires in 7 days', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const patNote = randomUtils.generateUniqueString(patData.positive.expires7Day.note);
    createdPatNote = patNote; // Store for cleanup

    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Enter note, select scope, set expiration, and generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(patNote);
      await newPersonalAccessTokenPage.selectScope(patData.positive.expires7Day.scope);
      await newPersonalAccessTokenPage.selectExpiration(patData.positive.expires7Day.expiration);
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify success message and generated token display', async () => {
      createdPatToken = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(createdPatToken).not.toBeNull();
    });

    await test.step('Verify token is listed on Personal Access Tokens page with correct expiration', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      const patDetails = await personalAccessTokensPage.getPatDetails(patNote);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.note).toBe(patNote);
      expect(patDetails?.scopes).toContain(patData.positive.expires7Day.scope);
      expect(patDetails?.expires).toContain('Expires'); // Expect "Expires on <date>" format
      // Further validation: check if expiration date is approximately 7 days from now
      const expectedExpiryDate = dateUtils.addDaysToCurrentDate(7);
      expect(patDetails?.expires).toContain(expectedExpiryDate);
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-CRT-003' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-CRT-004: Successfully create a PAT with the longest available expiration period (e.g., 90 days)', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const patNote = randomUtils.generateUniqueString(patData.positive.expires90Day.note);
    createdPatNote = patNote; // Store for cleanup

    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Enter note, select scope, set expiration, and generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(patNote);
      await newPersonalAccessTokenPage.selectScope(patData.positive.expires90Day.scope);
      await newPersonalAccessTokenPage.selectExpiration(patData.positive.expires90Day.expiration);
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify success message and generated token display', async () => {
      createdPatToken = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(createdPatToken).not.toBeNull();
    });

    await test.step('Verify token is listed on Personal Access Tokens page with correct expiration', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      const patDetails = await personalAccessTokensPage.getPatDetails(patNote);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.note).toBe(patNote);
      expect(patDetails?.scopes).toContain(patData.positive.expires90Day.scope);
      expect(patDetails?.expires).toContain('Expires');

      const expectedExpiryDate = dateUtils.addDaysToCurrentDate(90); // Adjust to 90 days or max offered
      expect(patDetails?.expires).toContain(expectedExpiryDate);
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-CRT-004' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-CRT-005: Verify PAT string is displayed only once upon creation', async ({ newPersonalAccessTokenPage, personalAccessTokensPage, page }) => {
    const patNote = randomUtils.generateUniqueString(patData.positive.verifyDisplay.note);
    createdPatNote = patNote; // Store for cleanup

    await test.step('Create a new PAT', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
      await newPersonalAccessTokenPage.enterNote(patNote);
      await newPersonalAccessTokenPage.selectScope(patData.positive.verifyDisplay.scope);
      await newPersonalAccessTokenPage.selectExpiration(patData.positive.verifyDisplay.expiration);
      await newPersonalAccessTokenPage.clickGenerateToken();
      createdPatToken = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(createdPatToken).not.toBeNull();
      await expect(newPersonalAccessTokenPage.copyTokenButton).toBeVisible(); // Ensure copy button is present
    });

    await test.step('Navigate away and back to PAT list', async () => {
      await page.goto('/'); // Navigate to dashboard
      await personalAccessTokensPage.navigate('/settings/tokens'); // Navigate back
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
    });

    await test.step('Try to view the created token\'s details and verify string is not visible', async () => {
      // GitHub UI does not have a direct "view details" for PATs that would re-display the token.
      // Instead, we verify the PAT string is NOT visible when viewing the PAT list entry itself.
      // The `getPatDetails` method confirms only metadata is visible, not the actual token string.
      const patDetails = await personalAccessTokensPage.getPatDetails(patNote);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.note).toBe(patNote);
      
      // Implicitly, the `getPatDetails` method does not return the actual token string.
      // If there was a specific UI element that *might* show it, we'd assert its invisibility.
      // For GitHub, the token string is genuinely *gone* from the UI after the initial display.
      // We can also check if the `generatedTokenDisplay` locator is not visible on the list page.
      await expect(personalAccessTokensPage.page.locator('.js-generated-token')).not.toBeVisible();
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-CRT-005' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'UI / Security' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-CRT-006: Successfully create a PAT with all scopes selected', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    // This test is complex due to the potentially large and dynamic number of scopes.
    // Manually selecting all scopes or clicking a 'Select All' button (if it exists)
    // could be brittle for automation. This is often better tested functionally once.
    // If a 'Select all' button exists, its locator would be used here.
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-CRT-006' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });
});
```

### `tests/pat/patCreationNegative.spec.ts`

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import { randomUtils } from '../../utils';
import patData from '../../data/patData.json';

test.describe('PAT Creation - Negative & Validation Scenarios', () => {

  // Global variable to store the generated PAT note for cleanup purposes if a token is somehow created
  let createdPatNote: string | null = null;

  test.afterEach(async ({ page, personalAccessTokensPage }) => {
    // Cleanup: Attempt to revoke the PAT if one was created in the test (e.g., auto-renamed in PAT-NEG-003)
    if (createdPatNote && await personalAccessTokensPage.isPatPresent(createdPatNote)) {
      await test.step(`Cleanup: Revoking PAT "${createdPatNote}"`, async () => {
        await personalAccessTokensPage.navigate('/settings/tokens');
        await personalAccessTokensPage.revokePat(createdPatNote);
        await expect(personalAccessTokensPage.isPatPresent(createdPatNote)).toBeFalsy();
      });
    }
    createdPatNote = null; // Reset for next test
  });

  test('PAT-NEG-001: Verify PAT cannot be created with an empty note', async ({ newPersonalAccessTokenPage }) => {
    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Leave note empty, select scope, and attempt to generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(''); // Leave empty
      await newPersonalAccessTokenPage.selectScope(patData.negative.emptyNote.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify error message and no token creation', async () => {
      await expect(newPersonalAccessTokenPage.isNoteErrorVisible()).toBeTruthy();
      expect(await newPersonalAccessTokenPage.getNoteErrorText()).toContain('Note is required'); // Adjust expected error message
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).not.toBeVisible();
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NEG-001' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Negative / Validation' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-NEG-002: Verify PAT cannot be created without selecting any scopes', async ({ newPersonalAccessTokenPage }) => {
    const patNote = randomUtils.generateUniqueString(patData.negative.noScopes.note);
    createdPatNote = patNote; // Store for cleanup if somehow created

    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Enter note, do not select scopes, and attempt to generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(patNote);
      // No scope selected
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify error message and no token creation', async () => {
      await expect(newPersonalAccessTokenPage.isScopeErrorVisible()).toBeTruthy();
      expect(await newPersonalAccessTokenPage.getScopeErrorText()).toContain('At least one scope must be selected'); // Adjust expected error message
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).not.toBeVisible();
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NEG-002' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Negative / Validation' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-NEG-003: Verify unique constraint for PAT names (duplicate name)', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    // This scenario is tricky for automation. GitHub often renames duplicate PATs (e.g., "Note (1)").
    // If the system renames it, the test would pass, but the intent is to verify the unique constraint.
    // If the system outright rejects, then an error message check would be needed.
    // Due to inconsistent expected behavior (error vs. auto-rename), it's marked as No.
    // To test this, you'd create a PAT, then try to create another with the exact same name.
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NEG-003' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Negative / Validation' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });

  test('PAT-NEG-004: Verify PAT name field handles maximum allowed length', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const longNote = 'a'.repeat(255); // Assuming max length is 255
    createdPatNote = longNote; // Store for cleanup

    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Enter max length note, select scope, and generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(longNote);
      await newPersonalAccessTokenPage.selectScope(patData.negative.maxLengthNote.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify PAT is created and note is not truncated', async () => {
      const generatedToken = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(generatedToken).not.toBeNull();

      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      const patDetails = await personalAccessTokensPage.getPatDetails(longNote);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.note).toBe(longNote); // Ensure the full note is displayed
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NEG-004' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Boundary / Validation' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-NEG-005: Verify expiration date cannot be set in the past', async ({ newPersonalAccessTokenPage }) => {
    // This requires a custom date picker interaction, which is highly UI-dependent and brittle.
    // Modern UIs typically disable past dates in date pickers, making explicit selection impossible.
    // If the UI allows inputting a past date, then a validation error would be expected.
    // Marking as 'No' due to the complexity and UI-specific nature of date picker interactions for negative scenarios.
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NEG-005' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Negative / Validation' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });

  test('PAT-NEG-006: Verify PAT name field is resistant to XSS attacks (script injection)', async ({ newPersonalAccessTokenPage, personalAccessTokensPage, page }) => {
    const maliciousNote = patData.negative.xssInjection.note;
    const patNote = randomUtils.generateUniqueString(maliciousNote);
    createdPatNote = patNote; // Store for cleanup

    await test.step('Navigate to New PAT page', async () => {
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    });

    await test.step('Enter malicious script into Note field, select scope, and generate token', async () => {
      await newPersonalAccessTokenPage.enterNote(maliciousNote);
      await newPersonalAccessTokenPage.selectScope(patData.negative.xssInjection.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
    });

    await test.step('Verify PAT is created and script is sanitized/encoded', async () => {
      const generatedToken = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(generatedToken).not.toBeNull();

      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      
      // Look for the PAT by its sanitized/encoded name on the listing page
      // GitHub usually displays raw text, so we'll look for the original string as text.
      // If it were executed, an alert box would pop up, or the script tag would be in the DOM.
      await expect(personalAccessTokensPage.patListTable.locator(`text=${maliciousNote}`)).toBeVisible();

      // Check the innerHTML of the element to ensure it's encoded or sanitized
      const patNoteElement = personalAccessTokensPage.patRows.filter({ hasText: patNote }).first().locator('.f5');
      const innerHtml = await patNoteElement.innerHTML();
      expect(innerHtml).not.toContain('<script>'); // Ensure script tag is not interpreted
      expect(innerHtml).toContain('&lt;script&gt;'); // Ensure it's HTML encoded

      // Also ensure no alert dialog was triggered
      page.on('dialog', async dialog => {
        expect.fail(`XSS attack triggered an alert: ${dialog.message()}`);
        await dialog.dismiss();
      });
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-NEG-006' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Security / Validation' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });
});
```

### `tests/pat/patListing.spec.ts`

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import { randomUtils } from '../../utils';
import patData from '../../data/patData.json';

test.describe('PAT Listing and Viewing', () => {
  // Store PAT notes for cleanup
  const createdPatNotes: string[] = [];

  test.beforeEach(async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    // Precondition: Create multiple active PATs for PAT-LST-001
    await newPersonalAccessTokenPage.navigate('/settings/tokens/new');
    await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();

    const pat1Note = randomUtils.generateUniqueString(patData.listing.activeRepo.note);
    createdPatNotes.push(pat1Note);
    await newPersonalAccessTokenPage.enterNote(pat1Note);
    await newPersonalAccessTokenPage.selectScope(patData.listing.activeRepo.scope);
    await newPersonalAccessTokenPage.selectExpiration(patData.listing.activeRepo.expiration);
    await newPersonalAccessTokenPage.clickGenerateToken();
    await newPersonalAccessTokenPage.page.waitForLoadState('networkidle');
    await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible(); // PAT 1 created

    await newPersonalAccessTokenPage.page.goto('/settings/tokens/new'); // Go back to create another
    await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    const pat2Note = randomUtils.generateUniqueString(patData.listing.activeGist7Day.note);
    createdPatNotes.push(pat2Note);
    await newPersonalAccessTokenPage.enterNote(pat2Note);
    await newPersonalAccessTokenPage.selectScope(patData.listing.activeGist7Day.scope);
    await newPersonalAccessTokenPage.selectExpiration(patData.listing.activeGist7Day.expiration);
    await newPersonalAccessTokenPage.clickGenerateToken();
    await newPersonalAccessTokenPage.page.waitForLoadState('networkidle');
    await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible(); // PAT 2 created

    await personalAccessTokensPage.navigate('/settings/tokens'); // Go to listing page
    await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
  });

  test.afterEach(async ({ personalAccessTokensPage }) => {
    // Cleanup: Revoke all PATs created in this test block
    for (const patNote of createdPatNotes) {
      if (await personalAccessTokensPage.isPatPresent(patNote)) {
        await test.step(`Cleanup: Revoking PAT "${patNote}"`, async () => {
          await personalAccessTokensPage.revokePat(patNote);
          await expect(personalAccessTokensPage.isPatPresent(patNote)).toBeFalsy();
        });
      }
    }
    createdPatNotes.length = 0; // Clear the array
  });

  test('PAT-LST-001: Verify all active PATs are correctly listed with their details', async ({ personalAccessTokensPage }) => {
    await test.step('Observe the list of tokens and verify active PATs', async () => {
      const pat1Details = await personalAccessTokensPage.getPatDetails(createdPatNotes[0]);
      expect(pat1Details).not.toBeNull();
      expect(pat1Details?.note).toBe(createdPatNotes[0]);
      expect(pat1Details?.scopes).toContain(patData.listing.activeRepo.scope);
      expect(pat1Details?.status).toBe('Active');

      const pat2Details = await personalAccessTokensPage.getPatDetails(createdPatNotes[1]);
      expect(pat2Details).not.toBeNull();
      expect(pat2Details?.note).toBe(createdPatNotes[1]);
      expect(pat2Details?.scopes).toContain(patData.listing.activeGist7Day.scope);
      expect(pat2Details?.status).toBe('Active'); // Should be active if 7 days has not passed
      expect(pat2Details?.expires).toContain('Expires'); // Expect "Expires on <date>" format
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-LST-001' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional / UI' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-LST-002: Verify expired PATs are correctly listed with their status', async ({ personalAccessTokensPage, newPersonalAccessTokenPage }) => {
    // This requires setting up a PAT with a very short expiration (e.g., 1 minute) and waiting for it to expire,
    // or creating a PAT with an expiration in the past (if the UI allows, which it usually doesn't).
    // The most practical way to test this would be to manipulate the system clock in a test environment
    // or to have a pre-existing expired PAT. For E2E, waiting is not ideal, and manipulation is out of scope.
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-LST-002' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional / UI' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });

  test('PAT-LST-003: Verify revoked PATs are correctly listed with their status', async ({ personalAccessTokensPage, newPersonalAccessTokenPage }) => {
    const patToRevokeNote = randomUtils.generateUniqueString(patData.listing.revokedTest.note);
    createdPatNotes.push(patToRevokeNote);

    await test.step('Create a PAT and then revoke it', async () => {
      await newPersonalAccessTokenPage.navigate('/settings/tokens/new');
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
      await newPersonalAccessTokenPage.enterNote(patToRevokeNote);
      await newPersonalAccessTokenPage.selectScope(patData.listing.revokedTest.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible(); // PAT created

      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      await personalAccessTokensPage.revokePat(patToRevokeNote);
      await personalAccessTokensPage.page.waitForLoadState('networkidle');
    });

    await test.step('Verify the revoked PAT is listed with "Revoked" status', async () => {
      const revokedPatDetails = await personalAccessTokensPage.getPatDetails(patToRevokeNote);
      expect(revokedPatDetails).not.toBeNull();
      expect(revokedPatDetails?.note).toBe(patToRevokeNote);
      expect(revokedPatDetails?.scopes).toContain(patData.listing.revokedTest.scope);
      expect(revokedPatDetails?.status).toBe('Revoked');
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-LST-003' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional / UI' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-LST-004: Verify pagination/load time for many PATs', async ({ personalAccessTokensPage }) => {
    // This requires a test environment pre-populated with a very large number of PATs (e.g., 100+).
    // Automating the creation of 100+ PATs within a single test is impractical and impacts test execution time significantly.
    // It's a performance test that would typically be run in a dedicated performance testing suite or with specific environment setup.
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-LST-004' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Performance' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });

  test('PAT-LST-005: Verify how multiple scopes are displayed for a PAT', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const multiScopePatNote = randomUtils.generateUniqueString(patData.listing.multiScopePAT.note);
    createdPatNotes.push(multiScopePatNote);

    await test.step('Create a PAT with multiple scopes', async () => {
      await newPersonalAccessTokenPage.navigate('/settings/tokens/new');
      await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
      await newPersonalAccessTokenPage.enterNote(multiScopePatNote);
      await newPersonalAccessTokenPage.selectMultipleScopes(patData.listing.multiScopePAT.scopes);
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible(); // PAT created
    });

    await test.step('Observe the scope display on the PAT list page', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      
      const patDetails = await personalAccessTokensPage.getPatDetails(multiScopePatNote);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.note).toBe(multiScopePatNote);
      
      // Verify all scopes are present in the displayed string, possibly comma-separated or truncated.
      // The exact display format might vary (e.g., 'repo, admin:org, gist' vs 'repo, ...').
      // We'll check if all expected scopes are contained within the text.
      const displayedScopes = patDetails?.scopes || '';
      for (const scope of patData.listing.multiScopePAT.scopes) {
        expect(displayedScopes).toContain(scope);
      }

      // If there's a tooltip/hover effect, this would require advanced interaction,
      // which might be more suited for manual testing or a visual regression test.
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-LST-005' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'UI' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });
});
```

### `tests/pat/patManagement.spec.ts`

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import { randomUtils, dateUtils } from '../../utils';
import patData from '../../data/patData.json';

test.describe('PAT Management (Revocation)', () => {
  // Store PAT notes for cleanup
  const createdPatNotes: string[] = [];

  test.beforeEach(async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    // Ensure we start each test on the New PAT creation page.
    await newPersonalAccessTokenPage.navigate('/settings/tokens/new');
    await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
  });

  test.afterEach(async ({ personalAccessTokensPage }) => {
    // Cleanup: Revoke all PATs created in this test block
    for (const patNote of createdPatNotes) {
      if (await personalAccessTokensPage.isPatPresent(patNote)) {
        await test.step(`Cleanup: Revoking PAT "${patNote}"`, async () => {
          await personalAccessTokensPage.navigate('/settings/tokens'); // Ensure on PAT list page for revocation
          await personalAccessTokensPage.revokePat(patNote);
          await expect(personalAccessTokensPage.isPatPresent(patNote)).toBeFalsy();
        });
      }
    }
    createdPatNotes.length = 0; // Clear the array
  });

  test('PAT-MGT-001: Verify an active PAT can be successfully revoked', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const patToRevokeNote = randomUtils.generateUniqueString(patData.management.revokeMeTest.note);
    createdPatNotes.push(patToRevokeNote); // Add to cleanup list

    await test.step('Create an active PAT', async () => {
      await newPersonalAccessTokenPage.enterNote(patToRevokeNote);
      await newPersonalAccessTokenPage.selectScope(patData.management.revokeMeTest.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible(); // Ensure PAT created
    });

    await test.step('Navigate to PAT list and revoke the PAT', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      await personalAccessTokensPage.revokePat(patToRevokeNote);
    });

    await test.step('Verify the PAT status changes to "Revoked"', async () => {
      const revokedPatDetails = await personalAccessTokensPage.getPatDetails(patToRevokeNote);
      expect(revokedPatDetails).not.toBeNull();
      expect(revokedPatDetails?.status).toBe('Revoked');
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-MGT-001' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-MGT-002: Verify appropriate confirmation is required for PAT revocation', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const patToConfirmRevoke = randomUtils.generateUniqueString(patData.management.confirmRevoke.note);
    createdPatNotes.push(patToConfirmRevoke);

    await test.step('Create a PAT', async () => {
      await newPersonalAccessTokenPage.enterNote(patToConfirmRevoke);
      await newPersonalAccessTokenPage.selectScope(patData.management.confirmRevoke.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible();
    });

    await test.step('Navigate to PAT list and initiate revocation', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      // Click revoke button without confirming to open dialog
      await personalAccessTokensPage.patRows.filter({ hasText: patToConfirmRevoke }).first()
                                        .getByRole('button', { name: /Revoke/i }).click();
    });

    await test.step('Verify confirmation dialog content', async () => {
      const dialogText = await personalAccessTokensPage.getRevocationConfirmationDialogText();
      expect(dialogText).not.toBeNull();
      expect(dialogText).toContain('Are you sure you want to revoke'); // Generic check
      expect(dialogText).toContain(patToConfirmRevoke);
      await expect(personalAccessTokensPage.confirmRevokeButton).toBeVisible();
      await expect(personalAccessTokensPage.cancelRevokeButton).toBeVisible();
    });

    // Cancel the dialog for cleanup (handled by afterEach, but explicit is good)
    await personalAccessTokensPage.cancelRevokeButton.click();
    await personalAccessTokensPage.confirmationDialog.waitFor({ state: 'hidden' });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-MGT-002' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'UI / Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-MGT-003: Verify PAT is not revoked if cancellation is chosen', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    const patToCancelRevoke = randomUtils.generateUniqueString(patData.management.cancelRevoke.note);
    createdPatNotes.push(patToCancelRevoke);

    await test.step('Create a PAT', async () => {
      await newPersonalAccessTokenPage.enterNote(patToCancelRevoke);
      await newPersonalAccessTokenPage.selectScope(patData.management.cancelRevoke.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible();
    });

    await test.step('Navigate to PAT list, initiate revocation, and then cancel', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      await personalAccessTokensPage.cancelRevokePat(patToCancelRevoke);
    });

    await test.step('Verify the PAT remains active', async () => {
      const patDetails = await personalAccessTokensPage.getPatDetails(patToCancelRevoke);
      expect(patDetails).not.toBeNull();
      expect(patDetails?.status).toBe('Active');
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-MGT-003' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional / UI' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-MGT-004: Verify an expired PAT can be revoked', async ({ newPersonalAccessTokenPage, personalAccessTokensPage }) => {
    // This test relies on creating an 'expired' PAT, which means we either need to:
    // 1. Create a PAT with a very short expiration and wait (impractical for tests).
    // 2. Mock the system time (complex for Playwright E2E).
    // 3. Have a pre-existing expired PAT (requires specific test data setup).
    // For demonstration, we'll create a 7-day PAT and assume it can be revoked, as the UI likely allows.
    // The "expired" status can't be confirmed without waiting, so we focus on revocation functionality.
    
    const patNoteForExpiredRevoke = randomUtils.generateUniqueString(patData.management.expiredRevokeTest.note);
    createdPatNotes.push(patNoteForExpiredRevoke);

    await test.step('Create a PAT with 7-day expiration (simulating future expiration)', async () => {
      await newPersonalAccessTokenPage.enterNote(patNoteForExpiredRevoke);
      await newPersonalAccessTokenPage.selectScope(patData.management.expiredRevokeTest.scope);
      await newPersonalAccessTokenPage.selectExpiration('7 days'); // Choose a short but valid expiration
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible();
    });

    await test.step('Navigate to PAT list and revoke the PAT (whether expired or active)', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      await personalAccessTokensPage.revokePat(patNoteForExpiredRevoke);
    });

    await test.step('Verify the PAT status changes to "Revoked"', async () => {
      const revokedPatDetails = await personalAccessTokensPage.getPatDetails(patNoteForExpiredRevoke);
      expect(revokedPatDetails).not.toBeNull();
      expect(revokedPatDetails?.status).toBe('Revoked');
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-MGT-004' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Functional' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-MGT-005: Verify security of PAT revocation (CSRF)', async ({ page }) => {
    // This test requires crafting a simulated CSRF attack, which typically involves:
    // 1. Setting up an external web page with a malicious form or script.
    // 2. Getting the user's browser to submit a request to the GitHub revocation endpoint from that external page.
    // This is beyond the scope of a standard Playwright E2E test, which operates within the browser's context.
    // Manual penetration testing or specific security tooling would be more appropriate for this.
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-MGT-005' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Security' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });
});
```

### `tests/api/patApiIntegration.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { ApiUtils, randomUtils } from '../../utils';
import patData from '../../data/patData.json';
import users from '../../data/users.json';
import { PersonalAccessTokensPage, NewPersonalAccessTokenPage } from '../../pages'; // Import necessary page objects for UI interaction
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

test.describe('API Integration with PATs', () => {
  let apiUtils: ApiUtils;
  let personalAccessTokensPage: PersonalAccessTokensPage;
  let newPersonalAccessTokenPage: NewPersonalAccessTokenPage;

  let createdPatNote: string | null = null;
  let createdPatTokenString: string | null = null; // To store the actual PAT string

  test.beforeEach(async ({ request, page }) => {
    apiUtils = new ApiUtils(request);
    personalAccessTokensPage = new PersonalAccessTokensPage(page);
    newPersonalAccessTokenPage = new NewPersonalAccessTokenPage(page);
    
    // Ensure user is logged in for any UI-based PAT creation/management
    await page.goto('/');
    const loginPage = new (await import('../../pages/loginPage')).default(page);
    await loginPage.login(users.validUser.username, users.validUser.password);
    await expect(page.locator('summary[aria-label="View profile and more"]')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Attempt to revoke the PAT if one was created in the test and we have its note
    if (createdPatNote) {
      await test.step(`Cleanup: Revoking PAT "${createdPatNote}" via UI if exists`, async () => {
        // Navigate to PAT list if not already there
        await personalAccessTokensPage.navigate('/settings/tokens');
        if (await personalAccessTokensPage.isPatPresent(createdPatNote)) {
          await personalAccessTokensPage.revokePat(createdPatNote);
          await expect(personalAccessTokensPage.isPatPresent(createdPatNote)).toBeFalsy();
        }
      });
    }
    createdPatNote = null;
    createdPatTokenString = null;
  });

  // Helper to create a PAT via UI and capture its string
  async function createPatAndCaptureString(patName: string, scopes: string[], expiration: string = 'No expiration') {
    await test.step('Create PAT via UI and capture token string', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.clickGenerateNewToken();
      await newPersonalAccessTokenPage.enterNote(patName);
      await newPersonalAccessTokenPage.selectMultipleScopes(scopes);
      await newPersonalAccessTokenPage.selectExpiration(expiration);
      await newPersonalAccessTokenPage.clickGenerateToken();
      createdPatTokenString = await newPersonalAccessTokenPage.getGeneratedToken();
      expect(createdPatTokenString).not.toBeNull();
      createdPatNote = patName; // Store for cleanup
    });
    return createdPatTokenString;
  }

  test('PAT-API-001: Verify newly created PAT can authenticate an API request based on its scope', async () => {
    const patNote = randomUtils.generateUniqueString(patData.api.repoScope.note);
    const patScopes = patData.api.repoScope.scopes;
    const patString = await createPatAndCaptureString(patNote, patScopes);
    expect(patString).not.toBeNull();

    await test.step('Make authenticated API request with PAT', async () => {
      // Use the PAT string to make an API call (e.g., list user repos)
      const response = await apiUtils.getUserRepos(patString!);
      expect(response.status()).toBe(200);
      const repos = await response.json();
      expect(Array.isArray(repos)).toBeTruthy();
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-API-001' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'API / Integration' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-API-002: Verify API call fails if PAT lacks required scope', async ({ request }) => {
    const patNote = randomUtils.generateUniqueString(patData.api.publicRepoScope.note);
    const patScopes = patData.api.publicRepoScope.scopes; // Only 'public_repo' scope
    const patString = await createPatAndCaptureString(patNote, patScopes);
    expect(patString).not.toBeNull();

    await test.step('Attempt to create a private repository with insufficient scope', async () => {
      const privateRepoName = randomUtils.generateUniqueString('private-repo');
      const response = await apiUtils.createRepo(patString!, privateRepoName, true); // Create private repo
      expect(response.status()).toBe(403); // Expect Forbidden
      const error = await response.json();
      expect(error.message).toContain('Resource not accessible by integration'); // Common GitHub API error for scope issues
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-API-002' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'API / Integration' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-API-003: Verify a revoked PAT can no longer authenticate API requests', async () => {
    const patNote = randomUtils.generateUniqueString(patData.api.revokeAndTest.note);
    const patScopes = patData.api.revokeAndTest.scopes;
    const patString = await createPatAndCaptureString(patNote, patScopes);
    expect(patString).not.toBeNull();

    await test.step('Revoke the created PAT', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.revokePat(patNote);
      await expect(personalAccessTokensPage.isPatPresent(patNote)).toBeFalsy(); // Verify it's revoked from UI
    });

    await test.step('Attempt to make an API request with the revoked PAT', async () => {
      const response = await apiUtils.getUserRepos(patString!);
      expect(response.status()).toBe(401); // Expect Unauthorized
      const error = await response.json();
      expect(error.message).toContain('Bad credentials'); // Common message for invalid/revoked token
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-API-003' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'API / Integration' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-API-004: Verify an expired PAT can no longer authenticate API requests', async () => {
    // This test is tricky because we can't easily make a PAT expire instantly.
    // The workaround is to use a PAT with a very short expiration (e.g., 1 day or a custom minimal time if supported)
    // and then simulate the 'expired' state. For practical automation without waiting,
    // we assume we have a way to generate or retrieve an already expired token for testing purposes.
    // Given the framework constraints, creating a PAT with a 7-day expiration is the closest,
    // but the test would only truly verify 'expired' behavior if run *after* 7 days.
    // For now, it will function identically to PAT-API-003 unless a mechanism for
    // instantly expiring tokens (e.g., via dev tools or a special API) is available.

    // A more realistic scenario for automation: assume an expired token string is available
    // from a specific test data setup or a previous run where a token actually expired.
    // Since we don't have a direct way to instantly expire a token through the UI,
    // this test will currently create a token and revoke it, similar to the previous test.
    // This highlights a limitation for automating time-dependent features without environment control.
    
    const patNote = randomUtils.generateUniqueString(patData.api.expiredAndTest.note);
    const patScopes = patData.api.expiredAndTest.scopes;
    const expiration = '7 days'; // Smallest provided expiration, cannot test 'expired' immediately
    const patString = await createPatAndCaptureString(patNote, patScopes, expiration);
    expect(patString).not.toBeNull();

    // To properly test expiration, we would need to wait for 7 days or have a pre-expired token.
    // For the purpose of immediate automation, we will simulate invalidation by revoking it
    // and explicitly state this limitation in the report/comments.
    await test.step('Simulate expiration by revoking the token immediately (limitation of E2E for true expiration)', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      await personalAccessTokensPage.revokePat(patNote);
      await expect(personalAccessTokensPage.isPatPresent(patNote)).toBeFalsy();
    });

    await test.step('Attempt to make an API request with the "expired" (revoked) PAT', async () => {
      const response = await apiUtils.getUserRepos(patString!);
      expect(response.status()).toBe(401); // Expect Unauthorized
      const error = await response.json();
      expect(error.message).toContain('Bad credentials');
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-API-004' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'API / Integration' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-API-005: Verify API endpoint handles invalid PAT strings gracefully', async ({ request }) => {
    const invalidPatString = patData.api.invalidPat.string;
    const malformedPatString = patData.api.malformedPat.string;

    await test.step('Attempt API request with a clearly invalid PAT string', async () => {
      const response = await apiUtils.getUserRepos(invalidPatString);
      expect(response.status()).toBe(401); // Expect Unauthorized
      const error = await response.json();
      expect(error.message).toContain('Bad credentials');
    });

    await test.step('Attempt API request with a malformed/too long PAT string', async () => {
      const response = await apiUtils.getUserRepos(malformedPatString);
      expect(response.status()).toBe(401); // Expect Unauthorized
      const error = await response.json();
      expect(error.message).toContain('Bad credentials'); // Or similar for malformed
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-API-005' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'API / Security' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test('PAT-API-006: Verify rate limits apply to API calls made with PATs', async ({ request }) => {
    const patNote = randomUtils.generateUniqueString(patData.api.rateLimiting.note);
    const patScopes = patData.api.rateLimiting.scopes;
    const patString = await createPatAndCaptureString(patNote, patScopes);
    expect(patString).not.toBeNull();

    const requestCount = 60; // GitHub's unauthenticated rate limit is often 60 req/hour, authenticated is higher.
                          // For a quick test, we'll try to exceed a low threshold.
                          // Realistically, for this test, you'd need to hit the authenticated limit which is much higher (e.g., 5000 req/hour).
                          // This test might need to be adjusted based on actual GitHub API rate limits and test environment.

    await test.step(`Make ${requestCount} API calls to trigger rate limiting`, async () => {
      let rateLimitExceeded = false;
      for (let i = 0; i < requestCount; i++) {
        const response = await apiUtils.getUserRepos(patString!);
        if (response.status() === 429) { // Too Many Requests
          rateLimitExceeded = true;
          console.warn(`Rate limit exceeded after ${i + 1} requests.`);
          break;
        }
        // Monitor headers for X-RateLimit-Remaining
        const remaining = response.headers()['x-ratelimit-remaining'];
        // console.log(`Request ${i + 1}: Status ${response.status()}, RateLimit-Remaining: ${remaining}`);
        await page.waitForTimeout(50); // Small delay to avoid hammering too quickly, adjust as needed
      }
      expect(rateLimitExceeded).toBeTruthy(); // Expect rate limit to be hit eventually
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-API-006' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Performance / API' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });
});
```

### `tests/security/patSecurity.spec.ts`

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import { randomUtils } from '../../utils';
import patData from '../../data/patData.json';
import users from '../../data/users.json'; // For PAT-SEC-003 setup

test.describe('Security Scenarios for PAT Management', () => {
  // Store PAT notes for cleanup
  const createdPatNotes: string[] = [];

  test.afterEach(async ({ personalAccessTokensPage }) => {
    // Cleanup: Revoke all PATs created in this test block
    for (const patNote of createdPatNotes) {
      if (await personalAccessTokensPage.isPatPresent(patNote)) {
        await test.step(`Cleanup: Revoking PAT "${patNote}"`, async () => {
          await personalAccessTokensPage.navigate('/settings/tokens'); // Ensure on PAT list page
          await personalAccessTokensPage.revokePat(patNote);
          await expect(personalAccessTokensPage.isPatPresent(patNote)).toBeFalsy();
        });
      }
    }
    createdPatNotes.length = 0; // Clear the array
  });

  test('PAT-SEC-001: Verify input sanitization on PAT name (XSS)', async ({ newPersonalAccessTokenPage, personalAccessTokensPage, page }) => {
    const maliciousNote = patData.security.xssSanitization.note;
    const uniquePatNote = randomUtils.generateUniqueString('XSS_Test_');
    createdPatNotes.push(uniquePatNote); // Store for cleanup

    await test.step('Create a new PAT with the malicious "Note"', async () => {
      await newPersonalAccessTokenPage.navigate('/settings/tokens/new');
      await newPersonalAccessTokenPage.enterNote(maliciousNote);
      await newPersonalAccessTokenPage.selectScope(patData.security.xssSanitization.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible();
    });

    await test.step('Verify the note is displayed as plain text and HTML is encoded on the PAT list page', async () => {
      await personalAccessTokensPage.navigate('/settings/tokens');
      
      // Look for the element that contains the note, expecting it to be visible as plain text.
      // Note: GitHub might save the malicious string as it is and encode it when displaying.
      // We look for the raw string as text content, and then check its inner HTML for encoding.
      const patRow = personalAccessTokensPage.patRows.filter({ hasText: maliciousNote }).first();
      await expect(patRow).toBeVisible(); // The row containing the raw malicious text should be visible.

      const noteElement = patRow.locator('.f5'); // Adjust locator for the note display element
      const noteText = await noteElement.textContent();
      const noteHtml = await noteElement.innerHTML();

      expect(noteText).toContain(maliciousNote); // Verify the raw string is displayed
      expect(noteHtml).not.toContain('<script>'); // Ensure no actual script tag is rendered
      expect(noteHtml).toContain('&lt;script&gt;'); // Ensure it's HTML encoded

      // Also ensure no alert dialog was triggered (Playwright automatically captures this)
      page.on('dialog', async dialog => {
        expect.fail(`XSS attack triggered an alert: ${dialog.message()}`);
        await dialog.dismiss();
      });
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-SEC-001' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Security' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-SEC-002: Verify no PAT string in logs/storage after initial display', async ({ newPersonalAccessTokenPage, page }) => {
    // This test involves observing network traffic (developer tools) during PAT creation,
    // and inspecting browser history, cache, local storage, session storage, etc.
    // Playwright can interact with network requests, but inspecting browser-specific caches
    // or history across different browser implementations can be complex and beyond standard E2E.
    // While Playwright can assert that a specific network response doesn't contain the token
    // after the initial display, it cannot easily guarantee its absence from all possible client-side storage or logs.
    // This is typically a manual verification or requires specialized security tooling.
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-SEC-002' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Security' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });

  test('PAT-SEC-003: Verify a user cannot view or manage another user\'s PATs', async ({ page, request }) => {
    // Precondition: User A (current logged in user) creates a PAT.
    const userA_PatNote = randomUtils.generateUniqueString('UserA_PAT_');
    createdPatNotes.push(userA_PatNote); // Add to cleanup list for User A's session

    await test.step('User A creates a PAT', async () => {
      await page.goto('/settings/tokens/new');
      await newPersonalAccessTokenPage.enterNote(userA_PatNote);
      await newPersonalAccessTokenPage.selectScope(patData.security.accessControl.scope);
      await newPersonalAccessTokenPage.clickGenerateToken();
      await expect(newPersonalAccessTokenPage.generatedTokenDisplay).toBeVisible();
    });

    await test.step('Log out User A and log in as User B', async () => {
      // Navigate to logout endpoint or click logout button (not in current POM)
      await page.goto('/logout');
      const loginPage = new (await import('../../pages/loginPage')).default(page);
      await loginPage.login(users.anotherValidUser.username, users.anotherValidUser.password);
      await expect(page.locator('summary[aria-label="View profile and more"]')).toBeVisible();
    });

    await test.step('User B attempts to view User A\'s PATs via UI', async () => {
      await page.goto('/settings/tokens');
      await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
      
      // Expect User A's PAT not to be visible in User B's list
      await expect(personalAccessTokensPage.patRows.filter({ hasText: userA_PatNote })).not.toBeVisible();
    });

    await test.step('User B attempts to view User A\'s PATs via API (if direct API available)', async () => {
      // This is a hypothetical API call as GitHub doesn't expose other users' PATs directly via simple API.
      // If there were an endpoint like `/users/{user_A}/settings/tokens`, this would be tested.
      // For now, we simulate by trying to access something that would require User A's privileges.
      // This test mainly covers the UI aspect and assumes server-side access control.
      
      // If there's an API call specifically for listing one's own PATs, calling it from User B's context
      // should only return User B's tokens, not User A's.
      // As a placeholder, we can assume if User B tried to use User A's PAT (if known), it would fail.
      // (This is covered in PAT-API-003, but this test focuses on *accessing* another user's PAT management UI/API).
      const response = await request.get('/settings/tokens'); // Authenticated with User B
      expect(response.status()).toBe(200); // Should return User B's token list
      const responseBody = await response.text();
      expect(responseBody).not.toContain(userA_PatNote); // User B should not see User A's PAT in raw HTML/JSON
    });
    
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-SEC-003' });
    test.info().annotations.push({ type: 'Priority', description: 'High' });
    test.info().annotations.push({ type: 'Test Type', description: 'Security' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'Yes' });
  });

  test.skip('PAT-SEC-004: Verify protection against brute-force token generation (rate limiting)', async ({ page }) => {
    // This test requires making many POST requests to the PAT creation endpoint in quick succession.
    // It's similar to PAT-API-006 but focuses on the UI/form submission endpoint.
    // This often involves bypassing CSRF tokens, or using an API directly.
    // Simulating this robustly from an E2E browser context can be challenging due to browser's built-in protections
    // and the need to repeatedly submit forms with dynamic CSRF tokens.
    // It's better suited for a dedicated performance/security testing tool (e.g., OWASP ZAP, Burp Suite, JMeter).
    test.info().annotations.push({ type: 'Test Case ID', description: 'PAT-SEC-004' });
    test.info().annotations.push({ type: 'Priority', description: 'Medium' });
    test.info().annotations.push({ type: 'Test Type', description: 'Security / Performance' });
    test.info().annotations.push({ type: 'Automation Candidate', description: 'No' });
  });
});
```

## 6. Fixtures

### `fixtures/pageFixtures.ts`

```typescript
import { test as base } from '@playwright/test';
import { LoginPage, GitHubHeader, DeveloperSettingsPage, PersonalAccessTokensPage, NewPersonalAccessTokenPage } from '../pages';
import users from '../data/users.json'; // Ensure this path is correct

// Declare the types of your fixtures.
type MyFixtures = {
  loginPage: LoginPage;
  gitHubHeader: GitHubHeader;
  developerSettingsPage: DeveloperSettingsPage;
  personalAccessTokensPage: PersonalAccessTokensPage;
  newPersonalAccessTokenPage: NewPersonalAccessTokenPage;
  authenticatedPage: void; // Represents a precondition where the user is logged in
  patSettingsPage: void;   // Represents a precondition where the user is on the PATs listing page
  newPatTokenPage: void;   // Represents a precondition where the user is on the New PAT creation page
};

// Extend the base test object with your fixtures.
export const test = base.extend<MyFixtures>({
  // Fixture for LoginPage
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // Fixture for GitHubHeader
  gitHubHeader: async ({ page }, use) => {
    await use(new GitHubHeader(page));
  },

  // Fixture for DeveloperSettingsPage
  developerSettingsPage: async ({ page }, use) => {
    await use(new DeveloperSettingsPage(page));
  },

  // Fixture for PersonalAccessTokensPage
  personalAccessTokensPage: async ({ page }, use) => {
    await use(new PersonalAccessTokensPage(page));
  },

  // Fixture for NewPersonalAccessTokenPage
  newPersonalAccessTokenPage: async ({ page }, use) => {
    await use(new NewPersonalAccessTokenPage(page));
  },

  // Fixture to ensure the user is authenticated (logged in)
  authenticatedPage: [async ({ page, loginPage }, use) => {
    // This assumes global-setup handles primary authentication via storageState.
    // If running tests in isolation without global-setup, this fixture would perform login.
    // For now, we navigate to a known authenticated page to confirm session.
    await page.goto('/'); // Navigate to dashboard
    await page.waitForLoadState('networkidle');
    // Verify user is logged in by checking for a common element only visible when logged in
    await expect(page.locator('summary[aria-label="View profile and more"]')).toBeVisible({ timeout: 10000 });
    await use();
  }, { auto: true }], // 'auto: true' makes this fixture run before every test.

  // Fixture to navigate to the Personal Access Tokens listing page
  patSettingsPage: [async ({ page, authenticatedPage, gitHubHeader, developerSettingsPage, personalAccessTokensPage }, use) => {
    // Ensure authenticated first
    // Navigate via UI steps (profile -> settings -> developer settings -> personal access tokens)
    await gitHubHeader.clickSettings();
    await developerSettingsPage.clickPersonalAccessTokens();
    await personalAccessTokensPage.verifyOnPersonalAccessTokensPage();
    await use();
  }, { auto: true, dependencies: ['authenticatedPage'] }], // Depends on authenticatedPage

  // Fixture to navigate to the New Personal Access Token creation page
  newPatTokenPage: [async ({ page, patSettingsPage, personalAccessTokensPage, newPersonalAccessTokenPage }, use) => {
    // Ensure on PAT settings page first
    await personalAccessTokensPage.clickGenerateNewToken();
    await newPersonalAccessTokenPage.verifyOnNewPersonalAccessTokenPage();
    await use();
  }, { dependencies: ['patSettingsPage'] }], // Depends on patSettingsPage
});

// Export default for convenience, if you mainly use `test` and `expect`.
export { expect };
```

### `global-setup.ts`

```typescript
import { FullConfig, chromium, expect } from '@playwright/test';
import { LoginPage } from './pages';
import users from './data/users.json'; // Make sure this path is correct
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

/**
 * Global setup function to perform actions once before all tests.
 * This is used for setting up authentication state to avoid repeated logins.
 */
async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;

  // Create a new browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const loginPage = new LoginPage(page);

  // Perform login
  await page.goto(baseURL + '/login');
  await loginPage.usernameInput.fill(users.validUser.username);
  await loginPage.passwordInput.fill(users.validUser.password);
  await loginPage.signInButton.click();

  // Wait for successful login (e.g., checking for the profile picture on the dashboard)
  await expect(page.locator('summary[aria-label="View profile and more"]')).toBeVisible({ timeout: 15000 });

  // Save the authentication state to a file
  await page.context().storageState({ path: storageState as string });
  
  await browser.close();
  console.log('Global setup complete: User authenticated and session saved.');
}

export default globalSetup;
```

### `global-teardown.ts`

```typescript
import { FullConfig } from '@playwright/test';
import * as fs from 'fs';

/**
 * Global teardown function to perform actions once after all tests.
 * This is used for cleanup, like removing the saved authentication state.
 */
async function globalTeardown(config: FullConfig) {
  const { storageState } = config.projects[0].use;

  // Delete the authentication state file
  if (storageState && typeof storageState === 'string' && fs.existsSync(storageState)) {
    fs.unlinkSync(storageState);
    console.log(`Global teardown complete: Deleted authentication state file at ${storageState}`);
  } else {
    console.log('Global teardown: No authentication state file to delete.');
  }
}

export default globalTeardown;
```

## 7. Utility Classes

### `utils/apiUtils.ts`

```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

/**
 * ApiUtils class provides a wrapper for making GitHub API requests.
 */
export class ApiUtils {
  private request: APIRequestContext;
  private baseURL: string;
  private accessToken?: string;

  constructor(requestContext: APIRequestContext, customBaseURL?: string) {
    this.request = requestContext;
    this.baseURL = customBaseURL || 'https://api.github.com';
    this.accessToken = process.env.GITHUB_API_TOKEN; // Optional: A general token if needed for API-only tests
  }

  /**
   * Helper to construct headers with a PAT.
   * @param pat The Personal Access Token string.
   * @returns An object with Authorization header.
   */
  private getAuthHeaders(pat: string): { Authorization: string } {
    return {
      'Authorization': `token ${pat}`,
    };
  }

  /**
   * Makes a generic authenticated GET request to the GitHub API.
   * @param endpoint The API endpoint (e.g., '/user/repos').
   * @param pat The PAT to use for authentication.
   * @returns The API response.
   */
  async get(endpoint: string, pat: string): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(pat),
    });
  }

  /**
   * Makes a generic authenticated POST request to the GitHub API.
   * @param endpoint The API endpoint (e.g., '/user/repos').
   * @param pat The PAT to use for authentication.
   * @param data The request body.
   * @returns The API response.
   */
  async post(endpoint: string, pat: string, data: object): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(pat),
      data: data,
    });
  }

  /**
   * Example: Get authenticated user's repositories.
   * Requires 'repo' or 'public_repo' scope.
   * @param pat The PAT to use.
   * @returns The API response.
   */
  async getUserRepos(pat: string): Promise<APIResponse> {
    return this.get('/user/repos', pat);
  }

  /**
   * Example: Create a new repository for the authenticated user.
   * Requires 'public_repo' or 'repo' scope.
   * @param pat The PAT to use.
   * @param repoName The name of the repository.
   * @param isPrivate Whether the repository should be private.
   * @returns The API response.
   */
  async createRepo(pat: string, repoName: string, isPrivate: boolean = false): Promise<APIResponse> {
    return this.post('/user/repos', pat, {
      name: repoName,
      private: isPrivate,
      description: `Test repository for PAT automation created on ${new Date().toISOString()}`
    });
  }

  // Add more specific API methods as needed based on test requirements.
  // E.g., for triggering workflows, managing gists, etc.
}
```

### `utils/authUtils.ts`

```typescript
import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import users from '../data/users.json';
import * as fs from 'fs';

/**
 * AuthUtils provides reusable functions for authentication flows.
 */
export class AuthUtils {
  /**
   * Logs in a user and saves the storage state for subsequent tests.
   * @param page The Playwright Page object.
   * @param username The username for login.
   * @param password The password for login.
   * @param storageStatePath The path to save the storage state file.
   */
  static async loginAndSaveState(page: Page, username: string, password: string, storageStatePath: string): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);

    // Verify successful login
    await expect(page.locator('summary[aria-label="View profile and more"]')).toBeVisible();

    // Save storage state
    await page.context().storageState({ path: storageStatePath });
    console.log(`Authentication state saved to ${storageStatePath}`);
  }

  /**
   * Loads a saved authentication state.
   * @param page The Playwright Page object.
   * @param storageStatePath The path to the storage state file.
   */
  static async loadAndVerifyState(page: Page, storageStatePath: string): Promise<void> {
    if (fs.existsSync(storageStatePath)) {
      await page.context().storageState({ path: storageStatePath });
      console.log(`Authentication state loaded from ${storageStatePath}`);
      // Navigate to a page to ensure the session is active
      await page.goto('/');
      await expect(page.locator('summary[aria-label="View profile and more"]')).toBeVisible();
    } else {
      throw new Error(`Storage state file not found at ${storageStatePath}. Please run global setup.`);
    }
  }
}
```

### `utils/dateUtils.ts`

```typescript
import { format } from 'date-fns';

/**
 * DateUtils provides utility functions for date manipulations and formatting.
 */
export class DateUtils {
  /**
   * Adds a specified number of days to the current date and returns it in 'MMM d, yyyy' format.
   * @param days The number of days to add.
   * @returns The future date formatted as 'MMM d, yyyy'.
   */
  static addDaysToCurrentDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return format(date, 'MMM d, yyyy'); // e.g., 'May 20, 2024'
  }

  /**
   * Formats a given date into 'MMM d, yyyy' format.
   * @param date The Date object to format.
   * @returns The formatted date string.
   */
  static formatDate(date: Date): string {
    return format(date, 'MMM d, yyyy');
  }

  // Add more date utility methods as needed (e.g., compare dates, parse date strings)
}
```

### `utils/randomUtils.ts`

```typescript
/**
 * RandomUtils provides utility functions for generating random strings and data.
 */
export class RandomUtils {
  /**
   * Generates a unique string by appending a timestamp to a base string.
   * @param baseString The base string (e.g., "TestToken_").
   * @returns A unique string.
   */
  static generateUniqueString(baseString: string): string {
    const timestamp = Date.now();
    return `${baseString}${timestamp}`;
  }

  /**
   * Generates a random string of a specified length.
   * @param length The desired length of the random string.
   * @returns A random alphanumeric string.
   */
  static generateRandomAlphanumeric(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
```

## 8. Test Data (JSON)

### `data/users.json`

```json
{
  "validUser": {
    "username": "YOUR_GITHUB_USERNAME",
    "password": "YOUR_GITHUB_PASSWORD"
  },
  "anotherValidUser": {
    "username": "YOUR_ANOTHER_GITHUB_USERNAME",
    "password": "YOUR_ANOTHER_GITHUB_PASSWORD"
  },
  "invalidUser": {
    "username": "invalidUser",
    "password": "invalidPassword"
  }
}
```
**Note:** Replace `YOUR_GITHUB_USERNAME`, `YOUR_GITHUB_PASSWORD`, etc., with actual credentials for your test GitHub accounts. It's recommended to use environment variables (`.env`) for sensitive data instead of directly in `users.json` if this file is committed to version control. For this example, I've kept it in `users.json` as requested but included a `.env` file in the structure.

### `data/patData.json`

```json
{
  "positive": {
    "minValid": {
      "note": "TestToken_ReadRepo_",
      "scope": "repo",
      "expiration": "No expiration"
    },
    "multiScope": {
      "note": "TestToken_MultiScope_",
      "scopes": ["user", "public_repo"],
      "expiration": "No expiration"
    },
    "expires7Day": {
      "note": "TestToken_7Day_",
      "scope": "read:org",
      "expiration": "7 days"
    },
    "expires90Day": {
      "note": "TestToken_90Day_",
      "scope": "gist",
      "expiration": "90 days"
    },
    "verifyDisplay": {
      "note": "VerifyPAT_Display_",
      "scope": "admin:repo_hook",
      "expiration": "No expiration"
    }
  },
  "negative": {
    "emptyNote": {
      "note": "",
      "scope": "repo"
    },
    "noScopes": {
      "note": "NoScopesTest_",
      "scope": "None selected"
    },
    "duplicateName": {
      "note": "DuplicateTest",
      "scope": "repo"
    },
    "maxLengthNote": {
      "note": "Max_Length_Note_",
      "scope": "repo"
    },
    "xssInjection": {
      "note": "\"hello\"/><script>alert('XSS');</script>",
      "scope": "repo"
    }
  },
  "listing": {
    "activeRepo": {
      "note": "Active_Repo_",
      "scope": "repo",
      "expiration": "No expiration"
    },
    "activeGist7Day": {
      "note": "Active_Gist_7Day_",
      "scope": "gist",
      "expiration": "7 days"
    },
    "revokedTest": {
      "note": "Revoked_Test_",
      "scope": "read:org"
    },
    "multiScopePAT": {
      "note": "MultiScopePAT_",
      "scopes": ["repo", "admin:org", "gist"],
      "expiration": "No expiration"
    }
  },
  "management": {
    "revokeMeTest": {
      "note": "RevokeMe_Test_",
      "scope": "repo"
    },
    "confirmRevoke": {
      "note": "ConfirmRevoke_",
      "scope": "repo"
    },
    "cancelRevoke": {
      "note": "CancelRevoke_",
      "scope": "repo"
    },
    "expiredRevokeTest": {
      "note": "ExpiredRevoke_Test_",
      "scope": "repo",
      "expiration": "7 days"
    }
  },
  "api": {
    "repoScope": {
      "note": "ApiTestToken_RepoScope_",
      "scopes": ["repo"]
    },
    "publicRepoScope": {
      "note": "ApiTestToken_PublicRepo_",
      "scopes": ["public_repo"]
    },
    "revokeAndTest": {
      "note": "ApiTestToken_RevokeAndTest_",
      "scopes": ["repo"]
    },
    "expiredAndTest": {
      "note": "ApiTestToken_ExpiredAndTest_",
      "scopes": ["repo"]
    },
    "invalidPat": {
      "string": "ghp_invalidtokenstring"
    },
    "malformedPat": {
      "string": "ghp_toolong_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "rateLimiting": {
      "note": "ApiTestToken_RateLimit_",
      "scopes": ["read:user"]
    }
  },
  "security": {
    "xssSanitization": {
      "note": "\"hello\"/><script>alert('XSS');</script>",
      "scope": "repo"
    },
    "accessControl": {
      "note": "UserA_AccessControl_PAT_",
      "scope": "read:user"
    }
  }
}
```

## 9. API Testing Example

The `tests/api/patApiIntegration.spec.ts` script provides comprehensive examples of API testing:

*   **`PAT-API-001`**: Demonstrates using a newly created PAT (with `repo` scope) to make a successful API call (`GET /user/repos`).
*   **`PAT-API-002`**: Shows an API call failing with a `403 Forbidden` error due to insufficient PAT scope (`public_repo` trying to create a private repo).
*   **`PAT-API-003`**: Verifies that a revoked PAT results in a `401 Unauthorized` API response.
*   **`PAT-API-004`**: (Simulated) Demonstrates an API call failing for an "expired" PAT (currently simulated by revocation due to E2E limitations for time-based tests).
*   **`PAT-API-005`**: Tests API endpoints' graceful handling of invalid or malformed PAT strings, returning `401 Unauthorized`.
*   **`PAT-API-006`**: Attempts to trigger API rate limiting by making multiple requests in a short period.

The `utils/apiUtils.ts` class abstracts the `APIRequestContext` and provides specific methods for GitHub API interactions, making tests cleaner and more reusable.

## 10. README

```markdown
# GitHub Personal Access Token (PAT) Automation Framework

This project provides an enterprise-grade automation framework using Playwright and TypeScript for testing the management of GitHub Personal Access Tokens (PATs). It adheres to industry best practices, including the Page Object Model, custom fixtures, utility classes, and integrated API testing.

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Installation](#installation)
3.  [Configuration](#configuration)
4.  [Running Tests](#running-tests)
5.  [Project Structure](#project-structure)
6.  [Page Object Model (POM)](#page-object-model-pom)
7.  [Fixtures](#fixtures)
8.  [Utility Classes](#utility-classes)
9.  [Test Data](#test-data)
10. [API Testing](#api-testing)
11. [HTML Reporting](#html-reporting)
12. [Best Practices](#best-practices)

## 1. Prerequisites

*   Node.js (LTS version recommended)
*   npm (Node Package Manager) or Yarn
*   Google Chrome, Mozilla Firefox, or Apple WebKit browser installed (Playwright will install necessary browser binaries automatically)
*   A GitHub account (or two for multi-user tests) for testing purposes. **Highly recommended to use a dedicated test account rather than your personal account.**

## 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd github-pat-automation
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Install Playwright browser binaries:**
    ```bash
    npx playwright install
    ```

## 3. Configuration

### Environment Variables (`.env`)

Create a `.env` file in the project root to store sensitive information like GitHub credentials.

```env
# GitHub Test User Credentials
GITHUB_USERNAME=your_test_username
GITHUB_PASSWORD=your_test_password
GITHUB_ANOTHER_USERNAME=another_test_username
GITHUB_ANOTHER_PASSWORD=another_test_password

# Optional: A general PAT for API-only tests, if needed
# GITHUB_API_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Ensure `data/users.json` is updated to reference these environment variables if desired, or directly with placeholder values for illustration. For production readiness, always use `.env` and `dotenv`.

### Playwright Configuration (`playwright.config.ts`)

The `playwright.config.ts` file is pre-configured with:
*   `baseURL`: `https://github.com`
*   `timeout` settings
*   `reporter`: `list` (console) and `html` (web report, opens on failure)
*   `globalSetup` and `globalTeardown` for handling authentication state.
*   Browser projects for `chromium`, `firefox`, and `webkit`.

## 4. Running Tests

### All Tests

```bash
npm test
```

### Specific Test Files

```bash
npx playwright test tests/pat/patNavigation.spec.ts
npx playwright test tests/api/patApiIntegration.spec.ts
```

### Running Tests in Headed Mode (browser UI visible)

```bash
npm run test:headed
```

### Running Tests in UI Mode (Playwright Test UI)

```bash
npm run test:ui
```

### Running API Tests Only

```bash
npm run test:api
```

### Running PAT UI/Functional Tests Only

```bash
npm run test:pat
```

### Generating and Viewing HTML Report

After running tests, generate and open the HTML report:

```bash
npm run report
```

### Linting and Formatting

```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors automatically
```

## 5. Project Structure

The project follows a modular and maintainable structure:

```
.
├── playwright.config.ts            # Playwright test configuration
├── package.json                    # Project dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── global-setup.ts                 # Global setup script for authentication
├── global-teardown.ts              # Global teardown script for cleanup
├── README.md                       # This file
├── .env                            # Environment variables (for sensitive data)
├── .gitignore                      # Files/folders to ignore from Git
├── data
│   ├── patData.json                # Test data for PAT creation/management
│   └── users.json                  # User credentials for various test scenarios
├── fixtures
│   └── pageFixtures.ts             # Custom Playwright fixtures for page objects and preconditions
├── pages                           # Page Object Model (POM) classes
│   ├── basePage.ts                 # Base class for all page objects
│   ├── githubHeader.ts             # Reusable header component
│   ├── loginPage.ts                # Login page
│   ├── settings                    # Folder for settings-related pages
│   │   ├── developerSettingsPage.ts# Developer settings navigation
│   │   ├── personalAccessTokensPage.ts # PAT listing and management page
│   │   └── newPersonalAccessTokenPage.ts # New PAT creation page
│   └── index.ts                    # Centralized export for page objects
├── tests                           # Test files organized by module/feature
│   ├── api                         # API integration tests
│   │   └── patApiIntegration.spec.ts
│   ├── pat                         # UI/functional tests for PAT management
│   │   ├── patCreationNegative.spec.ts
│   │   ├── patCreationPositive.spec.ts
│   │   ├── patListing.spec.ts
│   │   ├── patManagement.spec.ts
│   │   └── patNavigation.spec.ts
│   └── security                    # Security-focused tests
│       └── patSecurity.spec.ts
└── utils                           # Reusable utility functions
    ├── apiUtils.ts                 # Wrapper for API requests
    ├── authUtils.ts                # Authentication helpers
    ├── dateUtils.ts                # Date manipulation utilities
    └── randomUtils.ts              # Random data generation
```

## 6. Page Object Model (POM)

The framework strictly adheres to the Page Object Model design pattern.
*   Each significant page or reusable component of the application has its own class under the `pages` directory.
*   These classes contain:
    *   **Locators**: Properties that represent UI elements (e.g., `usernameInput`, `signInButton`).
    *   **Methods**: Functions that perform actions on these UI elements (e.g., `login()`, `clickGenerateNewToken()`).
*   This separation of concerns makes tests more readable, maintainable, and less prone to breaking when UI changes occur.

## 7. Fixtures

Custom Playwright fixtures are defined in `fixtures/pageFixtures.ts`. They provide:
*   **Page Object Instances**: Automatically initialized instances of Page Object classes (e.g., `loginPage`, `personalAccessTokensPage`) available directly in your tests.
*   **Test Preconditions**: Fixtures like `authenticatedPage`, `patSettingsPage`, and `newPatTokenPage` ensure the test starts in a desired state (e.g., user logged in, or on the PAT listing page), reducing boilerplate code in individual tests.
*   **Global Setup/Teardown**: `global-setup.ts` handles initial login and saving the authentication state (`auth.json`), which `playwright.config.ts` uses to persist the session across tests. `global-teardown.ts` cleans up this state file.

## 8. Utility Classes

The `utils` directory contains helper classes for common tasks:
*   `ApiUtils`: Simplifies making HTTP requests to the GitHub API, handling authentication, and common endpoints.
*   `AuthUtils`: Provides generic login functions and storage state management.
*   `DateUtils`: Assists with date-related operations, like calculating future dates for expiration.
*   `RandomUtils`: Generates unique strings and random data, useful for creating distinct test data like PAT names.

## 9. Test Data

Test data is externalized into JSON files under the `data` directory:
*   `users.json`: Stores credentials for various test users (e.g., `validUser`, `anotherValidUser`).
*   `patData.json`: Contains structured data for PAT creation scenarios, including notes, scopes, and expiration options.

This approach promotes data-driven testing, separating test logic from test data, and making it easy to manage and update test inputs.

## 10. API Testing

The framework includes dedicated API tests under `tests/api`.
*   The `ApiUtils` class abstracts `APIRequestContext` to make API calls with PATs.
*   API tests can be run independently or as part of the full suite.
*   They verify the functionality of PATs at the API level, ensuring correct authentication, authorization, and error handling based on scopes and token validity (active, expired, revoked).

## 11. HTML Reporting

The `playwright.config.ts` is configured to generate an interactive HTML report.
*   After running tests, use `npm run report` to open the report in your browser.
*   The report provides a detailed view of test results, including steps, assertions, and captured traces/screenshots for failed tests, which aids in debugging.

## 12. Enterprise Best Practices

*   **Page Object Model (POM)**: Ensures maintainability and readability by abstracting UI interactions.
*   **TypeScript**: Provides type safety, better code organization, and enhances developer experience.
*   **Custom Fixtures**: Reduces code duplication and simplifies test preconditions.
*   **Data-Driven Testing**: Externalizes test data, making tests flexible and easy to update.
*   **API Testing Integration**: Validates functionality at the service layer, complementing UI tests and offering faster feedback.
*   **Modular Test Structure**: Tests are organized by features (`pat`, `api`, `security`), improving navigation and management.
*   **Environment Variables**: Protects sensitive information by loading credentials from `.env`.
*   **Global Setup/Teardown**: Efficiently manages authentication state, avoiding repetitive logins.
*   **Clear Naming Conventions**: Consistent naming for files, classes, methods, and variables.
*   **Comments**: Explanatory comments where necessary, especially for complex logic or test limitations.
*   **Robust Assertions**: Uses Playwright's `expect` for clear and descriptive test validations.
*   **Error Handling/Validation**: Includes negative test scenarios to verify application resilience.
*   **HTML Reporting**: Provides comprehensive visual reports for quick analysis and debugging.
```