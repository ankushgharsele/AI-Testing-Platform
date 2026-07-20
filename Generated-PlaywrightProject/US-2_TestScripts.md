```typescript
// createRetailer.spec.ts

import { test, expect, Page } from '@playwright/test';

/**
 * Assumed Page Objects Interfaces (not generated as per instructions, but used for type safety and clarity)
 * In a real project, these would be actual classes imported from a 'page-objects' directory.
 */
interface ILoginPage {
    navigate(): Promise<void>;
    login(username: string, password: string): Promise<void>;
    getLoginErrorMessage(): Promise<string | null>;
}

interface IRetailerPage {
    navigateToCreateRetailer(): Promise<void>;
    fillRetailerForm(details: {
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
        address: string;
        country: string;
        city: string;
        zipCode: string;
    }): Promise<void>;
    submitForm(): Promise<void>;
    getFormFieldErrorMessage(fieldId: string): Promise<string | null>;
    getSuccessNotificationText(): Promise<string | null>;
    isRetailerListed(retailerName: string): Promise<boolean>;
    page: Page; // Added to allow direct page interactions if needed
}

// Assume the following classes exist and are imported
// import { LoginPage } from '../page-objects/loginPage';
// import { RetailerPage } from '../page-objects/retailerPage';

// Placeholder for actual Page Object instantiation
// In a real project, these would be initialized in `beforeEach` or passed via `test.use`
let loginPage: ILoginPage;
let retailerPage: IRetailerPage;

test.describe('US-002 - Create Retailer Functionality', () => {

    test.beforeEach(async ({ page }) => {
        // Initialize Page Objects for each test
        // In a real project, you would instantiate your actual Page Object classes here.
        loginPage = {
            page: page,
            async navigate() { await page.goto('/login'); },
            async login(username, password) {
                await page.fill('#email', username);
                await page.fill('#password', password);
                await page.click('#login-button');
                await page.waitForURL('/dashboard'); // Wait for successful login redirect
            },
            async getLoginErrorMessage() { return page.locator('#login-error-message').textContent(); }
        };

        retailerPage = {
            page: page,
            async navigateToCreateRetailer() { await page.goto('/retailers/create'); },
            async fillRetailerForm(details) {
                await page.fill('#retailerName', details.name);
                await page.fill('#contactPerson', details.contactPerson);
                await page.fill('#email', details.email);
                await page.fill('#phone', details.phone);
                await page.fill('#address', details.address);
                await page.selectOption('#country', { label: details.country }); // Assuming select by label
                await page.fill('#city', details.city);
                await page.fill('#zipCode', details.zipCode);
            },
            async submitForm() { await page.click('#submitRetailer'); },
            async getFormFieldErrorMessage(fieldId) {
                const errorLocator = page.locator(`#${fieldId}-error`);
                return errorLocator.isVisible() ? errorLocator.textContent() : null;
            },
            async getSuccessNotificationText() {
                const successToast = page.locator('.toast-success');
                await successToast.waitFor({ state: 'visible' });
                return successToast.textContent();
            },
            async isRetailerListed(retailerName) {
                await page.goto('/retailers'); // Navigate to retailer list page
                const retailerRow = page.locator(`tr:has-text("${retailerName}")`);
                return retailerRow.isVisible();
            }
        };

        // --- Perform Login before each test ---
        await loginPage.navigate();
        await loginPage.login(
            process.env.GH_USERNAME || 'salesman@example.com', // Use environment variables for credentials
            process.env.GH_PASSWORD || 'Salesman@123'
        );
        await expect(page).toHaveURL('/dashboard'); // Verify redirection to dashboard after login
    });

    test('should allow a Salesman to create a new Retailer with valid mandatory details @retailer @create @positive @smoke', async ({ page }) => {
        const retailerData = {
            name: `Test Retailer ${Date.now()}`,
            contactPerson: 'John Doe',
            email: `john.doe.${Date.now()}@example.com`,
            phone: '123-456-7890',
            address: '123 Retailer St',
            country: 'United States',
            city: 'New York',
            zipCode: '10001',
        };

        await test.step('Navigate to Create Retailer page', async () => {
            await retailerPage.navigateToCreateRetailer();
            await expect(page).toHaveURL('/retailers/create');
            await expect(page.locator('h1')).toHaveText('Create New Retailer');
        });

        await test.step('Fill in all mandatory details', async () => {
            await retailerPage.fillRetailerForm(retailerData);
        });

        await test.step('Submit the form', async () => {
            await retailerPage.submitForm();
        });

        await test.step('Verify success notification and redirection', async () => {
            const successMessage = await retailerPage.getSuccessNotificationText();
            expect(successMessage).toContain('Retailer created successfully!');
            await expect(page).toHaveURL('/retailers'); // Assuming redirect to retailer list page
        });

        await test.step('Verify the new retailer is listed', async () => {
            const isListed = await retailerPage.isRetailerListed(retailerData.name);
            expect(isListed).toBeTruthy(`Retailer "${retailerData.name}" should be listed in the table.`);
        });
    });

    test('should prevent creating a Retailer with missing mandatory "Name" field @retailer @create @negative @regression', async ({ page }) => {
        const retailerData = {
            name: '', // Missing name
            contactPerson: 'Jane Smith',
            email: `jane.smith.${Date.now()}@example.com`,
            phone: '987-654-3210',
            address: '456 Missing Name Rd',
            country: 'Canada',
            city: 'Toronto',
            zipCode: 'M5V 2J9',
        };

        await test.step('Navigate to Create Retailer page', async () => {
            await retailerPage.navigateToCreateRetailer();
            await expect(page).toHaveURL('/retailers/create');
        });

        await test.step('Fill in details, leaving "Name" empty', async () => {
            await retailerPage.fillRetailerForm(retailerData);
        });

        await test.step('Attempt to submit the form', async () => {
            await retailerPage.submitForm();
        });

        await test.step('Verify "Name" field displays an error message', async () => {
            const errorMessage = await retailerPage.getFormFieldErrorMessage('retailerName');
            expect(errorMessage).not.toBeNull();
            expect(errorMessage).toContain('Retailer Name is required');
        });

        await test.step('Verify no success notification appears and page remains on create form', async () => {
            await expect(page.locator('.toast-success')).not.toBeVisible();
            await expect(page).toHaveURL('/retailers/create');
        });
    });

    test('should prevent creating a Retailer with an invalid "Email" format @retailer @create @negative @regression', async ({ page }) => {
        const retailerData = {
            name: `Invalid Email Retailer ${Date.now()}`,
            contactPerson: 'Bob Johnson',
            email: 'invalid-email', // Invalid email format
            phone: '555-123-4567',
            address: '789 Bad Email Blvd',
            country: 'Mexico',
            city: 'Mexico City',
            zipCode: '01000',
        };

        await test.step('Navigate to Create Retailer page', async () => {
            await retailerPage.navigateToCreateRetailer();
            await expect(page).toHaveURL('/retailers/create');
        });

        await test.step('Fill in details with an invalid "Email"', async () => {
            await retailerPage.fillRetailerForm(retailerData);
        });

        await test.step('Attempt to submit the form', async () => {
            await retailerPage.submitForm();
        });

        await test.step('Verify "Email" field displays an error message', async () => {
            const errorMessage = await retailerPage.getFormFieldErrorMessage('email');
            expect(errorMessage).not.toBeNull();
            expect(errorMessage).toContain('Invalid email format');
        });

        await test.step('Verify no success notification appears and page remains on create form', async () => {
            await expect(page.locator('.toast-success')).not.toBeVisible();
            await expect(page).toHaveURL('/retailers/create');
        });
    });

    test('should prevent creating a Retailer with a duplicate "Name" (if business rule exists) @retailer @create @negative @regression', async ({ page }) => {
        // This test assumes a backend validation for duplicate names.
        // First, create a retailer to ensure a duplicate exists.
        const duplicateRetailerName = `Duplicate Test Retailer ${Date.now()}`;
        const initialRetailerData = {
            name: duplicateRetailerName,
            contactPerson: 'First Contact',
            email: `first.contact.${Date.now()}@example.com`,
            phone: '111-222-3333',
            address: '100 Duplicate St',
            country: 'United States',
            city: 'Chicago',
            zipCode: '60601',
        };

        await test.step('Create the first retailer successfully', async () => {
            await retailerPage.navigateToCreateRetailer();
            await retailerPage.fillRetailerForm(initialRetailerData);
            await retailerPage.submitForm();
            const successMessage = await retailerPage.getSuccessNotificationText();
            expect(successMessage).toContain('Retailer created successfully!');
            await expect(page).toHaveURL('/retailers');
        });

        // Now attempt to create another retailer with the same name
        const duplicateAttemptRetailerData = {
            name: duplicateRetailerName, // Duplicate name
            contactPerson: 'Second Contact',
            email: `second.contact.${Date.now()}@example.com`,
            phone: '444-555-6666',
            address: '200 Attempt St',
            country: 'United States',
            city: 'Los Angeles',
            zipCode: '90001',
        };

        await test.step('Navigate to Create Retailer page again', async () => {
            await retailerPage.navigateToCreateRetailer();
            await expect(page).toHaveURL('/retailers/create');
        });

        await test.step('Fill in details with the duplicate name', async () => {
            await retailerPage.fillRetailerForm(duplicateAttemptRetailerData);
        });

        await test.step('Attempt to submit the form', async () => {
            await retailerPage.submitForm();
        });

        await test.step('Verify an error message indicating duplicate name', async () => {
            // This might be a field-specific error or a general form error/toast from the backend
            const formErrorMessage = await page.locator('#retailerName-error').textContent(); // Assuming field-specific
            // Or a general toast/banner: const generalErrorMessage = await page.locator('.toast-error').textContent();
            expect(formErrorMessage).not.toBeNull();
            expect(formErrorMessage).toContain('Retailer Name already exists');
        });

        await test.step('Verify no success notification appears and page remains on create form', async () => {
            await expect(page.locator('.toast-success')).not.toBeVisible();
            await expect(page).toHaveURL('/retailers/create');
        });
    });

    test.afterEach(async ({ page }) => {
        // Optional: Clean up created retailers if necessary.
        // For this exercise, we'll just navigate back to the dashboard or close the page.
        await page.goto('/dashboard');
    });

});
```

```typescript
// Login.spec.ts

