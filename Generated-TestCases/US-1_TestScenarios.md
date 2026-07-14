# Test Scenario Report

## 1. Issue Details

-   **Issue ID:** 1
-   **Issue Title:** US-001 - Salesman Login
-   **Summary:** As a Salesman, the user should be able to successfully log into the application using valid credentials. Upon successful authentication, the system must display the Salesman Dashboard, enabling the user to proceed with order creation and other Salesman-specific functionalities.

## 2. Functional Test Scenarios

*   **F-001:** Verify that accessing the application's root URL or a protected page redirects to the Salesman login page.
*   **F-002:** Verify successful login with a valid Salesman username and password.
*   **F-003:** Verify that upon successful login, the application redirects the user to the designated Salesman Dashboard.
*   **F-004:** Verify that clicking the "Forgot Password?" link (if present) navigates to the password recovery page or initiates the password reset process.
*   **F-005:** Verify that checking the "Remember Me" checkbox (if present) allows the user to remain logged in across browser sessions.
*   **F-006:** Verify that a user logged in as a Salesman can perform actions intended for their role (e.g., navigate to "Create Order" page) after successful login.

## 3. Positive Test Scenarios

*   **P-001:** Log in with a valid Salesman username and password provided in the system.
*   **P-002:** Log in with a valid Salesman username and password after a successful logout from a previous session.
*   **P-003:** Log in by entering valid credentials and pressing the "Enter" key instead of clicking the "Login" button.
*   **P-004:** Log in with valid credentials when the "Remember Me" checkbox is selected (if applicable), then close and reopen the browser to verify session persistence.
*   **P-005:** Log in with a newly registered and activated Salesman account.
*   **P-006:** Log in with an existing Salesman account that has been inactive for a period but is still valid.

## 4. Negative Test Scenarios

*   **N-001:** Attempt to log in with an invalid username and a valid password.
*   **N-002:** Attempt to log in with a valid username and an invalid password.
*   **N-003:** Attempt to log in with both an invalid username and an invalid password.
*   **N-004:** Attempt to log in with an empty username field and a valid password.
*   **N-005:** Attempt to log in with a valid username and an empty password field.
*   **N-006:** Attempt to log in with both username and password fields empty.
*   **N-007:** Attempt to log in with a username that exists but belongs to a different role (e.g., Admin, Customer) if the login page is exclusive to Salesmen.
*   **N-008:** Attempt to log in with an account that has been disabled or locked due to excessive failed attempts.
*   **N-009:** Attempt to log in using credentials with incorrect casing (e.g., `USERNAME` vs `username` for a case-sensitive system, or vice versa).
*   **N-010:** Attempt to access a Salesman-specific page directly via URL without being logged in; verify redirection to the login page.
*   **N-011:** Attempt to login after the maximum number of failed attempts, verifying that the account is locked or a CAPTCHA is presented.

## 5. Boundary Value Test Scenarios

*   **BV-001:** Attempt to log in with a username and password at the minimum allowed character length.
*   **BV-002:** Attempt to log in with a username and password at the maximum allowed character length.
*   **BV-003:** Attempt to log in with a username and password one character less than the minimum allowed length.
*   **BV-004:** Attempt to log in with a username and password one character more than the maximum allowed length.
*   **BV-005:** Verify the behavior when performing N-1 and N+1 failed login attempts before an account lockout or CAPTCHA trigger (where N is the defined threshold).

## 6. Validation Test Scenarios

*   **V-001:** Verify that the username field correctly handles inputs with leading/trailing spaces (trimmed or treated as invalid).
*   **V-002:** Verify that the password field correctly handles inputs with leading/trailing spaces (trimmed or treated as invalid).
*   **V-003:** Verify that the username field accepts only allowed characters (e.g., alphanumeric, specific symbols) as per specifications.
*   **V-004:** Verify that the password field accepts only allowed characters (e.g., alphanumeric, specific symbols) as per specifications.
*   **V-005:** Verify that the username field does not allow injection of malicious scripts (e.g., XSS) or SQL commands.
*   **V-006:** Verify that the password field does not allow injection of malicious scripts (e.g., XSS) or SQL commands.
*   **V-007:** Verify error messages are displayed for invalid character inputs or unsupported formats in both username and password fields.

## 7. UI Test Scenarios

