```markdown
# Playwright Enterprise Automation Framework

This framework provides a robust and scalable solution for automating web and API testing using Playwright with TypeScript, following the Page Object Model (POM) and enterprise best practices.

## 1. Project Structure

```
.
├── playwright-report/                  # Playwright HTML report output
├── test-results/                       # Test execution artifacts (screenshots, videos)
├── tests/
│   ├── api/
│   │   └── retailerApi.spec.ts         # API test scripts
│   ├── e2e/
│   │   └── retailer/
│   │       └── createRetailer.spec.ts  # End-to-end UI test scripts
│   └── fixtures/
│       └── customFixtures.ts           # Custom Playwright test fixtures
├── pages/
│   ├── basePage.ts                     # Base class for all page objects
│   ├── common/
│   │   └── navigationBar.ts            # Common navigation components
│   ├── dashboardPage.ts                # Dashboard page object
│   ├── loginPage.ts                    # Login page object
│   ├── retailers/
│   │   ├── createRetailerPage.ts       # Create Retailer page object (US-002 focus)
│   │   └── retailersPage.ts            # Retailers List page object
├── data/
│   └── retailerData.json               # Test data for retailers
├── utils/
│   ├── apiClient.ts                    # Utility for making API requests
│   ├── commonUtils.ts                  # Generic utility functions
│   └── dataGenerator.ts                # Utility for generating dynamic test data
├── .env                                # Environment variables (e.g., base URL, credentials)
├── .gitignore                          # Specifies intentionally untracked files to ignore
├── package.json                        # Project dependencies and scripts
├── playwright.config.ts                # Playwright configuration file
├── tsconfig.json                       # TypeScript configuration
└── README.md                           # Project README file
```

## 2. package.json

```json
{
  "name": "enterprise-playwright-framework",
  "version": "1.0.0",
  "description": "Enterprise Playwright Automation Framework for US-002 - Create Retailer",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:specific": "playwright test tests/e2e/retailer/createRetailer.spec.ts",
    "test:api": "playwright test tests/api/retailerApi.spec.ts",
    "test:report": "playwright show-report",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix"
  },
  "keywords": [
    "Playwright",
    "TypeScript",
    "Automation",
    "E2E",
    "API",
    "POM",
    "Enterprise"
  ],
  "author": "Your Name/Team",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.45.3",
    "@types/node": "^20.14.12",
    "@typescript-eslint/eslint-plugin": "^7.16.1",
    "@typescript-eslint/parser": "^7.16.1",
    "dotenv": "^16.4.5",
    "eslint": "^8.57.0",
    "eslint-plugin-playwright": "^1.2.0",
    "typescript": "^5.5.4"
  }
}
```

## 3. playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Path to the test files
  testDir: './tests',
  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: 'test-results',
  // Global setup file to run once before all tests
  // globalSetup: require.resolve('./global-setup'),

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
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'], // Console reporter
    // ['json', { outputFile: 'test-results/test-results.json' }],
    // ['junit', { outputFile: 'test-results/test-results.xml' }],
  ],

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Fallback to localhost if not set

    // Collect trace when retrying the first time. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    // Record video on failure
    video: 'on-first-retry',

    // Configure credentials for API requests
    extraHTTPHeaders: {
      'Accept': 'application/json',
      // Add authorization token if needed for API tests
      // 'Authorization': `Bearer ${process.env.API_TOKEN}`,
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

  // Set timeout for each test in milliseconds.
  timeout: 60 * 1000, // 60 seconds
  // Set expect timeout
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
});
```

## 4. Page Objects

### `pages/basePage.ts`

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * BasePage provides common functionalities and elements for all page objects.
 * It ensures consistency and reduces code duplication.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly url: string;

  // Common elements that might appear on multiple pages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
    this.successMessage = page.locator('.alert-success, .toast-success');
    this.errorMessage = page.locator('.alert-danger, .toast-error');
    this.loadingSpinner = page.locator('.loading-spinner');
  }

  /**
   * Navigates to the page's URL.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /**
   * Waits for a network request to finish, optionally asserting its status.
   * @param urlSubstring Substring of the URL to wait for.
   * @param status Expected status code (e.g., 200, 201).
   */
  async waitForNetworkResponse(urlSubstring: string, status?: number): Promise<void> {
    await this.page.waitForResponse(response => {
      const isMatchingUrl = response.url().includes(urlSubstring);
      const isMatchingStatus = status ? response.status() === status : true;
      return isMatchingUrl && isMatchingStatus;
    });
  }

  /**
   * Waits for the loading spinner to disappear.
   */
  async waitForLoadState(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden' }).catch(() => {
      console.log('Loading spinner not found or already hidden.');
    });
    // Additionally wait for network idle to ensure all background tasks are done
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clicks a generic button by its text.
   * @param buttonText The text content of the button.
   */
  async clickButtonByText(buttonText: string): Promise<void> {
    await this.page.locator(`button:has-text("${buttonText}")`).click();
  }

  /**
   * Fills a text input field by its label.
   * @param labelText The text of the label associated with the input.
   * @param value The value to fill into the input.
   */
  async fillInputFieldByLabel(labelText: string, value: string): Promise<void> {
    await this.page.locator(`label:has-text("${labelText}") + input`).fill(value);
  }

  /**
   * Selects an option from a dropdown by its label.
   * @param labelText The text of the label associated with the select.
   * @param value The value attribute of the option to select.
   */
  async selectDropdownByLabel(labelText: string, value: string): Promise<void> {
    await this.page.locator(`label:has-text("${labelText}") + select`).selectOption(value);
  }
}
```

### `pages/common/navigationBar.ts`

```typescript
import { Locator, Page } from '@playwright/test';

/**
 * Represents the common navigation bar present across multiple pages.
 */
