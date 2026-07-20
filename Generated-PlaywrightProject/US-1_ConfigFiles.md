```json
// package.json
{
  "name": "enterprise-playwright-framework",
  "version": "1.0.0",
  "description": "Enterprise-grade Playwright automation framework for web applications.",
  "main": "dist/index.js",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:debug": "playwright test --debug",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "prepare": "husky",
    "precommit": "lint-staged"
  },
  "keywords": [
    "playwright",
    "typescript",
    "automation",
    "e2e",
    "enterprise"
  ],
  "author": "Your Company Automation Team",
  "license": "UNLICENSED",
  "devDependencies": {
    "@playwright/test": "^1.44.1",
    "@types/node": "^20.12.12",
    "@typescript-eslint/eslint-plugin": "^7.10.0",
    "@typescript-eslint/parser": "^7.10.0",
    "dotenv": "^16.4.5",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.2",
    "prettier": "^3.2.5",
    "typescript": "^5.4.5"
  },
  "lint-staged": {
    "*.ts": "eslint --cache --fix",
    "*.{js,css,md}": "prettier --write"
  }
}
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file for local development
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: process.env.CI === 'true',
  /* Retry on CI only */
  retries: process.env.CI === 'true' ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI === 'true' ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // Add custom reporter for Slack/Teams integration if needed
    // ['<path_to_custom_reporter>', { /* options */ }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure', // 'on-first-retry' or 'retain-on-failure'
    
    /* Screenshot options */
    screenshot: 'only-on-failure', // 'off', 'on', 'only-on-failure'

    /* Video options */
    video: 'retain-on-failure', // 'off', 'on', 'retain-on-failure'

    /* Global timeout for all actions and assertions */
    actionTimeout: 10 * 1000, // 10 seconds

    /* Global navigation timeout */
    navigationTimeout: 30 * 1000, // 30 seconds

    /* Locale and timezone for consistent test results */
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',

    /* Device viewport for desktop tests */
    viewport: { width: 1920, height: 1080 },
  },

  /* Configure projects for major browsers and device types */
  projects: [
    // Setup project for authentication (runs once before all other tests)
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'global-teardown', // Ensure teardown runs after all tests
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the storage state from the setup project to authenticate tests
        storageState: './auth/user.json',
      },
      dependencies: ['setup'], // chromium project depends on setup completing first
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: './auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: './auth/user.json',
      },
      dependencies: ['setup'],
    },
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: './auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        storageState: './auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Folder for test artifacts relative to the configuration file. */
  outputDir: 'test-results/',

  /* Global setup and teardown files */
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": true,
    "declaration": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"],
      "@fixtures/*": ["src/fixtures/*"],
      "@tests/*": ["tests/*"]
    },
    "types": [
      "node",
      "@playwright/test"
    ]
  },
  "include": [
    "./**/*.ts",
    "./**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

```ini
# .env.example
# This file contains example environment variables.
# Create a .env file based on this template and fill in your actual values.

# Base URL for the application under test
BASE_URL=https://your-enterprise-app.com

# Credentials for the default user used in global setup
APP_USERNAME=salesman@example.com
APP_PASSWORD=YourSecurePassword123!

# Path where authentication state will be saved (relative to project root)
STORAGE_STATE_PATH=./auth/user.json
```

```typescript
// global-setup.ts
import { chromium, expect, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  // Load environment variables for global setup
  dotenv.config({ path: path.resolve(__dirname, '.env') });

  const { baseURL } = config.projects[0].use; // Get baseURL from the first project configuration
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;
  const authFile = process.env.STORAGE_STATE_PATH || './auth/user.json';

  if (!baseURL || !username || !password) {
    throw new Error('BASE_URL, APP_USERNAME, or APP_PASSWORD environment variables are not set. Please check your .env file.');
  }

  // Create the directory if it doesn't exist
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  // Check if authentication state already exists and is recent enough (optional: add a timestamp check)
  // For simplicity, we regenerate it every time here. For CI, this is usually fine.
  // For local development, you might want to skip if authFile exists.
  // if (fs.existsSync(authFile)) {
  //   console.log(`Authentication state already exists at ${authFile}. Skipping login.`);
  //   return;
  // }

  console.log(`Performing global setup: Logging in user '${username}' to ${baseURL}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Navigate to the login page
  await page.goto(`${baseURL}/login`);
  await expect(page).toHaveURL(/.*login/); // Ensure login page is displayed

  // 2. Fill in credentials and login
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // 3. Verify successful login and dashboard display
  await page.waitForURL(`${baseURL}/dashboard`, { timeout: 30000 }); // Wait for dashboard URL
  await expect(page).toHaveURL(/.*dashboard/); // Ensure dashboard is displayed
  console.log('Login successful. Dashboard displayed.');

  // Save authentication state for reuse across tests
  await page.context().storageState({ path: authFile });
  console.log(`Authentication state saved to ${authFile}`);

  await browser.close();
  console.log('Global setup complete.');
}

export default globalSetup;
```

```typescript
// global-teardown.ts
import { FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

async function globalTeardown(config: FullConfig) {
  dotenv.config({ path: path.resolve(__dirname, '.env') });

  const authFile = process.env.STORAGE_STATE_PATH || './auth/user.json';

  console.log('Performing global teardown...');

  // Optional: Clean up authentication state file after all tests are done
  // This is often not done on CI as artifacts might be needed for debugging.
  // Uncomment if you want to explicitly remove the file after a full test run.
  // if (fs.existsSync(authFile)) {
  //   fs.unlinkSync(authFile);
  //   console.log(`Authentication state file removed: ${authFile}`);
  // }

  // Add any other global cleanup tasks here
  // e.g., closing database connections, cleaning up test data in external systems,
  // generating custom reports, etc.

  console.log('Global teardown complete.');
}

export default globalTeardown;
```