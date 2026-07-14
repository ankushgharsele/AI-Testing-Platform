```markdown
# Enterprise Automation Framework for US-001 - Salesman Login

This document outlines a complete enterprise automation framework designed to automate the "Salesman Login" user story. The framework follows best practices, uses industry-standard tools, and is structured for scalability and maintainability.

---

# 1. Framework Structure

```
AutomationFramework/
│
├── src/test/java
│ ├── com/automation/base
│ │ └── BaseTest.java
│ ├── com/automation/listeners
│ │ └── ExtentReporterNG.java
│ ├── com/automation/pages
│ │ ├── LoginPage.java
│ │ └── DashboardPage.java
│ ├── com/automation/tests
│ │ └── SalesmanLoginTest.java
│ └── com/automation/utilities
│ │ ├── ConfigReader.java
│ │ ├── ExcelReader.java
│ │ └── WaitUtility.java
│
├── src/test/resources
│ ├── config
│ │ └── config.properties
│ ├── log4j2.xml
│ └── testdata
│   └── SalesmanLoginData.xlsx
│
├── testng.xml
├── pom.xml
└── README.md
```

---

# 2. pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.automation</groupId>
    <artifactId>AutomationFramework</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <selenium.version>4.20.0</selenium.version>
        <testng.version>7.10.2</testng.version>
        <webdrivermanager.version>5.8.0</webdrivermanager.version>
        <apache.poi.version>5.2.5</apache.poi.version>
        <extentreports.version>5.1.1</extentreports.version>
        <log4j.version>2.23.1</log4j.version>
        <surefire.plugin.version>3.2.5</surefire.plugin.version>
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

        <!-- Apache POI for Excel operations -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>${apache.poi.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>${apache.poi.version}</version>
        </dependency>

        <!-- Extent Reports for detailed test reporting -->
        <dependency>
            <groupId>com.aventstack</groupId>
            <artifactId>extentreports</artifactId>
            <version>${extentreports.version}</version>
        </dependency>

        <!-- Log4j2 for logging -->
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
            <!-- Maven Surefire Plugin for running TestNG tests -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${surefire.plugin.version}</version>
                <configuration>
                    <suiteXmlFiles>
                        <suiteXmlFile>testng.xml</suiteXmlFile>
                    </suiteXmlFiles>
                    <argLine>
                        -Dfile.encoding=UTF-8
                    </argLine>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

# 3. BaseTest.java

```java
package com.automation.base;

import com.automation.utilities.ConfigReader;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.io.FileHandler;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.File;
import java.io.IOException;
import java.time.Duration;

public class BaseTest {

    public static WebDriver driver;
    public static ConfigReader config;
    public static final Logger logger = LogManager.getLogger(BaseTest.class);

    @BeforeMethod
    public void setup() {
        if (config == null) {
            config = new ConfigReader("src/test/resources/config/config.properties");
        }

        String browser = config.getProperty("browser");
        if (browser == null) {
            browser = "chrome"; // Default browser
        }

        if (driver == null) {
            initializeDriver(browser);
        }

        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(Integer.parseInt(config.getProperty("implicit.wait"))));
        driver.get(config.getProperty("application.url"));
        logger.info("Application launched: " + config.getProperty("application.url") + " in " + browser + " browser.");
    }

    private void initializeDriver(String browser) {
        switch (browser.toLowerCase()) {
            case "chrome":
                WebDriverManager.chromedriver().setup();
                driver = new ChromeDriver();
                logger.debug("ChromeDriver initialized.");
                break;
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                driver = new FirefoxDriver();
                logger.debug("FirefoxDriver initialized.");
                break;
            default:
                logger.error("Unsupported browser: " + browser + ". Defaulting to Chrome.");
                WebDriverManager.chromedriver().setup();
                driver = new ChromeDriver();
                break;
        }
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        if (driver != null) {
            if (result.getStatus() == ITestResult.FAILURE) {
                String testName = result.getMethod().getMethodName();
                takeScreenshot(testName);
                logger.error("Test '" + testName + "' failed. Screenshot captured.");
            }
            driver.quit();
            driver = null; // Reset driver for next test method
            logger.info("Browser closed.");
        }
    }

    public void takeScreenshot(String testName) {
        if (driver instanceof TakesScreenshot) {
            File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String screenshotPath = "reports/screenshots/" + testName + "_" + System.currentTimeMillis() + ".png";
            try {
                File destFile = new File(screenshotPath);
                FileHandler.copy(screenshotFile, destFile);
                logger.info("Screenshot saved: " + destFile.getAbsolutePath());
            } catch (IOException e) {
                logger.error("Failed to take screenshot: " + e.getMessage());
            }
        } else {
            logger.warn("Driver does not support taking screenshots.");
        }
    }

    public WebDriver getDriver() {
        return driver;
    }
}
```

---

# 4. Page Object Classes

## LoginPage.java

```java
package com.automation.pages;