export class NavigationBar {
  readonly page: Page;
  readonly retailersLink: Locator;
  readonly dashboardLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.retailersLink = page.locator('nav a:has-text("Retailers")');
    this.dashboardLink = page.locator('nav a:has-text("Dashboard")');
    this.logoutButton = page.locator('nav button:has-text("Logout")');
  }

  /**
   * Clicks on the Retailers link in the navigation bar.
   */
  async clickRetailers(): Promise<void> {
    await this.retailersLink.click();
    await this.page.waitForURL('**/retailers');
  }

  /**
   * Clicks on the Dashboard link in the navigation bar.
   */
  async clickDashboard(): Promise<void> {
    await this.dashboardLink.click();
    await this.page.waitForURL('**/dashboard');
  }

  /**
   * Clicks the Logout button.
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForURL('**/login'); // Assuming logout redirects to login
  }
}
```

### `pages/loginPage.ts`

```typescript
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Represents the Login page of the application.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, '/login'); // Assuming login URL is /login
    this.usernameInput = page.locator('input[name="username"], input[id="username"]');
    this.passwordInput = page.locator('input[name="password"], input[id="password"]');
    this.loginButton = page.locator('button:has-text("Login")');
  }

  /**
   * Navigates to the login page.
   */
  async gotoLoginPage(): Promise<void> {
    await this.goto();
    await expect(this.page).toHaveURL(new RegExp(`${this.url}$`));
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Performs a login operation.
   * @param username The username to enter.
   * @param password The password to enter.
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForLoadState(); // Wait for any loading after login
  }

  /**
   * Checks if the login page is currently displayed.
   */
  async isLoginPageDisplayed(): Promise<boolean> {
    return await this.loginButton.isVisible();
  }
}
```

### `pages/dashboardPage.ts`

```typescript
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { NavigationBar } from './common/navigationBar';

/**
 * Represents the Dashboard page after a successful login.
 */
export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly navigationBar: NavigationBar;

  constructor(page: Page) {
    super(page, '/dashboard'); // Assuming dashboard URL is /dashboard
    this.welcomeMessage = page.locator('h1:has-text("Welcome")');
    this.navigationBar = new NavigationBar(page);
  }

  /**
   * Verifies that the dashboard page is displayed.
   */
  async verifyDashboardIsDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.url}$`));
    await expect(this.welcomeMessage).toBeVisible();
  }
}
```

### `pages/retailers/retailersPage.ts`

```typescript
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../basePage';
import { NavigationBar } from '../common/navigationBar';

/**
 * Represents the Retailers List page.
 * From here, users can view existing retailers, search, or navigate to create a new one.
 */
export class RetailersPage extends BasePage {
  readonly pageTitle: Locator;
  readonly addNewRetailerButton: Locator;
  readonly searchInput: Locator;
  readonly retailerTable: Locator;
  readonly navigationBar: NavigationBar;

  constructor(page: Page) {
    super(page, '/retailers'); // Assuming retailers list URL is /retailers
    this.pageTitle = page.locator('h1:has-text("Retailers")');
    this.addNewRetailerButton = page.locator('button:has-text("Add New Retailer")');
    this.searchInput = page.locator('input[placeholder="Search Retailers"]');
    this.retailerTable = page.locator('table#retailers-table');
    this.navigationBar = new NavigationBar(page);
  }

  /**
   * Navigates to the Retailers list page.
   */
  async gotoRetailersPage(): Promise<void> {
    await this.goto();
    await expect(this.page).toHaveURL(new RegExp(`${this.url}$`));
    await expect(this.pageTitle).toBeVisible();
    await this.waitForLoadState();
  }

  /**
   * Clicks the "Add New Retailer" button.
   */
  async clickAddNewRetailer(): Promise<void> {
    await this.addNewRetailerButton.click();
    await this.page.waitForURL('**/retailers/create'); // Assuming create page URL
  }

  /**
   * Searches for a retailer by name.
   * @param retailerName The name of the retailer to search for.
   */
  async searchRetailer(retailerName: string): Promise<void> {
    await this.searchInput.fill(retailerName);
    await this.page.keyboard.press('Enter'); // Assuming search is triggered by Enter or auto-updates
    await this.waitForLoadState();
  }

  /**
   * Checks if a retailer is present in the table.
   * @param retailerName The name of the retailer to check.
   */
  async isRetailerPresentInTable(retailerName: string): Promise<boolean> {
    return await this.retailerTable.locator(`text=${retailerName}`).isVisible();
  }
}
```

### `pages/retailers/createRetailerPage.ts`

