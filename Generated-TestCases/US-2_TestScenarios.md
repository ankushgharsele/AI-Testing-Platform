# Test Scenario Report

## 1. Issue Details

-   **Issue ID:** US-002
-   **Issue Title:** Create Retailer
-   **Summary:** As a Salesman, I should be able to create a new Retailer by entering mandatory details, so that the Retailer can place orders. This feature allows Salesmen to onboard new retailers into the system, enabling them to become active participants in the order fulfillment process.

## 2. Functional Test Scenarios

*   Verify a Salesman can access the "Create Retailer" form/page.
*   Verify all mandatory fields for creating a retailer are present on the form.
*   Verify a Salesman can successfully create a new Retailer by providing valid data for all mandatory fields.
*   Verify the newly created Retailer is visible in the Retailer list/management section.
*   Verify the system confirms successful Retailer creation (e.g., success message, redirection).
*   Verify that upon successful creation, the Retailer's default status is 'Active' or as specified.
*   Verify that if optional fields are provided, their values are correctly saved and displayed.
*   Verify the system prevents creation if any mandatory field is left blank.
*   Verify the system prevents creation if an email address already exists in the system.
*   Verify the system handles special characters correctly in fields like Retailer Name, Address, etc.
*   Verify the "Cancel" or "Back" functionality works as expected without creating a Retailer.

## 3. Positive Test Scenarios

*   Successfully create a Retailer providing valid data for all mandatory fields and no optional fields.
*   Successfully create a Retailer providing valid data for all mandatory and all available optional fields.
*   Successfully create a Retailer with a unique email address and phone number.
*   Successfully create multiple Retailers sequentially with unique valid data for each.
*   Verify the Retailer is created with an 'Active' status by default (if applicable).
*   Verify the Retailer's details are accurately displayed on the Retailer detail page after creation.
*   Verify the Salesman who created the Retailer is associated with it (if such tracking exists).

## 4. Negative Test Scenarios

*   Attempt to create a Retailer with a mandatory field left empty (e.g., Retailer Name, Email, Address).
*   Attempt to create a Retailer with an invalid email format (e.g., "test@.com", "test@com", "test").
*   Attempt to create a Retailer with an email address that already exists for another retailer.
*   Attempt to create a Retailer with an invalid phone number format (e.g., too short/long, alphanumeric characters).
*   Attempt to create a Retailer with a Retailer Name exceeding the maximum allowed length.
*   Attempt to create a Retailer while logged in as a user role other than a Salesman (e.g., Admin, Warehouse Manager, or unauthenticated user).
*   Attempt to create a Retailer by bypassing the UI and directly calling the API with invalid or missing parameters.
*   Attempt to submit the form without any data.
*   Attempt to submit the form multiple times rapidly after an initial successful submission.

## 5. Boundary Value Test Scenarios

*   **Retailer Name:**
    *   Enter Retailer Name with minimum allowed characters (e.g., 1 or 3 characters, depending on business rules).
    *   Enter Retailer Name with maximum allowed characters.
    *   Attempt to enter Retailer Name with one character more than the maximum allowed characters.
*   **Email Address:**
    *   Enter an email address with minimum valid length (e.g., a@b.co).
    *   Enter an email address with maximum valid length.
    *   Attempt to enter an email address with one character more than the maximum allowed.
*   **Phone Number:**
    *   Enter a phone number with minimum valid digits for the selected country code.
    *   Enter a phone number with maximum valid digits for the selected country code.
    *   Attempt to enter a phone number with one digit more than the maximum allowed.
*   **Address Fields (Street, City, Zip/Postal Code):**
    *   Enter values with minimum allowed characters.
    *   Enter values with maximum allowed characters.
    *   Attempt to enter values with one character more than the maximum allowed.

## 6. Validation Test Scenarios

*   Verify all mandatory fields are clearly marked (e.g., with an asterisk).
*   Verify appropriate client-side validation messages are displayed for:
    *   Empty mandatory fields.
    *   Invalid email format.
    *   Invalid phone number format.
    *   Field length violations (too short/long).
    *   Character type restrictions (e.g., numeric-only fields if any).
*   Verify appropriate server-side validation messages are displayed for:
    *   Duplicate email address.
    *   Data integrity constraints (e.g., foreign key violations if applicable).
    *   Business rule violations (e.g., unique retailer name constraint if applicable).
