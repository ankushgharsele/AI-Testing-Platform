# Test Data

## Authentication Data

| Field | Value | Role | Purpose |
|-------|-------|------|---------|
| `username` | `salesman@example.com` | Salesman | Valid credentials for `salesman` user authentication. |
| `password` | `SalesmanPassword123` | Salesman | Valid password for `salesman` user authentication. |
| `username` | `admin@example.com` | Admin | Valid credentials for `admin` user authentication (currently unused in provided tests). |
| `password` | `AdminPassword123` | Admin | Valid password for `admin` user authentication (currently unused in provided tests). |

## Valid Data

| Field | Value | Purpose |
|-------|-------|---------|
| Retailer Name | `Acme Retail Solutions` | Unique, valid retailer name for creation (TC-RET-001). |
| Retailer Code | `ARS-XYZ12` | Unique, valid retailer code for creation (TC-RET-001). |
| Email | `contact@acmeretail.com` | Valid email format for retailer (TC-RET-001). |
| Phone Number | `(555) 123-4567` | Valid phone number format for retailer (TC-RET-001). |
| Address Line 1 | `123 Main Street` | Valid address for retailer (TC-RET-001). |
| City | `Springfield` | Valid city for retailer (TC-RET-001). |
| State/Province | `IL` | Valid state/province (abbreviated) for retailer (TC-RET-001). |
| Zip/Postal Code | `62704` | Valid zip/postal code for retailer (TC-RET-001). |
| Country | `United States` | Valid country for retailer (TC-RET-001). |
| Search Query | `Laptop Pro X` | Exact match for product name (TC-PS-001). |
| Search Query | `laptop pro x` | Case-insensitive match for product name (TC-PS-003). |
| Search Query | `LPX-001` | Exact match for product SKU (TC-PS-004). |
| Search Query | `lpx-001` | Case-insensitive match for product SKU (TC-PS-005). |
| Search Query | `Wireless Mouse` | Exact match for product name (TC-PS-009, TC-PS-015). |
| Search Query | `Dell UltraSharp Monitor` | Exact match for product name with multiple words (TC-PS-010). |
| Search Query | `External SSD 1TB` | Exact match for product name with numbers (TC-PS-021). |
| Search Query | `Gaming RGB` | Multiple keywords in order (TC-PS-029). |
| Search Query | `RGB Gaming` | Multiple keywords in different order (TC-PS-029). |
| Search Query | `Monitor` | Search term with expected results for browser navigation (TC-PS-031). |

## Invalid Data

| Field | Value | Expected Result |
|-------|-------|-----------------|
| Retailer Name | `(empty string)` | "Retailer Name is required." validation error (TC-RET-002). |
| Email | `invalid-email-format` | "Please enter a valid email address." validation error (TC-RET-003). |
| Retailer Code | `(existing retailer's code)` | "Retailer code already exists. Please use a unique code." server-side error message (TC-RET-004). |
| Search Query | `XYZ NonExistent Product 123` | "No results found" message displayed (TC-PS-006). |
| Search Query | `(empty string)` | "No results found" message displayed, URL remains home (TC-PS-007). |
| Search Query | `   ` | "No results found" message displayed, URL remains home (if trimmed) (TC-PS-008). |
| Search Query | `(missing)` | API returns 400 Bad Request, "Query parameter required" message (TC-PS-020). |
| Search Query | `NonExistentAPIProduct` | API returns 200 OK with empty results (TC-PS-019). |

## Boundary Values

| Field | Test Type | Value | Expected Result |
|-------|-----------|-------|-----------------|
| Search Query | Max Length | `A`.repeat(`MAX_SEARCH_QUERY_LENGTH`) (e.g., `A`.repeat(100)) | Input field accepts value, search performs with full query (implied for max length). |
| Search Query | Max Length + 1 | `A`.repeat(`MAX_SEARCH_QUERY_LENGTH` + 1) (e.g., `A`.repeat(101)) | Input field truncates to `MAX_SEARCH_QUERY_LENGTH`, search performs with truncated query, "No results found" (TC-PS-012). |
| Phone Number | Min/Max Length | `123-456-7890` (10 digits) | Valid (assuming 10 digits + hyphens is standard). |
| Phone Number | Invalid Length | `123-456-789` (9 digits) | Expected validation error (implied by TC-RET-006, TC-RET-007). |
| Zip/Postal Code | Min/Max Length | `12345` (5 digits) | Valid (assuming 5 digits is standard). |
| Zip/Postal Code | Invalid Length | `1234` (4 digits) | Expected validation error (implied). |

## Empty and Special Character Data

