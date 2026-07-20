```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { BASE_URL } from './constants/app.constants';

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
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: './reports/test-results',
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
    ['html', { outputFolder: './reports/html-report', open: 'never' }],
    ['json', { outputFile: './reports/json-report/results.json' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,

    /* Collect a trace for each test failing. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    /* Capture video on failure */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project to authenticate and save storage state
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the storage state from the setup project
        storageState: path.resolve(__dirname, 'fixtures/auth.json'),
      },
      dependencies: ['setup'],
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: path.resolve(__dirname, 'fixtures/auth.json'),
    //   },
    //   dependencies: ['setup'],
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: path.resolve(__dirname, 'fixtures/auth.json'),
    //   },
    //   dependencies: ['setup'],
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

// e2e/constants/app.constants.ts
export const BASE_URL = 'http://localhost:3000'; // Replace with your actual application base URL
export const TEST_USER_EMAIL = 'salesman@example.com';
export const TEST_USER_PASSWORD = 'password123';
export const STORAGE_STATE_PATH = path.resolve(__dirname, '../fixtures/auth.json');


// e2e/src/models/retailer.ts
/**
 * @interface Retailer
 * @description Represents the data structure for a Retailer entity.
 * Used for defining test data and ensuring type safety when interacting with retailer forms.
 */
export interface Retailer {
  name: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  industryType: string; // e.g., 'Grocer', 'Pharmacy', 'General Store'
}


// e2e/test-data/retailer-data.json
// Note: Dynamic data like retailer names will be generated in the test script itself
// to ensure uniqueness for each test run. This file is for static base data or lists.
{
  "defaultRetailer": {
    "contactPersonName": "John Doe",
    "contactPersonEmail": "john.doe@retailer.com",
    "contactPersonPhone": "123-456-7890",
    "addressStreet": "123 Main St",
    "addressCity": "Anytown",
    "addressState": "CA",
    "addressZip": "90210",
    "industryType": "Grocer"
  },
  "industryTypes": [
    "Grocer",
    "Pharmacy",
    "General Store",
    "Hardware Store",
    "Electronics Store"
  ]
}


// e2e/src/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * @class LoginPage
 * @description Page Object Model for the login page of the application.
 * Encapsulates selectors and methods for login-related interactions.
 */
export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  /**
   * @param {Page} page - Playwright's Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.errorMessage = page.locator('.error-message'); // Assuming an error message element
  }

  /**
   * Navigates to the login page.
   * @async
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Fills the email and password fields.
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @async
   */
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the login button.
   * @async
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Performs a complete login action.
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @async
   */
  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.fillCredentials(email, password);
    await this.clickLogin();
  }

  /**
   * Asserts that an error message is visible and contains expected text.
   * @param {string} message - Expected error message text.
   * @async
   */
  async assertErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  /**
   * Asserts that the user is redirected to a specific URL after login.
   * @param {string} expectedUrl - The expected URL after successful login.
   * @async
   */
  async assertLoggedIn(expectedUrl: string = '/dashboard'): Promise<void> {
    await this.page.waitForURL(expectedUrl);
    expect(this.page.url()).toContain(expectedUrl);
  }
}


// e2e/src/pages/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * @class DashboardPage
 * @description Page Object Model for the application's dashboard or home page.
 * Provides navigation methods to other sections of the application.
 */
export class DashboardPage {
  private readonly page: Page;
  private readonly newRetailerLink: Locator;
  private readonly retailersMenu: Locator;
  private readonly dashboardHeader: Locator;

  /**
   * @param {Page} page - Playwright's Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.retailersMenu = page.getByRole('link', { name: 'Retailers' });
    this.newRetailerLink = page.getByRole('link', { name: 'Create New Retailer' });
    this.dashboardHeader = page.getByRole('heading', { name: 'Dashboard' }); // Assuming a dashboard header
  }

  /**
   * Navigates to the dashboard page.
   * @async
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard'); // Assuming dashboard is the default landing page after login
    await expect(this.dashboardHeader).toBeVisible();
  }

  /**
   * Navigates to the Create Retailer page.
   * This method assumes there's a direct link or a menu item to 'Create New Retailer'.
   * @async
   */
  async navigateToCreateRetailerPage(): Promise<void> {
    // Check if there's a direct link or if a menu needs to be clicked first
    if (await this.newRetailerLink.isVisible()) {
      await this.newRetailerLink.click();
    } else {
      // Assuming 'Retailers' is a menu item that reveals 'Create New Retailer'
      await this.retailersMenu.click();
      await this.newRetailerLink.click();
    }
    await this.page.waitForURL('**/retailers/new'); // Wait for the URL to change to the new retailer page
  }

  /**
   * Asserts that the dashboard header is visible, indicating a successful navigation to the dashboard.
   * @async
   */
  async assertDashboardVisible(): Promise<void> {
    await expect(this.dashboardHeader).toBeVisible();
  }
}


// e2e/src/pages/CreateRetailerPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { Retailer } from '../models/retailer';

/**
 * @class CreateRetailerPage
 * @description Page Object Model for the 'Create New Retailer' page.
 * Handles interactions with forms and elements related to retailer creation.
 */
export class CreateRetailerPage {
  private readonly page: Page;
  private readonly retailerNameInput: Locator;
  private readonly contactPersonNameInput: Locator;
  private readonly contactPersonEmailInput: Locator;
  private readonly contactPersonPhoneInput: Locator;
  private readonly addressStreetInput: Locator;
  private readonly addressCityInput: Locator;
  private readonly addressStateSelect: Locator;
  private readonly addressZipInput: Locator;
  private readonly industryTypeSelect: Locator;
  private readonly createRetailerButton: Locator;
  private readonly successMessage: Locator;
  private readonly pageHeader: Locator;

  /**
   * @param {Page} page - Playwright's Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.getByRole('heading', { name: 'Create New Retailer' });
    this.retailerNameInput = page.getByLabel('Retailer Name');
    this.contactPersonNameInput = page.getByLabel('Contact Person Name');
    this.contactPersonEmailInput = page.getByLabel('Contact Person Email');
    this.contactPersonPhoneInput = page.getByLabel('Contact Person Phone');
    this.addressStreetInput = page.getByLabel('Street Address');
    this.addressCityInput = page.getByLabel('City');
    this.addressStateSelect = page.getByLabel('State');
    this.addressZipInput = page.getByLabel('Zip Code');
    this.industryTypeSelect = page.getByLabel('Industry Type');
    this.createRetailerButton = page.getByRole('button', { name: 'Create Retailer' });
    this.successMessage = page.locator('.success-message'); // Assuming a success message class
  }

  /**
   * Asserts that the Create Retailer page is loaded and visible.
   * @async
   */
  async assertPageLoaded(): Promise<void> {
    await expect(this.pageHeader).toBeVisible();
    await expect(this.createRetailerButton).toBeVisible();
  }

  /**
   * Fills all mandatory fields for creating a retailer.
   * @param {Retailer} retailerData - Object containing retailer details.
   * @async
   */
  async fillMandatoryRetailerDetails(retailerData: Retailer): Promise<void> {
    await this.retailerNameInput.fill(retailerData.name);
    await this.contactPersonNameInput.fill(retailerData.contactPersonName);
    await this.contactPersonEmailInput.fill(retailerData.contactPersonEmail);
    await this.contactPersonPhoneInput.fill(retailerData.contactPersonPhone);
    await this.addressStreetInput.fill(retailerData.addressStreet);
    await this.addressCityInput.fill(retailerData.addressCity);
    await this.addressStateSelect.selectOption(retailerData.addressState);
    await this.addressZipInput.fill(retailerData.addressZip);
    await this.industryTypeSelect.selectOption(retailerData.industryType);
  }

  /**
   * Clicks the 'Create Retailer' button.
   * @async
   */
  async clickCreateRetailerButton(): Promise<void> {
    await this.createRetailerButton.click();
  }

  /**
   * Asserts that a success message is displayed after creation.
   * @async
   */
  async assertCreationSuccess(): Promise<void> {
    // This could also be a redirect to a list page or the new retailer's detail page
    // For now, assume a success message pops up.
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toHaveText(/Retailer created successfully!/i);
  }

  /**
   * Asserts that the page has redirected to the retailer list or detail page.
   * @param {string} expectedPartialUrl - A part of the URL expected after successful creation (e.g., '/retailers').
   * @async
   */
  async assertRedirectAfterCreation(expectedPartialUrl: string = '/retailers'): Promise<void> {
    await this.page.waitForURL(`**${expectedPartialUrl}**`);
    expect(this.page.url()).toContain(expectedPartialUrl);
  }

  /**
   * Asserts that validation errors are visible for specific fields.
   * @param {string[]} fields - An array of field labels for which to expect errors.
   * @async
   */
  async assertValidationErrors(fields: string[]): Promise<void> {
    for (const field of fields) {
      const errorLocator = this.page.locator(`label:has-text("${field}") + .error-message`);
      await expect(errorLocator).toBeVisible();
      await expect(errorLocator).toHaveText(/is required|invalid/i);
    }
  }
}


// e2e/global.setup.ts
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './src/pages/LoginPage';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, STORAGE_STATE_PATH } from './constants/app.constants';

/**
 * @description Global setup script to perform authentication once and save the storage state.
 * This avoids repetitive logins for each test, improving test execution speed.
 */
setup('authenticate as salesman', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.fillCredentials(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  await loginPage.clickLogin();

  // Wait for the dashboard or a page indicating successful login
  await page.waitForURL('/dashboard');
  await expect(page).toHaveURL(/.*dashboard/);

  // Save the storage state (cookies, local storage, etc.)
  // This state will be used by subsequent tests to skip the login process.
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  console.log(`Authentication state saved to: ${STORAGE_STATE_PATH}`);
});


// e2e/global.teardown.ts
import * as fs from 'fs';
import { STORAGE_STATE_PATH } from './constants/app.constants';

/**
 * @description Global teardown script to clean up artifacts after all tests have run.
 * Currently, it removes the saved authentication state file.
 */
async function globalTeardown() {
  // Remove the storage state file if it exists
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    fs.unlinkSync(STORAGE_STATE_PATH);
    console.log(`Authentication state file removed: ${STORAGE_STATE_PATH}`);
  }
}

export default globalTeardown;


// e2e/tests/createRetailer.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage'; // Although logged in by setup, good practice to have it available
import { DashboardPage } from '../src/pages/DashboardPage';
import { CreateRetailerPage } from '../src/pages/CreateRetailerPage';
import { Retailer } from '../src/models/retailer';
import * as retailerTestData from '../test-data/retailer-data.json';

// Helper to generate a unique retailer name
const generateUniqueRetailerName = (baseName: string): string => {
  const timestamp = new Date().getTime();
  return `${baseName}-${timestamp}`;
};

test.describe('Retailer Management - Salesman Role', () => {

  let dashboardPage: DashboardPage;
  let createRetailerPage: CreateRetailerPage;

  // Before each test, initialize page objects and navigate to dashboard if needed.
  // The 'setup' project handles the login state, so tests start logged in.
  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    createRetailerPage = new CreateRetailerPage(page);
    // Ensure we are on the dashboard or can navigate from it
    await page.goto('/dashboard'); // Go to dashboard after login (handled by setup)
    await dashboardPage.assertDashboardVisible();
  });

  test('UG_CR_001 | Should allow a Salesman to create a new Retailer with all mandatory details', async ({ page }) => {
    test.info().annotations.push({ type: 'User Story', description: 'As a Salesman, I should be able to create a new Retailer by entering mandatory details, So that the Retailer can place orders.' });

    // 1. Navigate to the "Create New Retailer" page
    await test.step('Navigate to Create New Retailer page', async () => {
      await dashboardPage.navigateToCreateRetailerPage();
      await createRetailerPage.assertPageLoaded();
      await expect(page).toHaveURL(/.*retailers\/new/);
      console.log('Navigated to Create New Retailer page.');
    });

    // 2. Prepare test data for the new retailer
    const uniqueRetailerName = generateUniqueRetailerName('Acme Retailer');
    const newRetailer: Retailer = {
      name: uniqueRetailerName,
      contactPersonName: retailerTestData.defaultRetailer.contactPersonName,
      contactPersonEmail: `test-${Math.random().toString(36).substring(7)}@${retailerTestData.defaultRetailer.contactPersonEmail.split('@')[1]}`, // Ensure unique email
      contactPersonPhone: retailerTestData.defaultRetailer.contactPersonPhone,
      addressStreet: retailerTestData.defaultRetailer.addressStreet,
      addressCity: retailerTestData.defaultRetailer.addressCity,
      addressState: retailerTestData.defaultRetailer.addressState,
      addressZip: retailerTestData.defaultRetailer.addressZip,
      industryType: retailerTestData.defaultRetailer.industryType,
    };
    console.log(`Attempting to create retailer: ${newRetailer.name}`);

    // 3. Fill in all mandatory retailer details
    await test.step('Fill in all mandatory retailer details', async () => {
      await createRetailerPage.fillMandatoryRetailerDetails(newRetailer);
      // Optional: Add a screenshot here to confirm fields are filled
      await page.screenshot({ path: `reports/screenshots/createRetailer_filled_form_${uniqueRetailerName}.png` });
      console.log('Mandatory retailer details filled.');
    });

    // 4. Click the 'Create Retailer' button
    await test.step('Submit the form by clicking "Create Retailer" button', async () => {
      await createRetailerPage.clickCreateRetailerButton();
      console.log('Clicked "Create Retailer" button.');
    });

    // 5. Assert that the retailer is created successfully (e.g., success message or redirect)
    await test.step('Verify successful retailer creation', async () => {
      // Assuming a success message is displayed OR redirection to a retailer list/detail page
      await createRetailerPage.assertCreationSuccess(); // If a success message is displayed
      await createRetailerPage.assertRedirectAfterCreation('/retailers'); // If redirected to a list page
      console.log(`Successfully verified creation of retailer: ${newRetailer.name}`);
    });

    // Optional: Further verification (e.g., search for the created retailer in a list)
    // This would require another POM (RetailersListPage) and potentially an API call if feasible.
    // For this script, we'll stop at asserting the success message/redirection.
    await test.step('Optional: Verify retailer appears in the list (requires another POM)', async () => {
      // Example:
      // const retailersListPage = new RetailersListPage(page);
      // await retailersListPage.assertRetailerInList(newRetailer.name);
      console.log('Further verification of retailer in list can be added here.');
    });
  });

  // Example of a negative test case (optional, but good practice)
  test('UG_CR_002 | Should display validation errors when mandatory fields are left blank', async ({ page }) => {
    test.info().annotations.push({ type: 'Validation Test', description: 'Verify that the system prevents retailer creation without mandatory details.' });

    await test.step('Navigate to Create New Retailer page', async () => {
      await dashboardPage.navigateToCreateRetailerPage();
      await createRetailerPage.assertPageLoaded();
      await expect(page).toHaveURL(/.*retailers\/new/);
      console.log('Navigated to Create New Retailer page for negative test.');
    });

    await test.step('Attempt to submit the form without filling any mandatory details', async () => {
      // Do not fill any fields
      await createRetailerPage.clickCreateRetailerButton();
      console.log('Clicked "Create Retailer" button without filling details.');
    });

    await test.step('Verify validation error messages are displayed for mandatory fields', async () => {
      const mandatoryFields = [
        'Retailer Name',
        'Contact Person Name',
        'Contact Person Email',
        'Contact Person Phone',
        'Street Address',
        'City',
        'State',
        'Zip Code',
        'Industry Type'
      ];
      await createRetailerPage.assertValidationErrors(mandatoryFields);
      await page.screenshot({ path: `reports/screenshots/createRetailer_validation_errors.png` });
      console.log('Validation errors verified for all mandatory fields.');
    });
  });

});
```