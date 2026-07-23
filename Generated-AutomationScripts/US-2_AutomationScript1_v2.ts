```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, TEST_TIMEOUT } from './constants/globalConstants';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: process.env.CI ? true : false,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: './reports/html-report', open: 'never' }], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot options */
    screenshot: 'only-on-failure',
    /* Video options */
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

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: './reports/test-results',

  /* Global timeout for tests */
  timeout: TEST_TIMEOUT,
  expect: {
    timeout: 5000, // Timeout for expect statements
  },
});
```

```typescript
// e2e/constants/globalConstants.ts
export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'; // Replace with your actual application base URL
export const TEST_TIMEOUT = 60 * 1000; // 60 seconds for a single test
export const PAGE_LOAD_TIMEOUT = 30 * 1000; // 30 seconds for page navigation
export const API_TIMEOUT = 10 * 1000; // 10 seconds for API calls

// User roles for login
export const USER_ROLES = {
  SALESMAN: { username: 'salesman@example.com', password: 'password123' }, // Replace with actual credentials
  ADMIN: { username: 'admin@example.com', password: 'adminpassword' },
};
```

```typescript
// e2e/constants/retailerConstants.ts
export const RETAILER_PAGE_TITLES = {
  CREATE_RETAILER: 'Create New Retailer',
  RETAILER_LIST: 'Retailers List',
  RETAILER_DETAILS: 'Retailer Details',
};

export const RETAILER_MESSAGES = {
  SUCCESS_CREATE: 'Retailer created successfully!',
  ERROR_NAME_REQUIRED: 'Retailer Name is required.',
  ERROR_CONTACT_REQUIRED: 'Contact Person is required.',
  ERROR_EMAIL_REQUIRED: 'Email is required.',
  ERROR_EMAIL_INVALID: 'Invalid email format.',
  ERROR_PHONE_REQUIRED: 'Phone Number is required.',
  ERROR_ADDRESS_REQUIRED: 'Address is required.',
  ERROR_SUBMIT_FAILED: 'Failed to create retailer. Please try again.',
};

export const RETAILER_SELECTORS = {
  CREATE_BUTTON: 'text="Create Retailer"',
  SAVE_BUTTON: 'button[type="submit"]',
  BACK_BUTTON: 'text="Back to Retailers"',
  ALERT_SUCCESS: '.alert-success',
  ALERT_ERROR: '.alert-danger',
};
```

```typescript
// e2e/helpers/dataGenerator.ts
import { Retailer } from '../src/models/retailer';

/**
 * Generates unique retailer data for testing.
 * @returns {Retailer} An object containing unique retailer details.
 */
export function generateUniqueRetailerData(): Retailer {
  const timestamp = Date.now();
  const uniqueId = Math.floor(Math.random() * 1000000); // Add a random number for better uniqueness

  return {
    name: `Test Retailer ${timestamp}-${uniqueId}`,
    contactPerson: `John Doe ${timestamp}`,
    email: `retailer_${timestamp}_${uniqueId}@example.com`,
    phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${uniqueId} Test Street, Test City, TS 12345`,
    // Add other optional fields as needed
  };
}
```

```typescript
// e2e/src/models/retailer.ts
/**
 * Interface representing the data structure for a Retailer.
 */
export interface Retailer {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  // Add any other mandatory or optional fields for a retailer here
  id?: string; // Optional, if ID is assigned after creation
  status?: 'Active' | 'Inactive'; // Example of an optional field
}
```

```typescript
// e2e/src/pages/loginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { USER_ROLES } from '../../constants/globalConstants';
import { PAGE_LOAD_TIMEOUT } from '../../constants/globalConstants';

/**
 * Page Object Model for the Login Page.
 * Encapsulates selectors and methods for login actions.
 */
export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username'); // Adjust selector as per your application
    this.passwordInput = page.locator('#password'); // Adjust selector as per your application
    this.loginButton = page.locator('button[type="submit"]'); // Adjust selector as per your application
    this.errorMessage = page.locator('.error-message'); // Adjust selector as per your application
  }

  /**
   * Navigates to the login page.
   * @returns {Promise<void>}
   */
  async navigateToLoginPage(): Promise<void> {
    await this.page.goto('/login', { timeout: PAGE_LOAD_TIMEOUT }); // Adjust login path
    await expect(this.loginButton).toBeVisible(); // Ensure login page loaded
  }

  /**
   * Performs a login action with given credentials.
   * @param {string} username - The username to enter.
   * @param {string} password - The password to enter.
   * @returns {Promise<void>}
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Assuming redirection to dashboard or home page after successful login
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Logs in as a Salesman user.
   * @returns {Promise<void>}
   */
  async loginAsSalesman(): Promise<void> {
    await this.navigateToLoginPage();
    await this.login(USER_ROLES.SALESMAN.username, USER_ROLES.SALESMAN.password);
    // Add an assertion for successful login, e.g., checking for a dashboard element
    await expect(this.page.locator('h1')).not.toContainText('Login'); // Check that we are no longer on the login page
  }

  /**
   * Verifies if an error message is displayed.
   * @param {string} message - The expected error message text.
   * @returns {Promise<void>}
   */
  async verifyErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
