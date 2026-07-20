```json
{
  "name": "enterprise-playwright-framework",
  "version": "1.0.0",
  "description": "Enterprise Playwright Automation Framework for Retailer Management",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:api": "playwright test --project=API",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"**/*.{ts,json,md}\""
  },
  "keywords": [
    "playwright",
    "automation",
    "typescript",
    "enterprise"
  ],
  "author": "Automation Architect",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.44.1",
    "@types/node": "^20.12.12",
    "@typescript-eslint/eslint-plugin": "^7.10.0",
    "@typescript-eslint/parser": "^7.10.0",
    "dotenv": "^16.4.5",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-playwright": "^1.6.0",
    "prettier": "^3.2.5",
    "typescript": "^5.4.5"
  }
}
```

```typescript
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config'; // Load .env file at the top
import * as path from 'path';

const STORAGE_STATE_PATH = path.join(__dirname, 'playwright-auth/storageState.json');

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
  workers: process.env.CI === 'true' ? 1 : (parseInt(process.env.PLAYWRIGHT_WORKERS || 'undefined', 10) || undefined),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI === 'true' ? 'github' : [
    ['list'],
    ['html', { open: 'on-failure', outputFolder: 'playwright-report' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Default if not in .env
    /* Collect trace when retrying the first time. */
    trace: 'on-first-retry',
    /* Video recording. */
    video: 'on-first-retry',
    /* Screenshot capture. */
    screenshot: 'only-on-failure',
    /* Locale for browser context */
    locale: 'en-US',
    /* Timezone for browser context */
    timezoneId: 'America/Los_Angeles', // Example timezone
    /* Storage state for authenticated sessions */
    storageState: STORAGE_STATE_PATH,
    /* Headless mode */
    headless: process.env.CI === 'true' || process.env.PW_HEADLESS === 'true',
    /* Extra HTTP Headers for all requests */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Common for API requests
    }
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

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

    /* Test against API endpoints directly. */
    {
      name: 'API',
      testMatch: '**/*.api.ts', // Example: API tests might live in files ending with .api.ts
      use: {
        baseURL: process.env.API_URL || process.env.BASE_URL, // Use API_URL if defined, otherwise BASE_URL
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
        // No browser is needed for API tests
      },
    },

    /* Test against Visual Regression. */
    // {
    //   name: 'visual-regression',
    //   testMatch: '**/*.visual.ts',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     viewport: { width: 1280, height: 720 }, // Consistent viewport for visual tests
    //   },
    // },
  ],

  /* Folder for test artifacts relative to the project root. */
  outputDir: 'test-results',

  /* Maximum time one test can run for. */
  timeout: 30 * 1000, // 30 seconds

  /* Expect assertion timeout */
  expect: {
    timeout: 5 * 1000 // 5 seconds for assertions
  }
});
```

```json
{
  "compilerOptions": {
    "target": "ES2022",                                  /* Specify ECMAScript target version. */
    "module": "NodeNext",                                /* Specify module code generation. */
    "moduleResolution": "NodeNext",                      /* Specify how modules are resolved. */
    "lib": [
      "ES2022",
      "DOM"
    ],                                   /* Specify a set of bundled library declaration files. */
    "baseUrl": ".",                                      /* Specify the base directory to resolve non-relative module names. */
    "paths": {
      "@core/*": ["src/core/*"],                         /* Example of path mapping for common utilities or base classes */
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"]
    },
    "outDir": "./dist",                                  /* Redirect output structure to the directory. */
    "rootDir": "./",                                     /* Specify the root directory of input files. */
    "strict": true,                                      /* Enable all strict type-checking options. */
    "noImplicitAny": true,                               /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. */
    "skipLibCheck": true,                                /* Skip type checking all .d.ts files. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */
    "resolveJsonModule": true,                           /* Enable importing .json files */
    "types": [
      "node",
      "@playwright/test"
    ]
  },
  "include": [
    "**/*.ts"
  ],                                 /* Specify an array of filenames or patterns to include in the program. */
  "exclude": [
    "node_modules",                                      /* Specify an array of filenames or patterns that should be skipped when resolving 'include'. */
    "playwright-report",
    "test-results",
    "playwright-auth"
  ]
}
```

```ini
# Base URL for the application under test (e.g., UI tests)
BASE_URL="https://your-retailer-app-qa.com"

# Base URL for API calls (can be different from BASE_URL if APIs are on a separate domain/port)
API_URL="https://your-retailer-api-qa.com/api/v1"

# Credentials for a Salesman user, as per US-002: Create Retailer
# These credentials should be stored securely in CI/CD environments.
SALESMAN_USERNAME="salesman.user@example.com"
SALESMAN_PASSWORD="SecurePassword123!"

# Optional: Credentials for an admin user, if needed for complex global setup/teardown tasks
# ADMIN_USERNAME="admin.user@example.com"
# ADMIN_PASSWORD="AdminPassword123!"

# Playwright configuration options
# Set to 'true' to run tests in headless mode (default on CI).
# Overrides 'headless' setting in playwright.config.ts if present.
PW_HEADLESS="false"

# Number of Playwright workers (threads) to use for parallel test execution.
# If unset, Playwright defaults to (CPU_cores - 1) or 1 on CI.
# PLAYWRIGHT_WORKERS="4"
```

