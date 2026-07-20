```typescript
import { Page, BrowserContext, ElementHandle, Locator, expect, Response, Request, TestInfo } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// --- Logger Utility ---
enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    OFF = 4,
}

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO; // Default log level
    private logFilePath: string | null = null;
    private logToFileEnabled: boolean = false;

    private constructor() {
        // Private constructor to enforce Singleton pattern
        this.logLevel = this.getLogLevelFromEnv() || LogLevel.INFO;
        this.logFilePath = process.env.LOG_FILE_PATH || null;
        this.logToFileEnabled = !!this.logFilePath;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private getLogLevelFromEnv(): LogLevel | undefined {
        const envLevel = process.env.LOG_LEVEL?.toUpperCase();
        switch (envLevel) {
            case 'DEBUG': return LogLevel.DEBUG;
            case 'INFO': return LogLevel.INFO;
            case 'WARN': return LogLevel.WARN;
            case 'ERROR': return LogLevel.ERROR;
            case 'OFF': return LogLevel.OFF;
            default: return undefined;
        }
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public enableFileLogging(filePath: string): void {
        this.logFilePath = filePath;
        this.logToFileEnabled = true;
    }

    public disableFileLogging(): void {
        this.logToFileEnabled = false;
        this.logFilePath = null;
    }

    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ` ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')}` : '';
        return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
    }

    private writeToFile(message: string): void {
        if (this.logToFileEnabled && this.logFilePath) {
            try {
                fs.appendFileSync(this.logFilePath, message + '\n');
            } catch (error) {
                console.error(`[ERROR] Failed to write log to file: ${error}`);
            }
        }
    }

    public debug(message: string, ...args: any[]): void {
        if (this.logLevel <= LogLevel.DEBUG) {
            const formatted = this.formatMessage('DEBUG', message, ...args);
            console.log(formatted);
            this.writeToFile(formatted);
        }
    }

    public info(message: string, ...args: any[]): void {
        if (this.logLevel <= LogLevel.INFO) {
            const formatted = this.formatMessage('INFO', message, ...args);
            console.info(formatted);
            this.writeToFile(formatted);
        }
    }

    public warn(message: string, ...args: any[]): void {
        if (this.logLevel <= LogLevel.WARN) {
            const formatted = this.formatMessage('WARN', message, ...args);
            console.warn(formatted);
            this.writeToFile(formatted);
        }
    }

    public error(message: string, error?: Error | unknown, ...args: any[]): void {
        if (this.logLevel <= LogLevel.ERROR) {
            const errorMessage = error instanceof Error ? `${message}: ${error.message}\n${error.stack}` : message;
            const formatted = this.formatMessage('ERROR', errorMessage, ...args);
            console.error(formatted);
            this.writeToFile(formatted);
        }
    }
}

const logger = Logger.getInstance();

// --- WaitHelper Utility ---
class WaitHelper {
    private page: Page;
    private defaultTimeout: number = 30000; // 30 seconds

    constructor(page: Page) {
        this.page = page;
        this.defaultTimeout = ConfigReader.getInstance().getNumber('defaultTimeout', 30000);
    }

    /**
     * Waits for an element specified by a selector to be visible.
     * @param selector The CSS or XPath selector for the element.
     * @param timeout Optional timeout in milliseconds.
     * @returns A promise that resolves when the element is visible.
     */
    public async waitForElementVisible(selector: string, timeout?: number): Promise<Locator> {
        const effectiveTimeout = timeout ?? this.defaultTimeout;
        logger.debug(`Waiting for element to be visible: "${selector}" with timeout: ${effectiveTimeout}ms`);
        try {
            const locator = this.page.locator(selector);
            await locator.waitFor({ state: 'visible', timeout: effectiveTimeout });
            logger.info(`Element "${selector}" is visible.`);
            return locator;
        } catch (error) {
            logger.error(`Failed to wait for element "${selector}" to be visible`, error);
            throw new Error(`Element "${selector}" not visible after ${effectiveTimeout}ms.`);
        }
    }