```

```typescript
// e2e/src/pages/retailerPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { Retailer } from '../models/retailer';
import { RETAILER_MESSAGES, RETAILER_PAGE_TITLES, RETAILER_SELECTORS } from '../../constants/retailerConstants';
import { PAGE_LOAD_TIMEOUT } from '../../constants/globalConstants';

/**
 * Page Object Model for the Create New Retailer page.
 * Encapsulates selectors and methods for interacting with the retailer creation form.
 */
export class RetailerPage {
  private readonly page: Page;
  private readonly createRetailerNavLink: Locator;
  private readonly retailerNameInput: Locator;
  private readonly contactPersonInput: Locator;
  private readonly emailInput: Locator;
  private readonly phoneInput: Locator;
  private readonly addressTextarea: Locator;
  private readonly saveButton: Locator;
  private readonly successAlert: Locator;
  private readonly nameError: Locator;
  private readonly contactPersonError: Locator;
  private readonly emailError: Locator;
  private readonly phoneError: Locator;
  private readonly addressError: Locator;
  private readonly pageTitle: Locator;
  private readonly backToListButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Assuming a navigation link to create a retailer exists after login
    this.createRetailerNavLink = page.locator('nav a[href="/retailers/create"]'); // Adjust selector as per your application
    this.retailerNameInput = page.locator('#retailerName'); // Adjust selector
    this.contactPersonInput = page.locator('#contactPerson'); // Adjust selector
    this.emailInput = page.locator('#email'); // Adjust selector
    this.phoneInput = page.locator('#phone'); // Adjust selector
    this.addressTextarea = page.locator('#address'); // Adjust selector
    this.saveButton = page.locator(RETAILER_SELECTORS.SAVE_BUTTON);
    this.successAlert = page.locator(RETAILER_SELECTORS.ALERT_SUCCESS);
    this.pageTitle = page.locator('h1');

    // Error message locators for mandatory fields
    this.nameError = page.locator('#retailerName-error'); // Example: assumes error message appears next to input with specific ID
    this.contactPersonError = page.locator('#contactPerson-error');
    this.emailError = page.locator('#email-error');
    this.phoneError = page.locator('#phone-error');
    this.addressError = page.locator('#address-error');