import com.automation.base.BaseTest;
import com.automation.utilities.WaitUtility;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BaseTest {

    private WebDriver driver;
    private WaitUtility waitUtility;
    private static final Logger logger = LogManager.getLogger(LoginPage.class);

    // Locators
    private final By usernameField = By.id("username"); // Assuming id locator
    private final By passwordField = By.id("password"); // Assuming id locator
    private final By loginButton = By.xpath("//button[@type='submit']"); // Assuming button type submit
    private final By loginPageTitle = By.xpath("//h2[contains(text(),'Login')]"); // Example for login page verification

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.waitUtility = new WaitUtility(driver, Integer.parseInt(config.getProperty("explicit.wait")));
    }

    /**
     * Checks if the login page elements are displayed.
     * @return true if login page is displayed, false otherwise.
     */
    public boolean isLoginPageDisplayed() {
        try {
            waitUtility.waitForElementToBeVisible(loginPageTitle);
            boolean usernameVisible = waitUtility.isElementVisible(usernameField);
            boolean passwordVisible = waitUtility.isElementVisible(passwordField);
            boolean loginButtonVisible = waitUtility.isElementVisible(loginButton);
            logger.info("Login Page displayed status: Username field visible=" + usernameVisible +
                        ", Password field visible=" + passwordVisible + ", Login button visible=" + loginButtonVisible);
            return usernameVisible && passwordVisible && loginButtonVisible;
        } catch (Exception e) {
            logger.error("Login page elements not fully displayed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Enters username into the username field.
     * @param username The username to enter.
     */
    public void enterUsername(String username) {
        waitUtility.waitForElementToBeVisible(usernameField).sendKeys(username);
        logger.info("Entered username: " + username);
    }

    /**
     * Enters password into the password field.
     * @param password The password to enter.
     */
    public void enterPassword(String password) {
        waitUtility.waitForElementToBeVisible(passwordField).sendKeys(password);
        logger.info("Entered password.");
    }

    /**
     * Clicks the login button.
     * @return A DashboardPage object representing the next page.
     */
    public DashboardPage clickLoginButton() {
        waitUtility.waitForElementToBeClickable(loginButton).click();
        logger.info("Clicked login button.");
        return new DashboardPage(driver);
    }

    /**
     * Performs a complete login action.
     * @param username The username.
     * @param password The password.
     * @return A DashboardPage object upon successful login.
     */
    public DashboardPage login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        return clickLoginButton();
    }
}
```

## DashboardPage.java

```java
package com.automation.pages;

import com.automation.base.BaseTest;
import com.automation.utilities.WaitUtility;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class DashboardPage extends BaseTest {

    private WebDriver driver;
    private WaitUtility waitUtility;
    private static final Logger logger = LogManager.getLogger(DashboardPage.class);

    // Locators for Dashboard elements
    private final By dashboardHeader = By.xpath("//h1[contains(text(),'Dashboard')]"); // Example for dashboard verification
    private final By welcomeMessage = By.id("welcomeMessage"); // Example welcome message ID
    private final By createOrderButton = By.id("createOrderBtn"); // Example for an element indicating functionality

    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        this.waitUtility = new WaitUtility(driver, Integer.parseInt(config.getProperty("explicit.wait")));
    }

    /**
     * Checks if the Dashboard page elements are displayed, indicating successful login.
     * @return true if dashboard is displayed, false otherwise.
     */
    public boolean isDashboardDisplayed() {
        try {
            waitUtility.waitForElementToBeVisible(dashboardHeader);
            boolean headerVisible = waitUtility.isElementVisible(dashboardHeader);
            boolean welcomeMsgVisible = waitUtility.isElementVisible(welcomeMessage);
            boolean createOrderBtnVisible = waitUtility.isElementVisible(createOrderButton);
            logger.info("Dashboard displayed status: Header visible=" + headerVisible +
                        ", Welcome message visible=" + welcomeMsgVisible + ", Create Order button visible=" + createOrderBtnVisible);
            return headerVisible && welcomeMsgVisible && createOrderBtnVisible;
        } catch (Exception e) {
            logger.error("Dashboard elements not fully displayed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Gets the text of the dashboard header.
     * @return The text of the dashboard header.
     */
    public String getDashboardTitle() {
        String title = waitUtility.waitForElementToBeVisible(dashboardHeader).getText();
        logger.info("Dashboard Title: " + title);
        return title;
    }

    /**
     * Gets the text of the welcome message.
     * @return The text of the welcome message.
     */
    public String getWelcomeMessage() {
        String message = waitUtility.waitForElementToBeVisible(welcomeMessage).getText();
        logger.info("Welcome Message: " + message);
        return message;
    }
}
```

---

# 5. Test Class

```java
package com.automation.tests;

import com.automation.base.BaseTest;
import com.automation.pages.DashboardPage;
import com.automation.pages.LoginPage;
import com.automation.utilities.ExcelReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class SalesmanLoginTest extends BaseTest {

    private static final Logger logger = LogManager.getLogger(SalesmanLoginTest.class);
    private LoginPage loginPage;
    private DashboardPage dashboardPage;

    // Data Provider for login credentials from Excel
    @DataProvider(name = "loginData")
    public Object[][] getLoginData() {
        String excelFilePath = "src/test/resources/testdata/SalesmanLoginData.xlsx";
        String sheetName = "ValidLogin";
        try {
            ExcelReader excelReader = new ExcelReader(excelFilePath);
            return excelReader.getTestData(sheetName);
        } catch (Exception e) {
            logger.error("Error reading login data from Excel: " + e.getMessage());
            return new Object[][]{{"defaultUser", "defaultPass"}}; // Fallback data
        }
    }

    @Test(priority = 1, description = "US-001_AC1: Verify Login page opens successfully")
    public void verifyLoginPageOpens() {
        logger.info("Starting test: verifyLoginPageOpens");
        loginPage = new LoginPage(getDriver());
        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page elements are not displayed.");
        logger.info("Login page opened and elements are visible.");
    }

    @Test(priority = 2, description = "US-001_AC2_AC3: Verify successful login with valid credentials and dashboard is displayed", dataProvider = "loginData")
    public void verifySuccessfulLogin(String username, String password) {
        logger.info("Starting test: verifySuccessfulLogin with username: " + username);
        loginPage = new LoginPage(getDriver());

        // Performing login action
        dashboardPage = loginPage.login(username, password);
        logger.info("Attempted login with credentials.");

        // Assertions for successful login and dashboard display
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard page is not displayed after successful login.");
        Assert.assertEquals(dashboardPage.getDashboardTitle(), "Dashboard", "Dashboard title is incorrect.");
        Assert.assertTrue(dashboardPage.getWelcomeMessage().contains(username), "Welcome message does not contain username.");
        logger.info("Successfully logged in and Dashboard is displayed for user: " + username);
    }
}
```

---

# 6. Utility Classes

## ConfigReader.java

```java
package com.automation.utilities;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ConfigReader {

    private Properties properties;
    private static final Logger logger = LogManager.getLogger(ConfigReader.class);

    public ConfigReader(String filePath) {
        properties = new Properties();
        try (FileInputStream fis = new FileInputStream(filePath)) {
            properties.load(fis);
            logger.info("Configuration properties loaded from: " + filePath);
        } catch (IOException e) {
            logger.error("Failed to load configuration properties from " + filePath + ": " + e.getMessage(), e);
            throw new RuntimeException("Could not load config properties from " + filePath, e);
        }
    }

    public String getProperty(String key) {
        String value = properties.getProperty(key);
        if (value == null) {
            logger.warn("Property '" + key + "' not found in config file.");
        }
        return value;
    }
}
```

## ExcelReader.java

```java
package com.automation.utilities;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ExcelReader {

    private String filePath;
    private static final Logger logger = LogManager.getLogger(ExcelReader.class);

    public ExcelReader(String filePath) {
        this.filePath = filePath;
        logger.info("ExcelReader initialized for file: " + filePath);
    }

    /**
     * Reads test data from a specified sheet in an Excel file.
     * Assumes the first row contains headers and skips it.
     *
     * @param sheetName The name of the sheet to read data from.
     * @return A 2D array of Objects containing the test data.
     * @throws IOException If an error occurs while reading the file.
     */
    public Object[][] getTestData(String sheetName) throws IOException {
        List<Object[]> data = new ArrayList<>();
        FileInputStream fis = null;
        Workbook workbook = null;

        try {
            fis = new FileInputStream(filePath);
            workbook = new XSSFWorkbook(fis);
            Sheet sheet = workbook.getSheet(sheetName);

            if (sheet == null) {
                logger.error("Sheet '" + sheetName + "' not found in " + filePath);
                throw new IllegalArgumentException("Sheet '" + sheetName + "' not found.");
            }

            Iterator<Row> rowIterator = sheet.iterator();
            if (rowIterator.hasNext()) {
                rowIterator.next(); // Skip header row
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                List<Object> rowData = new ArrayList<>();
                int physicalNumberOfCells = row.getPhysicalNumberOfCells();

                for (int i = 0; i < physicalNumberOfCells; i++) { // Iterate over all cells in the row
                    Cell cell = row.getCell(i);
                    rowData.add(getCellValue(cell));
                }
                data.add(rowData.toArray());
            }
            logger.info("Successfully read " + data.size() + " rows from sheet '" + sheetName + "'.");
        } finally {
            if (workbook != null) {
                workbook.close();
            }
            if (fis != null) {
                fis.close();
            }
        }
        return data.toArray(new Object[0][0]);
    }

    private Object getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue()); // Return numeric as String
                }
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "";
        }
    }
}
```

## WaitUtility.java

```java
package com.automation.utilities;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class WaitUtility {

    private WebDriver driver;
    private WebDriverWait wait;
    private int timeoutInSeconds;
    private static final Logger logger = LogManager.getLogger(WaitUtility.class);

    public WaitUtility(WebDriver driver, int timeoutInSeconds) {
        this.driver = driver;
        this.timeoutInSeconds = timeoutInSeconds;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds));
        logger.debug("WaitUtility initialized with timeout: " + timeoutInSeconds + " seconds.");
    }

    /**
     * Waits for an element to be visible on the page.
     * @param locator The By locator of the element.
     * @return The WebElement once it is visible.
     */
    public WebElement waitForElementToBeVisible(By locator) {
        try {
            logger.debug("Waiting for element to be visible: " + locator);
            return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        } catch (Exception e) {
            logger.error("Element not visible within " + timeoutInSeconds + " seconds: " + locator + " - " + e.getMessage());
            throw new RuntimeException("Element not visible: " + locator, e);
        }
    }

    /**
     * Waits for an element to be clickable on the page.
     * @param locator The By locator of the element.
     * @return The WebElement once it is clickable.
     */
    public WebElement waitForElementToBeClickable(By locator) {
        try {
            logger.debug("Waiting for element to be clickable: " + locator);
            return wait.until(ExpectedConditions.elementToBeClickable(locator));
        } catch (Exception e) {
            logger.error("Element not clickable within " + timeoutInSeconds + " seconds: " + locator + " - " + e.getMessage());
            throw new RuntimeException("Element not clickable: " + locator, e);
        }
    }

    /**
     * Waits for a specific text to be present in an element.
     * @param locator The By locator of the element.
     * @param text The text to wait for.
     * @return true if the text is present, false otherwise.
     */
    public boolean waitForTextToBePresentInElement(By locator, String text) {
        try {
            logger.debug("Waiting for text '" + text + "' to be present in element: " + locator);
            return wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, text));
        } catch (Exception e) {
            logger.error("Text '" + text + "' not present in element " + locator + " within " + timeoutInSeconds + " seconds: " + e.getMessage());
            return false;
        }
    }

    /**
     * Checks if an element is visible without throwing an exception, useful for conditional checks.
     * @param locator The By locator of the element.
     * @return true if the element is visible, false otherwise.
     */
    public boolean isElementVisible(By locator) {
        try {
            WebElement element = driver.findElement(locator);
            return element.isDisplayed();
        } catch (org.openqa.selenium.NoSuchElementException | org.openqa.selenium.TimeoutException e) {
            logger.debug("Element " + locator + " not visible or found: " + e.getMessage());
            return false;
        }
    }
}
```

## Listener Class (ExtentReporterNG.java)

```java
package com.automation.listeners;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.markuputils.ExtentColor;
import com.aventstack.extentreports.markuputils.MarkupHelper;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.automation.base.BaseTest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ExtentReporterNG extends BaseTest implements ITestListener {

    private static ExtentReports extent;
    private static ThreadLocal<ExtentTest> extentTest = new ThreadLocal<>();
    private static final Logger logger = LogManager.getLogger(ExtentReporterNG.class);

    // Static block to initialize ExtentReports once
    static {
        String reportPath = System.getProperty("user.dir") + "/reports/ExtentReport_" + new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".html";
        ExtentSparkReporter htmlReporter = new ExtentSparkReporter(reportPath);
        htmlReporter.config().setDocumentTitle("Automation Test Report");
        htmlReporter.config().setReportName("Salesman Login Test Automation Results");
        htmlReporter.config().setTheme(Theme.STANDARD);
        htmlReporter.config().setTimeStampFormat("MMM d, yyyy HH:mm:ss");

        extent = new ExtentReports();
        extent.attachReporter(htmlReporter);
        extent.setSystemInfo("Host Name", "Localhost");
        extent.setSystemInfo("Environment", "QA");
        extent.setSystemInfo("User Name", "Automation Architect");
        logger.info("Extent Reports initialized at: " + reportPath);
    }

    @Override
    public void onStart(ITestContext context) {
        logger.info("Test Suite started: " + context.getName());
    }

    @Override
    public void onTestStart(ITestResult result) {
        logger.info("Test started: " + result.getMethod().getMethodName());
        ExtentTest test = extent.createTest(result.getMethod().getMethodName(), result.getMethod().getDescription());
        extentTest.set(test);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        logger.info("Test passed: " + result.getMethod().getMethodName());
        extentTest.get().log(Status.PASS, MarkupHelper.createLabel(result.getMethod().getMethodName() + " Test Case PASSED", ExtentColor.GREEN));
    }

    @Override
    public void onTestFailure(ITestResult result) {
        logger.error("Test failed: " + result.getMethod().getMethodName());
        extentTest.get().log(Status.FAIL, MarkupHelper.createLabel(result.getMethod().getMethodName() + " Test Case FAILED", ExtentColor.RED));
        extentTest.get().fail(result.getThrowable());

        // Capture screenshot on failure
        String screenshotPath = null;
        try {
            screenshotPath = captureScreenshot(result.getMethod().getMethodName());
            if (screenshotPath != null) {
                extentTest.get().fail("Screenshot is below:" + extentTest.get().addScreenCaptureFromPath(screenshotPath));
            }
        } catch (IOException e) {
            logger.error("Error capturing screenshot: " + e.getMessage());
        }
    }

    // Helper method to capture screenshot, reused from BaseTest but made available here
    private String captureScreenshot(String testName) throws IOException {
        if (driver instanceof TakesScreenshot) {
            File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String fileName = testName + "_" + timestamp + ".png";
            String directory = System.getProperty("user.dir") + "/reports/screenshots/";
            File destFile = new File(directory + fileName);

            // Ensure directory exists
            new File(directory).mkdirs();

            FileHandler.copy(screenshotFile, destFile);
            logger.info("Screenshot captured: " + destFile.getAbsolutePath());
            return destFile.getAbsolutePath();
        }
        logger.warn("Driver does not support taking screenshots for extent reports.");
        return null;
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        logger.warn("Test skipped: " + result.getMethod().getMethodName());
        extentTest.get().log(Status.SKIP, MarkupHelper.createLabel(result.getMethod().getMethodName() + " Test Case SKIPPED", ExtentColor.ORANGE));
    }

    @Override
    public void onFinish(ITestContext context) {
        logger.info("Test Suite finished: " + context.getName());
        extent.flush(); // Writes test information to the started reporters
    }

    // Unused methods of ITestListener
    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
        // Not implemented
    }

    @Override
    public void onTestFailedWithTimeout(ITestResult result) {
        onTestFailure(result); // Treat timeout failures as regular failures
    }
}
```

## log4j2.xml (in `src/test/resources/log4j2.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <Appenders>
        <!-- Console Appender -->
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>

        <!-- File Appender -->
        <File name="File" fileName="reports/automation.log" append="true">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </File>
    </Appenders>

    <Loggers>
        <Root level="INFO"> <!-- Default logging level for all loggers -->
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Root>
        <Logger name="com.automation" level="DEBUG" additivity="false">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Logger>
    </Loggers>