*   **UI-001:** Verify all essential elements are present on the login page: Username input field, Password input field, Login button, "Forgot Password?" link, and application logo/branding.
*   **UI-002:** Verify the labels for the username and password fields are clear and correctly positioned.
*   **UI-003:** Verify the password input field masks characters as they are typed (e.g., with asterisks or dots).
*   **UI-004:** Verify the "Login" button is initially disabled if both fields are empty and becomes enabled upon valid input.
*   **UI-005:** Verify that error messages for invalid credentials or empty fields are displayed prominently, clearly, and in a user-friendly manner.
*   **UI-006:** Verify the tab order (focus navigation) on the login page is logical: Username -> Password -> Remember Me (if present) -> Forgot Password -> Login button.
*   **UI-007:** Verify the overall aesthetic design, colors, fonts, and alignment of elements on the login page conform to design specifications.
*   **UI-008:** Verify the application logo/branding is correctly displayed and functional (e.g., clicking it navigates to the home page if intended).
*   **UI-009:** Verify the page title in the browser tab is appropriate for the login page.

## 8. API Test Scenarios

*   **API-001:** Verify the `/login` API endpoint responds successfully (e.g., HTTP 200 OK) with a valid authentication token/session ID upon submission of correct Salesman credentials.
*   **API-002:** Verify the `/login` API endpoint returns an appropriate error status code (e.g., HTTP 401 Unauthorized) and a meaningful error message for invalid Salesman credentials.
*   **API-003:** Verify the `/login` API endpoint returns an appropriate error status code (e.g., HTTP 400 Bad Request) when required parameters (username, password) are missing or malformed in the request.
*   **API-004:** Verify the `/login` API endpoint enforces rate limiting for failed login attempts to prevent brute-force attacks.
*   **API-005:** Verify the structure and data types of the successful login response payload (e.g., token, user role, expiration time).
*   **API-006:** Verify the session token received upon successful login is valid and can be used to access protected Salesman-specific API endpoints.
*   **API-007:** Verify the `/login` API endpoint correctly handles different content types (e.g., `application/json`, `application/x-www-form-urlencoded`).
*   **API-008:** Verify that passwords are not exposed in plain text in the API request or response.

## 9. Database Test Scenarios

*   **DB-001:** Verify that valid Salesman user credentials (username, hashed password, role) exist and are retrievable from the `Users` table (or equivalent) in the database.
*   **DB-002:** Verify that user passwords are stored securely using strong hashing algorithms (e.g., bcrypt, Argon2) and not in plain text.
*   **DB-003:** Upon successful login, verify that the `last_login` timestamp for the Salesman user account is updated in the database.
*   **DB-004:** Verify that a `login_attempts` counter (if implemented) is incremented on failed login attempts and reset on successful login.
*   **DB-005:** Verify that the `account_status` (e.g., 'active', 'locked') of a Salesman user is updated correctly in the database after exceeding a configured number of failed login attempts.
*   **DB-006:** Verify that only Salesman roles are associated with accounts designated for Salesman login.
*   **DB-007:** Verify that user session information (e.g., session ID, expiry) is securely stored and managed in the database (or session store).

## 10. Integration Test Scenarios

*   **INT-001:** Verify successful login integrates with the authentication service (e.g., Identity Provider, LDAP, OAuth2) to authenticate Salesman credentials.
*   **INT-002:** Verify that upon successful authentication, the system correctly integrates with the authorization service to assign Salesman-specific permissions and roles.
*   **INT-003:** Verify that the login module seamlessly redirects to the Salesman Dashboard module/service post-authentication, ensuring correct navigation.
*   **INT-004:** Verify that session management is consistently maintained across different application modules or microservices after a successful Salesman login.
*   **INT-005:** Verify that the "Forgot Password" functionality correctly integrates with the email service to send password reset links.
*   **INT-006:** Verify that logs related to login events (success/failure) are correctly pushed to the centralized logging system.

## 11. Security Test Scenarios

*   **SEC-001:** Verify that all login-related communication (API calls, page loads) occurs over HTTPS/SSL to protect credentials in transit.
*   **SEC-002:** Verify that passwords are not stored in plain text in browser local storage, session storage, or cookies.
*   **SEC-003:** Verify session tokens/cookies are marked as `HttpOnly` and `Secure` to prevent client-side script access and ensure transmission over HTTPS only.
*   **SEC-004:** Test for protection against Brute-force attacks (e.g., account lockout after multiple failed attempts, CAPTCHA implementation).
*   **SEC-005:** Test for SQL Injection vulnerabilities by entering malicious SQL strings in username and password fields.
*   **SEC-006:** Test for Cross-Site Scripting (XSS) vulnerabilities by entering malicious scripts in username and password fields.
*   **SEC-007:** Verify the implementation of CSRF tokens to protect the login form from Cross-Site Request Forgery attacks.
*   **SEC-008:** Verify the application handles session fixation attacks by regenerating session IDs after successful login.
*   **SEC-009:** Verify that clicking the browser's back button after successful login does not display the login page with pre-filled credentials.
*   **SEC-010:** Verify that user sessions are properly invalidated on the server-side upon explicit logout.