    this.backToListButton = page.locator(RETAILER_SELECTORS.BACK_BUTTON); // Assuming a button to go back to list
  }

  /**
   * Navigates to the Create New Retailer page.
   * Assumes the user is already logged in.
   * @returns {Promise<void>}
   */
  async navigateToCreateRetailerPage(): Promise<void> {
    await this.page.goto('/retailers/create', { timeout: PAGE_LOAD_TIMEOUT }); // Adjust path as per your application
    await expect(this.pageTitle).toHaveText(RETAILER_PAGE_TITLES.CREATE_RETAILER, { timeout: PAGE_LOAD_TIMEOUT });
    await expect(this.saveButton).toBeVisible();
  }

  /**
   * Fills the retailer creation form with provided data.
   * @param {Retailer} retailerData - The data to fill into the form fields.
   * @returns {Promise<void>}
   */
  async fillRetailerForm(retailerData: Retailer): Promise<void> {
    if (retailerData.name) {
      await this.retailerNameInput.fill(retailerData.name);
    }
    if (retailerData.contactPerson) {
      await this.contactPersonInput.fill(retailerData.contactPerson);
    }
    if (retailerData.email) {
      await this.emailInput.fill(retailerData.email);
    }
    if (retailerData.phone) {
      await this.phoneInput.fill(retailerData.phone);
    }
    if (retailerData.address) {
      await this.addressTextarea.fill(retailerData.address);
    }
  }

  /**
   * Submits the retailer creation form.
   * @returns {Promise<void>}
   */
  async submitRetailerForm(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Creates a new retailer with the given data.
   * This combines filling the form and submitting it.
   * @param {Retailer} retailerData - The data for the new retailer.
   * @returns {Promise<void>}
   */
  async createRetailer(retailerData: Retailer): Promise<void> {
    await this.fillRetailerForm(retailerData);
    await this.submitRetailerForm();
  }

  /**
   * Verifies if the success message is displayed after retailer creation.
   * @returns {Promise<void>}
   */
  async verifySuccessMessage(): Promise<void> {
    await expect(this.successAlert).toBeVisible();
    await expect(this.successAlert).toContainText(RETAILER_MESSAGES.SUCCESS_CREATE);
  }

  /**
   * Verifies redirection to the retailer details or list page.
   * @param {string} expectedPageTitle - The expected title of the page after redirection.
   * @returns {Promise<void>}
   */
  async verifyRedirection(expectedPageTitle: string = RETAILER_PAGE_TITLES.RETAILER_DETAILS): Promise<void> {
    await expect(this.pageTitle).toHaveText(expectedPageTitle);
    await expect(this.page.url()).toContain('/retailers'); // Check URL for common segment
  }

  /**
   * Verifies that the form remains on the creation page.
   * @returns {Promise<void>}
   */
  async verifyRemainsOnCreationPage(): Promise<void> {
    await expect(this.pageTitle).toHaveText(RETAILER_PAGE_TITLES.CREATE_RETAILER);
    await expect(this.saveButton).toBeVisible();
  }

  /**
   * Verifies the error message for the retailer name input.
   * @returns {Promise<void>}
   */
  async verifyRetailerNameError(): Promise<void> {
    await expect(this.nameError).toBeVisible();
    await expect(this.nameError).toContainText(RETAILER_MESSAGES.ERROR_NAME_REQUIRED);
  }

  /**
   * Verifies the error message for the contact person input.
   * @returns {Promise<void>}
   */
  async verifyContactPersonError(): Promise<void> {
    await expect(this.contactPersonError).toBeVisible();
    await expect(this.contactPersonError).toContainText(RETAILER_MESSAGES.ERROR_CONTACT_REQUIRED);
  }

  /**
   * Verifies the error message for the email input.
   * @param {string} errorMessage - The expected error message.
   * @returns {Promise<void>}
   */
  async verifyEmailError(errorMessage: string): Promise<void> {
    await expect(this.emailError).toBeVisible();
    await expect(this.emailError).toContainText(errorMessage);
  }

  /**
   * Verifies the error message for the phone input.
   * @returns {Promise<void>}
   */
  async verifyPhoneError(): Promise<void> {
    await expect(this.phoneError).toBeVisible();
    await expect(this.phoneError).toContainText(RETAILER_MESSAGES.ERROR_PHONE_REQUIRED);
  }

  /**
   * Verifies the error message for the address input.
   * @returns {Promise<void>}
   */
  async verifyAddressError(): Promise<void> {
    await expect(this.addressError).toBeVisible();
    await expect(this.addressError).toContainText(RETAILER_MESSAGES.ERROR_ADDRESS_REQUIRED);
  }

  /**
   * (Optional) Navigates to a specific retailer's details page.
   * This method would typically be used after creating a retailer and navigating to its details.
   * @param {string} retailerId - The ID of the retailer to navigate to.
   * @returns {Promise<void>}
   */
  async navigateToRetailerDetails(retailerId: string): Promise<void> {
    await this.page.goto(`/retailers/${retailerId}`, { timeout: PAGE_LOAD_TIMEOUT });
    await expect(this.pageTitle).toHaveText(RETAILER_PAGE_TITLES.RETAILER_DETAILS);
  }

  /**
   * (Optional) Verifies the displayed details on a retailer's detail page.
   * @param {Retailer} expectedRetailerData - The data expected to be displayed.
   * @returns {Promise<void>}
   */
  async verifyRetailerDetailsDisplayed(expectedRetailerData: Retailer): Promise<void> {
    await expect(this.page.locator(`text=${expectedRetailerData.name}`)).toBeVisible();
    await expect(this.page.locator(`text=${expectedRetailerData.contactPerson}`)).toBeVisible();
    await expect(this.page.locator(`text=${expectedRetailerData.email}`)).toBeVisible();
    await expect(this.page.locator(`text=${expectedRetailerData.phone}`)).toBeVisible();
    await expect(this.page.locator(`text=${expectedRetailerData.address}`)).toBeVisible();
  }
}
```

```typescript
// e2e/tests/retailer.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/loginPage';
import { RetailerPage } from '../src/pages/retailerPage';
import { generateUniqueRetailerData } from '../helpers/dataGenerator';
import { Retailer } from '../src/models/retailer';
import { RETAILER_MESSAGES, RETAILER_PAGE_TITLES } from '../constants/retailerConstants';

