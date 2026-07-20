```typescript
// utilities/Logger.ts
import * as path from 'path';

/**
 * A static utility class for logging messages with different levels.
 * This can be extended to integrate with external logging services (e.g., Winston, Log4js)
 * or centralized logging platforms (e.g., Splunk, ELK stack) in an enterprise environment.
 */
export class Logger {
    private static getTimestamp(): string {
        return new Date().toISOString();
    }

    private static formatMessage(level: string, message: string, ...args: any[]): string {
        const formattedArgs = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg));
        return `[${this.getTimestamp()}] [${level.toUpperCase()}] ${message} ${formattedArgs.join(' ')}`;
    }

    /**
     * Logs an informational message.
     * @param message - The primary message to log.
     * @param args - Additional arguments to include in the log (e.g., objects, variables).
     */
    public static info(message: string, ...args: any[]): void {
        console.info(this.formatMessage('INFO', message, ...args));
    }

    /**
     * Logs a warning message.
     * @param message - The primary message to log.
     * @param args - Additional arguments to include in the log.
     */
    public static warn(message: string, ...args: any[]): void {
        console.warn(this.formatMessage('WARN', message, ...args));
    }

    /**
     * Logs an error message.
     * Includes an optional Error object for stack trace and detailed error information.
     * @param message - The primary error message.
     * @param error - The Error object (optional).
     * @param args - Additional arguments to include in the log.
     */
    public static error(message: string, error?: Error, ...args: any[]): void {
        const errorMessage = error ? `${message}: ${error.message} \nStack: ${error.stack}` : message;
        console.error(this.formatMessage('ERROR', errorMessage, ...args));
    }

    /**
     * Logs a debug message.
     * In an enterprise setup, this typically requires a specific log level to be enabled.
     * @param message - The primary message to log.
     * @param args - Additional arguments to include in the log.
     */
    public static debug(message: string, ...args: any[]): void {
        // This can be configured via a ConfigReader or environment variable (e.g., LOG_LEVEL)
        if (process.env.LOG_LEVEL === 'DEBUG') {
            console.debug(this.formatMessage('DEBUG', message, ...args));
        }
    }
}

// utilities/WaitHelper.ts
import { Page, Locator, ExpectOptions } from '@playwright/test';
import { Logger } from './Logger';

/**
 * A static utility class providing common waiting mechanisms for Playwright Page and Locator objects.
 * Encapsulates various waiting strategies to improve test reliability and readability.
 */
export class WaitHelper {
    /**
     * Waits for an element identified by a selector to be visible and enabled on the page.
     * @param page - Playwright Page object.
     * @param selector - CSS selector of the element.
     * @param timeout - Maximum time to wait in milliseconds (defaults to 30000ms).
     */
    public static async waitForElementToBeVisibleAndEnabled(page: Page, selector: string, timeout = 30000): Promise<void> {
        try {
            await page.waitForSelector(selector, { state: 'visible', timeout });
            await page.locator(selector).waitFor({ state: 'enabled', timeout });
            Logger.info(`Waited successfully for element '${selector}' to be visible and enabled.`);
        } catch (error) {
            Logger.error(`Failed to wait for element '${selector}' to be visible and enabled.`, error as Error);
            throw error;
        }
    }

    /**
     * Waits for an element identified by a selector to be removed from the DOM.
     * @param page - Playwright Page object.
     * @param selector - CSS selector of the element.
     * @param timeout - Maximum time to wait in milliseconds (defaults to 30000ms).
     */
    public static async waitForElementToDisappear(page: Page, selector: string, timeout = 30000): Promise<void> {
        try {
            await page.waitForSelector(selector, { state: 'detached', timeout });
            Logger.info(`Waited successfully for element '${selector}' to disappear.`);
        } catch (error) {
            Logger.error(`Failed to wait for element '${selector}' to disappear.`, error as Error);
            throw error;
        }
    }

    /**
     * Waits for a specific duration in milliseconds.
     * Use sparingly, prefer explicit waits (e.g., waitForElementToBeVisibleAndEnabled) for robustness.
     * @param milliseconds - The number of milliseconds to wait.
     */
    public static async waitForTimeout(milliseconds: number): Promise<void> {
        Logger.warn(`Explicitly waiting for ${milliseconds}ms. Consider using more robust waits.`);
        await new Promise(resolve => setTimeout(resolve, milliseconds));
        Logger.info(`Finished waiting for ${milliseconds}ms.`);
    }

    /**
     * Waits for the page to reach a specific load state.
     * @param page - Playwright Page object.
     * @param state - 'load', 'domcontentloaded', or 'networkidle'.
     * @param timeout - Maximum time to wait in milliseconds (defaults to 30000ms).
     */
    public static async waitForLoadState(page: Page, state: 'load' | 'domcontentloaded' | 'networkidle' | 'commit', timeout = 30000): Promise<void> {
        try {
            await page.waitForLoadState(state, { timeout });
            Logger.info(`Waited successfully for page load state: '${state}'.`);
        } catch (error) {
            Logger.error(`Failed to wait for page load state: '${state}'.`, error as Error);
            throw error;
        }
    }

    /**
     * Waits for a network response matching a URL string or RegExp.
     * @param page - Playwright Page object.
     * @param urlMatcher - A string or RegExp to match the response URL.
     * @param timeout - Maximum time to wait in milliseconds (defaults to 30000ms).
     * @returns The Response object once a matching response is received.
     */
    public static async waitForResponse(page: Page, urlMatcher: string | RegExp, timeout = 30000): Promise<any> {
        try {
            const response = await page.waitForResponse(urlMatcher, { timeout });
            Logger.info(`Waited successfully for network response matching '${urlMatcher}'. Status: ${response.status()}.`);
            return response;
        } catch (error) {
            Logger.error(`Failed to wait for network response matching '${urlMatcher}'.`, error as Error);
            throw error;
        }
    }

    /**
     * Waits for a specific condition on a Playwright Locator.
     * @param locator - Playwright Locator object.
     * @param options - Options for the waitFor method (e.g., state: 'visible', 'hidden', 'attached', 'detached', 'stable', timeout).
     */
    public static async waitForLocatorCondition(locator: Locator, options?: ExpectOptions): Promise<void> {
        try {
            await locator.waitFor(options);
            Logger.info(`Waited for locator condition: ${JSON.stringify(options || {})} for locator '${locator}'.`);
        } catch (error) {
            Logger.error(`Failed to wait for locator condition for '${locator}'.`, error as Error);
            throw error;
        }
    }
}

// utilities/ScreenshotHelper.ts
import { Page, FullPageScreenshotOptions, LocatorScreenshotOptions } from '@playwright/test';
import { Logger } from './Logger';
import * as path from 'path';
import * as fs from 'fs';

// Define a default directory for screenshots, can be overridden by ConfigReader or ENV
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || 'test-results/screenshots';

/**
 * A static utility class for taking various types of screenshots.
 * Handles directory creation, filename generation, and integrates with the Logger.
 */
export class ScreenshotHelper {

    /**
     * Ensures the screenshot directory exists. Creates it if it doesn't.
     */
    private static ensureScreenshotDirectory(): void {
        if (!fs.existsSync(SCREENSHOT_DIR)) {
            fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
            Logger.info(`Created screenshot directory: ${SCREENSHOT_DIR}`);
        }
    }

    /**
     * Takes a full-page screenshot of the current page.
     * @param page - Playwright Page object.
     * @param filenamePrefix - A prefix for the screenshot file name (e.g., 'home_page').
     * @param options - FullPageScreenshotOptions for customization (e.g., omitBackground, clip).
     * @returns The absolute path to the saved screenshot file.
     */
    public static async takeFullPageScreenshot(
        page: Page,
        filenamePrefix: string,
        options?: FullPageScreenshotOptions
    ): Promise<string> {
        this.ensureScreenshotDirectory();
        const timestamp = Date.now();
        const screenshotPath = path.join(SCREENSHOT_DIR, `${filenamePrefix}_${timestamp}.png`);
        try {
            await page.screenshot({ path: screenshotPath, fullPage: true, ...options });
            Logger.info(`Full page screenshot taken: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            Logger.error(`Failed to take full page screenshot for '${filenamePrefix}'.`, error as Error);
            throw error;
        }
    }

    /**
     * Takes a screenshot of a specific locator/element on the page.
     * @param page - Playwright Page object.
     * @param selector - CSS selector of the element to screenshot.
     * @param filenamePrefix - A prefix for the screenshot file name.
     * @param options - LocatorScreenshotOptions for customization.
     * @returns The absolute path to the saved screenshot file.
     */
    public static async takeElementScreenshot(
        page: Page,
        selector: string,
        filenamePrefix: string,
        options?: LocatorScreenshotOptions
    ): Promise<string> {
        this.ensureScreenshotDirectory();
        const timestamp = Date.now();
        const screenshotPath = path.join(SCREENSHOT_DIR, `${filenamePrefix}_element_${timestamp}.png`);
        const locator = page.locator(selector);
        try {
            if (!(await locator.isVisible())) {
                Logger.warn(`Element with selector '${selector}' is not visible. Screenshot might be empty or partial.`);
            }
            await locator.screenshot({ path: screenshotPath, ...options });
            Logger.info(`Element screenshot taken for '${selector}': ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            Logger.error(`Failed to take element screenshot for '${selector}'.`, error as Error);
            throw error;
        }
    }

    /**
     * Takes a screenshot specifically in a failure scenario.
     * Includes current URL and a timestamp in the filename for better context.
     * @param page - Playwright Page object.
     * @param testTitle - Title of the test that failed (for filename context).
     * @returns The absolute path to the saved screenshot file.
     */
    public static async takeFailureScreenshot(
        page: Page,
        testTitle: string
    ): Promise<string> {
        this.ensureScreenshotDirectory();
        const sanitizedTitle = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = Date.now();
        const currentUrl = page.url().replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50); // Limit URL part
        const screenshotPath = path.join(SCREENSHOT_DIR, `FAILURE_${sanitizedTitle}_${currentUrl}_${timestamp}.png`);
        try {
            await page.screenshot({ path: screenshotPath, fullPage: true });
            Logger.error(`Failure screenshot taken for test '${testTitle}': ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            Logger.error(`Failed to take failure screenshot for test '${testTitle}'.`, error as Error);
            throw error;
        }
    }
}

