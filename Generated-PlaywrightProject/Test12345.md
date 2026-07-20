```
.
├── .github/                      # GitHub Actions workflows for CI/CD pipelines.
│   └── workflows/
├── node_modules/                 # Installed Node.js packages.
├── reports/                      # Stores generated test execution reports, screenshots, and videos for analysis.
│   ├── allure-results/
│   ├── allure-report/
│   └── screenshots/
├── src/                          # Contains all the source code for the Playwright automation framework.
│   ├── config/                   # Manages Playwright configuration, environment-specific settings, and global setup/teardown logic.
│   │   ├── environments/
│   │   │   ├── dev.config.ts
│   │   │   ├── qa.config.ts
│   │   │   └── prod.config.ts
│   │   ├── playwright.config.ts
│   │   └── globalSetup.ts
│   ├── constants/                # Holds application-wide immutable values, enums, and error messages.
│   │   ├── apiEndpoints.ts
│   │   ├── errorMessages.ts
│   │   ├── selectors.ts
│   │   └── timeouts.ts
│   ├── fixtures/                 # Defines custom Playwright test fixtures for shared setup, resources, and authenticated states.
│   │   ├── authFixture.ts
│   │   └── baseFixture.ts
│   ├── helpers/                  # Provides reusable helper functions that interact directly with Playwright or assist in framework operations.
│   │   ├── browserHelper.ts
│   │   ├── assertionHelper.ts
│   │   └── elementHelper.ts
│   ├── pages/                    # Implements the Page Object Model (POM) pattern, representing application pages and their elements.
│   │   ├── common/               # Contains common components or base page classes for shared functionalities.
│   │   │   └── BasePage.ts
│   │   ├── customer/             # Page objects specific to customer-facing features.
│   │   │   ├── LoginPage.ts
│   │   │   └── DashboardPage.ts
│   │   └── admin/                # Page objects specific to admin-facing features.
│   │       └── AdminLoginPage.ts
│   ├── tests/                    # Contains the actual Playwright test specifications and test suites, organized by type or feature.
│   │   ├── api/                  # Test suites for validating backend API endpoints.
│   │   │   └── auth.api.spec.ts
│   │   ├── e2e/                  # End-to-end test suites simulating complete user journeys.
│   │   │   ├── customer/         # E2E tests for customer-specific flows.
│   │   │   │   └── login.e2e.spec.ts
│   │   │   └── admin/            # E2E tests for admin-specific flows.
│   │   │       └── adminLogin.e2e.spec.ts
│   │   └── component/            # Component-level tests focusing on individual UI components.
│   │       └── loginForm.component.spec.ts
│   └── utils/                    # Offers generic utility functions not specific to Playwright or the application under test.
│       ├── dataGenerator.ts
│       ├── logger.ts
│       └── timeUtils.ts
├── test-data/                    # Stores external test data used across various test scenarios, such as credentials or input values.
│   ├── customer/                 # Test data specifically for customer-related features.
│   │   ├── validCredentials.json
│   │   ├── invalidCredentials.json
│   │   └── forgotPasswordData.json
│   └── admin/                    # Test data specifically for admin-related features.
│       └── adminCredentials.json
├── package.json                  # Project metadata and dependencies definitions.
├── tsconfig.json                 # TypeScript compiler configuration.
└── README.md                     # Project documentation.
```