test.describe('Retailer Management - Create New Retailer', () => {
  let loginPage: LoginPage;
  let retailerPage: RetailerPage;
  let newRetailer: Retailer;

  // Before each test, initialize page objects and ensure login
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    retailerPage = new RetailerPage(page);

    // Log in as a Salesman before each test
    await loginPage.loginAsSalesman();

    // Navigate to the create retailer page
    await retailerPage.navigateToCreateRetailerPage();

    // Generate unique data for the new retailer
    newRetailer = generateUniqueRetailerData();
  });

  // TC_RETAILER_001: Verify navigation to the "Create New Retailer" page
  test('TC_RETAILER_001_Verify_Salesman_can_navigate_to_Create_Retailer_page', async ({ page }) => {
    // Navigation already handled in beforeEach, just assert title
    await expect(page.locator('h1')).toHaveText(RETAILER_PAGE_TITLES.CREATE_RETAILER);
    await expect(page.url()).toContain('/retailers/create');
  });

  // TC_RETAILER_002: Verify a Salesman can successfully create a new Retailer with all mandatory valid details.
  test('TC_RETAILER_002_Create_new_retailer_with_all_mandatory_valid_details', async ({ page }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAILER_002' });
    test.info().annotations.push({ type: 'User Story', description: 'As a Salesman, I should be able to create a new Retailer by entering mandatory details.' });

    // Fill the form with unique valid data
    await retailerPage.createRetailer(newRetailer);

    // Assert success message
    await retailerPage.verifySuccessMessage();

    // Assert redirection to retailer details/list page (assuming it redirects to details for the new retailer)
    await retailerPage.verifyRedirection(RETAILER_PAGE_TITLES.RETAILER_DETAILS);

    // Optional: Verify the newly created retailer's details are displayed on the details page
    await retailerPage.verifyRetailerDetailsDisplayed(newRetailer);
  });

  // TC_RETAILER_003_01: Verify validation message when Retailer Name is left empty.
  test('TC_RETAILER_003_01_Verify_validation_for_empty_Retailer_Name', async ({ page }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAILER_003_01' });
    test.info().annotations.push({ type: 'User Story', description: 'As a Salesman, I should be able to create a new Retailer by entering mandatory details.' });

    // Fill all fields except Retailer Name
    const retailerWithoutName: Retailer = { ...newRetailer, name: '' }; // Override name to be empty
    await retailerPage.createRetailer(retailerWithoutName);

    // Assert error message for Retailer Name
    await retailerPage.verifyRetailerNameError();
    await retailerPage.verifyRemainsOnCreationPage(); // Ensure form is not submitted
  });

  // TC_RETAILER_003_02: Verify validation message when Contact Person is left empty.
  test('TC_RETAILER_003_02_Verify_validation_for_empty_Contact_Person', async ({ page }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAILER_003_02' });

    const retailerWithoutContact: Retailer = { ...newRetailer, contactPerson: '' };
    await retailerPage.createRetailer(retailerWithoutContact);

    await retailerPage.verifyContactPersonError();
    await retailerPage.verifyRemainsOnCreationPage();
  });

  // TC_RETAILER_004: Verify validation messages appear for invalid email format.
  test('TC_RETAILER_004_Verify_validation_for_invalid_email_format', async ({ page }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAILER_004' });

    const retailerWithInvalidEmail: Retailer = { ...newRetailer, email: 'invalid-email' };
    await retailerPage.createRetailer(retailerWithInvalidEmail);

    await retailerPage.verifyEmailError(RETAILER_MESSAGES.ERROR_EMAIL_INVALID);
    await retailerPage.verifyRemainsOnCreationPage();
  });

  // TC_RETAILER_005: Verify validation messages appear for invalid phone number format.
  // Note: This assumes front-end validation for phone format. If only backend validates, test approach might change.
  test('TC_RETAILER_005_Verify_validation_for_invalid_phone_format', async ({ page }) => {
    test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAILER_005' });

    const retailerWithInvalidPhone: Retailer = { ...newRetailer, phone: '123' }; // Assuming '123' is an invalid format
    await retailerPage.createRetailer(retailerWithInvalidPhone);

    // Assuming a specific error message for phone format, otherwise, generic error
    await retailerPage.verifyPhoneError(); // Re-using for brevity, assuming the error for empty also covers invalid in some cases
    // If there's a specific 'Invalid Phone Format' message, it would be:
    // await retailerPage.verifyPhoneError(RETAILER_MESSAGES.ERROR_PHONE_INVALID_FORMAT);
    await retailerPage.verifyRemainsOnCreationPage();
  });
});
```