// utilities/ConfigReader.ts
import { Logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for application configuration.
 * Extend this interface in your project to define specific configuration keys and their types.
 */
export interface AppConfig {
    [key: string]: string | number | boolean | object | undefined;
}

/**
 * A static utility class for reading configuration values.
 * It prioritizes environment variables, then an optionally loaded configuration file/object,
 * and finally provides default values. Designed for centralized configuration management.
 */
export class ConfigReader {
    private static config: AppConfig = {};
    private static isInitialized = false;

    /**
     * Initializes the ConfigReader. This method should ideally be called once
     * during the global setup of the test suite (e.g., in `global-setup.ts`).
     * It can load configuration from a JSON file or a direct object.
     * Environment variables will always override loaded settings.
     * @param configPathOrObject - Optional path to a JSON config file (e.g., 'config.json')
     *                             or a direct configuration object. If not provided, it relies
     *                             solely on environment variables and defaults.
     */
    public static initialize(configPathOrObject?: string | AppConfig): void {
        if (this.isInitialized) {
            Logger.warn('ConfigReader already initialized. Re-initialization might lead to unexpected behavior.');
            return;
        }

        if (typeof configPathOrObject === 'string') {
            try {
                const configFilePath = path.resolve(process.cwd(), configPathOrObject);
                if (fs.existsSync(configFilePath)) {
                    this.config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
                    Logger.info(`ConfigReader initialized from file: ${configFilePath}`);
                } else {
                    Logger.error(`Config file not found at: ${configFilePath}. Proceeding with empty config and relying on environment variables.`);
                }
            } catch (error) {
                Logger.error(`Failed to load config from file '${configPathOrObject}'. Proceeding with empty config and environment variables.`, error as Error);
            }
        } else if (typeof configPathOrObject === 'object' && configPathOrObject !== null) {
            this.config = { ...configPathOrObject };
            Logger.info('ConfigReader initialized from provided object.');
        } else {
            Logger.info('ConfigReader initialized without explicit config path/object. Relying on environment variables.');
        }

        this.isInitialized = true;
    }

    /**
     * Retrieves a configuration value by its key.
     * Environment variables take precedence over any loaded configuration.
     * @param key - The configuration key (e.g., 'BASE_URL', 'API_TIMEOUT').
     * @param defaultValue - An optional default value to return if the key is not found.
     * @returns The configuration value, or the default value, or undefined if neither is found.
     */
    public static get<T extends string | number | boolean | object | undefined = string>(key: string, defaultValue?: T): T | undefined {
        if (!this.isInitialized) {
            // Auto-initialize with an empty config if not explicitly initialized.
            // In a strict enterprise setup, it's better to enforce explicit initialization in global setup.
            Logger.warn('ConfigReader accessed before explicit initialization. Auto-initializing. Consider calling ConfigReader.initialize() in global setup.');
            this.initialize();
        }

        // 1. Check environment variables (highest precedence)
        if (process.env[key] !== undefined) {
            Logger.debug(`Config for key '${key}' fetched from ENV.`);
            try {
                const envValue = process.env[key]!;
                // Attempt to parse common types from string environment variables
                if (envValue.toLowerCase() === 'true') return true as T;
                if (envValue.toLowerCase() === 'false') return false as T;
                if (!isNaN(Number(envValue)) && !isNaN(parseFloat(envValue))) return Number(envValue) as T;
                return envValue as T; // Default to string if parsing fails
            } catch (e) {
                Logger.warn(`Could not parse environment variable '${key}', returning as string.`, e as Error);
                return process.env[key] as T;
            }
        }

        // 2. Check the loaded configuration object
        if (this.config[key] !== undefined) {
            Logger.debug(`Config for key '${key}' fetched from loaded config.`);
            return this.config[key] as T;
        }

        // 3. Return default value if provided
        if (defaultValue !== undefined) {
            Logger.debug(`Config for key '${key}' not found, returning provided default value.`);
            return defaultValue;
        }

        Logger.warn(`Config key '${key}' not found in environment variables or loaded config, and no default value provided.`);
        return undefined;
    }

    /**
     * Retrieves a mandatory configuration value by its key.
     * Throws an error if the key is not found in environment variables or the loaded configuration.
     * @param key - The configuration key.
     * @returns The configuration value.
     * @throws Error if the mandatory key is not found.
     */
    public static getMandatory<T extends string | number | boolean | object>(key: string): T {
        const value = this.get<T>(key);
        if (value === undefined) {
            Logger.error(`Mandatory configuration key '${key}' is not set.`);
            throw new Error(`Mandatory configuration key '${key}' is not set in environment variables or config file.`);
        }
        return value;
    }

    /**
     * Clears the current configuration and resets initialization status.
     * Useful for testing or scenarios requiring re-initialization.
     */
    public static clearConfig(): void {
        this.config = {};
        this.isInitialized = false;
        Logger.info('ConfigReader configuration cleared.');
    }
}

// utilities/TestDataReader.ts
import { Logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for a generic test data structure.
 * Projects can extend this for more specific typing of their test data.
 */
export interface TestData {
    [key: string]: any;
}

/**
 * A static utility class for loading and accessing test data from external files.
 * Primarily designed for JSON files but can be extended for other formats (CSV, YAML).
 * Includes caching to avoid redundant file reads.
 */
export class TestDataReader {
    private static loadedData: { [absolutePath: string]: TestData } = {};

    /**
     * Loads test data from a JSON file. The data is cached internally
     * to prevent redundant file system operations for subsequent reads of the same file.
     * @param filePath - The relative or absolute path to the JSON data file.
     * @returns A Promise resolving to the loaded test data object.
     * @throws Error if the file cannot be found, read, or parsed as JSON.
     */
    public static async loadJsonData(filePath: string): Promise<TestData> {
        const absolutePath = path.resolve(process.cwd(), filePath);

        // Return cached data if already loaded
        if (this.loadedData[absolutePath]) {
            Logger.debug(`Returning cached data for: ${absolutePath}`);
            return this.loadedData[absolutePath];
        }

        try {
            if (!fs.existsSync(absolutePath)) {
                const error = new Error(`Test data file not found: ${absolutePath}`);
                Logger.error(error.message, error);
                throw error;
            }
            const fileContent = await fs.promises.readFile(absolutePath, 'utf-8');
            const data: TestData = JSON.parse(fileContent);
            this.loadedData[absolutePath] = data; // Cache the loaded data
            Logger.info(`Successfully loaded test data from: ${absolutePath}`);
            return data;
        } catch (error) {
            const errorMessage = `Failed to load or parse JSON data from ${absolutePath}.`;
            Logger.error(errorMessage, error as Error);
            throw new Error(`${errorMessage} Original error: ${(error as Error).message}`);
        }
    }

    /**
     * Retrieves a specific piece of test data by a given key from a previously loaded JSON file.
     * Supports dot-separated keys for accessing nested properties (e.g., 'user.admin.username').
     * @param filePath - The path of the JSON data file from which the data was loaded.
     * @param key - The key of the data to retrieve.
     * @returns The requested data, or undefined if the file was not loaded or the key is not found.
     */
    public static getDataByKey<T = any>(filePath: string, key: string): T | undefined {
        const absolutePath = path.resolve(process.cwd(), filePath);
        const data = this.loadedData[absolutePath];

        if (!data) {
            Logger.warn(`No data loaded for file: ${absolutePath}. Call loadJsonData() first.`);
            return undefined;
        }

        // Support dot-separated keys for nested objects traversal
        const keys = key.split('.');
        let current: any = data;
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                Logger.warn(`Key '${key}' (partially at '${k}') not found in data from ${absolutePath}.`);
                return undefined;
            }
        }
        Logger.debug(`Retrieved data for key '${key}' from ${absolutePath}.`);
        return current as T;
    }

    /**
     * Clears all cached test data. This can be useful for scenarios where
     * data might change or to free up memory.
     */
    public static clearCache(): void {
        this.loadedData = {};
        Logger.info('TestDataReader cache cleared.');
    }
}