    /**
     * Waits for an element specified by a selector to be enabled.
     * @param selector The CSS or XPath selector for the element.
     * @param timeout Optional timeout in milliseconds.
     * @returns A promise that resolves when the element is enabled.
     */
    public async waitForElementEnabled(selector: string, timeout?: number): Promise<Locator> {
        const effectiveTimeout = timeout ?? this.defaultTimeout;
        logger.debug(`Waiting for element to be enabled: "${selector}" with timeout: ${effectiveTimeout}ms`);
        try {
            const locator = this.page.locator(selector);
            await locator.waitFor({ state: 'enabled', timeout: effectiveTimeout });
            logger.info(`Element "${selector}" is enabled.`);
            return locator;
        } catch (error) {
            logger.error(`Failed to wait for element "${selector}" to be enabled`, error);
            throw new Error(`Element "${selector}" not enabled after ${effectiveTimeout}ms.`);
        }
    }

    /**
     * Waits for an element specified by a selector to be hidden.
     * @param selector The CSS or XPath selector for the element.
     * @param timeout Optional timeout in milliseconds.
     * @returns A promise that resolves when the element is hidden.
     */
    public async waitForElementHidden(selector: string, timeout?: number): Promise<void> {
        const effectiveTimeout = timeout ?? this.defaultTimeout;
        logger.debug(`Waiting for element to be hidden: "${selector}" with timeout: ${effectiveTimeout}ms`);
        try {
            await this.page.locator(selector).waitFor({ state: 'hidden', timeout: effectiveTimeout });
            logger.info(`Element "${selector}" is hidden.`);
        } catch (error) {
            logger.error(`Failed to wait for element "${selector}" to be hidden`, error);
            throw new Error(`Element "${selector}" not hidden after ${effectiveTimeout}ms.`);
        }
    }

    /**
     * Waits for a specific text to appear in an element.
     * @param selector The CSS or XPath selector for the element.
     * @param expectedText The text to wait for.
     * @param timeout Optional timeout in milliseconds.
     * @returns A promise that resolves when the text is present.
     */
    public async waitForTextInElement(selector: string, expectedText: string | RegExp, timeout?: number): Promise<void> {
        const effectiveTimeout = timeout ?? this.defaultTimeout;
        logger.debug(`Waiting for text "${expectedText}" in element "${selector}" with timeout: ${effectiveTimeout}ms`);
        try {
            await expect(this.page.locator(selector)).toHaveText(expectedText, { timeout: effectiveTimeout });
            logger.info(`Text "${expectedText}" found in element "${selector}".`);
        } catch (error) {
            logger.error(`Failed to wait for text "${expectedText}" in element "${selector}"`, error);
            throw new Error(`Text "${expectedText}" not found in element "${selector}" after ${effectiveTimeout}ms.`);
        }
    }

    /**
     * Waits for the number of elements matching a selector to be a specific count.
     * @param selector The CSS or XPath selector for the elements.
     * @param expectedCount The exact number of elements expected.
     * @param timeout Optional timeout in milliseconds.
     * @returns A promise that resolves when the count matches.
     */
    public async waitForNumberOfElements(selector: string, expectedCount: number, timeout?: number): Promise<void> {
        const effectiveTimeout = timeout ?? this.defaultTimeout;
        logger.debug(`Waiting for "${expectedCount}" elements for selector "${selector}" with timeout: ${effectiveTimeout}ms`);
        try {
            await expect(this.page.locator(selector)).toHaveCount(expectedCount, { timeout: effectiveTimeout });
            logger.info(`Found ${expectedCount} elements for selector "${selector}".`);
        } catch (error) {
            logger.error(`Failed to wait for ${expectedCount} elements for selector "${selector}"`, error);
            throw new Error(`Expected ${expectedCount} elements for "${selector}", but count mismatch after ${effectiveTimeout}ms.`);
        }
    }

    /**
     * Waits for a specific network response (e.g., status code, URL match).
     * @param urlRegex A regular expression to match the response URL.
     * @param statusCode Optional expected status code.
     * @param timeout Optional timeout in milliseconds.
     * @returns A promise that resolves with the Response object.
     */
    public async waitForResponse(urlRegex: RegExp, statusCode?: number, timeout?: number): Promise<Response> {
        const effectiveTimeout = timeout ?? this.defaultTimeout;
        logger.debug(`Waiting for response matching URL "${urlRegex}" and status "${statusCode || 'any'}" with timeout: ${effectiveTimeout}ms`);
        try {
            const response = await this.page.waitForResponse(
                (response) => {
                    const urlMatches = urlRegex.test(response.url());
                    const statusMatches = statusCode ? response.status() === statusCode : true;
                    return urlMatches && statusMatches;
                },
                { timeout: effectiveTimeout }
            );
            logger.info(`Caught response for URL "${response.url()}" with status ${response.status()}.`);
            return response;
        } catch (error) {
            logger.error(`Failed to wait for response matching URL "${urlRegex}" and status "${statusCode || 'any'}"`, error);
            throw new Error(`Response matching URL "${urlRegex}" and status "${statusCode || 'any'}" not received after ${effectiveTimeout}ms.`);
        }
    }