```typescript
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../basePage';

/**
 * Represents the "Create New Retailer" page (US-002).
 */
export class CreateRetailerPage extends BasePage {
  readonly pageTitle: Locator;
  readonly retailerNameInput: Locator;
  readonly retailerCodeInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipCodeInput: Locator;
  readonly countrySelect: Locator;
  readonly contactPersonInput: Locator;
  readonly contactEmailInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly statusActiveRadio: Locator;
  readonly statusInactiveRadio: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page, '/retailers/create'); // Assuming create retailer URL
    this.pageTitle = page.locator('h1:has-text("Create New Retailer")');
    this.retailerNameInput = page.locator('input[name="retailerName"], #retailerName');
    this.retailerCodeInput = page.locator('input[name="retailerCode"], #retailerCode');
    this.address1Input = page.locator('input[name="address1"], #address1');
    this.address2Input = page.locator('input[name="address2"], #address2');
    this.cityInput = page.locator('input[name="city"], #city');
    this.stateSelect = page.locator('select[name="state"], #state');
    this.zipCodeInput = page.locator('input[name="zipCode"], #zipCode');
    this.countrySelect = page.locator('select[name="country"], #country');
    this.contactPersonInput = page.locator('input[name="contactPerson"], #contactPerson');
    this.contactEmailInput = page.locator('input[name="contactEmail"], #contactEmail');
    this.contactPhoneInput = page.locator('input[name="contactPhone"], #contactPhone');
    this.statusActiveRadio = page.locator('input[name="status"][value="active"]');
    this.statusInactiveRadio = page.locator('input[name="status"][value="inactive"]');
    this.submitButton = page.locator('button:has-text("Create Retailer")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  /**
   * Navigates to the create retailer page.
   */
  async gotoCreateRetailerPage(): Promise<void> {
    await this.goto();
    await expect(this.page).toHaveURL(new RegExp(`${this.url}$`));
    await expect(this.pageTitle).toBeVisible();
    await this.waitForLoadState();
  }

  /**
   * Fills the retailer creation form.
   * @param retailerData Object containing retailer details.
   */
  async fillRetailerForm(retailerData: {
    name: string;
    code: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    status: 'active' | 'inactive';
  }): Promise<void> {
    await this.retailerNameInput.fill(retailerData.name);
    await this.retailerCodeInput.fill(retailerData.code);
    await this.address1Input.fill(retailerData.address1);
    if (retailerData.address2) {
      await this.address2Input.fill(retailerData.address2);
    }
    await this.cityInput.fill(retailerData.city);
    await this.stateSelect.selectOption({ label: retailerData.state });
    await this.zipCodeInput.fill(retailerData.zipCode);
    await this.countrySelect.selectOption({ label: retailerData.country });
    await this.contactPersonInput.fill(retailerData.contactPerson);
    await this.contactEmailInput.fill(retailerData.contactEmail);
    await this.contactPhoneInput.fill(retailerData.contactPhone);

    if (retailerData.status === 'active') {
      await this.statusActiveRadio.check();
    } else {
      await this.statusInactiveRadio.check();
    }
  }

  /**
   * Submits the retailer creation form.
   */
  async submitForm(): Promise<void> {
    // Wait for the POST request to /api/retailers to complete with a 201 status
    await Promise.all([
      this.page.waitForResponse(response =>
        response.url().includes('/api/retailers') && response.status() === 201
      ),
      this.submitButton.click(),
    ]);
    await this.waitForLoadState(); // Ensure all post-submission rendering is complete
  }

  /**
   * Clicks the cancel button.
   */
  async cancelForm(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForURL('**/retailers'); // Assuming cancel redirects to retailers list
  }

  /**
   * Gets a validation error message for a specific field.
   * @param fieldName The name of the input field (e.g., 'retailerName').
   */
  async getValidationErrorMessage(fieldName: string): Promise<string | null> {
    const errorLocator = this.page.locator(`[data-qa="${fieldName}-error"], [id="${fieldName}-error"]`);
    if (await errorLocator.isVisible()) {
      return await errorLocator.textContent();
    }
    return null;
  }
}
```

## 5. Playwright Test Scripts

### `tests/e2e/retailer/createRetailer.spec.ts`

