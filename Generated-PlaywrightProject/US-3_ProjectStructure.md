```
.
├── src                         // Main source directory for core automation logic.
│   ├── pages                   // Page Object Model (POM) classes for abstracting web page interactions.
│   │   └── auth                // POMs specific to the authentication module.
│   │       └── LoginPage.ts    // Page object for the customer login page.
│   │       └── DashboardPage.ts // Page object for the dashboard after login.
│   │       └── ForgotPasswordPage.ts // Page object for the forgot password page.
│   ├── fixtures                // Custom Playwright test fixtures to extend test context or provide setup/teardown.
│   │   └── authFixture.ts      // Custom fixture for managing authentication state or user sessions.
│   ├── utils                   // Generic, reusable utility functions not tied to specific pages or tests.
│   │   └── browserUtils.ts     // Common browser interaction utilities (e.g., waits, scrolls).
│   │   └── testDataGenerator.ts // Utility functions for generating dynamic test data.
│   ├── constants               // Centralized location for application-wide static values and messages.
│   │   └── appConstants.ts     // Contains URLs, timeouts, static error messages, etc.
│   └── helpers                 // Functions encapsulating common test steps or specific testing logic.
│       └── loginHelper.ts      // Helper functions for common login sequences or assertions.
├── tests                       // Contains all test specification files (.spec.ts).
│   └── e2e                     // End-to-End test suites.
│       └── auth                // Test suites specifically for the authentication module.
│           └── login.spec.ts   // Test suite for customer login functionality.
│           └── forgotPassword.spec.ts // Test suite for forgot password link functionality.
├── test-data                   // External data sources used by tests (e.g., user credentials, scenario data).
│   └── loginUsers.json         // JSON file containing valid and invalid login credentials.
├── config                      // Configuration files for Playwright and environment-specific settings.
│   └── playwright.config.ts    // Main Playwright configuration file.
│   └── environment.ts          // Environment-specific variables (e.g., base URLs for dev, staging).
├── reports                     // Output directory for generated test reports, screenshots, and videos.
│   ├── screenshots             // Directory to store screenshots captured during test failures or specific steps.
│   ├── videos                  // Directory to store recorded videos of test runs.
│   └── html-report             // Directory for Playwright's generated HTML test reports.
├── package.json                // Project dependencies and scripts definition.
└── tsconfig.json               // TypeScript compiler configuration.
```