</Configuration>
```

---

# 7. testng.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Salesman Login Automation Suite">

    <listeners>
        <listener class-name="com.automation.listeners.ExtentReporterNG"/>
    </listeners>

    <test thread-count="2" name="Salesman Login Tests">
        <classes>
            <class name="com.automation.tests.SalesmanLoginTest"/>
        </classes>
    </test> <!-- Salesman Login Tests -->

</suite> <!-- Salesman Login Automation Suite -->
```

---

# 8. README.md

```markdown
# Enterprise Automation Framework

This repository contains a robust and scalable automation framework developed using Selenium, Java, TestNG, and Maven. It's designed for enterprise-level software testing, focusing on maintainability, readability, and comprehensive reporting.

## Framework Overview

The framework incorporates the following key components and design patterns:

*   **Maven**: For dependency management and project build lifecycle.
*   **Selenium WebDriver**: For browser automation.
*   **TestNG**: As the testing framework, providing annotations, grouping, parallel execution, and reporting capabilities.
*   **Page Object Model (POM)**: To create an object repository for UI elements, improving code reusability and reducing maintenance effort.
*   **Data-Driven Testing**: Using Apache POI to read test data from Excel files (`.xlsx`).
*   **WebDriverManager**: Automatically manages browser drivers (Chrome, Firefox, etc.), eliminating manual downloads.
*   **Extent Reports**: For rich, interactive, and customizable test execution reports.
*   **Log4j2**: For robust logging, capturing detailed execution steps and debugging information.
*   **Utility Classes**: Dedicated classes for common tasks like reading configuration, handling waits, and taking screenshots, promoting code reusability.
*   **BaseTest Class**: Centralizes browser setup, teardown, and common functionalities like screenshot capture, ensuring all tests inherit standard setup.
*   **Listeners**: Implemented `ITestListener` for real-time reporting integration with Extent Reports.

## Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone <your-repository-url>
    cd AutomationFramework
    ```
