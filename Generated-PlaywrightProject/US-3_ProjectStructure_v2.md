```markdown
.
├── playwright.config.ts
├── src
│   ├── api
│   │   └── authApiClient.ts
│   ├── config
│   │   ├── environments
│   │   │   ├── dev.ts
│   │   │   ├── qa.ts
│   │   │   └── prod.ts
│   │   └── environmentConfig.ts
│   ├── constants
│   │   ├── apiEndpoints.ts
│   │   ├── errorMessages.ts
│   │   └── routes.ts
│   ├── fixtures
│   │   └── customFixtures.ts
│   ├── helpers
│   │   ├── navigationHelpers.ts
│   │   └── uiInteractionHelpers.ts
│   ├── pages
│   │   ├── base
│   │   │   └── BasePage.ts
│   │   ├── customer
│   │   │   ├── DashboardPage.ts
│   │   │   └── LoginPage.ts
│   │   └── common
│   │       └── HeaderComponent.ts
│   ├── test-data
│   │   ├── customer
│   │   │   └── loginData.ts
│   │   └── sharedData.ts
│   └── utils
│       ├── dataGenerator.ts
│       ├── logger.ts
│       └── playwrightUtils.ts
├── tests
│   ├── api
│   │   └── customerApi.spec.ts
│   ├── e2e
│   │   ├── customer
│   │   │   └── customerLogin.spec.ts
│   │   └── smoke.spec.ts
│   └── component
│       └── loginForm.spec.ts
├── reports
│   ├── screenshots
│   ├── videos
│   └── test-results
└── tsconfig.json

```

### Folder Descriptions

*   **src**: Contains all source code for the automation framework, organized by concern.
*   **src/api**: Modules for interacting with backend APIs, useful for setting up test data or bypassing UI.
*   **src/config**: Manages environment-specific configurations for tests, allowing easy switching between dev, QA, and prod.
*   **src/constants**: Stores application-wide static values, messages, or enumerations for easy maintenance.
*   **src/fixtures**: Defines custom Playwright test fixtures to extend the default `TestInfo` context and provide shared setup.
*   **src/helpers**: Houses reusable utility functions that facilitate common automation tasks or complex UI interactions.
*   **src/pages**: Implements the Page Object Model (POM) for UI components and pages, promoting reusability and maintainability.
*   **src/test-data**: Centralizes various data sets used as inputs for test scenarios, separating data from test logic.
*   **src/utils**: Provides generic, framework-agnostic utility functions not directly tied to Playwright or page objects.
*   **tests**: Holds all test suites and specifications, categorized by type (e.g., e2e, API).
*   **tests/e2e**: Contains end-to-end tests that simulate full user journeys through the application UI.
*   **reports**: Stores all generated test reports, screenshots, videos, and traces after test execution.
```