| Field | Test Type | Value | Expected Result |
|-------|-----------|-------|-----------------|
| Search Query | Leading/Trailing Spaces | `  Wireless Mouse  ` | Search performs with `Wireless Mouse` (trimmed), correct product displayed (TC-PS-009). |
| Search Query | Supported Special Chars | `Dell UltraSharp Monitor` | Search performs correctly, relevant products displayed (TC-PS-010). |
| Search Query | Unsupported Special Chars | `` `!@#$%^&*()_+ `` | "No results found" message, no errors, no unexpected behavior (TC-PS-011). |
| Retailer Name | Unicode | `株式会社アシックス` | Accepts and displays Unicode characters. |
| Email | Unicode | `test@élève.com` | Accepts and validates valid internationalized email domains (if supported). |
| Address Line 1 | Unicode | `Straße des 17. Juni 135` | Accepts and displays Unicode characters. |

## Security Test Data

| Field | Test Type | Value | Expected Result |
|-------|-----------|-------|-----------------|
| Search Query | SQL Injection | `' OR '1'='1` | "No results found" or specific error, no unexpected products, no SQL errors displayed (TC-PS-023). |
| Search Query | SQL Injection | `'; DROP TABLE products; --` | "No results found" or specific error, no unexpected products, no SQL errors displayed (TC-PS-023). |
| Search Query | SQL Injection | `" OR "1"="1` | "No results found" or specific error, no unexpected products, no SQL errors displayed (TC-PS-023). |
| Search Query | SQL Injection | `SLEEP(5)` | "No results found" or specific error, no unexpected products, no SQL errors displayed, no noticeable delay (TC-PS-023). |
| Search Query | XSS Attack | `<script>alert('XSS')</script>` | Search term rendered as plain text, no alert dialog, no script execution, "No results found" (TC-PS-024). |
| Search Query | XSS Attack | `<img src=x onerror=alert('XSS')>` | Search term rendered as plain text, no alert dialog, no script execution, "No results found" (TC-PS-024). |
| Search Query | XSS Attack | `<body onload=alert('XSS')>` | Search term rendered as plain text, no alert dialog, no script execution, "No results found" (TC-PS-024). |
| Search Query | XSS Attack | `"><script>alert(document.domain)</script>` | Search term rendered as plain text, no alert dialog, no script execution, "No results found" (TC-PS-024). |

## Additional Scenario Data

| Scenario | Field | Value | Expected Result |
|----------|-------|-------|-----------------|
| Product Data (Constants) | `PRODUCT_DATA.LAPTOP_PRO_X.name` | `Laptop Pro X` | Product name displayed. |
| Product Data (Constants) | `PRODUCT_DATA.LAPTOP_PRO_X.sku` | `LPX-001` | Product SKU displayed. |
| Product Data (Constants) | `PRODUCT_DATA.LAPTOP_PRO_X.price` | `$1299.99` | Product price displayed, format `^\$\d+(\.\d{2})?$`. |
| Product Data (Constants) | `PRODUCT_DATA.WIRELESS_MOUSE.name` | `Wireless Mouse` | Product name displayed. |
| Product Data (Constants) | `PRODUCT_DATA.WIRELESS_MOUSE.sku` | `WM-200` | Product SKU displayed. |
| Product Data (Constants) | `PRODUCT_DATA.MONITOR.name` | `Dell UltraSharp Monitor` | Product name displayed. |
| Product Data (Constants) | `PRODUCT_DATA.EXTERNAL_SSD_1TB.name` | `External SSD 1TB` | Product name displayed. |
| Product Data (Constants) | `PRODUCT_DATA.EXTERNAL_SSD_1TB.sku` | `ESD-1000` | Product SKU displayed. |
| Product Data (Constants) | `PRODUCT_DATA.EXTERNAL_SSD_1TB.description` | `High-speed 1TB portable SSD.` | Product description displayed on detail page. |
| Product Data (Constants) | `PRODUCT_DATA.GAMING_KEYBOARD_RGB.name` | `Gaming Keyboard RGB` | Product name displayed. |
| Product Data (Constants) | `PRODUCT_DATA.GAMING_KEYBOARD_RGB.sku` | `GK-RGB-001` | Product SKU displayed (example). |
| Product Data (Constants) | `PRODUCT_DATA.RGB_GAMING_MOUSE.name` | `RGB Gaming Mouse` | Product name displayed. |
| Product Data (Constants) | `PRODUCT_DATA.RGB_GAMING_MOUSE.sku` | `RGB-GM-001` | Product SKU displayed (example). |
| Product Data (Constants) | `PRODUCT_DATA.BRAND_NEW_GADGET.name` | `Quantum Synthesizer` | New product name (TC-PS-022 simulated). |
| Product Data (Constants) | `PRODUCT_DATA.BRAND_NEW_GADGET.sku` | `QS-V1` | New product SKU (TC-PS-022 simulated). |
| `MAX_SEARCH_QUERY_LENGTH` | `Constant` | `100` | Maximum length for search query input. |
| Search Query (Pagination) | `Mouse` | Many products match `Mouse` (e.g., `Gaming Mouse`, `Wireless Mouse`, `Ergonomic Mouse`). | Multiple search results spanning pages, pagination controls enabled (TC-PS-028). |
| UI Messages (Constants) | `UI_MESSAGES.GENERIC_ERROR` | `An unexpected error occurred. Please try again later.` | User-friendly error message for backend failure (TC-PS-027). |
| UI Messages (Constants) | `UI_MESSAGES.EMPTY_SEARCH_TERM_VALIDATION` | `Please enter a search term.` | Placeholder validation message for empty search (implied). |
| Search Bar Placeholder | Placeholder Text | `Search product by name or SKU` | Search input field displays this text (TC-PS-013). |

## Performance Test Data

| Field | Data Type | Size/Description | Expected Result |
|-------|-----------|------------------|-----------------|
| Search Query | Common Product Name | `Laptop` | Search results displayed within `2000 ms` (TC-PS-025). |
| Search Query | Non-existent Product Name | `NonexistentProductXYZ` | "No results found" message displayed within `1500 ms` (TC-PS-026). |
| Search Query | Large Dataset Query | `(complex query for many results)` | Search results displayed within acceptable threshold (e.g., `3000 ms`). |
| Search Query | Long Query with No Results | `Z`.repeat(`MAX_SEARCH_QUERY_LENGTH`) | "No results found" message displayed within `1500 ms`. |