    /**
     * Pauses execution for a given number of milliseconds. Use sparingly and only when no other wait strategy is suitable.
     * @param ms The number of milliseconds to wait.
     */
    public async waitForTimeout(ms: number): Promise<void> {
        logger.warn(`Explicitly waiting for ${ms}ms. Consider using condition-based waits instead.`);
        await this.page.waitForTimeout(ms);
    }

    /**
     * Waits for the page's load state to reach a specific condition.
     * @param state 'load' | 'domcontentloaded' | 'networkidle'. Defaults to 'networkidle'.
     * @param timeout Optional timeout in milliseconds.
     */
    public async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle', timeout?: number): Promise<void> {
        const effectiveTimeout = timeout ?? this.defaultTimeout;
        logger.debug(`Waiting for page load state to be "${state}" with timeout: ${effectiveTimeout}ms`);
        try {
            await this.page.waitForLoadState(state, { timeout: effectiveTimeout });
            logger.info(`Page load state reached "${state}".`);
        } catch (error) {
            logger.error(`Failed to wait for page load state "${state}"`, error);
            throw new Error(`Page load state "${state}" not reached after ${effectiveTimeout}ms.`);
        }
    }
}

// --- ScreenshotHelper Utility ---
class ScreenshotHelper {
    private page: Page;
    private screenshotsDir: string;
    private testInfo: TestInfo | undefined;

    constructor(page: Page, testInfo?: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
        // Default to a 'screenshots' folder in the project root, or override via config/env
        this.screenshotsDir = ConfigReader.getInstance().getString('screenshotsDir', path.join(process.cwd(), 'screenshots'));
        this.ensureScreenshotsDirectoryExists();
    }

    private ensureScreenshotsDirectoryExists(): void {
        if (!fs.existsSync(this.screenshotsDir)) {
            logger.debug(`Creating screenshots directory: ${this.screenshotsDir}`);
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }

    /**
     * Generates a unique filename for a screenshot.
     * @param name A descriptive name for the screenshot.
     * @returns The full path for the screenshot file.
     */
    private generateFilename(name: string): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // YYYY-MM-DDTHH-MM-SS-sssZ
        const testName = this.testInfo ? this.testInfo.title.replace(/[^a-zA-Z0-9-]/g, '_') : 'unnamed-test';
        const formattedName = name.replace(/[^a-zA-Z0-9-]/g, '_'); // Sanitize name
        return path.join(this.screenshotsDir, `${testName}-${formattedName}-${timestamp}.png`);
    }

    /**
     * Takes a full-page screenshot.
     * @param name A descriptive name for the screenshot.
     * @param fullPage Whether to take a screenshot of the full scrollable page. Defaults to true.
     * @param path Optional custom path to save the screenshot. If not provided, a default path is generated.
     * @returns The path where the screenshot was saved.
     */
    public async takeFullPageScreenshot(name: string = 'full-page', fullPage: boolean = true, customPath?: string): Promise<string> {
        const filePath = customPath || this.generateFilename(name);
        logger.info(`Taking full page screenshot: "${name}" to ${filePath}`);
        try {
            await this.page.screenshot({ path: filePath, fullPage: fullPage });
            logger.info(`Full page screenshot saved: ${filePath}`);
            if (this.testInfo) {
                this.testInfo.attachments.push({ name: name, path: filePath, contentType: 'image/png' });
            }
            return filePath;
        } catch (error) {
            logger.error(`Failed to take full page screenshot "${name}"`, error);
            throw new Error(`Could not take full page screenshot: ${error}`);
        }
    }