```typescript
import { chromium, FullConfig, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import 'dotenv/config'; // Load environment variables from .env file

const STORAGE_STATE_PATH = path.join(__dirname, 'playwright-auth/storageState.json');

async function globalSetup(config: FullConfig) {
  console.log('Global setup started...');

  const { baseURL } = config.projects[0].use; // Get baseURL from the first project configured in playwright.config.ts
  if (!baseURL) {
    throw new Error('baseURL is not defined in Playwright configuration.');
  }

  // Ensure playwright-auth directory exists to save session state
  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log(`Created directory for auth state: ${authDir}`);
  }

  // --- Salesman Login and Session Storage for UI tests ---
  // This section performs a typical web login to obtain an authenticated session.
  // Adjust based on your application's specific authentication flow (e.g., OAuth, API token).

  if (!process.env.SALESMAN_USERNAME || !process.env.SALESMAN_PASSWORD) {
    throw new Error('SALESMAN_USERNAME and SALESMAN_PASSWORD must be defined in .env or environment variables.');
  }

  console.log(`Attempting to log in as Salesman: ${process.env.SALESMAN_USERNAME}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the login page (adjust path as per your application)
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/.*login|.*sign-in/, { timeout: 10000 }); // Assert we are on the login page

    // Fill in login credentials (adjust selectors as per your application's login form)
    await page.fill('input[name="username"], input[id="username"], input[name="email"]', process.env.SALESMAN_USERNAME);
    await page.fill('input[name="password"], input[id="password"]', process.env.SALESMAN_PASSWORD);

    // Click the login button (adjust selector)
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for navigation to the dashboard or home page after successful login
    // Adjust this assertion to your application's post-login state/URL
    await page.waitForURL(`${baseURL}/dashboard`, { timeout: 15000 });
    await expect(page).toHaveURL(`${baseURL}/dashboard`);
    console.log('Salesman successfully logged in to UI.');

    // Save the authentication state to a file. Subsequent tests will use this state.
    await page.context().storageState({ path: STORAGE_STATE_PATH });
    console.log(`Salesman authentication state saved to: ${STORAGE_STATE_PATH}`);

  } catch (error) {
    console.error('Salesman login failed during global setup:', error);
    // Optionally, save a screenshot for debugging login failures
    await page.screenshot({ path: 'playwright-auth/login-failure-screenshot.png' });
    // Optionally, save HTML for debugging login failures
    fs.writeFileSync('playwright-auth/login-failure-page.html', await page.content());
    await browser.close();
    throw new Error('Failed to set up Salesman authentication state for UI tests.');
  } finally {
    await browser.close();
  }

  // --- Add other initial setup steps here if needed ---
  // For example:
  // - Provision a specific test user via API
  // - Ensure certain prerequisite data exists in the database
  // - Perform environment health checks

  console.log('Global setup finished.');
}

export default globalSetup;
```

```typescript
import { FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import 'dotenv/config'; // Load environment variables from .env file

const STORAGE_STATE_PATH = path.join(__dirname, 'playwright-auth/storageState.json');

async function globalTeardown(config: FullConfig) {
  console.log('Global teardown started...');

  // --- Clean up authentication state file ---
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    fs.unlinkSync(STORAGE_STATE_PATH);
    console.log(`Deleted authentication state file: ${STORAGE_STATE_PATH}`);
  }

  // --- Clean up any test data created during setup or tests ---
  // This is a placeholder for enterprise-level data cleanup.
  // For the "Create Retailer" user story (US-002), if the tests create retailers,
  // this is where you would ideally delete them to ensure test isolation.
  // This might involve making API calls to your application's backend.

  console.log('Performing test data cleanup (if any)...');
  // Example placeholder for API-based data cleanup:
  // const apiUrl = process.env.API_URL || process.env.BASE_URL;
  // if (apiUrl && process.env.ADMIN_AUTH_TOKEN) { // Assuming an admin token for cleanup operations
  //   const response = await fetch(`${apiUrl}/retailers/cleanup-endpoint`, {
  //     method: 'POST', // Or DELETE, depending on your API
  //     headers: {
  //       'Authorization': `Bearer ${process.env.ADMIN_AUTH_TOKEN}`,
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ /* specify retailers to delete, e.g., by tag or creation time */ })
  //   });
  //   if (response.ok) {
  //     console.log('Successfully performed test data cleanup.');
  //   } else {
  //     console.error('Failed to perform test data cleanup:', response.statusText);
  //   }
  // }

  // --- Any other final cleanup or reporting steps ---
  // For example, generating custom reports, pushing logs to a centralized system, etc.

  console.log('Global teardown finished.');
}

export default globalTeardown;
```