```typescript
import { test, expect } from '../../fixtures/customFixtures';
import { DataGenerator } from '../../../utils/dataGenerator';
import retailerData from '../../../data/retailerData.json';

test.describe('US-002: Create New Retailer Functionality', () => {

  // Before each test, ensure we are authenticated and on the create retailer page
  test.beforeEach(async ({ authenticatedPage, retailersPage, createRetailerPage }) => {
    // Use the authenticatedPage fixture to ensure login
    await authenticatedPage.gotoRetailersPage();
    await retailersPage.clickAddNewRetailer();
    await expect(createRetailerPage.pageTitle).toBeVisible();
    await expect(authenticatedPage.page).toHaveURL(/.*\/retailers\/create/);
  });

  test('should successfully create a new retailer with valid data', async ({ authenticatedPage, createRetailerPage, retailersPage }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_US002_001' });
    test.info().annotations.push({ type: 'Requirement', description: 'US-002: Create Retailer' });
    test.info().annotations.push({ type: 'Severity', description: 'High' });
    test.info().annotations.push({ type: 'Priority', description: 'P1' });

    const newRetailer = DataGenerator.generateRetailerData();

    await test.step('Fill the retailer creation form with valid data', async () => {
      await createRetailerPage.fillRetailerForm(newRetailer);
      await expect(createRetailerPage.retailerNameInput).toHaveValue(newRetailer.name);
      await expect(createRetailerPage.contactEmailInput).toHaveValue(newRetailer.contactEmail);
    });

    await test.step('Submit the form and verify success', async () => {
      await createRetailerPage.submitForm();
      await expect(authenticatedPage.page).toHaveURL(/.*\/retailers$/); // Should redirect to retailers list
      await expect(createRetailerPage.successMessage).toBeVisible();
      await expect(createRetailerPage.successMessage).toContainText('Retailer created successfully');
    });

    await test.step('Verify the new retailer is visible in the retailers list', async () => {
      await retailersPage.searchRetailer(newRetailer.name);
      await expect(await retailersPage.isRetailerPresentInTable(newRetailer.name)).toBeTruthy();
      console.log(`Successfully created retailer: ${newRetailer.name}`);
    });
  });

  test('should display validation errors for empty required fields', async ({ createRetailerPage }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_US002_002' });
    test.info().annotations.push({ type: 'Requirement', description: 'US-002: Create Retailer' });
    test.info().annotations.push({ type: 'Severity', description: 'Medium' });
    test.info().annotations.push({ type: 'Priority', description: 'P2' });

    await test.step('Attempt to submit the form without filling any fields', async () => {
      await createRetailerPage.submitButton.click(); // Directly click submit
      await createRetailerPage.page.waitForLoadState('domcontentloaded'); // Ensure DOM is ready for error messages
    });

    await test.step('Verify validation messages are displayed for required fields', async () => {
      await expect(createRetailerPage.errorMessage).toBeHidden(); // Ensure no global error initially

      await expect(await createRetailerPage.getValidationErrorMessage('retailerName')).not.toBeNull();
      expect(await createRetailerPage.getValidationErrorMessage('retailerName')).toContain('Retailer Name is required');

      await expect(await createRetailerPage.getValidationErrorMessage('retailerCode')).not.toBeNull();
      expect(await createRetailerPage.getValidationErrorMessage('retailerCode')).toContain('Retailer Code is required');

      await expect(await createRetailerPage.getValidationErrorMessage('contactEmail')).not.toBeNull();
      expect(await createRetailerPage.getValidationErrorMessage('contactEmail')).toContain('Email is required');
    });
  });

  test('should display error for invalid email format', async ({ createRetailerPage }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_US002_003' });
    test.info().annotations.push({ type: 'Requirement', description: 'US-002: Create Retailer' });
    test.info().annotations.push({ type: 'Severity', description: 'Medium' });
    test.info().annotations.push({ type: 'Priority', description: 'P2' });

    const retailerData = DataGenerator.generateRetailerData();
    retailerData.contactEmail = 'invalid-email'; // Invalid email

    await test.step('Fill the form with invalid email', async () => {
      await createRetailerPage.fillRetailerForm(retailerData);
      await createRetailerPage.contactEmailInput.fill(retailerData.contactEmail); // Override with invalid email
    });

    await test.step('Submit the form', async () => {
      await createRetailerPage.submitButton.click();
      await createRetailerPage.page.waitForLoadState('domcontentloaded');
    });

    await test.step('Verify invalid email validation message', async () => {
      const emailErrorMessage = await createRetailerPage.getValidationErrorMessage('contactEmail');
      await expect(emailErrorMessage).not.toBeNull();
      expect(emailErrorMessage).toContain('Invalid email format');
    });
  });

  test('should cancel retailer creation and navigate back to retailers list', async ({ authenticatedPage, createRetailerPage }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_US002_004' });
    test.info().annotations.push({ type: 'Requirement', description: 'US-002: Create Retailer' });
    test.info().annotations.push({ type: 'Severity', description: 'Low' });
    test.info().annotations.push({ type: 'Priority', description: 'P3' });

    await test.step('Fill some data into the form (optional, but simulates user input)', async () => {
      const partialData = DataGenerator.generateRetailerData();
      await createRetailerPage.retailerNameInput.fill(partialData.name);
      await createRetailerPage.retailerCodeInput.fill(partialData.code);
    });

    await test.step('Click the cancel button', async () => {
      await createRetailerPage.cancelForm();
    });

    await test.step('Verify navigation back to the retailers list page', async () => {
      await expect(authenticatedPage.page).toHaveURL(/.*\/retailers$/);
      // Optional: Verify that the partially filled data was not saved (not visible on list)
    });
  });

  test('should display error for duplicate retailer code', async ({ authenticatedPage, createRetailerPage, request }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_US002_005' });
    test.info().annotations.push({ type: 'Requirement', description: 'US-002: Create Retailer - Unique Retailer Code' });
    test.info().annotations.push({ type: 'Severity', description: 'High' });
    test.info().annotations.push({ type: 'Priority', description: 'P1' });

    const existingRetailer = DataGenerator.generateRetailerData();

    await test.step('Pre-condition: Create a retailer via API to ensure a duplicate exists', async () => {
      const createResponse = await request.post('/api/retailers', { data: existingRetailer });
      expect(createResponse.ok()).toBeTruthy();
      expect(createResponse.status()).toBe(201);
      console.log(`Pre-created retailer via API for duplicate test: ${existingRetailer.code}`);
    });

    await test.step('Navigate to create retailer page for a new attempt', async () => {
      await authenticatedPage.page.goto('/retailers/create'); // Re-navigate in case previous test failed
      await createRetailerPage.waitForLoadState();
    });

    await test.step('Fill form with duplicate retailer code but unique name', async () => {
      const duplicateRetailerData = {
        ...DataGenerator.generateRetailerData(), // Get new unique data
        code: existingRetailer.code, // Use the duplicate code
        name: `Duplicate Test Retailer ${DataGenerator.generateUniqueId()}`, // Ensure name is unique to avoid name collision
      };
      await createRetailerPage.fillRetailerForm(duplicateRetailerData);
    });

    await test.step('Attempt to submit and verify duplicate error', async () => {
      await createRetailerPage.submitButton.click();
      await createRetailerPage.page.waitForLoadState('domcontentloaded');

      // Assuming server-side validation returns a global error message or a field-specific one
      await expect(createRetailerPage.errorMessage).toBeVisible();
      await expect(createRetailerPage.errorMessage).toContainText('Retailer Code already exists');
      await expect(authenticatedPage.page).toHaveURL(/.*\/retailers\/create/); // Should stay on the same page
    });
  });

  // Data-driven test example for creating multiple retailers
  retailerData.retailers.forEach((data, index) => {
    test(`Data-driven: should create retailer "${data.name}" (set ${index + 1})`, async ({ authenticatedPage, createRetailerPage, retailersPage }) => {
      test.info().annotations.push({ type: 'Test Case ID', description: `TC_US002_006_DD_${index + 1}` });
      test.info().annotations.push({ type: 'Requirement', description: 'US-002: Create Retailer (Data-Driven)' });
      test.info().annotations.push({ type: 'Severity', description: 'High' });
      test.info().annotations.push({ type: 'Priority', description: 'P1' });

      // Ensure a unique code for each run, even if data.json has static codes
      const uniqueRetailer = {
        ...data,
        code: `${data.code}-${DataGenerator.generateUniqueId()}`,
        contactEmail: DataGenerator.generateRandomEmail(),
      };

      await test.step('Fill retailer form with data from JSON', async () => {
        await createRetailerPage.fillRetailerForm(uniqueRetailer);
      });

      await test.step('Submit form and verify success', async () => {
        await createRetailerPage.submitForm();
        await expect(createRetailerPage.successMessage).toBeVisible();
        await expect(createRetailerPage.successMessage).toContainText('Retailer created successfully');
      });

      await test.step('Verify retailer in list', async () => {
        await retailersPage.gotoRetailersPage(); // Navigate back to list if not already there
        await retailersPage.searchRetailer(uniqueRetailer.name);
        await expect(await retailersPage.isRetailerPresentInTable(uniqueRetailer.name)).toBeTruthy();
        console.log(`Data-driven test: Retailer "${uniqueRetailer.name}" created successfully.`);
      });
    });
  });
});
```