// utilities/CommonHelper.ts
import { Page, BrowserContext } from '@playwright/test';
import { Logger } from './Logger';

/**
 * A static utility class containing common, general-purpose helper methods
 * that do not fit into more specific categories (e.g., waits, screenshots).
 * Includes methods for string/number generation, date formatting, navigation,
 * and browser storage management.
 */
export class CommonHelper {

    /**
     * Generates a random alphanumeric string of a specified length.
     * @param length - The desired length of the random string (defaults to 10).
     * @returns A randomly generated string.
     */
    public static generateRandomString(length: number = 10): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        Logger.debug(`Generated random string of length ${length}.`);
        return result;
    }

    /**
     * Generates a random integer within a specified range (inclusive).
     * @param min - The minimum value for the random number.
     * @param max - The maximum value for the random number.
     * @returns A random integer between min and max (inclusive).
     */
    public static generateRandomNumber(min: number, max: number): number {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        Logger.debug(`Generated random number between ${min} and ${max}: ${randomNumber}.`);
        return randomNumber;
    }

    /**
     * Formats a given Date object into a 'YYYY-MM-DD' string.
     * @param date - The Date object to format. Defaults to the current date if not provided.
     * @returns The formatted date string.
     */
    public static formatDate(date: Date = new Date()): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        Logger.debug(`Formatted date '${date.toISOString()}' to '${formattedDate}'.`);
        return formattedDate;
    }

    /**
     * Navigates the Playwright Page to a specified URL.
     * @param page - Playwright Page object.
     * @param url - The URL to navigate to.
     * @param options - Optional navigation options (e.g., waitUntil).
     */
    public static async navigateToUrl(page: Page, url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        try {
            await page.goto(url, options);
            Logger.info(`Navigated to URL: ${url}`);
        } catch (error) {
            Logger.error(`Failed to navigate to URL: ${url}`, error as Error);
            throw error;
        }
    }

    /**
     * Clears all items from the local storage of the current page's origin.
     * @param page - Playwright Page object.
     */
    public static async clearLocalStorage(page: Page): Promise<void> {
        await page.evaluate(() => localStorage.clear());
        Logger.info('Cleared local storage.');
    }

    /**
     * Clears all items from the session storage of the current page's origin.
     * @param page - Playwright Page object.
     */
    public static async clearSessionStorage(page: Page): Promise<void> {
        await page.evaluate(() => sessionStorage.clear());
        Logger.info('Cleared session storage.');
    }

    /**
     * Clears all cookies for the given browser context.
     * @param context - Playwright BrowserContext object.
     */
    public static async clearAllCookies(context: BrowserContext): Promise<void> {
        await context.clearCookies();
        Logger.info('Cleared all cookies for the browser context.');
    }

    /**
     * Reloads the current page.
     * @param page - Playwright Page object.
     * @param options - Optional reload options (e.g., waitUntil).
     */
    public static async reloadPage(page: Page, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        try {
            await page.reload(options);
            Logger.info('Page reloaded successfully.');
        } catch (error) {
            Logger.error('Failed to reload page.', error as Error);
            throw error;
        }
    }

    /**
     * Retrieves the current URL of the page.
     * @param page - Playwright Page object.
     * @returns The current URL as a string.
     */
    public static getCurrentUrl(page: Page): string {
        const url = page.url();
        Logger.debug(`Current URL: ${url}`);
        return url;
    }

    /**
     * Closes all pages within the given browser context, except for the first one.
     * Useful for cleaning up lingering tabs in multi-page scenarios.
     * @param context - Playwright BrowserContext object.
     */
    public static async closeExtraPages(context: BrowserContext): Promise<void> {
        const pages = context.pages();
        if (pages.length <= 1) {
            Logger.debug('No extra pages to close in context.');
            return;
        }
        for (let i = 1; i < pages.length; i++) {
            const pageUrl = pages[i].url();
            await pages[i].close();
            Logger.info(`Closed extra page with URL: ${pageUrl}`);
        }
    }
}
```