    /**
     * Takes a screenshot of a specific element.
     * @param selector The CSS or XPath selector of the element.
     * @param name A descriptive name for the screenshot.
     * @param path Optional custom path to save the screenshot. If not provided, a default path is generated.
     * @returns The path where the screenshot was saved.
     */
    public async takeElementScreenshot(selector: string, name: string = 'element', customPath?: string): Promise<string> {
        const filePath = customPath || this.generateFilename(name);
        logger.info(`Taking element screenshot for "${selector}" as "${name}" to ${filePath}`);
        try {
            const element = this.page.locator(selector);
            await element.screenshot({ path: filePath });
            logger.info(`Element screenshot saved: ${filePath}`);
            if (this.testInfo) {
                this.testInfo.attachments.push({ name: name, path: filePath, contentType: 'image/png' });
            }
            return filePath;
        } catch (error) {
            logger.error(`Failed to take element screenshot for "${selector}"`, error);
            throw new Error(`Could not take screenshot of element "${selector}": ${error}`);
        }
    }

    /**
     * Takes a screenshot with a specific mask (e.g., to hide sensitive information).
     * @param name A descriptive name for the screenshot.
     * @param selectorsToMask An array of CSS/XPath selectors for elements to mask.
     * @param path Optional custom path to save the screenshot.
     * @returns The path where the screenshot was saved.
     */
    public async takeScreenshotWithMask(name: string = 'masked-page', selectorsToMask: string[], customPath?: string): Promise<string> {
        const filePath = customPath || this.generateFilename(name);
        logger.info(`Taking screenshot with mask for "${selectorsToMask.join(', ')}" as "${name}" to ${filePath}`);
        try {
            await this.page.screenshot({
                path: filePath,
                mask: selectorsToMask.map(s => this.page.locator(s)),
                fullPage: true, // Typically masked screenshots are full page
            });
            logger.info(`Masked screenshot saved: ${filePath}`);
            if (this.testInfo) {
                this.testInfo.attachments.push({ name: name, path: filePath, contentType: 'image/png' });
            }
            return filePath;
        } catch (error) {
            logger.error(`Failed to take masked screenshot "${name}"`, error);
            throw new Error(`Could not take masked screenshot: ${error}`);
        }
    }
}

// --- ConfigReader Utility ---
type ConfigValue = string | number | boolean | object | undefined;

class ConfigReader {
    private static instance: ConfigReader;
    private config: Record<string, ConfigValue> = {};
    private configFilePath: string = path.join(process.cwd(), 'playwright.config.json'); // Default config file

    private constructor() {
        this.loadConfig();
    }

    public static getInstance(): ConfigReader {
        if (!ConfigReader.instance) {
            ConfigReader.instance = new ConfigReader();
        }
        return ConfigReader.instance;
    }

    public setConfigFilePath(filePath: string): void {
        this.configFilePath = filePath;
        this.loadConfig(); // Reload config if path changes
    }

    private loadConfig(): void {
        logger.debug(`Loading configuration from ${this.configFilePath}`);
        try {
            if (fs.existsSync(this.configFilePath)) {
                const configString = fs.readFileSync(this.configFilePath, 'utf-8');
                this.config = JSON.parse(configString);
                logger.info(`Configuration loaded successfully from ${this.configFilePath}.`);
            } else {
                logger.warn(`Config file not found at ${this.configFilePath}. Relying solely on environment variables or defaults.`);
                this.config = {}; // Ensure it's an empty object if file doesn't exist
            }
        } catch (error) {
            logger.error(`Error loading or parsing config file ${this.configFilePath}`, error);
            this.config = {}; // Fallback to empty config on error
        }
        // Overlay with environment variables (ENV vars take precedence)
        this.loadEnvironmentVariables();
    }

    private loadEnvironmentVariables(): void {
        for (const key in process.env) {
            if (key.startsWith('PW_')) { // Convention for Playwright-related environment variables
                const configKey = key.substring(3); // Remove 'PW_' prefix
                this.config[configKey] = process.env[key];
                logger.debug(`Overriding config key '${configKey}' with environment variable 'PW_${configKey}'.`);
            }
        }
    }