2.  **Prerequisites**:
    *   **Java Development Kit (JDK) 11 or higher**: Ensure `JAVA_HOME` is set and Java is in your PATH.
    *   **Maven**: Ensure Maven is installed and configured in your PATH.
3.  **Update `config.properties`**:
    *   Navigate to `src/test/resources/config/config.properties`.
    *   Update `application.url` to the URL of the application under test.
    *   Adjust `browser`, `implicit.wait`, `explicit.wait` as needed.
    *   Provide valid `username` and `password` for the Salesman login.
4.  **Update `SalesmanLoginData.xlsx` (Optional for DataProvider)**:
    *   Navigate to `src/test/resources/testdata/SalesmanLoginData.xlsx`.
    *   Ensure the `ValidLogin` sheet contains a header row (e.g., `Username`, `Password`) and subsequent rows with test data. The `SalesmanLoginTest` uses `DataProvider` to read from this file.

## Execution Steps

### 1. Build the Project (Optional, Maven will do it automatically during test execution)

To compile the project and download all dependencies:

```bash
mvn clean install
```

### 2. Execute Tests

#### Using Maven Command (Recommended)

This command will execute the `testng.xml` suite defined in the `pom.xml`.

```bash
mvn test
```

#### Using TestNG Command (from IDE like IntelliJ/Eclipse)