## 12. Performance Test Scenarios

*   **PERF-001:** Measure the page load time of the Salesman login page under normal user load.
*   **PERF-002:** Measure the response time of the login API endpoint under normal user load (e.g., 50 concurrent users).
*   **PERF-003:** Measure the page load time of the Salesman login page under peak user load (e.g., 500 concurrent users).
*   **PERF-004:** Measure the response time of the login API endpoint under peak user load (e.g., 500 concurrent users), verifying it remains within acceptable thresholds.
*   **PERF-005:** Conduct a stress test to determine the maximum number of concurrent Salesman login attempts the system can handle before degradation or failure.
*   **PERF-006:** Monitor resource utilization (CPU, memory, network I/O, database connections) on the server during various load conditions for the login process.
*   **PERF-007:** Measure the time taken for database queries related to user authentication and session creation.

## 13. Error Handling Test Scenarios

*   **ERR-001:** Verify that a clear and user-friendly error message is displayed when invalid credentials are provided.
*   **ERR-002:** Verify a specific error message is shown if the Salesman account is locked or disabled.
*   **ERR-003:** Verify appropriate error messages are displayed when mandatory fields (username, password) are left empty.
*   **ERR-004:** Simulate a backend server error during the login process and verify a graceful error message is presented to the user, not technical jargon.
*   **ERR-005:** Simulate network disconnection during the login request and verify the application provides feedback (e.g., "Network error, please try again").
*   **ERR-006:** Verify that appropriate log entries are generated for all successful and failed login attempts for auditing and troubleshooting purposes.
*   **ERR-007:** Verify the system's behavior when an external authentication service (if integrated) is unavailable during a login attempt.

## 14. Accessibility Test Scenarios

*   **ACC-001:** Verify that the entire login page is navigable and functional using only a keyboard (Tab, Shift+Tab, Enter keys).
*   **ACC-002:** Verify that all interactive elements (input fields, buttons, links) have appropriate focus indicators.
*   **ACC-003:** Verify that all form fields have explicit `<label>` elements associated with them for screen reader compatibility.
*   **ACC-004:** Verify that error messages and field validation feedback are perceivable by screen readers (e.g., using ARIA live regions).
*   **ACC-005:** Verify that there is sufficient color contrast between text and background for all elements on the login page, meeting WCAG guidelines (e.g., AA or AAA).
*   **ACC-006:** Verify that the page can be zoomed up to 200% without loss of content or functionality, and without requiring horizontal scrolling.
*   **ACC-007:** Verify appropriate ARIA attributes are used for complex components or states (if any), such as `aria-describedby` for error messages.
*   **ACC-008:** Verify semantic HTML elements are used correctly for structure and meaning (e.g., `<form>`, `<input>`, `<button>`).

## 15. Cross Browser Test Scenarios

*   **CB-001:** Verify the login page opens and functions correctly on Google Chrome (latest two stable versions).
*   **CB-002:** Verify the login page opens and functions correctly on Mozilla Firefox (latest two stable versions).
*   **CB-003:** Verify the login page opens and functions correctly on Microsoft Edge (latest two stable versions).
*   **CB-004:** Verify the login page opens and functions correctly on Apple Safari (latest two stable versions on macOS).
*   **CB-005:** Verify that the UI elements, styling, and layout remain consistent and functional across all supported browsers.
*   **CB-006:** Verify that JavaScript-dependent functionalities (e.g., field validation, password masking) work as expected in all supported browsers.

## 16. Mobile Responsive Test Scenarios

*   **MR-001:** Verify the login page layout adapts correctly and is fully functional on small screen sizes (e.g., smartphones in portrait mode).
*   **MR-002:** Verify the login page layout adapts correctly and is fully functional on medium screen sizes (e.g., tablets in portrait and landscape modes).
*   **MR-003:** Verify input fields, buttons, and text scale appropriately and remain readable on various mobile devices without requiring zooming or horizontal scrolling.
*   **MR-004:** Verify that on-screen keyboards correctly appear when input fields are focused and do not obscure critical elements.
*   **MR-005:** Verify touch gestures (tapping, scrolling) are responsive and work as expected on mobile devices.
*   **MR-006:** Verify error messages are displayed clearly and responsively on mobile viewports.
*   **MR-007:** Verify any navigation elements (e.g., back button, menu) are easily accessible and functional in mobile layouts.