import { test, expect } from '@playwright/test';

/**
 * Assumed Page Object Interface for LoginPage (not generated as per instructions)
 * In a real project, this would be an actual class imported from a 'page-objects' directory.
 */
interface ILoginPage {
    navigate(): Promise<void>;
    fillEmail(email: string): Promise<void>;
    fillPassword(password: string): Promise<void>;
    clickLoginButton(): Promise<void>;
    getLoginErrorMessage(): Promise<string | null>;
    page: Page; // Added to allow direct page interactions if needed
}

// Placeholder for actual Page Object instantiation
let loginPage: ILoginPage;

test.describe('Login Functionality', () => {

    test.beforeEach(async ({ page }) => {
        // Initialize LoginPage Page Object for each test
        // In a real project, you would instantiate your actual LoginPage class here.
        loginPage = {
            page: page,
            async navigate() { await page.goto('/login'); },
            async fillEmail(email) { await page.fill('#email', email); },
            async fillPassword(password) { await page.fill('#password', password); },
            async clickLoginButton() { await page.click('#login-button'); },
            async getLoginErrorMessage() {
                const errorLocator = page.locator('#login-error-message');
                return errorLocator.isVisible() ? errorLocator.textContent() : null;
            }
        };
        await loginPage.navigate();
        await expect(page).toHaveURL('/login'); // Ensure we are on the login page
    });

    test('should allow a user to log in successfully with valid credentials @login @positive @smoke', async ({ page }) => {
        const username = process.env.GH_USERNAME || 'salesman@example.com';
        const password = process.env.GH_PASSWORD || 'Salesman@123';

        await test.step('Enter valid email and password', async () => {
            await loginPage.fillEmail(username);
            await loginPage.fillPassword(password);
        });

        await test.step('Click the Login button', async () => {
            await loginPage.clickLoginButton();
        });

        await test.step('Verify successful redirection to dashboard', async () => {
            await expect(page).toHaveURL('/dashboard'); // Assuming dashboard is the post-login page
            await expect(page.locator('h1')).toHaveText('Dashboard'); // Verify a prominent element
        });
    });

    test('should prevent a user from logging in with invalid password @login @negative @regression', async ({ page }) => {
        const username = process.env.GH_USERNAME || 'salesman@example.com';
        const invalidPassword = 'WrongPassword123';

        await test.step('Enter valid email and invalid password', async () => {
            await loginPage.fillEmail(username);
            await loginPage.fillPassword(invalidPassword);
        });

        await test.step('Click the Login button', async () => {
            await loginPage.clickLoginButton();
        });

        await test.step('Verify error message is displayed', async () => {
            const errorMessage = await loginPage.getLoginErrorMessage();
            expect(errorMessage).not.toBeNull();
            expect(errorMessage).toContain('Invalid credentials'); // Or specific message from UI
            await expect(page).toHaveURL('/login'); // Should remain on login page
        });
    });

    test('should prevent a user from logging in with invalid email format @login @negative @regression', async ({ page }) => {
        const invalidEmail = 'invalid-email-format';
        const password = process.env.GH_PASSWORD || 'Salesman@123';

        await test.step('Enter invalid email format and a password', async () => {
            await loginPage.fillEmail(invalidEmail);
            await loginPage.fillPassword(password);
        });

        await test.step('Click the Login button', async () => {
            await loginPage.clickLoginButton();
        });

        await test.step('Verify email format error message is displayed', async () => {
            // Assuming an inline validation for email format before backend check
            const emailErrorLocator = page.locator('#email-error');
            await expect(emailErrorLocator).toBeVisible();
            await expect(emailErrorLocator).toHaveText('Please enter a valid email address.');
            await expect(page).toHaveURL('/login'); // Should remain on login page
        });
    });

    test('should prevent a user from logging in with an unregistered email @login @negative @regression', async ({ page }) => {
        const unregisteredEmail = `unregistered_${Date.now()}@example.com`;
        const password = process.env.GH_PASSWORD || 'Salesman@123';

        await test.step('Enter an unregistered email and a password', async () => {
            await loginPage.fillEmail(unregisteredEmail);
            await loginPage.fillPassword(password);
        });

        await test.step('Click the Login button', async () => {
            await loginPage.clickLoginButton();
        });

        await test.step('Verify error message for unregistered user', async () => {
            const errorMessage = await loginPage.getLoginErrorMessage();
            expect(errorMessage).not.toBeNull();
            expect(errorMessage).toContain('User not found'); // Or specific message from UI
            await expect(page).toHaveURL('/login'); // Should remain on login page
        });
    });
});
```