*   Verify validation messages are user-friendly, clear, and actionable.
*   Verify validation messages disappear once the invalid input is corrected.

## 7. UI Test Scenarios

*   Verify the "Create Retailer" form loads correctly without any broken elements or layout issues.
*   Verify all form fields (text boxes, dropdowns, buttons) are correctly aligned and styled according to design specifications.
*   Verify all labels for input fields are clear and descriptive.
*   Verify placeholder text (if any) is displayed correctly in input fields.
*   Verify the "Submit" and "Cancel" buttons are clearly visible and functional.
*   Verify focus order (tab order) is logical and sequential across all form elements.
*   Verify tooltips or help text (if present) are displayed correctly on hover/focus.
*   Verify the form title ("Create New Retailer") is accurate.
*   Verify the form clears out after a successful submission or after canceling.

## 8. API Test Scenarios

*   Send a POST request to the `/api/retailers` (or similar) endpoint with all valid mandatory retailer details.
    *   Verify a `201 Created` status code is returned.
    *   Verify the response body contains the newly created retailer's details, including a unique ID.
    *   Verify the retailer is successfully created in the database.
*   Send a POST request with missing mandatory fields.
    *   Verify a `400 Bad Request` status code is returned.
    *   Verify the response body contains specific error messages indicating which fields are missing.
*   Send a POST request with an invalid email format.
    *   Verify a `400 Bad Request` status code is returned.
    *   Verify the response body indicates the email format error.
*   Send a POST request with an email address that already exists.
    *   Verify a `409 Conflict` or `400 Bad Request` status code is returned.
    *   Verify the response body indicates the duplicate email error.
*   Send a POST request with an invalid authorization token or no token.
    *   Verify a `401 Unauthorized` or `403 Forbidden` status code is returned.
*   Send a POST request with an overly large request payload to test limits.
*   Verify data types for all fields in the request payload (e.g., numeric IDs are integers, not strings).
*   Test input fields with special characters, SQL injection attempts, and XSS payload attempts (as part of basic security checks).

## 9. Database Test Scenarios

*   Verify that after successful creation via UI/API, a new record is inserted into the `Retailers` table (or equivalent).
*   Verify all mandatory field values (Name, Email, Phone, Address, etc.) are correctly stored in their respective columns for the new retailer.
*   Verify optional field values are correctly stored if provided.
*   Verify the `created_at`, `updated_at` (or similar timestamp) fields are accurately populated.
*   Verify the `created_by` or `salesman_id` field (if applicable) correctly links to the Salesman who created the retailer.
*   Verify default values (e.g., `status='Active'`) are correctly set in the database if not explicitly provided.
*   Verify no duplicate records are created when attempting to create a retailer with a unique constraint violation (e.g., duplicate email).
*   Verify data integrity constraints (e.g., foreign keys for address components, if separate tables are used) are maintained.

## 10. Integration Test Scenarios

*   **User Management:**
    *   Verify that the Salesman's role permissions correctly allow access to the "Create Retailer" functionality.
    *   Verify that only authorized Salesmen can create retailers.
*   **Order Management:**
    *   Verify that a newly created retailer can be selected and associated with new orders in the Order Management module.
    *   Verify that the retailer's details are accessible and accurate when placing an order.
*   **Reporting/Analytics:**
    *   Verify that the newly created retailer appears in relevant reports (e.g., "New Retailers This Month," "Retailer List").
*   **Notification System:**
    *   If applicable, verify that an internal notification (e.g., to an Admin or another department) is triggered upon new retailer creation.
    *   If applicable, verify that an automated welcome email is sent to the new retailer's contact person.
*   **Search/Filter:**
    *   Verify that the newly created retailer is discoverable through search and filter functionalities in the retailer management section.

## 11. Security Test Scenarios

*   **Authentication & Authorization:**
    *   Verify only authenticated users with the 'Salesman' role can access and use the "Create Retailer" functionality.
    *   Attempt to create a retailer as an unauthenticated user, verify failure and appropriate error.
    *   Attempt to create a retailer as a user with an unauthorized role (e.g., Customer, Warehouse Staff), verify failure and appropriate error.
