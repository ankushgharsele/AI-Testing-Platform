```
.
├── src/                                   # Source directory for all core automation components.
│   ├── pages/                             # Contains Page Object Model (POM) classes, representing specific web pages or components.
│   │   └── product-search/                # Page objects specific to the product search feature.
│   ├── tests/                             # Holds the executable test scripts and test suites.
│   │   └── features/                      # Tests organized by application features.
│   │       └── product-search/            # Test specifications for the product search feature.
│   ├── fixtures/                          # Provides reusable test setup, teardown, and context.
│   │   └── contexts/                      # Custom test contexts or extend Playwright's base test.
│   ├── utils/                             # General-purpose utility functions not specific to pages or tests.
│   │   └── api/                           # Utilities for API interactions (if applicable for search verification).
│   ├── constants/                         # Stores immutable values like URLs, timeouts, or specific selectors.
│   │   └── enums/                         # Enumerations for common statuses or types.
│   └── helpers/                           # Contains helper functions for common testing tasks or assertions.
│       └── assertions/                    # Custom assertion helpers.
├── config/                                # Stores Playwright configuration files and environment-specific settings.
│   └── environments/                      # Environment-specific configuration files.
├── test-data/                             # Externalized test data in various formats (e.g., JSON, TS).
│   └── product-search/                    # Data files specific to product search scenarios.
├── reports/                               # Output directory for test execution reports and artifacts.
│   └── screenshots/                       # Captured screenshots from test failures.
```