    /**
     * Gets a configuration value as a string.
     * @param key The configuration key.
     * @param defaultValue Optional default value if the key is not found.
     * @returns The string value or the default value.
     */
    public getString(key: string, defaultValue?: string): string {
        const value = this.config[key] ?? process.env[key]; // Check env var directly as well
        if (value !== undefined) {
            return String(value);
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        logger.error(`Configuration key "${key}" not found and no default value provided.`);
        throw new Error(`Configuration key "${key}" not found.`);
    }

    /**
     * Gets a configuration value as a number.
     * @param key The configuration key.
     * @param defaultValue Optional default value if the key is not found.
     * @returns The number value or the default value.
     */
    public getNumber(key: string, defaultValue?: number): number {
        const value = this.config[key] ?? process.env[key];
        if (value !== undefined) {
            const num = Number(value);
            if (!isNaN(num)) {
                return num;
            }
            logger.warn(`Configuration key "${key}" has a non-numeric value: "${value}".`);
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        logger.error(`Configuration key "${key}" not found or not a number, and no default value provided.`);
        throw new Error(`Configuration key "${key}" not found or not a number.`);
    }

    /**
     * Gets a configuration value as a boolean.
     * @param key The configuration key.
     * @param defaultValue Optional default value if the key is not found.
     * @returns The boolean value or the default value.
     */
    public getBoolean(key: string, defaultValue?: boolean): boolean {
        const value = this.config[key] ?? process.env[key];
        if (value !== undefined) {
            if (typeof value === 'boolean') {
                return value;
            }
            const strValue = String(value).toLowerCase();
            if (strValue === 'true' || strValue === '1') {
                return true;
            }
            if (strValue === 'false' || strValue === '0') {
                return false;
            }
            logger.warn(`Configuration key "${key}" has a non-boolean value: "${value}".`);
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        logger.error(`Configuration key "${key}" not found or not a boolean, and no default value provided.`);
        throw new Error(`Configuration key "${key}" not found or not a boolean.`);
    }

    /**
     * Gets a configuration value as an object (e.g., JSON).
     * @param key The configuration key.
     * @param defaultValue Optional default value if the key is not found.
     * @returns The object value or the default value.
     */
    public getObject<T extends object>(key: string, defaultValue?: T): T {
        const value = this.config[key] ?? process.env[key];
        if (value !== undefined) {
            if (typeof value === 'object' && value !== null) {
                return value as T;
            }
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value) as T;
                } catch (error) {
                    logger.warn(`Configuration key "${key}" has a string value that is not valid JSON: "${value}".`, error);
                }
            }
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        logger.error(`Configuration key "${key}" not found or not a valid object, and no default value provided.`);
        throw new Error(`Configuration key "${key}" not found or not a valid object.`);
    }

    /**
     * Checks if a configuration key exists.
     * @param key The configuration key.
     * @returns True if the key exists, false otherwise.
     */
    public hasKey(key: string): boolean {
        return this.config.hasOwnProperty(key) || process.env.hasOwnProperty(key);
    }
}

// --- TestDataReader Utility ---
class TestDataReader {
    private static instance: TestDataReader;
    private data: Record<string, any> = {};
    private dataDirectory: string = path.join(process.cwd(), 'test-data'); // Default data directory

    private constructor() {
        this.dataDirectory = ConfigReader.getInstance().getString('testDataDir', this.dataDirectory);
        // Data is loaded on demand by filename, not all at once in constructor
    }

    public static getInstance(): TestDataReader {
        if (!TestDataReader.instance) {
            TestDataReader.instance = new TestDataReader();
        }
        return TestDataReader.instance;
    }

    /**
     * Sets the directory where test data files are located.
     * @param directoryPath The path to the test data directory.
     */
    public setTestDataDirectory(directoryPath: string): void {
        this.dataDirectory = directoryPath;
    }