## 6. Fixtures

### `tests/fixtures/customFixtures.ts`

```typescript
import { test as baseTest } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { DashboardPage } from '../../pages/dashboardPage';
import { RetailersPage } from '../../pages/retailers/retailersPage';
import { CreateRetailerPage } from '../../pages/retailers/createRetailerPage';

// Define the shape of our custom fixtures
type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  retailersPage: RetailersPage;
  createRetailerPage: CreateRetailerPage;
  authenticatedPage: {
    // This fixture ensures the user is logged in before tests run
    page: typeof baseTest['skip']['page']; // Represents a Playwright Page instance
    login: (username?: string, password?: string) => Promise<void>;
    gotoRetailersPage: () => Promise<void>;
  };
};

// Extend the base test with our custom fixtures
export const test = baseTest.extend<MyFixtures>({
  // Page object fixtures
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  retailersPage: async ({ page }, use) => {
    await use(new RetailersPage(page));
  },
  createRetailerPage: async ({ page }, use) => {
    await use(new CreateRetailerPage(page));
  },

  // Authenticated page fixture
  authenticatedPage: [
    async ({ page, loginPage, dashboardPage }, use) => {
      // Logic to ensure user is logged in
      const defaultUsername = process.env.USER_EMAIL || 'admin@example.com';
      const defaultPassword = process.env.USER_PASSWORD || 'password123';

      // Function to perform login
      const login = async (username = defaultUsername, password = defaultPassword) => {
        await loginPage.gotoLoginPage();
        await loginPage.login(username, password);
        await dashboardPage.verifyDashboardIsDisplayed(); // Ensure login was successful
      };

      // Ensure login is performed before tests run if not already authenticated
      // This check prevents re-login if context is already authenticated (e.g., from global setup)
      if (!(await dashboardPage.welcomeMessage.isVisible())) {
        await login();
      }

      // Add common navigation methods for convenience
      const gotoRetailersPage = async () => {
        await dashboardPage.navigationBar.clickRetailers();
      };

      await use({ page, login, gotoRetailersPage });
    },
    { scope: 'each' } // 'each' to run before each test, 'worker' for shared context per worker
  ],
});

export { expect } from '@playwright/test';
```

## 7. Utility Classes

### `utils/dataGenerator.ts`

```typescript
/**
 * Utility class for generating random and unique test data.
 */
export class DataGenerator {
  /**
   * Generates a unique ID (timestamp + random string).
   */
  static generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Generates a random string of a given length.
   * @param length The desired length of the string.
   */
  static generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Generates a random email address.
   */
  static generateRandomEmail(): string {
    return `test.user.${DataGenerator.generateUniqueId()}@example.com`;
  }

  /**
   * Generates random phone number.
   */
  static generateRandomPhoneNumber(): string {
    return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  /**
   * Generates a set of valid retailer data.
   */
  static generateRetailerData(): {
    name: string;
    code: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    status: 'active' | 'inactive';
  } {
    const uniqueId = DataGenerator.generateUniqueId();
    return {
      name: `Retailer Name ${uniqueId}`,
      code: `CODE-${uniqueId.substring(0, 8).toUpperCase()}`,
      address1: `123 Main St ${uniqueId.substring(0, 4)}`,
      address2: 'Suite 100',
      city: 'Anytown',
      state: 'California', // Assuming a dropdown with 'California'
      zipCode: '90210',
      country: 'United States', // Assuming a dropdown with 'United States'
      contactPerson: `Contact Person ${DataGenerator.generateRandomString(5)}`,
      contactEmail: DataGenerator.generateRandomEmail(),
      contactPhone: DataGenerator.generateRandomPhoneNumber(),
      status: 'active',
    };
  }
}
```

### `utils/apiClient.ts`

```typescript
import { APIRequestContext, expect } from '@playwright/test';

/**
 * Utility class for making standardized API requests.
 */
export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: { [key: string]: string };

  constructor(request: APIRequestContext, baseURL: string, token?: string) {
    this.request = request;
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Performs a GET request.
   * @param path The API endpoint path.
   * @param params Optional query parameters.
   */
  async get(path: string, params?: Record<string, string | number | boolean>) {
    const response = await this.request.get(`${this.baseURL}${path}`, {
      params,
      headers: this.defaultHeaders,
    });
    return response;
  }

  /**
   * Performs a POST request.
   * @param path The API endpoint path.
   * @param data The request body.
   */
  async post(path: string, data: object) {
    const response = await this.request.post(`${this.baseURL}${path}`, {
      data,
      headers: this.defaultHeaders,
    });
    return response;
  }

  /**
   * Performs a PUT request.
   * @param path The API endpoint path.
   * @param data The request body.
   */
  async put(path: string, data: object) {
    const response = await this.request.put(`${this.baseURL}${path}`, {
      data,
      headers: this.defaultHeaders,
    });
    return response;
  }

  /**
   * Performs a DELETE request.
   * @param path The API endpoint path.
   */
  async delete(path: string) {
    const response = await this.request.delete(`${this.baseURL}${path}`, {
      headers: this.defaultHeaders,
    });
    return response;
  }

  /**
   * Helper to assert a successful API response status.
   * @param response The APIResponse object.
   * @param expectedStatus The expected HTTP status code (default: 200).
   */
  async expectSuccessfulResponse(response: any, expectedStatus: number = 200) {
    await expect(response.status()).toBe(expectedStatus);
    await expect(response.ok()).toBeTruthy();
  }

  /**
   * Helper to assert an unsuccessful API response status.
   * @param response The APIResponse object.
   * @param expectedStatus The expected HTTP status code (e.g., 400, 404).
   */
  async expectFailedResponse(response: any, expectedStatus: number) {
    await expect(response.status()).toBe(expectedStatus);
    await expect(response.ok()).toBeFalsy();
  }
}
```