1.  Right-click on `testng.xml` in your project explorer.
2.  Select `Run 'Salesman Login Automation Suite'`.

### 3. Review Reports

After execution, reports will be generated in the `reports` directory:

*   **Extent Reports**: An HTML report named `ExtentReport_<timestamp>.html` will be generated in `reports/`. Open this file in a web browser for detailed test results.
*   **Logs**: A log file named `automation.log` will be generated in `reports/`, containing detailed execution logs.
*   **Screenshots**: Failure screenshots will be saved in `reports/screenshots/`.

---

# 9. Best Practices

The framework incorporates several enterprise automation best practices:

*   **Explicit Waits**: Utilizes `WebDriverWait` with `ExpectedConditions` to handle dynamic elements and avoid `StaleElementReferenceException` and `NoSuchElementException`. This is encapsulated in `WaitUtility`.
*   **Logging**: Implements `Log4j2` for detailed logging at various levels (INFO, DEBUG, ERROR), aiding in debugging and monitoring test execution flow.
*   **Reporting**: Integrated `Extent Reports` to generate rich, interactive, and easy-to-understand HTML reports with screenshots for failures, providing clear visibility into test outcomes.
*   **Exception Handling**: Graceful error handling is implemented across page objects and utility classes to catch and log exceptions, preventing abrupt test failures and providing meaningful messages.
*   **Reusable Components**: Core functionalities like browser initialization, configuration reading, wait strategies, and screenshot capturing are encapsulated in dedicated utility classes and a `BaseTest` class, promoting code reuse and reducing duplication.
*   **Page Object Model (POM)**: UI elements and interactions are separated from test logic into Page Object classes, improving test readability, maintenance, and reducing code redundancy.
*   **Data-Driven Testing**: Supports reading test data from external sources (Excel using Apache POI) via TestNG's `@DataProvider`, allowing easy expansion of test scenarios without modifying test code.
*   **Configuration Management**: Uses `config.properties` for managing environment-specific configurations (URLs, browser types, waits, credentials), making the framework adaptable to different environments.
*   **Naming Standards**: Follows consistent and descriptive naming conventions for classes, methods, and variables (e.g., `LoginPage`, `verifySuccessfulLogin`, `usernameField`) to enhance code readability and maintainability.
*   **Modular Design**: The framework is structured into logical packages (`base`, `pages`, `tests`, `utilities`, `listeners`), making it easy to navigate, understand, and extend.
*   **WebDriverManager**: Automates the management of browser drivers, reducing setup complexities and ensuring compatibility.
*   **TestNG Annotations**: Leverages `@BeforeMethod`, `@AfterMethod`, `@Test`, and `@DataProvider` for structured test execution and flexible test data management.
```