*   **Input Validation & Injection:**
    *   Attempt SQL injection in all text fields (e.g., `Name', Address', etc.`). Verify the system sanitizes input or prevents execution.
    *   Attempt Cross-Site Scripting (XSS) in all text fields (e.g., `<script>alert('XSS');</script>`). Verify the system escapes output and prevents script execution.
    *   Test for Cross-Site Request Forgery (CSRF) by attempting to submit the form from an external domain or without a valid CSRF token.
*   **Data Tampering:**
    *   Attempt to modify mandatory fields through browser developer tools before submission.
    *   Attempt to submit negative or excessively large/small numerical values if any numerical fields are present.
*   **Sensitive Data Handling:**
    *   Verify no sensitive Salesman or system information is exposed in network requests or responses during retailer creation.

## 12. Performance Test Scenarios

*   **Load Testing:**
    *   Measure the response time for a single Salesman creating a retailer under normal system load.
    *   Simulate concurrent creation of retailers by multiple Salesmen (e.g., 50, 100, 500 concurrent users). Measure response times, throughput, and error rates.
    *   Determine the system's breaking point or maximum sustainable load for retailer creation.
*   **Stress Testing:**
    *   Apply load beyond the system's capacity to identify bottlenecks and how the system recovers.
*   **Scalability Testing:**
    *   Verify the system maintains acceptable performance when the number of existing retailers grows significantly (e.g., 100,000+ retailers in the database).
*   **Response Time:**
    *   Measure the page load time for the "Create Retailer" form.
    *   Measure the submission time for creating a retailer from the UI.
    *   Measure the API response time for the retailer creation endpoint.

## 13. Error Handling Test Scenarios

*   Verify clear and user-friendly error messages are displayed for all validation failures (client-side and server-side).
*   Verify specific error messages are provided when a unique constraint is violated (e.g., duplicate email).
*   Verify the system displays a generic error message for unexpected server errors (e.g., 500 Internal Server Error) without exposing sensitive technical details.
*   Verify the system gracefully handles network interruptions during form submission.
*   Verify error messages are localized if the application supports multiple languages.
*   Verify application logs capture detailed error information for debugging purposes without exposing PII.
*   Verify the system provides guidance on how to resolve errors where applicable.

## 14. Accessibility Test Scenarios

*   **Keyboard Navigation:**
    *   Verify all form elements and interactive components are navigable using only the keyboard (Tab, Shift+Tab, Enter, Spacebar).
    *   Verify focus indicator is visible and clear on all interactive elements.
*   **Screen Reader Compatibility:**
    *   Verify screen readers (e.g., JAWS, NVDA, VoiceOver) can correctly read out all labels, instructions, input fields, error messages, and button texts.
    *   Verify ARIA attributes are correctly implemented for complex widgets or dynamic updates (if any).
*   **Color Contrast:**
    *   Verify sufficient color contrast ratio between text and background for all form elements, labels, and error messages (WCAG 2.1 AA compliant).
*   **Text Resizing:**
    *   Verify the form remains usable and readable when text is resized up to 200% without loss of content or functionality.
*   **Form Structure:**
    *   Verify logical heading structure (`<h1>`, `<h2>`, etc.) is used for the page title and sections.
    *   Verify form fields are grouped logically (e.g., using `<fieldset>` and `<legend>`).

## 15. Cross Browser Test Scenarios

*   Verify the "Create Retailer" form's layout, styling, and functionality are consistent and correct across major browsers:
    *   Google Chrome (latest two versions)
    *   Mozilla Firefox (latest two versions)
    *   Microsoft Edge (latest two versions)
    *   Safari (latest two versions on macOS)
*   Verify client-side validations work as expected in all supported browsers.
*   Verify form submission and error messages behave consistently across all browsers.
*   Verify any dynamic UI elements (e.g., date pickers, auto-suggest fields) function correctly in all supported browsers.

## 16. Mobile Responsive Test Scenarios

*   Verify the "Create Retailer" form adapts correctly to different screen sizes and orientations (portrait/landscape) on various mobile devices (e.g., iPhone, Android phones, tablets).
*   Verify all form fields, labels, and buttons are properly displayed and accessible without horizontal scrolling.
*   Verify input fields are appropriately sized for touch interaction on mobile devices.
*   Verify the virtual keyboard appears correctly for text input fields and dismisses properly.
*   Verify validation messages are clearly visible and do not interfere with other UI elements on smaller screens.
*   Verify the overall user experience is intuitive on mobile platforms, maintaining usability and clarity.