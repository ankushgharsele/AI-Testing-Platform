```typescript
// pages/BasePage.ts
import { Page, expect, Locator } from '@playwright/test';

/**
 * BasePage provides common functionalities and methods that can be reused across all page objects.
 * It encapsulates basic browser interactions like navigation, waiting, and common assertions.
 * All other page objects should extend this class.
 */
export class BasePage {
    protected readonly page: Page;

    /**
     * Initializes a new instance of the BasePage class.
     * @param page The Playwright Page object.
     */
    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigates the browser to the specified URL.
     * @param url The URL to navigate to.
     * @param timeout Optional timeout for navigation in milliseconds. Defaults to Playwright's default.
     */
    async navigateTo(url: string, timeout?: number): Promise<void> {
        console.log(`Navigating to URL: ${url}`);
        await this.page.goto(url, { timeout: timeout });
    }

    /**
     * Waits for the network to be idle or a specific selector to appear, indicating the page has loaded.
     * This is a generic wait, specific page objects might implement more precise waits.
     * @param selector Optional selector to wait for. If not provided, waits for network idle.
     * @param timeout Optional timeout for waiting.
     */
    async waitForPageLoad(selector?: Locator, timeout?: number): Promise<void> {
        if (selector) {
            console.log(`Waiting for selector: ${selector.selector}`);
            await selector.waitFor({ state: 'visible', timeout: timeout });
        } else {
            console.log('Waiting for network idle...');
            await this.page.waitForLoadState('networkidle', { timeout: timeout });
        }
        console.log('Page load state reached.');
    }

    /**
     * Verifies that the current page's URL matches the expected URL.
     * @param expectedUrl The expected URL.
     * @param timeout Optional timeout for the assertion.
     */
    async verifyPageUrl(expectedUrl: string, timeout?: number): Promise<void> {
        console.log(`Asserting current URL to be: ${expectedUrl}`);
        await expect(this.page).toHaveURL(expectedUrl, { timeout: timeout });
    }

    /**
     * Verifies that the current page's title matches the expected title.
     * @param expectedTitle The expected page title.
     * @param timeout Optional timeout for the assertion.
     */
    async verifyPageTitle(expectedTitle: string, timeout?: number): Promise<void> {
        console.log(`Asserting page title to be: ${expectedTitle}`);
        await expect(this.page).toHaveTitle(expectedTitle, { timeout: timeout });
    }

    /**
     * Waits for an element to be visible and clicks it.
     * @param locator The Playwright Locator for the element.
     * @param timeout Optional timeout for the click action.
     */
    async clickElement(locator: Locator, timeout?: number): Promise<void> {
        console.log(`Clicking element: ${locator.selector}`);
        await locator.click({ timeout: timeout });
    }

    /**
     * Waits for an element to be visible and fills it with the provided text.
     * @param locator The Playwright Locator for the element.
     * @param value The text value to fill into the element.
     * @param timeout Optional timeout for the fill action.
     */
    async fillElement(locator: Locator, value: string, timeout?: number): Promise<void> {
        console.log(`Filling element: ${locator.selector} with value: [REDACTED]`);
        await locator.fill(value, { timeout: timeout });
    }
}
```