### `utils/commonUtils.ts`

```typescript
import { Page } from '@playwright/test';

/**
 * Generic utility functions that can be used across the framework.
 */
export class CommonUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for a specified duration in milliseconds.
   * Use sparingly, prefer explicit waits.
   * @param ms The time to wait in milliseconds.
   */
  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Generates a screenshot and saves it to the test-results folder.
   * @param name The name of the screenshot file (e.g., 'login-failure').
   */
  async takeScreenshot(name: string): Promise<void> {
    const screenshotPath = `test-results/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath });
    console.log(`Screenshot taken: ${screenshotPath}`);
  }

  /**
   * Checks if an element contains specific text.
   * @param locator The Playwright Locator for the element.
   * @param text The text to check for.
   * @param exact Whether the text must be an exact match (default: false).
   */
  async elementContainsText(locator: Locator, text: string, exact: boolean = false): Promise<boolean> {
    if (exact) {
      return (await locator.textContent()) === text;
    }
    return (await locator.textContent())?.includes(text) ?? false;
  }
}
```

## 8. Test Data (JSON)

### `data/retailerData.json`

```json
{
  "retailers": [
    {
      "name": "GlobalTech Retail",
      "code": "GTR001",
      "address1": "100 Innovation Drive",
      "city": "Techville",
      "state": "California",
      "zipCode": "90001",
      "country": "United States",
      "contactPerson": "Alice Smith",
      "contactEmail": "alice.smith@globaltech.com",
      "contactPhone": "+1-555-123-4567",
      "status": "active"
    },
    {
      "name": "Fashion Forward Boutiques",
      "code": "FFB002",
      "address1": "200 Style Avenue",
      "address2": "Unit B",
      "city": "Metropolis",
      "state": "New York",
      "zipCode": "10001",
      "country": "United States",
      "contactPerson": "Bob Johnson",
      "contactEmail": "bob.johnson@fashionforward.com",
      "contactPhone": "+1-555-987-6543",
      "status": "inactive"
    }
  ],
  "invalidRetailers": [
    {
      "name": "",
      "code": "INV001",
      "address1": "300 Error Lane",
      "city": "Bugsville",
      "state": "Texas",
      "zipCode": "75001",
      "country": "United States",
      "contactPerson": "Charlie Brown",
      "contactEmail": "charlie@invalid",
      "contactPhone": "123",
      "status": "active"
    }
  ]
}
```

## 9. API Testing Example

### `tests/api/retailerApi.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/apiClient';
import { DataGenerator } from '../../utils/dataGenerator';

// Load environment variables (e.g., API_BASE_URL)
import * as dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'; // Assuming API lives under /api

