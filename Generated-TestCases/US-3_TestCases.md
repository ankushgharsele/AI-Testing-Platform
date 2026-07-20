# US-003 - Customer Login

## User Story

As a customer,
I want to login using my registered email and password,
So that I can securely access my dashboard.

## Test Cases

### TC001 - Login with Valid Credentials
- Enter valid username
- Enter valid password
- Click Login
- Verify Dashboard is displayed

### TC002 - Login with Invalid Credentials
- Enter invalid username
- Enter invalid password
- Click Login
- Verify error message

### TC003 - Blank Username
- Leave username blank
- Enter password
- Verify validation message

### TC004 - Blank Password
- Enter username
- Leave password blank
- Verify validation message

### TC005 - Forgot Password
- Click Forgot Password
- Verify Forgot Password page opens