```typescript
// pages/LoginPage.ts
import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { DashboardPage } from './DashboardPage'; // Import DashboardPage for chaining

/**
 * LoginPage represents the login page of the application.
 * It provides methods to interact with login elements and perform login actions.
 */
export class LoginPage extends BasePage {
    // Locators
    protected readonly usernameInput: Locator;
    protected readonly passwordInput: Locator;
    protected readonly loginButton: Locator;
    protected readonly errorMessage: Locator; // Optional: for invalid login scenarios

    // Configuration constants (could be moved to a config file in a larger project)
    private readonly loginPageUrl: string = '/login'; // Assuming base URL is configured in playwright.config.ts
    private readonly loginPageTitle: string = 'Login | Application Name'; // Example title

    /**
     * Initializes a new instance of the LoginPage class.
     * @param page The Playwright Page object.
     */
    constructor(page: Page) {
        super(page);
        // Initialize locators using Playwright's recommended best practices
        this.usernameInput = page.getByLabel('Username');
        this.passwordInput = page.getByLabel('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.locator('.error-message'); // Example for an error message locator
    }

    /**
     * Navigates directly to the login page.
     */
    async navigateToLoginPage(): Promise<void> {
        await this.navigateTo(this.loginPageUrl);
        await this.verifyLoginPageIsDisplayed(); // Verify after navigation
        console.log('Navigated to Login Page successfully.');
    }

    /**
     * Enters the username into the username input field.
     * @param username The username to enter.
     */
    async enterUsername(username: string): Promise<void> {
        await this.fillElement(this.usernameInput, username);
    }

    /**
     * Enters the password into the password input field.
     * @param password The password to enter.
     */
    async enterPassword(password: string): Promise<void> {
        await this.fillElement(this.passwordInput, password);
    }

    /**
     * Clicks the login button.
     * This method does not wait for navigation, as the `login` method will handle the next page object creation.
     */
    async clickLoginButton(): Promise<void> {
        await this.clickElement(this.loginButton);
    }

    /**
     * Performs a complete login action with the given credentials.
     * Upon successful login, it returns an instance of DashboardPage.
     * @param username The username to log in with.
     * @param password The password to log in with.
     * @returns A Promise that resolves to a DashboardPage instance.
     */
    async login(username: string, password: string): Promise<DashboardPage> {
        console.log(`Attempting to login with username: ${username}`);
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
        console.log('Login button clicked. Expecting navigation to Dashboard.');
        // After clicking login, Playwright automatically waits for navigation by default
        // The next page object can be created directly
        return new DashboardPage(this.page);
    }

    /**
     * Verifies that the login page is currently displayed.
     * Checks URL, title, and the presence of key login elements.
     */
    async verifyLoginPageIsDisplayed(): Promise<void> {
        await this.verifyPageUrl(new RegExp(this.loginPageUrl + '$')); // Use regex for robust URL matching
        await this.verifyPageTitle(this.loginPageTitle);
        await expect(this.usernameInput, 'Username input field should be visible').toBeVisible();
        await expect(this.passwordInput, 'Password input field should be visible').toBeVisible();
        await expect(this.loginButton, 'Login button should be visible').toBeVisible();
        console.log('Login Page is successfully displayed and verified.');
    }

    /**
     * Retrieves the text of the error message, if visible.
     * @returns A Promise that resolves to the error message text or an empty string if not visible.
     */
    async getErrorMessageText(): Promise<string> {
        if (await this.errorMessage.isVisible()) {
            const text = await this.errorMessage.textContent();
            console.log(`Login error message: ${text}`);
            return text || '';
        }
        return '';
    }
}
```

```typescript
// pages/DashboardPage.ts
import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage represents the application's dashboard page.
 * It provides methods to interact with dashboard elements and verify its state.
 */
export class DashboardPage extends BasePage {
    // Locators
    protected readonly welcomeMessage: Locator;
    protected readonly createOrderButton: Locator;
    protected readonly userProfileLink: Locator;
    protected readonly logoutButton: Locator;

    // Configuration constants
    private readonly dashboardPageUrl: string = '/dashboard'; // Example dashboard URL
    private readonly dashboardPageTitle: string = 'Dashboard | Application Name'; // Example title

    /**
     * Initializes a new instance of the DashboardPage class.
     * @param page The Playwright Page object.
     */
    constructor(page: Page) {
        super(page);
        // Initialize locators
        this.welcomeMessage = page.getByText(/Welcome, Salesman/i); // Case-insensitive match
        this.createOrderButton = page.getByRole('link', { name: 'Create Order' });
        this.userProfileLink = page.getByRole('link', { name: 'Salesman Profile' });
        this.logoutButton = page.getByRole('button', { name: 'Logout' });
    }

    /**
     * Verifies that the Dashboard page is currently displayed.
     * Checks URL, title, and the presence of key dashboard elements.
     */
    async verifyDashboardIsDisplayed(): Promise<void> {
        console.log('Verifying Dashboard Page is displayed...');
        await this.verifyPageUrl(new RegExp(this.dashboardPageUrl + '$'));
        await this.verifyPageTitle(this.dashboardPageTitle);
        await expect(this.welcomeMessage, 'Welcome message should be visible').toBeVisible();
        await expect(this.createOrderButton, 'Create Order button should be visible').toBeVisible();
        await expect(this.userProfileLink, 'User Profile link should be visible').toBeVisible();
        await expect(this.logoutButton, 'Logout button should be visible').toBeVisible();
        console.log('Dashboard Page is successfully displayed and verified.');
    }

    /**
     * Retrieves the welcome message displayed on the dashboard.
     * @returns A Promise that resolves to the text content of the welcome message.
     */
    async getWelcomeMessageText(): Promise<string> {
        const message = await this.welcomeMessage.textContent();
        console.log(`Dashboard welcome message: ${message}`);
        return message || '';
    }

    /**
     * Clicks the 'Create Order' button/link on the dashboard.
     * @returns A Promise that resolves when the button is clicked.
     */
    async clickCreateOrderButton(): Promise<void> {
        console.log('Clicking "Create Order" button.');
        await this.clickElement(this.createOrderButton);
        // In a real scenario, this would likely return a new Page Object for the 'Create Order' form/page
    }

    /**
     * Clicks the 'Logout' button.
     * @returns A Promise that resolves to a LoginPage instance after logout.
     */
    async logout(): Promise<LoginPage> {
        console.log('Clicking "Logout" button.');
        await this.clickElement(this.logoutButton);
        // After logout, typically returns to the login page
        return new LoginPage(this.page);
    }
}
```