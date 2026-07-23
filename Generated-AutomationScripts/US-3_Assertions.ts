```typescript
// Assertions for the initial navigation and UI state
// ----------------------------------------------------------------------------------------------------
// After navigating to the signup page
await expect(page).toHaveURL('http://localhost:3000/signup');
await expect(page).toHaveTitle(/Sign Up|Register/i); // Adjust regex based on actual title

// Validate important UI elements are visible and have correct attributes/text
const usernameInput = page.locator('#username');
const emailInput = page.locator('#email');
const passwordInput = page.locator('#password');
const confirmPasswordInput = page.locator('#confirmPassword');
const registerButton = page.locator('button[type="submit"]');

await expect(page.locator('h1')).toHaveText(/Sign Up|Register/i); // Assuming there's an H1 title
await expect(usernameInput).toBeVisible();
await expect(usernameInput).toBeEnabled();
await expect(usernameInput).toHaveAttribute('placeholder', /Username/i); // Adjust placeholder text if different
await expect(emailInput).toBeVisible();
await expect(emailInput).toBeEnabled();
await expect(emailInput).toHaveAttribute('placeholder', /Email/i); // Adjust placeholder text if different
await expect(passwordInput).toBeVisible();
await expect(passwordInput).toBeEnabled();
await expect(passwordInput).toHaveAttribute('placeholder', /Password/i); // Adjust placeholder text if different
await expect(confirmPasswordInput).toBeVisible();
await expect(confirmPasswordInput).toBeEnabled();
await expect(confirmPasswordInput).toHaveAttribute('placeholder', /Confirm Password/i); // Adjust placeholder text if different
await expect(registerButton).toBeVisible();
await expect(registerButton).toBeEnabled();
await expect(registerButton).toHaveText(/Register|Sign Up/i);

// Assert initial absence of error/success messages
await expect(page.locator('.error-message')).not.toBeVisible(); // Assuming a common error message class
await expect(page.locator('.success-message')).not.toBeVisible(); // Assuming a common success message class


// Assertions for the positive registration flow (after filling fields and clicking Register)
// ----------------------------------------------------------------------------------------------------
// After filling the fields (optional, but good for debugging/robustness)
await expect(usernameInput).toHaveValue('testuser123');
await expect(emailInput).toHaveValue('test123@example.com');
await expect(passwordInput).toHaveValue('SecurePassword123!');
await expect(confirmPasswordInput).toHaveValue('SecurePassword123!');

// After clicking the Register button (assuming successful registration redirects to /dashboard or /login)
// It's crucial to wait for navigation or a specific element to appear after click.
// For example, if it navigates to /dashboard:
await expect(page).toHaveURL(/dashboard|login/i); // Adjust based on actual post-registration URL
await expect(page).toHaveTitle(/Dashboard|Login/i); // Adjust based on actual post-registration title

// Validate success message (assuming a success message is displayed on the new page or temporarily)
const successMessage = page.locator('.success-message'); // Adjust selector based on actual success message element
await expect(successMessage).toBeVisible();
await expect(successMessage).toHaveText(/Registration successful|Account created/i); // Adjust expected text

// Ensure no error messages are displayed after successful registration
await expect(page.locator('.error-message')).not.toBeVisible();

// Validate UI elements on the new page (e.g., a welcome message, logout button)
await expect(page.locator('text=Welcome, testuser123')).toBeVisible(); // Adjust selector and text
await expect(page.locator('button:has-text("Logout")')).toBeVisible(); // Adjust selector and text


// ----------------------------------------------------------------------------------------------------
// NEGATIVE VALIDATIONS (These would typically be in separate `test` blocks)
// ----------------------------------------------------------------------------------------------------

// Scenario 1: Attempting to register with empty fields
// (Assumes a fresh navigation to signup page and clicking register immediately)
/*
// await page.goto('http://localhost:3000/signup');
// await page.locator('button[type="submit"]').click();

await expect(page).toHaveURL('http://localhost:3000/signup'); // URL should not change on client-side validation errors
await expect(page.locator('.error-message')).toBeVisible(); // Generic error message
await expect(page.locator('#username-error')).toHaveText(/Username is required/i); // Specific field error
await expect(page.locator('#email-error')).toHaveText(/Email is required/i);
await expect(page.locator('#password-error')).toHaveText(/Password is required/i);
await expect(page.locator('#confirmPassword-error')).toHaveText(/Confirm password is required/i);
await expect(page.locator('.success-message')).not.toBeVisible();
*/

// Scenario 2: Attempting to register with mismatched passwords
/*
// await page.goto('http://localhost:3000/signup');
// await page.locator('#username').fill('mismatchuser');
// await page.locator('#email').fill('mismatch@example.com');
// await page.locator('#password').fill('Password123!');
// await page.locator('#confirmPassword').fill('DifferentPassword!');
// await page.locator('button[type="submit"]').click();

await expect(page).toHaveURL('http://localhost:3000/signup'); // URL should not change
await expect(page.locator('.error-message')).toBeVisible(); // Generic error message
await expect(page.locator('#confirmPassword-error')).toHaveText(/Passwords do not match/i); // Specific error
await expect(page.locator('.success-message')).not.toBeVisible();
*/

// Scenario 3: Attempting to register with an invalid email format
/*
// await page.goto('http://localhost:3000/signup');
// await page.locator('#username').fill('invalidemail');
// await page.locator('#email').fill('invalid-email'); // Invalid format
// await page.locator('#password').fill('Password123!');
// await page.locator('#confirmPassword').fill('Password123!');
// await page.locator('button[type="submit"]').click();

await expect(page).toHaveURL('http://localhost:3000/signup'); // URL should not change
await expect(page.locator('.error-message')).toBeVisible(); // Generic error message
await expect(page.locator('#email-error')).toHaveText(/Invalid email format/i); // Specific error
await expect(page.locator('.success-message')).not.toBeVisible();
*/

// Scenario 4: Attempting to register with an already existing user/email
/*
// (This scenario requires the backend to respond with an error)
// await page.goto('http://localhost:3000/signup');
// await page.locator('#username').fill('existinguser'); // Assume this user exists
// await page.locator('#email').fill('existing@example.com'); // Assume this email exists
// await page.locator('#password').fill('Password123!');
// await page.locator('#confirmPassword').fill('Password123!');
// await page.locator('button[type="submit"]').click();

// Depending on implementation, it might redirect or stay on page with an error
// If it stays on the signup page:
await expect(page).toHaveURL('http://localhost:3000/signup');
await expect(page.locator('.error-message')).toBeVisible();
await expect(page.locator('.error-message')).toHaveText(/User with this email already exists|Username already taken/i);
await expect(page.locator('.success-message')).not.toBeVisible();

// If it redirects to a /error page or shows a modal:
// await expect(page).toHaveURL(/error/i);
// await expect(page.locator('.error-page-message')).toHaveText(/Registration failed: User already exists/i);
*/
```