test.describe('API Tests: Retailers Management', () => {
  let apiClient: ApiClient;
  let authToken: string | undefined; // Assuming authentication might be needed for API

  // Pre-requisite: Authenticate and get a token if necessary
  test.beforeAll(async ({ request }) => {
    // Example: Authenticate if your API requires a token for most operations
    // const authResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    //   data: {
    //     username: process.env.API_USER || 'admin_api',
    //     password: process.env.API_PASSWORD || 'api_password',
    //   },
    // });
    // expect(authResponse.ok()).toBeTruthy();
    // const authData = await authResponse.json();
    // authToken = authData.token;
    // console.log(`API Auth Token: ${authToken ? 'Successfully obtained' : 'Not required or failed'}`);

    apiClient = new ApiClient(request, API_BASE_URL, authToken);
  });

  test('should create a new retailer via API', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'API_TC_001' });
    test.info().annotations.push({ type: 'Requirement', description: 'API: Create Retailer' });
    test.info().annotations.push({ type: 'Severity', description: 'High' });
    test.info().annotations.push({ type: 'Priority', description: 'P1' });

    const newRetailer = DataGenerator.generateRetailerData();

    await test.step('Send POST request to create retailer', async () => {
      const response = await apiClient.post('/retailers', newRetailer);
      await apiClient.expectSuccessfulResponse(response, 201);
      const responseBody = await response.json();

      // Assert response body contains expected fields and values
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.name).toBe(newRetailer.name);
      expect(responseBody.code).toBe(newRetailer.code);
      expect(responseBody.status).toBe(newRetailer.status);

      // Store the created retailer ID for potential cleanup or subsequent tests
      test.info().data.retailerId = responseBody.id;
      console.log(`API Created Retailer: ID=${responseBody.id}, Name=${responseBody.name}`);
    });
  });

  test('should get a list of retailers via API', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'API_TC_002' });
    test.info().annotations.push({ type: 'Requirement', description: 'API: Get Retailers List' });
    test.info().annotations.push({ type: 'Severity', description: 'Medium' });
    test.info().annotations.push({ type: 'Priority', description: 'P2' });

    await test.step('Send GET request to retrieve all retailers', async () => {
      const response = await apiClient.get('/retailers');
      await apiClient.expectSuccessfulResponse(response, 200);
      const retailers = await response.json();

      expect(Array.isArray(retailers)).toBeTruthy();
      expect(retailers.length).toBeGreaterThanOrEqual(0); // Assuming there might be existing data
      console.log(`API Retrieved ${retailers.length} retailers.`);

      if (retailers.length > 0) {
        expect(retailers[0]).toHaveProperty('id');
        expect(retailers[0]).toHaveProperty('name');
        expect(retailers[0]).toHaveProperty('code');
      }
    });
  });

  test('should retrieve a specific retailer by ID', async ({ request }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'API_TC_003' });
    test.info().annotations.push({ type: 'Requirement', description: 'API: Get Retailer by ID' });
    test.info().annotations.push({ type: 'Severity', description: 'Medium' });
    test.info().annotations.push({ type: 'Priority', description: 'P2' });

    const retailerToCreate = DataGenerator.generateRetailerData();
    let createdRetailerId: string;

    await test.step('Pre-condition: Create a retailer to fetch', async () => {
      const createResponse = await apiClient.post('/retailers', retailerToCreate);
      await apiClient.expectSuccessfulResponse(createResponse, 201);
      const responseBody = await createResponse.json();
      createdRetailerId = responseBody.id;
      console.log(`Pre-condition: Created retailer with ID: ${createdRetailerId}`);
    });

    await test.step('Send GET request to retrieve the specific retailer', async () => {
      const getResponse = await apiClient.get(`/retailers/${createdRetailerId}`);
      await apiClient.expectSuccessfulResponse(getResponse, 200);
      const retrievedRetailer = await getResponse.json();

      expect(retrievedRetailer.id).toBe(createdRetailerId);
      expect(retrievedRetailer.name).toBe(retailerToCreate.name);
      expect(retrievedRetailer.code).toBe(retailerToCreate.code);
      console.log(`API Retrieved specific retailer: ID=${retrievedRetailer.id}, Name=${retrievedRetailer.name}`);
    });
  });

  test('should return 404 for a non-existent retailer ID', async () => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'API_TC_004' });
    test.info().annotations.push({ type: 'Requirement', description: 'API: Get Retailer by Non-existent ID' });
    test.info().annotations.push({ type: 'Severity', description: 'Low' });
    test.info().annotations.push({ type: 'Priority', description: 'P3' });

    const nonExistentId = DataGenerator.generateUniqueId(); // Generate a random ID unlikely to exist

    await test.step('Send GET request for a non-existent retailer', async () => {
      const response = await apiClient.get(`/retailers/${nonExistentId}`);
      await apiClient.expectFailedResponse(response, 404);
      console.log(`API: Verified 404 for non-existent ID: ${nonExistentId}`);
    });
  });

  test('should handle duplicate retailer code during creation via API', async ({ request }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'API_TC_005' });
    test.info().annotations.push({ type: 'Requirement', description: 'API: Duplicate Retailer Code Validation' });
    test.info().annotations.push({ type: 'Severity', description: 'High' });
    test.info().annotations.push({ type: 'Priority', description: 'P1' });

    const originalRetailer = DataGenerator.generateRetailerData();
    const duplicateRetailer = { ...DataGenerator.generateRetailerData(), code: originalRetailer.code }; // Same code, different name

    await test.step('Pre-condition: Create the first retailer successfully', async () => {
      const response = await apiClient.post('/retailers', originalRetailer);
      await apiClient.expectSuccessfulResponse(response, 201);
      console.log(`Pre-condition: Created retailer with code: ${originalRetailer.code}`);
    });

    await test.step('Attempt to create a retailer with the same code', async () => {
      const response = await apiClient.post('/retailers', duplicateRetailer);
      await apiClient.expectFailedResponse(response, 400); // Assuming 400 Bad Request for validation error
      const errorBody = await response.json();
      expect(errorBody).toHaveProperty('message');
      expect(errorBody.message).toContain('Retailer Code must be unique'); // Assuming specific error message
      console.log(`API: Verified duplicate code error: ${errorBody.message}`);
    });
  });
});
```

## 10. README

```markdown
# Enterprise Playwright Automation Framework

This project sets up an enterprise-grade automation framework using Playwright with TypeScript. It's designed to be robust, scalable, and maintainable, following best practices for Page Object Model, data-driven testing, and integration of both UI and API tests.

## Table of Contents