    /**
     * Loads a test data file (JSON or CSV) by its filename.
     * Caches the loaded data to avoid redundant file reads.
     * @param filename The name of the test data file (e.g., 'users.json', 'products.csv').
     * @returns The parsed data from the file.
     */
    private async loadFile(filename: string): Promise<any> {
        if (this.data[filename]) {
            logger.debug(`Returning cached data for ${filename}`);
            return this.data[filename];
        }

        const filePath = path.join(this.dataDirectory, filename);
        logger.info(`Loading test data from: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            logger.error(`Test data file not found: ${filePath}`);
            throw new Error(`Test data file not found: ${filePath}`);
        }

        try {
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            let parsedData: any;
            if (filename.endsWith('.json')) {
                parsedData = JSON.parse(fileContent);
            } else if (filename.endsWith('.csv')) {
                // Basic CSV parsing for demonstration. For production, consider 'csv-parse' library.
                parsedData = this.parseCsv(fileContent);
            } else {
                logger.error(`Unsupported test data file format: ${filename}. Only .json and .csv are supported.`);
                throw new Error(`Unsupported test data file format: ${filename}`);
            }
            this.data[filename] = parsedData; // Cache the data
            logger.info(`Successfully loaded and cached data from ${filename}.`);
            return parsedData;
        } catch (error) {
            logger.error(`Failed to load or parse test data file ${filePath}`, error);
            throw new Error(`Failed to load or parse test data file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Simple CSV parser. Assumes first row is header.
     * @param csvContent The content of the CSV file.
     * @returns An array of objects, where each object represents a row.
     */
    private parseCsv(csvContent: string): Record<string, string>[] {
        const lines = csvContent.trim().split('\n');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);

        return dataRows.map(row => {
            const values = row.split(',').map(v => v.trim());
            const rowObject: Record<string, string> = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index];
            });
            return rowObject;
        });
    }

    /**
     * Retrieves all data from a specified file.
     * @param filename The name of the test data file.
     * @returns The full data object/array from the file.
     */
    public async getAllData(filename: string): Promise<any> {
        return this.loadFile(filename);
    }

    /**
     * Retrieves a specific item by a key from a data file.
     * Useful for JSON files where data is an object, or finding an item in an array by a unique key.
     * @param filename The name of the test data file.
     * @param key The key to retrieve (for objects) or the value to match in a primary key field (for arrays of objects).
     * @param primaryKeyField Optional. If data is an array of objects, specify the field to use as a primary key for lookup. Defaults to 'id'.
     * @returns The specific data item.
     */
    public async getDataByKey<T>(filename: string, key: string | number, primaryKeyField: string = 'id'): Promise<T> {
        const allData = await this.loadFile(filename);
        if (Array.isArray(allData)) {
            const item = allData.find((dataItem: any) => dataItem[primaryKeyField] === key);
            if (!item) {
                logger.error(`Data item with "${primaryKeyField}" = "${key}" not found in ${filename}`);
                throw new Error(`Data item with "${primaryKeyField}" = "${key}" not found in ${filename}`);
            }
            return item;
        } else if (typeof allData === 'object' && allData !== null) {
            const item = allData[String(key)];
            if (!item) {
                logger.error(`Data item with key "${key}" not found in ${filename}`);
                throw new Error(`Data item with key "${key}" not found in ${filename}`);
            }
            return item;
        } else {
            logger.error(`Data in ${filename} is not an array or object, cannot retrieve by key.`);
            throw new Error(`Data in ${filename} is not an array or object, cannot retrieve by key.`);
        }
    }

    /**
     * Retrieves data filtered by a specific condition.
     * Useful for arrays of objects.
     * @param filename The name of the test data file.
     * @param filterFn A function that returns true for items to be included.
     * @returns An array of filtered data items.
     */
    public async getFilteredData<T>(filename: string, filterFn: (item: T) => boolean): Promise<T[]> {
        const allData = await this.loadFile(filename);
        if (Array.isArray(allData)) {
            const filtered = allData.filter(filterFn);
            logger.debug(`Filtered data from ${filename}, found ${filtered.length} items.`);
            return filtered;
        } else {
            logger.error(`Data in ${filename} is not an array, cannot apply filter.`);
            throw new Error(`Data in ${filename} is not an array, cannot apply filter.`);
        }
    }
}

// --- CommonHelper Utility ---
class CommonHelper {
    private page: Page;
    private context: BrowserContext;

    constructor(page: Page) {
        this.page = page;
        this.context = page.context();
    }

    /**
     * Navigates the page to a specified URL.
     * @param url The URL to navigate to.
     * @param options Playwright NavigateOptions.
     */
    public async navigateTo(url: string, options?: Parameters<Page['goto']>[1]): Promise<void> {
        logger.info(`Navigating to URL: ${url}`);
        try {
            await this.page.goto(url, options);
            logger.info(`Successfully navigated to: ${this.page.url()}`);
        } catch (error) {
            logger.error(`Failed to navigate to URL: ${url}`, error);
            throw new Error(`Navigation failed to ${url}: ${error}`);
        }
    }

    /**
     * Generates a random string of a specified length.
     * @param length The desired length of the string.
     * @param characters The characters to use for generation. Defaults to alphanumeric.
     * @returns A random string.
     */
    public generateRandomString(length: number, characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        logger.debug(`Generated random string of length ${length}`);
        return result;
    }

    /**
     * Generates a random number within a specified range.
     * @param min The minimum value (inclusive).
     * @param max The maximum value (inclusive).
     * @returns A random number.
     */
    public generateRandomNumber(min: number, max: number): number {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        logger.debug(`Generated random number between ${min} and ${max}: ${num}`);
        return num;
    }

