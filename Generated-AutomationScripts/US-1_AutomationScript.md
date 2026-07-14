```markdown
# Maven `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.company.project</groupId>
    <artifactId>EnterpriseAutomationFramework</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <selenium.version>4.15.0</selenium.version>
        <testng.version>7.8.0</testng.version>
        <webdrivermanager.version>5.6.2</webdrivermanager.version>
        <log4j.version>2.22.0</log4j.version>
    </properties>

    <dependencies>
        <!-- Selenium Java -->
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>${selenium.version}</version>
        </dependency>

        <!-- TestNG -->
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>${testng.version}</version>
            <scope>test</scope>
        </dependency>

        <!-- WebDriverManager for automatic browser driver management -->
        <dependency>
            <groupId>io.github.bonigarcia</groupId>
            <artifactId>webdrivermanager</artifactId>
            <version>${webdrivermanager.version}</version>
        </dependency>

        <!-- Log4j2 API and Core -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>${log4j.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>${log4j.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>${maven.compiler.source}</source>
                    <target>${maven.compiler.target}</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.3</version>
                <configuration>
                    <suiteXmlFiles>
                        <suiteXmlFile>src/test/resources/testng.xml</suiteXmlFile>
                    </suiteXmlFiles>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

# `src/main/java/com/company/project/pages/LoginPage.java`

```java
package com.company.project.pages;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Page Object Model for the Login Page.
 * Encapsulates the elements and actions available on the login page.
 */
public class LoginPage {

    private static final Logger logger = LogManager.getLogger(LoginPage.class);
    private final WebDriver driver;
    private final WebDriverWait wait;

    // Locators for login page elements
    @FindBy(id = "username") // Example: Using ID for username input
    private WebElement usernameInput;

    @FindBy(id = "password") // Example: Using ID for password input
    private WebElement passwordInput;

    @FindBy(xpath = "//button[@type='submit' and text()='Login']") // Example: Using XPath for login button
    private WebElement loginButton;

    @FindBy(className = "error-message") // Example: Using class name for error message
    private WebElement errorMessage;

    @FindBy(css = ".welcome-message") // Example: Using CSS selector for a welcome message on successful login
    private WebElement welcomeMessage;

    /**
     * Constructor for LoginPage.
     * Initializes elements using PageFactory and sets up WebDriverWait.
     * @param driver The WebDriver instance.
     */
    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10)); // Default wait of 10 seconds
        logger.info("LoginPage initialized.");
    }

    /**
     * Enters the username into the username input field.
     * @param username The username to enter.
     */
    public void enterUsername(String username) {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameInput));
            usernameInput.clear();
            usernameInput.sendKeys(username);
            logger.debug("Entered username: " + username);
        } catch (Exception e) {
            logger.error("Failed to enter username: " + username, e);
            throw new RuntimeException("Could not enter username.", e);
        }
    }

    /**
     * Enters the password into the password input field.
     * @param password The password to enter.
     */
    public void enterPassword(String password) {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordInput));
            passwordInput.clear();
            passwordInput.sendKeys(password);
            logger.debug("Entered password."); // Avoid logging actual password
        } catch (Exception e) {
            logger.error("Failed to enter password.", e);
            throw new RuntimeException("Could not enter password.", e);
        }
    }

    /**
     * Clicks the login button.
     */
    public void clickLoginButton() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(loginButton));
            loginButton.click();
            logger.info("Clicked login button.");
        } catch (Exception e) {
            logger.error("Failed to click login button.", e);
            throw new RuntimeException("Could not click login button.", e);
        }
    }

    /**
     * Performs the login operation with provided credentials.
     * @param username The username.
     * @param password The password.
     */
    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
        logger.info("Attempted login with username: " + username);
    }

    /**
     * Checks if the error message is displayed.
     * @return true if the error message is visible, false otherwise.
     */
    public boolean isErrorMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).isDisplayed();
        } catch (Exception e) {
            logger.debug("Error message not displayed or an exception occurred: " + e.getMessage());
            return false;
        }
    }

    /**
     * Gets the text of the error message.
     * @return The text of the error message, or null if not displayed.
     */
    public String getErrorMessageText() {
        if (isErrorMessageDisplayed()) {
            return errorMessage.getText();
        }
        return null;
    }

    /**
     * Checks if a welcome message or an element indicating successful login is displayed.
     * This usually means the user is redirected to a dashboard or home page.
     * For a simple login, we might check for an element on the *next* page.
     * Here, we assume a welcome message appears on the same page or the immediately loaded page post-login.
     * @return true if the welcome message is visible, false otherwise.
     */
    public boolean isWelcomeMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(welcomeMessage)).isDisplayed();
        } catch (Exception e) {
            logger.debug("Welcome message not displayed or an exception occurred: " + e.getMessage());
            return false;
        }
    }
}
```

# `src/main/java/com/company/project/utils/PropertyReader.java`

```java
package com.company.project.utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Utility class to read properties from configuration files.
 */
public class PropertyReader {

    private static final Logger logger = LogManager.getLogger(PropertyReader.class);
    private static final Properties properties = new Properties();
    private static final String CONFIG_FILE_PATH = "src/test/resources/config.properties";

    static {
        try (InputStream input = new FileInputStream(CONFIG_FILE_PATH)) {
            properties.load(input);
            logger.info("Successfully loaded properties from " + CONFIG_FILE_PATH);
        } catch (IOException e) {
            logger.error("Failed to load properties from " + CONFIG_FILE_PATH, e);
            throw new RuntimeException("Could not load config.properties file.", e);
        }
    }

    /**
     * Retrieves a property value by its key.
     * @param key The key of the property.
     * @return The value of the property.
     */
    public static String getProperty(String key) {
        String value = properties.getProperty(key);
        if (value == null) {
            logger.warn("Property '" + key + "' not found in " + CONFIG_FILE_PATH);
        }
        return value;
    }

    /**
     * Retrieves a property value by its key with a default value.
     * @param key The key of the property.
     * @param defaultValue The default value to return if the property is not found.
     * @return The value of the property or the default value.
     */
    public static String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
}
```

# `src/main/java/com/company/project/utils/WebDriverManager.java`

```java
package com.company.project.utils;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.URL;
import java.time.Duration;

/**
 * Manages WebDriver instances, including setup and teardown.
 * Supports local and remote WebDriver instantiation.
 */
public class WebDriverManager {

    private static final Logger logger = LogManager.getLogger(WebDriverManager.class);
    private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    /**
     * Initializes the WebDriver based on configuration.
     * Supports Chrome and Firefox, and can be extended for other browsers or remote execution.
     *
     * @return The initialized WebDriver instance.
     */
    public static WebDriver getDriver() {
        if (driver.get() == null) {
            String browser = PropertyReader.getProperty("browser", "chrome").toLowerCase();
            String runMode = PropertyReader.getProperty("runMode", "local").toLowerCase(); // local or remote

            logger.info("Initializing WebDriver for browser: " + browser + ", run mode: " + runMode);

            try {
                if ("remote".equals(runMode)) {
                    String seleniumGridUrl = PropertyReader.getProperty("seleniumGridUrl", "http://localhost:4444/wd/hub");
                    DesiredCapabilities capabilities = new DesiredCapabilities();
                    switch (browser) {
                        case "chrome":
                            ChromeOptions chromeOptions = new ChromeOptions();
                            // Add any specific chromeOptions for remote execution
                            capabilities.setBrowserName("chrome");
                            capabilities.setCapability(ChromeOptions.CAPABILITY, chromeOptions);
                            driver.set(new RemoteWebDriver(new URL(seleniumGridUrl), capabilities));
                            break;
                        case "firefox":
                            FirefoxOptions firefoxOptions = new FirefoxOptions();
                            // Add any specific firefoxOptions for remote execution
                            capabilities.setBrowserName("firefox");
                            capabilities.setCapability(FirefoxOptions.CAPABILITY, firefoxOptions);
                            driver.set(new RemoteWebDriver(new URL(seleniumGridUrl), capabilities));
                            break;
                        default:
                            logger.error("Unsupported browser for remote execution: " + browser);
                            throw new IllegalArgumentException("Unsupported browser for remote execution: " + browser);
                    }
                } else { // Local execution
                    switch (browser) {
                        case "chrome":
                            WebDriverManager.chromedriver().setup();
                            ChromeOptions chromeOptions = new ChromeOptions();
                            // chromeOptions.addArguments("--headless"); // Example for headless mode
                            // chromeOptions.addArguments("--window-size=1920,1080");
                            driver.set(new ChromeDriver(chromeOptions));
                            logger.info("ChromeDriver initialized locally.");
                            break;
                        case "firefox":
                            WebDriverManager.firefoxdriver().setup();
                            FirefoxOptions firefoxOptions = new FirefoxOptions();
                            // firefoxOptions.addArguments("-headless"); // Example for headless mode
                            driver.set(new FirefoxDriver(firefoxOptions));
                            logger.info("FirefoxDriver initialized locally.");
                            break;
                        default:
                            logger.error("Unsupported browser for local execution: " + browser);
                            throw new IllegalArgumentException("Unsupported browser for local execution: " + browser);
                    }
                }
                driver.get().manage().window().maximize();
                driver.get().manage().timeouts().implicitlyWait(Duration.ofSeconds(PropertyReader.getProperty("implicitWaitSeconds", "10").isBlank() ? 10 : Long.parseLong(PropertyReader.getProperty("implicitWaitSeconds", "10"))));
                driver.get().manage().timeouts().pageLoadTimeout(Duration.ofSeconds(PropertyReader.getProperty("pageLoadTimeoutSeconds", "30").isBlank() ? 30 : Long.parseLong(PropertyReader.getProperty("pageLoadTimeoutSeconds", "30"))));
            } catch (Exception e) {
                logger.fatal("Failed to initialize WebDriver.", e);
                throw new RuntimeException("WebDriver initialization failed.", e);
            }
        }
        return driver.get();
    }

    /**
     * Quits the WebDriver instance and removes it from ThreadLocal.
     */
    public static void quitDriver() {
        if (driver.get() != null) {
            driver.get().quit();
            logger.info("WebDriver quit.");
            driver.remove();
        }
    }
}
```

# `src/test/java/com/company/project/base/BaseTest.java`

```java
package com.company.project.base;

import com.company.project.utils.PropertyReader;
import com.company.project.utils.WebDriverManager;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Base class for all TestNG test classes.
 * Provides common setup and teardown functionalities, including WebDriver management
 * and screenshot capture on test failures.
 */
public class BaseTest {

    private static final Logger logger = LogManager.getLogger(BaseTest.class);
    protected WebDriver driver;

    /**
     * Sets up the WebDriver before each test method.
     * Initializes the driver, maximizes the window, and navigates to the base URL.
     */
    @BeforeMethod
    public void setup() {
        try {
            driver = WebDriverManager.getDriver();
            String baseURL = PropertyReader.getProperty("baseURL");
            driver.get(baseURL);
            logger.info("Navigated to URL: " + baseURL);
        } catch (Exception e) {
            logger.fatal("Failed to set up WebDriver or navigate to URL.", e);
            throw new RuntimeException("Test setup failed.", e);
        }
    }

    /**
     * Tears down the WebDriver after each test method.
     * Quits the driver and takes a screenshot if the test failed.
     * @param result The TestNG result object, containing information about the test execution.
     */
    @AfterMethod
    public void teardown(ITestResult result) {
        if (driver != null) {
            if (result.getStatus() == ITestResult.FAILURE) {
                logger.error("Test '" + result.getMethod().getMethodName() + "' FAILED. Capturing screenshot...");
                takeScreenshot(result.getMethod().getMethodName());
            } else if (result.getStatus() == ITestResult.SUCCESS) {
                logger.info("Test '" + result.getMethod().getMethodName() + "' PASSED.");
            } else if (result.getStatus() == ITestResult.SKIP) {
                logger.warn("Test '" + result.getMethod().getMethodName() + "' SKIPPED.");
            }
            WebDriverManager.quitDriver();
        }
    }

    /**
     * Captures a screenshot and saves it to a specified directory.
     * @param screenshotName The name to give to the screenshot file.
     * @return The absolute path to the saved screenshot file, or null if capture failed.
     */
    protected String takeScreenshot(String screenshotName) {
        if (driver instanceof TakesScreenshot) {
            try {
                File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
                String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
                Path screenshotPath = Paths.get("target", "screenshots", screenshotName + "_" + timestamp + ".png");
                Files.createDirectories(screenshotPath.getParent()); // Ensure directory exists
                Files.copy(screenshotFile.toPath(), screenshotPath);
                String absolutePath = screenshotPath.toAbsolutePath().toString();
                logger.info("Screenshot saved to: " + absolutePath);
                return absolutePath;
            } catch (IOException e) {
                logger.error("Failed to capture screenshot: " + e.getMessage(), e);
                return null;
            }
        }
        logger.warn("Driver does not support taking screenshots.");
        return null;
    }
}
```

# `src/test/java/com/company/project/tests/LoginTest.java`

```java
package com.company.project.tests;

import com.company.project.base.BaseTest;
import com.company.project.pages.LoginPage;
import com.company.project.utils.PropertyReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Test class for validating login functionalities for US-001 Salesman Login.
 * Extends BaseTest to leverage common setup and teardown procedures.
 */
public class LoginTest extends BaseTest {

    private static final Logger logger = LogManager.getLogger(LoginTest.class);

    /**
     * Test case for successful salesman login.
     * Verifies that a salesman can log in with valid credentials and sees a welcome message.
     */
    @Test(description = "US-001_TC001: Verify Salesman can login successfully with valid credentials")
    public void testSuccessfulSalesmanLogin() {
        logger.info("Starting test: testSuccessfulSalesmanLogin");
        LoginPage loginPage = new LoginPage(driver);

        String username = PropertyReader.getProperty("salesman.username");
        String password = PropertyReader.getProperty("salesman.password");

        // Step 1: Enter valid username
        loginPage.enterUsername(username);
        // Step 2: Enter valid password
        loginPage.enterPassword(password);
        // Step 3: Click login button
        loginPage.clickLoginButton();

        // Step 4: Verify successful login (e.g., welcome message, redirection)
        // Note: For a real application, you might verify URL change, dashboard elements, etc.
        // Here, we assume a simple welcome message appears.
        try {
            Assert.assertTrue(loginPage.isWelcomeMessageDisplayed(), "Expected welcome message not displayed after successful login.");
            logger.info("Salesman login successful for user: " + username);
        } catch (AssertionError e) {
            logger.error("Assertion failed in testSuccessfulSalesmanLogin: " + e.getMessage());
            throw e; // Re-throw to fail the test
        } catch (Exception e) {
            logger.error("An unexpected error occurred during successful login verification.", e);
            throw new RuntimeException("Verification failed.", e);
        }
    }

    /**
     * Test case for unsuccessful salesman login with invalid credentials.
     * Verifies that an appropriate error message is displayed when invalid credentials are used.
     */
    @Test(description = "US-001_TC002: Verify Salesman cannot login with invalid credentials")
    public void testInvalidSalesmanLogin() {
        logger.info("Starting test: testInvalidSalesmanLogin");
        LoginPage loginPage = new LoginPage(driver);

        String invalidUsername = PropertyReader.getProperty("invalid.username");
        String invalidPassword = PropertyReader.getProperty("invalid.password");
        String expectedErrorMessage = "Invalid credentials. Please try again."; // Example expected error message

        // Step 1: Enter invalid username
        loginPage.enterUsername(invalidUsername);
        // Step 2: Enter invalid password
        loginPage.enterPassword(invalidPassword);
        // Step 3: Click login button
        loginPage.clickLoginButton();

        // Step 4: Verify error message is displayed and contains expected text
        try {
            Assert.assertTrue(loginPage.isErrorMessageDisplayed(), "Expected error message not displayed for invalid login.");
            String actualErrorMessage = loginPage.getErrorMessageText();
            Assert.assertEquals(actualErrorMessage, expectedErrorMessage,
                    "Actual error message does not match expected error message.");
            logger.info("Invalid login attempt successful. Error message displayed: " + actualErrorMessage);
        } catch (AssertionError e) {
            logger.error("Assertion failed in testInvalidSalesmanLogin: " + e.getMessage());
            throw e; // Re-throw to fail the test
        } catch (Exception e) {
            logger.error("An unexpected error occurred during invalid login verification.", e);
            throw new RuntimeException("Verification failed.", e);
        }
    }
}
```

# `src/test/resources/config.properties`

```properties
# Browser to use for tests: chrome, firefox
browser=chrome

# Base URL for the application under test
baseURL=https://www.example.com/login # Placeholder: Replace with actual login URL

# Salesman Valid Credentials
salesman.username=salesman@example.com # Placeholder: Replace with actual salesman username
salesman.password=Password123!         # Placeholder: Replace with actual salesman password

# Invalid Credentials for unsuccessful login tests
invalid.username=wronguser@example.com # Placeholder: Replace with an invalid username
invalid.password=wrongpass             # Placeholder: Replace with an invalid password

# WebDriver Implicit Wait (seconds)
implicitWaitSeconds=10

# Page Load Timeout (seconds)
pageLoadTimeoutSeconds=30

# Selenium Grid configuration (uncomment and configure for remote execution)
# runMode=remote
# seleniumGridUrl=http://localhost:4444/wd/hub
```

# `src/test/resources/log4j2.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <Appenders>
        <!-- Console Appender -->
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>

        <!-- File Appender for all logs -->
        <File name="FileLogger" fileName="target/logs/automation.log">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </File>

        <!-- Optional: Separate Appender for Errors -->
        <File name="ErrorLogger" fileName="target/logs/error.log">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
            <ThresholdFilter level="ERROR" onMatch="ACCEPT" onMismatch="DENY"/>
        </File>
    </Appenders>
    <Loggers>
        <Root level="debug">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="FileLogger"/>
            <AppenderRef ref="ErrorLogger"/>
        </Root>
    </Loggers>
</Configuration>
```

# `src/test/resources/testng.xml`

```xml
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd" >

<suite name="EnterpriseAutomationSuite" verbose="1">
    <listeners>
        <!-- Optional: Add TestNG report listeners here for enhanced reporting -->
        <!-- <listener class-name="org.testng.reporters.EmailableReporter2"/> -->
        <!-- <listener class-name="org.testng.reporters.JUnitReportReporter"/> -->
        <!-- Example: ExtentReports listener (requires ExtentReports dependency) -->
        <!-- <listener class-name="com.company.project.listeners.ExtentReportListener"/> -->
    </listeners>

    <test name="SalesmanLoginTests">
        <classes>
            <class name="com.company.project.tests.LoginTest"/>
        </classes>
    </test> <!-- Test -->

</suite> <!-- Suite -->
```
```