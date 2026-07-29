# Test Data

## Valid Data

| Field        | Value                         | Purpose                                      | Expected Result                                                                                     | Source TC(s)          |
|--------------|-------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------------|-----------------------|
| Search Term  | `Laptop Pro X`                | Exact product name match                     | Display `Laptop Pro X` (SKU: LPX-001) as the only result.                                           | TC-PS-001, TC-PS-014  |
| Search Term  | `Laptop`                      | Partial product name match                   | Display products containing "Laptop" (e.g., `Laptop Pro X`).                                        | TC-PS-002, TC-PS-025  |
| Search Term  | `laptop pro x`                | Case-insensitive product name                | Display `Laptop Pro X` (SKU: LPX-001) as the only result.                                           | TC-PS-003             |
| Search Term  | `LPX-001`                     | Exact SKU match                              | Display `Laptop Pro X` (SKU: LPX-001) as the only result.                                           | TC-PS-004             |
| Search Term  | `lpx-001`                     | Case-insensitive SKU match                   | Display `Laptop Pro X` (SKU: LPX-001) as the only result.                                           | TC-PS-005             |
| Search Term  | `  Wireless Mouse  `          | Product name with leading/trailing spaces    | Display `Wireless Mouse` (SKU: M-WIRE-005) as the only result, spaces trimmed.                      | TC-PS-009             |
| Search Term  | `Product-Name-Hyphenated`     | Product name with supported special chars    | Display `Product-Name-Hyphenated` (SKU: PN-H-001) as the only result. (Mocked in test)            | TC-PS-010             |
| Search Term  | `Wireless Mouse`              | Using Enter key for search                   | Display `Wireless Mouse` (SKU: M-WIRE-005) as the only result.                                      | TC-PS-015             |
| Search Term  | `Mouse`                       | Search for multiple results                  | Display all products containing "Mouse" (e.g., `Wireless Mouse`, `RGB Gaming Mouse`).              | TC-PS-016, TC-PS-028  |
| Search Term  | `Gaming Keyboard RGB`         | API search by product name                   | HTTP Status 200 OK, JSON response with `Gaming Keyboard RGB` details.                               | TC-PS-017             |
| Search Term  | `M-WIRE-005`                  | API search by SKU                            | HTTP Status 200 OK, JSON response with `Wireless Mouse` details.                                    | TC-PS-018             |
| Search Term  | `External SSD 1TB`            | Navigate to Product Detail Page              | Display `External SSD 1TB` (SKU: SSD-EXT-001) as only result, click navigates to PDP for it.        | TC-PS-021             |
| Search Term  | `Brand New Gadget`            | Search for newly added product by name       | Display `Brand New Gadget` (SKU: BNG-001). (Simulated in test)                                      | TC-PS-022             |
| Search Term  | `BNG-001`                     | Search for newly added product by SKU        | Display `Brand New Gadget` (SKU: BNG-001). (Simulated in test)                                      | TC-PS-022             |
| Search Term  | `Gaming RGB`                  | Multiple keywords, order 1                   | Display products containing both "Gaming" and "RGB" (e.g., `Gaming Keyboard RGB`, `RGB Gaming Mouse`). | TC-PS-029             |
| Search Term  | `RGB Gaming`                  | Multiple keywords, order 2                   | Display products containing both "Gaming" and "RGB" (e.g., `Gaming Keyboard RGB`, `RGB Gaming Mouse`). | TC-PS-029             |
| Search Term  | `Dell UltraSharp Monitor`     | For browser history navigation               | Display `Dell UltraSharp Monitor` (SKU: MON-DELL-U27).                                              | TC-PS-031             |

## Invalid Data

| Field       | Value                           | Expected Result                                                 | Source TC(s)          |
|-------------|---------------------------------|-----------------------------------------------------------------|-----------------------|
| Search Term | `XYZ NonExistent Product 123`   | No products displayed, "No results found" message.              | TC-PS-006             |
| Search Term | `NonExistentAPIProduct`         | API: HTTP Status 200 OK, JSON response with an empty array `[]`. | TC-PS-019             |
| API Query   | (missing `query` parameter)     | API: HTTP Status 400 Bad Request, JSON error message.           | TC-PS-020             |
| Search Term | `Any Product`                   | UI: User-friendly error message (`UI_MESSAGES.GENERIC_ERROR`).  | TC-PS-027             |

## Boundary Values