    /**
     * Clears all items from the browser's local storage for the current origin.
     */
    public async clearLocalStorage(): Promise<void> {
        logger.info('Clearing local storage.');
        try {
            await this.page.evaluate(() => localStorage.clear());
            logger.info('Local storage cleared.');
        } catch (error) {
            logger.error('Failed to clear local storage', error);
            throw new Error(`Failed to clear local storage: ${error}`);
        }
    }

    /**
     * Clears all cookies for the current browser context.
     */
    public async clearCookies(): Promise<void> {
        logger.info('Clearing browser cookies.');
        try {
            await this.context.clearCookies();
            logger.info('Browser cookies cleared.');
        } catch (error) {
            logger.error('Failed to clear browser cookies', error);
            throw new Error(`Failed to clear browser cookies: ${error}`);
        }
    }

    /**
     * Sets a cookie in the current browser context.
     * @param cookie Playwright Cookie object.
     */
    public async setCookie(cookie: Parameters<BrowserContext['addCookies']>[0][number]): Promise<void> {
        logger.info(`Setting cookie: ${cookie.name}=${cookie.value}`);
        try {
            await this.context.addCookies([cookie]);
            logger.info('Cookie set successfully.');
        } catch (error) {
            logger.error(`Failed to set cookie ${cookie.name}`, error);
            throw new Error(`Failed to set cookie ${cookie.name}: ${error}`);
        }
    }

    /**
     * Scrolls an element into view.
     * @param selector The CSS or XPath selector of the element to scroll.
     * @param options Playwright ScrollIntoViewOptions.
     */
    public async scrollIntoView(selector: string, options?: Parameters<Locator['scrollIntoViewIfNeeded']>[0]): Promise<void> {
        logger.debug(`Scrolling element "${selector}" into view.`);
        try {
            await this.page.locator(selector).scrollIntoViewIfNeeded(options);
            logger.info(`Element "${selector}" scrolled into view.`);
        } catch (error) {
            logger.error(`Failed to scroll element "${selector}" into view`, error);
            throw new Error(`Could not scroll element "${selector}" into view: ${error}`);
        }
    }

    /**
     * Uploads files to an input element.
     * @param selector The CSS or XPath selector of the file input element.
     * @param filePaths An array of paths to the files to upload.
     */
    public async uploadFiles(selector: string, filePaths: string[]): Promise<void> {
        logger.info(`Uploading files "${filePaths.join(', ')}" to selector "${selector}"`);
        try {
            await this.page.locator(selector).setInputFiles(filePaths);
            logger.info(`Files uploaded successfully to "${selector}".`);
        } catch (error) {
            logger.error(`Failed to upload files to "${selector}"`, error);
            throw new Error(`File upload failed for "${selector}": ${error}`);
        }
    }

    /**
     * Retrieves the current URL of the page.
     * @returns The current URL.
     */
    public getCurrentUrl(): string {
        const url = this.page.url();
        logger.debug(`Current URL: ${url}`);
        return url;
    }

    /**
     * Retrieves the page title.
     * @returns The page title.
     */
    public async getPageTitle(): Promise<string> {
        const title = await this.page.title();
        logger.debug(`Page title: ${title}`);
        return title;
    }

    /**
     * Performs a keyboard action.
     * @param key The key to press (e.g., 'Enter', 'Escape', 'Tab', 'ArrowLeft').
     */
    public async pressKey(key: string): Promise<void> {
        logger.debug(`Pressing key: ${key}`);
        try {
            await this.page.keyboard.press(key);
            logger.info(`Key "${key}" pressed.`);
        } catch (error) {
            logger.error(`Failed to press key "${key}"`, error);
            throw new Error(`Failed to press key "${key}": ${error}`);
        }
    }

    /**
     * Executes a JavaScript function in the browser context.
     * @param expression The JavaScript function or string to evaluate.
     * @param arg Optional argument to pass to the function.
     * @returns The result of the JavaScript evaluation.
     */
    public async executeScript<T>(expression: string | Function, arg?: any): Promise<T> {
        logger.debug(`Executing script in browser context.`);
        try {
            const result = await this.page.evaluate(expression, arg);
            logger.debug(`Script executed, result: ${JSON.stringify(result)}`);
            return result as T;
        } catch (error) {
            logger.error(`Failed to execute script`, error);
            throw new Error(`Script execution failed: ${error}`);
        }
    }
}
```