1.  [Project Structure](#1-project-structure)
2.  [Prerequisites](#2-prerequisites)
3.  [Setup Instructions](#3-setup-instructions)
4.  [Running Tests](#4-running-tests)
5.  [Test Reporting](#5-test-reporting)
6.  [Environment Variables](#6-environment-variables)
7.  [Key Features](#7-key-features)
8.  [Enterprise Best Practices](#8-enterprise-best-practices)
9.  [Contributing](#9-contributing)
10. [Troubleshooting](#10-troubleshooting)

## 1. Project Structure

The project is organized into logical directories to ensure clear separation of concerns:

```
.
├── playwright-report/         # Playwright HTML report output
├── test-results/              # Test execution artifacts (screenshots, videos)
├── tests/
│   ├── api/                   # Contains API test scripts
│   ├── e2e/                   # Contains End-to-End (UI) test scripts
│   └── fixtures/              # Custom Playwright test fixtures
├── pages/                     # Page Object Model classes for UI elements and actions
│   ├── basePage.ts            # Base class for all page objects
│   └── ...                    # Specific page objects (login, dashboard, retailers, etc.)
├── data/                      # JSON files for test data
├── utils/                     # Reusable utility functions (data generation, API client, common helpers)
├── .env                       # Environment variables (local config)
├── .gitignore
├── package.json               # Project dependencies and scripts
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 2. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: v18.x or higher (LTS recommended)
*   **npm**: v8.x or higher (comes with Node.js)
*   **Git**: For cloning the repository

## 3. Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd enterprise-playwright-framework
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This command will install Playwright, TypeScript, and other development dependencies specified in `package.json`. Playwright will also download the necessary browser binaries (Chromium, Firefox, WebKit).

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory of the project and add your environment-specific variables.
    ```
    # Example .env file
    BASE_URL=http://localhost:3000
    API_BASE_URL=http://localhost:3000/api
    USER_EMAIL=admin@example.com
    USER_PASSWORD=password123
    # API_TOKEN=your_api_auth_token (if applicable)
    ```
    **Note:** Do not commit your `.env` file to version control, especially if it contains sensitive information. It's already included in `.gitignore`.

## 4. Running Tests

You can run tests using various npm scripts defined in `package.json`.

*   **Run all tests (UI and API):**
    ```bash
    npm test
    ```

*   **Run all tests in headed mode (browsers visible):**
    ```bash
    npm run test:headed
    ```

*   **Run tests with Playwright UI mode (interactive debugging):**
    ```bash
    npm run test:ui
    ```

*   **Run a specific E2E test file:**
    ```bash
    npm run test:specific
    # Example: npm run test:specific tests/e2e/retailer/createRetailer.spec.ts
    ```

*   **Run only API tests:**
    ```bash
    npm run test:api
    ```

*   **Run tests on specific browsers:**
    You can specify browsers using the `--project` flag.
    ```bash
    npx playwright test --project=chromium
    npx playwright test --project=firefox
    npx playwright test --project=webkit
    ```

## 5. Test Reporting

After running tests, Playwright generates a comprehensive HTML report.

*   **Open the HTML report:**
    ```bash
    npm run test:report
    ```
    This will open the report in your default browser, showing detailed results, screenshots, and videos for failed tests.

## 6. Environment Variables

The framework uses `dotenv` to manage environment variables. This allows for flexible configuration across different environments (local, dev, staging, production).

*   **`.env` file:** For local development, create a `.env` file in the root directory.
*   **CI/CD:** In CI/CD pipelines, set these variables as secrets or environment variables directly in your pipeline configuration.

**Common Variables:**

*   `BASE_URL`: The base URL of the web application under test (e.g., `http://localhost:3000`).
*   `API_BASE_URL`: The base URL for API endpoints (e.g., `http://localhost:3000/api`).
*   `USER_EMAIL`: Default username for login actions.
*   `USER_PASSWORD`: Default password for login actions.
*   `API_USER`, `API_PASSWORD`, `API_TOKEN`: Credentials for API authentication if required.

## 7. Key Features

*   **Playwright Test Runner**: Native Playwright test runner for reliable execution.
*   **TypeScript**: Enhanced code quality, maintainability, and early error detection.
*   **Page Object Model (POM)**: Organized and reusable page object classes, reducing code duplication.
*   **Custom Fixtures**: Simplified test setup (e.g., `authenticatedPage` fixture to handle login once).
*   **Data-Driven Testing**: Utilizes JSON files for managing test data, enabling easy expansion.
*   **API Testing**: Dedicated section for validating API endpoints.
*   **Utility Classes**: Helper functions for data generation, API interactions, and common operations.
*   **HTML Reporting**: Detailed and interactive reports for test results, including screenshots and video recordings on failure.
*   **Enterprise Folder Structure**: Clear, scalable directory organization.
*   **Linting & Formatting**: (Optional, but recommended) Integration with ESLint to maintain code consistency and quality.

## 8. Enterprise Best Practices

*   **Modular Design (POM)**: Pages, tests, and utilities are strictly separated into their respective modules, ensuring high reusability and maintainability.
*   **Custom Fixtures for Setup**: Use Playwright's `test.extend` to create custom fixtures for common setups like authenticated sessions, reducing boilerplate in tests.
*   **Atomic Test Cases**: Each test focuses on a single, specific scenario, making failures easier to diagnose.
*   **Descriptive Naming Conventions**: Files, classes, methods, and variables are named clearly to reflect their purpose.
*   **Robust Selectors**: Prefer `role`, `text`, `data-testid` (or similar `data-qa`) attributes over fragile CSS/XPath selectors.
*   **Explicit Waits**: Avoid `page.waitForTimeout()` unless absolutely necessary. Use `expect().toBeVisible()`, `page.waitForSelector()`, `page.waitForURL()`, `page.waitForResponse()` instead.
*   **Error Handling and Logging**: Implement meaningful error messages and console logs, especially in utility functions and API calls.
*   **Environment Configuration**: Utilize `.env` files and environment variables for sensitive data and configuration parameters, separating them from the codebase.
*   **Data Generation**: Employ a `DataGenerator` utility to create unique test data on the fly, preventing data collisions and ensuring fresh test runs.
*   **API for Pre/Post Conditions**: Use API calls for test setup (e.g., creating test data) and cleanup, significantly speeding up test execution compared to UI-driven setups.
*   **Comprehensive Reporting**: Leverage Playwright's built-in HTML reporter for detailed insights into test runs, including screenshots and videos on failure.
*   **Code Linting & Formatting**: Integrate ESLint and Prettier (optional, but good practice) to enforce coding standards and maintain consistent code style.
*   **Annotations**: Use `test.info().annotations.push()` for adding metadata like test case IDs, requirements, severity, and priority, which can be useful for reporting and traceability.
*   **Graceful Page Transitions**: Always wait for URL changes, specific elements to load, or network responses after actions that trigger navigation or data loading.

## 9. Contributing

Feel free to extend this framework for new features, bug fixes, or improvements.
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## 10. Troubleshooting

*   **"Error: browserType.launch: WebSocket error"**: Ensure you have enough memory and resources. Try running fewer workers or on a single project.
*   **"Timeout exceeded"**: Increase `timeout` in `playwright.config.ts` if your application is slow, or add more specific `page.waitFor` conditions.
*   **Browser binaries not found**: Run `npx playwright install` to re-download necessary browser binaries.
*   **Environment variables not loading**: Ensure your `.env` file is correctly placed in the root directory and `dotenv.config()` is called in `playwright.config.ts`.
*   **Test fails silently**: Check `outputDir` (`test-results`) for screenshots/videos on failure. Enable `trace: 'on'` for detailed debugging traces.

---

This framework provides a solid foundation. Remember to adapt the page objects, test data, and test scripts to precisely match the unique elements and behaviors of your application under test.
```