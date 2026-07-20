```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { APP_URL } from './constants/appConstants';

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
    reporter: [
        ['list'],
        ['html', { outputFolder: './reports/html-report', open: 'never' }],
        ['json', { outputFile: './reports/test-results.json' }],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: APP_URL,

        /* Capture screenshot and video on test failure. */
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        /* Trace execution for failed tests. */
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
    ],

    /* Output directory for test results. */
    outputDir: './reports/test-results',
});

// e2e/constants/appConstants.ts
export const APP_URL = process.env.APP_URL || 'http://localhost:3000'; // Default application URL
export const LOGIN_USERS = {
    SALESMAN: {
        username: 'salesman@example.com',
        password: 'password123',
    },
    // Add other user roles if necessary
};

// Define timeout constants (optional, but good practice)
export const DEFAULT_TIMEOUT = 10000; // 10 seconds

// e2e/helpers/dataGenerator.ts
import { faker } from '@faker-js/faker';
import { Retailer } from '../src/models/retailer.model';

/**
 * Generates random, realistic data for a new retailer.
 * @returns {Retailer} A retailer object with generated data.
 */
export function generateRetailerData(): Retailer {
    return {
        name: faker.company.name() + ' Store ' + faker.string.alphanumeric(3).toUpperCase(),
        email: faker.internet.email(),
        phone: faker.phone.number('###########'), // e.g., 1234567890
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.stateAbbr(), // e.g., 'NY', 'CA'
        zip: faker.location.zipCode('#####'),
    };
}

// e2e/src/models/retailer.model.ts
/**
 * Interface representing the data structure for a Retailer.
 * This ensures type safety when working with retailer data.
 */
export interface Retailer {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

// e2e/src/pages/loginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { LOGIN_USERS, DEFAULT_TIMEOUT } from '../../constants/appConstants';

/**
 * Represents the Login Page of the application.
 * Follows the Page Object Model (POM) pattern.
 */
export class LoginPage {
    private readonly page: Page;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;

    /**
     * Initializes the Login Page Page Object.
     * @param page Playwright Page object.
     */
    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.getByLabel('Username').or(page.getByPlaceholder('Enter your username'));
        this.passwordInput = page.getByLabel('Password').or(page.getByPlaceholder('Enter your password'));
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.locator('.error-message'); // Assuming an error message element
    }

    /**
     * Navigates to the login page.
     */
    async navigate(): Promise<void> {
        await this.page.goto('/login');
        await expect(this.loginButton).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    }

    /**
     * Logs in a user with specified credentials.
     * @param userRole The role of the user to log in (e.g., 'SALESMAN').
     */
    async login(userRole: keyof typeof LOGIN_USERS = 'SALESMAN'): Promise<void> {
        const user = LOGIN_USERS[userRole];
        if (!user) {
            throw new Error(`User role '${userRole}' not found in LOGIN_USERS.`);
        }

        await expect(this.usernameInput).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
        await this.loginButton.click();

        // Wait for navigation after login. Assuming it goes to dashboard or home page ('/')
        await this.page.waitForURL('/', { timeout: DEFAULT_TIMEOUT });
        console.log(`Successfully logged in as ${userRole}.`);
    }

    /**
     * Expects a specific error message to be visible on the login page.
     * @param message The expected error message text.
     */
    async expectErrorMessage(message: string): Promise<void> {
        await expect(this.errorMessage).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        await expect(this.errorMessage).toHaveText(message);
    }
}

// e2e/src/pages/dashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { DEFAULT_TIMEOUT } from '../../constants/appConstants';

/**
 * Represents the Dashboard Page of the application after successful login.
 * Provides methods to navigate to different sections.
 */
export class DashboardPage {
    private readonly page: Page;
    private readonly createRetailerLink: Locator;
    private readonly welcomeMessage: Locator;

    /**
     * Initializes the Dashboard Page Page Object.
     * @param page Playwright Page object.
     */
    constructor(page: Page) {
        this.page = page;
        this.createRetailerLink = page.getByRole('link', { name: 'Create New Retailer' }).or(page.getByTestId('create-retailer-nav-link'));
        this.welcomeMessage = page.locator('text=Welcome, Salesman').or(page.locator('.welcome-message')); // Assuming a welcome message
    }

    /**
     * Verifies that the dashboard page is loaded and displays a welcome message.
     */
    async expectDashboardLoaded(): Promise<void> {
        await expect(this.page).toHaveURL('/', { timeout: DEFAULT_TIMEOUT });
        await expect(this.welcomeMessage).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        console.log('Dashboard loaded successfully.');
    }

    /**
     * Navigates to the "Create Retailer" page/form.
     */
    async navigateToCreateRetailer(): Promise<void> {
        await expect(this.createRetailerLink).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        await this.createRetailerLink.click();
        await this.page.waitForURL(/.*\/retailers\/new/, { timeout: DEFAULT_TIMEOUT });
        console.log('Navigated to Create New Retailer page.');
    }
}

// e2e/src/pages/retailer/createRetailerPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { Retailer } from '../../models/retailer.model';
import { DEFAULT_TIMEOUT } from '../../../constants/appConstants';

/**
 * Represents the "Create New Retailer" Page/Form.
 * Provides methods to interact with the retailer creation form.
 */
export class CreateRetailerPage {
    private readonly page: Page;
    // Form fields
    public readonly retailerNameInput: Locator;
    public readonly emailInput: Locator;
    public readonly phoneInput: Locator;
    public readonly addressInput: Locator;
    public readonly cityInput: Locator;
    public readonly stateSelect: Locator;
    public readonly zipInput: Locator;
    // Actions
    private readonly submitButton: Locator;
    private readonly cancelButton: Locator;
    // Messages
    private readonly successMessage: Locator;
    private readonly formErrorMessage: Locator; // General form error, if any

    /**
     * Initializes the CreateRetailerPage Page Object.
     * @param page Playwright Page object.
     */
    constructor(page: Page) {
        this.page = page;
        // Locators for input fields
        this.retailerNameInput = page.getByLabel('Retailer Name');
        this.emailInput = page.getByLabel('Email');
        this.phoneInput = page.getByLabel('Phone Number');
        this.addressInput = page.getByLabel('Address');
        this.cityInput = page.getByLabel('City');
        this.stateSelect = page.getByLabel('State'); // Assuming a select dropdown
        this.zipInput = page.getByLabel('Zip Code');

        // Locators for buttons
        this.submitButton = page.getByRole('button', { name: 'Create Retailer' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });

        // Locators for messages
        this.successMessage = page.getByText('Retailer created successfully!');
        this.formErrorMessage = page.locator('.form-error-message'); // General error for the form
    }

    /**
     * Verifies that the Create Retailer page is loaded.
     */
    async expectPageLoaded(): Promise<void> {
        await expect(this.retailerNameInput).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        await expect(this.submitButton).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        console.log('Create Retailer page loaded.');
    }

    /**
     * Fills in all mandatory retailer details in the form.
     * @param retailer An object containing retailer data.
     */
    async fillRetailerDetails(retailer: Retailer): Promise<void> {
        await this.retailerNameInput.fill(retailer.name);
        await this.emailInput.fill(retailer.email);
        await this.phoneInput.fill(retailer.phone);
        await this.addressInput.fill(retailer.address);
        await this.cityInput.fill(retailer.city);
        await this.stateSelect.selectOption(retailer.state); // Selects by value, label, or index
        await this.zipInput.fill(retailer.zip);
        console.log(`Filled details for retailer: ${retailer.name}`);
    }

    /**
     * Submits the retailer creation form.
     */
    async submitForm(): Promise<void> {
        await expect(this.submitButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT });
        await this.submitButton.click();
        console.log('Retailer creation form submitted.');
    }

    /**
     * Clicks the cancel button on the form.
     */
    async cancelForm(): Promise<void> {
        await this.cancelButton.click();
        console.log('Retailer creation cancelled.');
    }

    /**
     * Expects the success message to be visible after form submission.
     */
    async expectSuccessMessageVisible(): Promise<void> {
        await expect(this.successMessage).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        console.log('Success message "Retailer created successfully!" displayed.');
    }

    /**
     * Expects a field-specific validation error message to be visible for a given field.
     * @param fieldLabel The label of the field (e.g., 'Retailer Name').
     * @param errorMessage The specific error message text.
     */
    async expectFieldErrorMessage(fieldLabel: string, errorMessage: string): Promise<void> {
        const errorLocator = this.page.locator(`label:has-text("${fieldLabel}") + .error-text`); // Adjust based on actual error message placement
        await expect(errorLocator).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        await expect(errorLocator).toHaveText(errorMessage);
        console.log(`Expected error "${errorMessage}" for field "${fieldLabel}" is visible.`);
    }
}

// e2e/src/pages/retailer/retailerListPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { DEFAULT_TIMEOUT } from '../../../constants/appConstants';

/**
 * Represents the Retailer List Page where created retailers are displayed.
 * Provides methods to verify retailer presence.
 */
export class RetailerListPage {
    private readonly page: Page;
    private readonly retailerListTable: Locator;
    private readonly noRetailersMessage: Locator;

    /**
     * Initializes the RetailerListPage Page Object.
     * @param page Playwright Page object.
     */
    constructor(page: Page) {
        this.page = page;
        this.retailerListTable = page.locator('.retailer-list-table'); // Assuming a table with class 'retailer-list-table'
        this.noRetailersMessage = page.getByText('No retailers found.');
    }

    /**
     * Navigates to the retailer list page.
     */
    async navigateToRetailerList(): Promise<void> {
        await this.page.goto('/retailers');
        await expect(this.page).toHaveURL(/.*\/retailers/, { timeout: DEFAULT_TIMEOUT });
        console.log('Navigated to Retailer List page.');
    }

    /**
     * Expects a specific retailer to be present in the list, identified by its name.
     * @param retailerName The name of the retailer to search for.
     */
    async expectRetailerInList(retailerName: string): Promise<void> {
        await expect(this.retailerListTable).toBeVisible({ timeout: DEFAULT_TIMEOUT }); // Wait for the table to load
        const retailerRow = this.page.locator(`.retailer-list-table tr:has-text("${retailerName}")`);
        await expect(retailerRow).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        console.log(`Verified retailer "${retailerName}" is present in the list.`);
    }

    /**
     * Expects a specific retailer NOT to be present in the list.
     * @param retailerName The name of the retailer to search for.
     */
    async expectRetailerNotInList(retailerName: string): Promise<void> {
        const retailerRow = this.page.locator(`.retailer-list-table tr:has-text("${retailerName}")`);
        await expect(retailerRow).not.toBeVisible({ timeout: DEFAULT_TIMEOUT });
        console.log(`Verified retailer "${retailerName}" is NOT present in the list.`);
    }

    /**
     * Expects the "No retailers found" message to be visible.
     */
    async expectNoRetailersMessage(): Promise<void> {
        await expect(this.noRetailersMessage).toBeVisible({ timeout: DEFAULT_TIMEOUT });
        console.log('"No retailers found" message is visible.');
    }
}

// e2e/tests/retailer/createRetailer.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/loginPage';
import { DashboardPage } from '../../src/pages/dashboardPage';
import { CreateRetailerPage } from '../../src/pages/retailer/createRetailerPage';
import { RetailerListPage } from '../../src/pages/retailer/retailerListPage';
import { generateRetailerData } from '../../helpers/dataGenerator';
import { APP_URL } from '../../constants/appConstants';

/**
 * Test suite for "Retailer Management - Create New Retailer" functionality.
 * Covers user story: "As a Salesman, I should be able to create a new Retailer by entering mandatory details."
 */
test.describe('Retailer Management - Create New Retailer', () => {

    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;
    let createRetailerPage: CreateRetailerPage;
    let retailerListPage: RetailerListPage;

    // Before each test, initialize page objects and log in as a salesman
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        createRetailerPage = new CreateRetailerPage(page);
        retailerListPage = new RetailerListPage(page);

        // Navigate to the base URL and perform login
        await page.goto(APP_URL);
        await loginPage.login('SALESMAN');
        await dashboardPage.expectDashboardLoaded();
    });

    /**
     * Test Case ID: TC_RETAIL_001
     * Description: Verify successful creation of a new Retailer with all mandatory fields.
     */
    test('should successfully create a new retailer with all mandatory details', async ({ page }) => {
        // Add test case metadata for reporting
        test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAIL_001' });
        test.info().annotations.push({ type: 'User Story', description: 'As a Salesman, I should be able to create a new Retailer by entering mandatory details.' });
        test.info().annotations.push({ type: 'Severity', description: 'Critical' });

        // Generate unique retailer data for the test
        const newRetailer = generateRetailerData();
        console.log('Attempting to create retailer with data:', newRetailer);

        // 1. Navigate to the create retailer page
        await dashboardPage.navigateToCreateRetailer();
        await createRetailerPage.expectPageLoaded();

        // 2. Fill in all mandatory retailer details
        await createRetailerPage.fillRetailerDetails(newRetailer);

        // 3. Submit the form
        await createRetailerPage.submitForm();

        // 4. Assert success message is displayed
        await createRetailerPage.expectSuccessMessageVisible();
        await expect(page).toHaveURL(/.*\/retailers\/\d+/); // Assuming redirect to retailer detail page or list

        // 5. Optionally, navigate to the retailer list and verify the new retailer appears
        await retailerListPage.navigateToRetailerList();
        await retailerListPage.expectRetailerInList(newRetailer.name);

        console.log(`Test 'TC_RETAIL_001' passed: Retailer '${newRetailer.name}' created and verified successfully.`);
    });

    /**
     * Test Case ID: TC_RETAIL_002
     * Description: Verify error message when trying to create a Retailer with missing mandatory 'Retailer Name'.
     */
    test('should show validation error for missing mandatory Retailer Name', async ({ page }) => {
        test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAIL_002' });
        test.info().annotations.push({ type: 'User Story', description: 'As a Salesman, I should be able to create a new Retailer by entering mandatory details.' });
        test.info().annotations.push({ type: 'Severity', description: 'High' });

        const newRetailer = generateRetailerData(); // Generate full data, then omit name
        console.log('Attempting to create retailer with missing name:', { ...newRetailer, name: '<<MISSING>>' });

        await dashboardPage.navigateToCreateRetailer();
        await createRetailerPage.expectPageLoaded();

        // Fill all details EXCEPT the retailer name
        // await createRetailerPage.retailerNameInput.fill(''); // Omit filling this field or clear it if pre-filled
        await createRetailerPage.emailInput.fill(newRetailer.email);
        await createRetailerPage.phoneInput.fill(newRetailer.phone);
        await createRetailerPage.addressInput.fill(newRetailer.address);
        await createRetailerPage.cityInput.fill(newRetailer.city);
        await createRetailerPage.stateSelect.selectOption(newRetailer.state);
        await createRetailerPage.zipInput.fill(newRetailer.zip);

        await createRetailerPage.submitForm();

        // Assert that the success message is NOT visible
        await expect(createRetailerPage.successMessage).not.toBeVisible();

        // Assert the field-specific error message for 'Retailer Name'
        await createRetailerPage.expectFieldErrorMessage('Retailer Name', 'Retailer Name is required.'); // Assuming specific error text
        await expect(page).toHaveURL(/.*\/retailers\/new/); // Should remain on the same page

        console.log('Test \'TC_RETAIL_002\' passed: Validation error for missing Retailer Name displayed correctly.');
    });

    /**
     * Test Case ID: TC_RETAIL_003
     * Description: Verify cancellation of Retailer creation returns to dashboard or list.
     */
    test('should allow cancellation of retailer creation', async ({ page }) => {
        test.info().annotations.push({ type: 'Test Case ID', description: 'TC_RETAIL_003' });
        test.info().annotations.push({ type: 'User Story', description: 'As a Salesman, I should be able to create a new Retailer.' });
        test.info().annotations.push({ type: 'Severity', description: 'Medium' });

        await dashboardPage.navigateToCreateRetailer();
        await createRetailerPage.expectPageLoaded();

        const newRetailer = generateRetailerData();
        // Optionally fill some details before cancelling
        await createRetailerPage.retailerNameInput.fill(newRetailer.name);
        await createRetailerPage.emailInput.fill(newRetailer.email);

        await createRetailerPage.cancelForm();

        // Assert that the page navigates away from the create form
        // Assuming it navigates back to the dashboard or retailer list
        await expect(page).not.toHaveURL(/.*\/retailers\/new/);
        await expect(page).toHaveURL(/.*\/retailers/); // Or to the dashboard: /
        await retailerListPage.expectRetailerNotInList(newRetailer.name); // Ensure no partial creation occurred

        console.log('Test \'TC_RETAIL_003\' passed: Retailer creation cancelled successfully.');
    });

});
```