| Field       | Test Type             | Value                                     | Expected Result                                                                                       | Source TC(s) |
|-------------|-----------------------|-------------------------------------------|-------------------------------------------------------------------------------------------------------|--------------|
| Search Term | Minimum Length (empty)| `''` (empty string)                       | Client-side validation message: "Please enter a search term." (No search performed).                  | TC-PS-007    |
| Search Term | Max Length + 10       | `A`.repeat(110)                           | Client-side input truncation to 100 characters. Search performed with truncated value, no results.  | TC-PS-012    |
| Search Term | Valid Max Length      | `A`.repeat(100)                           | No results found (assuming no product with 100 'A's). Input field accepts full length.              | TC-PS-012    |

## Empty and Special Character Data

| Field       | Test Type                       | Value                          | Expected Result                                                     | Source TC(s) |
|-------------|---------------------------------|--------------------------------|---------------------------------------------------------------------|--------------|
| Search Term | Empty string                    | `''`                           | Client-side validation message: "Please enter a search term.".      | TC-PS-007    |
| Search Term | Only spaces (empty-equivalent)  | `   ` (three spaces)           | No products displayed, "No results found" message (spaces trimmed). | TC-PS-008    |
| Search Term | Unsupported special characters  | `\`!@#$%^&*()_+``              | No products displayed, "No results found" message.                  | TC-PS-011    |
| Search Term | Unicode characters              | `こんにちは製品`                 | No results found (assuming no matching product). Graceful handling. | N/A          |
| Search Term | Emojis                          | `🔍✨💻`                       | No results found (assuming no matching product). Graceful handling. | N/A          |

## Security Test Data

| Field       | Test Type             | Value                                      | Expected Result                                                      | Source TC(s) |
|-------------|-----------------------|--------------------------------------------|----------------------------------------------------------------------|--------------|
| Search Term | SQL Injection (basic) | `' OR '1'='1`                              | No products, "No results found" message. No SQL errors visible.      | TC-PS-023    |
| Search Term | SQL Injection (drop)  | `'; DROP TABLE products; --`               | No products, "No results found" message. No SQL errors or data loss. | TC-PS-023    |
| Search Term | XSS (script tag)      | `<script>alert('XSS')</script>`            | Script not executed, displayed as plain text in UI. No alert box.    | TC-PS-024    |
| Search Term | XSS (image error)     | `<img src=x onerror=alert('XSS')>`         | Script not executed, displayed as plain text in UI. No alert box.    | TC-PS-024    |

## Additional Scenario Data

| Scenario                 | Field          | Value                                 | Expected Result                                                                                                                                                                                                                                                                          | Source TC(s) |
|--------------------------|----------------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| UI - Placeholder text    | Search Input   | N/A (check attribute)                 | Placeholder text should be `Search products...` or `Search by name or SKU...` (case-insensitive regex).                                                                                                                                                                                 | TC-PS-013    |
| UI - Keyboard Navigation | Search Term    | `Accessibility Test`                  | Search bar is tabbable, allows typing, search button is tabbable and activatable via Enter. After search, no results and "No results found" message displayed.                                                                                                                           | TC-PS-030    |
| Pagination (Page 1)      | Search Term    | `Mouse`                               | Display `Wireless Mouse` (mocked as page 1). Pagination controls visible, "Next" enabled, "Previous" hidden. URL contains `?query=Mouse`.                                                                                                                                              | TC-PS-028    |
| Pagination (Page 2)      | Search Term    | `Mouse` (after clicking Next/Page 2) | Display `RGB Gaming Mouse` (mocked as page 2). Pagination controls visible, "Next" and "Previous" enabled. URL contains `?query=Mouse&page=2`.                                                                                                                                          | TC-PS-028    |
| Browser Back/Forward     | Initial Page   | Home Page                             | On 'Back' from search results, navigate to Home Page. Search input should be cleared.                                                                                                                                                                                                    | TC-PS-031    |
| Browser Back/Forward     | Search Term    | `Dell UltraSharp Monitor`             | After search for "Monitor", then 'Back' to Home, then 'Forward': Navigate back to search results page, search term (`Dell UltraSharp Monitor`) and results are preserved in UI.                                                                                                       | TC-PS-031    |

## Performance Test Data

| Field       | Data Type | Size/Description               | Expected Result                                                                 | Source TC(s) |
|-------------|-----------|--------------------------------|---------------------------------------------------------------------------------|--------------|
| Search Term | String    | `Laptop` (common, many results) | Page loads within < 2000 ms, relevant products displayed.                       | TC-PS-025    |
| Search Term | String    | `NonexistentProductXYZ` (no results) | Page loads within < 1500 ms, "No results found" message displayed.              | TC-PS-026    |