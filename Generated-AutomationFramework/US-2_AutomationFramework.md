# Enterprise Automation Framework

This framework provides a robust, scalable, and maintainable solution for automating web application testing using Selenium, Java, TestNG, and Maven. It follows industry-standard design patterns, enterprise coding standards, and best practices for creating production-ready test automation.

---

## 1. Framework Structure

```
AutomationFramework/
│
├── src/test/java/
│ ├── base/
│ │ └── BaseTest.java
│ ├── pages/
│ │ └── CreateRetailerPage.java
│ ├── tests/
│ │ └── CreateRetailerTests.java
│ ├── utilities/
│ │ ├── ConfigReader.java
│ │ ├── ExcelReader.java
│ │ ├── ScreenshotUtility.java
│ │ └── WaitUtility.java
│ ├── listeners/
│ │ ├── TestListener.java
│ │ └── ExtentReportManager.java
│ └── config/
│     └── config.properties
│
├── src/test/resources/
│ ├── testdata/
│ │ └── RetailerData.xlsx
│ └── log4j2.xml
│
├── testng.xml
├── pom.xml
└── README.md
```

---

## 2. pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.enterprise.automation</groupId>
    <artifactId>EnterpriseAutomationFramework</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <selenium.version>4.18.1</selenium.version>
        <testng.version>7.9.0</testng.version>
        <webdrivermanager.version>5.7.0</webdrivermanager.version>
        <apache.poi.version>5.2.5</apache.poi.version>
        <extentreports.version>5.1.1</extentreports.version>
        <log4j.version>2.23.0</log4j.version>
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

        <!-- WebDriverManager -->
        <dependency>
            <groupId>io.github.bonigarcia</groupId>
            <artifactId>webdrivermanager</artifactId>
            <version>${webdrivermanager.version}</version>
        </dependency>

        <!-- Apache POI for Excel Operations -->
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

        <!-- Extent Reports -->
        <dependency>
            <groupId>com.aventstack</groupId>
            <artifactId>extentreports</artifactId>
            <version>${extentreports.version}</version>
        </dependency>

        <!-- Log4j -->
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

        <!-- https://mvnrepository.com/artifact/commons-io/commons-io -->
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.15.1</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Maven Surefire Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${surefire.plugin.version}</version>
                <configuration>
                    <suiteXmlFiles>
                        <suiteXmlFile>testng.xml</suiteXmlFile>
                    </suiteXmlFiles>
                    <argLine>
                        -javaagent:"${settings.localRepository}/org/aspectj/aspectjweaver/1.9.21/aspectjweaver-1.9.21.jar"
                    </argLine>
                    <systemPropertyVariables>
                        <log.level>INFO</log.level> <!-- Set Log4j level -->
                    </systemPropertyVariables>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>org.aspectj</groupId>
                        <artifactId>aspectjweaver</artifactId>
                        <version>1.9.21</version>
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 3. BaseTest.java

`src/test/java/base/BaseTest.java`

```java
package base;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import io.github.bonigarcia.wdm.WebDriverManager;
import listeners.ExtentReportManager;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import utilities.ConfigReader;
import utilities.ScreenshotUtility;
import utilities.WaitUtility;

import java.io.IOException;
import java.lang.reflect.Method;
import java.time.Duration;

public class BaseTest {

    protected static ThreadLocal<WebDriver> driver = new ThreadLocal<>();
    protected static ThreadLocal<ExtentTest> extentTest = new ThreadLocal<>();
    protected static ExtentReports extent;
    protected static final Logger LOGGER = LogManager.getLogger(BaseTest.class);

    // Get WebDriver instance for the current thread
    public WebDriver getDriver() {
        return driver.get();
    }

    // Get ExtentTest instance for the current thread
    public ExtentTest getExtentTest() {
        return extentTest.get();
    }

    @BeforeMethod(alwaysRun = true)
    public void setup(Method method) {
        extent = ExtentReportManager.getExtentReports();
        ExtentTest test = extent.createTest(method.getName());
        extentTest.set(test);

        String browser = ConfigReader.getProperty("browser", "chrome"); // Default to chrome
        LOGGER.info("Initializing WebDriver for browser: {}", browser);

        WebDriver currentDriver;
        switch (browser.toLowerCase()) {
            case "chrome":
                WebDriverManager.chromedriver().setup();
                ChromeOptions chromeOptions = new ChromeOptions();
                chromeOptions.addArguments("--start-maximized");
                // chromeOptions.addArguments("--headless"); // Uncomment for headless execution
                currentDriver = new ChromeDriver(chromeOptions);
                break;
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                FirefoxOptions firefoxOptions = new FirefoxOptions();
                firefoxOptions.addArguments("-width", "1920", "-height", "1080"); // Maximize alternative
                // firefoxOptions.addArguments("--headless"); // Uncomment for headless execution
                currentDriver = new FirefoxDriver(firefoxOptions);
                break;
            case "edge":
                WebDriverManager.edgedriver().setup();
                EdgeOptions edgeOptions = new EdgeOptions();
                edgeOptions.addArguments("--start-maximized");
                // edgeOptions.addArguments("--headless"); // Uncomment for headless execution
                currentDriver = new EdgeDriver(edgeOptions);
                break;
            default:
                LOGGER.error("Invalid browser specified: {}. Defaulting to Chrome.", browser);
                WebDriverManager.chromedriver().setup();
                currentDriver = new ChromeDriver();
                break;
        }

        driver.set(currentDriver);
        getDriver().manage().window().maximize();
        getDriver().manage().timeouts().implicitlyWait(Duration.ofSeconds(Long.parseLong(ConfigReader.getProperty("implicit.wait", "10"))));
        getDriver().get(ConfigReader.getProperty("app.url"));
        LOGGER.info("Navigated to URL: {}", ConfigReader.getProperty("app.url"));
        getExtentTest().info("Browser launched and navigated to URL: " + ConfigReader.getProperty("app.url"));
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            getExtentTest().fail("Test Failed: " + result.getThrowable());
            LOGGER.error("Test Case Failed: {} - {}", result.getMethod().getMethodName(), result.getThrowable().getMessage());
            try {
                String screenshotPath = ScreenshotUtility.captureScreenshot(getDriver(), result.getMethod().getMethodName());
                getExtentTest().addScreenCaptureFromPath(screenshotPath, "Test Failure Screenshot");
                LOGGER.info("Screenshot captured for failed test: {}", screenshotPath);
            } catch (IOException e) {
                LOGGER.error("Failed to capture screenshot: {}", e.getMessage());
                getExtentTest().error("Failed to capture screenshot: " + e.getMessage());
            }
        } else if (result.getStatus() == ITestResult.SKIP) {
            getExtentTest().skip("Test Skipped: " + result.getThrowable());
            LOGGER.warn("Test Case Skipped: {} - {}", result.getMethod().getMethodName(), result.getThrowable().getMessage());
        } else {
            getExtentTest().pass("Test Passed");
            LOGGER.info("Test Case Passed: {}", result.getMethod().getMethodName());
        }

        if (getDriver() != null) {
            getDriver().quit();
            LOGGER.info("WebDriver closed for the current test.");
            getExtentTest().info("Browser closed.");
        }
        extent.flush();
    }
}
```

---

## 4. Page Object Class

`src/test/java/pages/CreateRetailerPage.java`

```java
package pages;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;
import org.testng.Assert;
import utilities.WaitUtility;

public class CreateRetailerPage {

    private WebDriver driver;
    private WaitUtility waitUtility;
    private static final Logger LOGGER = LogManager.getLogger(CreateRetailerPage.class);

    // Locators for elements on the Create Retailer page
    private final By retailerNameInput = By.id("retailerName");
    private final By addressInput = By.id("address");
    private final By cityInput = By.id("city");
    private final By stateSelect = By.id("state"); // Assuming a dropdown
    private final By zipInput = By.id("zip");
    private final By contactPersonInput = By.id("contactPerson");
    private final By contactEmailInput = By.id("contactEmail");
    private final By contactPhoneInput = By.id("contactPhone");
    private final By submitButton = By.xpath("//button[text()='Create Retailer']");
    private final By successMessage = By.xpath("//div[@class='alert alert-success']"); // Example success message

    // Constructor
    public CreateRetailerPage(WebDriver driver) {
        this.driver = driver;
        this.waitUtility = new WaitUtility(driver);
        PageFactory.initElements(driver, this); // Initializes WebElements using @FindBy (if used)
        LOGGER.info("Initialized CreateRetailerPage for driver: {}", driver.toString());
    }

    /**
     * Enters the retailer's name into the input field.
     * @param retailerName The name of the retailer.
     */
    public void enterRetailerName(String retailerName) {
        LOGGER.info("Entering retailer name: {}", retailerName);
        WebElement element = waitUtility.waitForElementToBeVisible(retailerNameInput);
        element.clear();
        element.sendKeys(retailerName);
    }

    /**
     * Enters the retailer's address details.
     * @param address The address.
     * @param city The city.
     * @param state The state.
     * @param zip The zip code.
     */
    public void enterAddressDetails(String address, String city, String state, String zip) {
        LOGGER.info("Entering address: {}, City: {}, State: {}, Zip: {}", address, city, state, zip);
        waitUtility.waitForElementToBeVisible(addressInput).clear();
        driver.findElement(addressInput).sendKeys(address);

        waitUtility.waitForElementToBeVisible(cityInput).clear();
        driver.findElement(cityInput).sendKeys(city);

        // Assuming state is a text input for simplicity. If it's a dropdown, use Select class.
        waitUtility.waitForElementToBeVisible(stateSelect).clear();
        driver.findElement(stateSelect).sendKeys(state);

        waitUtility.waitForElementToBeVisible(zipInput).clear();
        driver.findElement(zipInput).sendKeys(zip);
    }

    /**
     * Enters the contact person details.
     * @param personName The contact person's name.
     * @param email The contact person's email.
     * @param phone The contact person's phone number.
     */
    public void enterContactDetails(String personName, String email, String phone) {
        LOGGER.info("Entering contact person: {}, Email: {}, Phone: {}", personName, email, phone);
        waitUtility.waitForElementToBeVisible(contactPersonInput).clear();
        driver.findElement(contactPersonInput).sendKeys(personName);

        waitUtility.waitForElementToBeVisible(contactEmailInput).clear();
        driver.findElement(contactEmailInput).sendKeys(email);

        waitUtility.waitForElementToBeVisible(contactPhoneInput).clear();
        driver.findElement(contactPhoneInput).sendKeys(phone);
    }

    /**
     * Clicks the "Create Retailer" submit button.
     */
    public void clickCreateRetailerButton() {
        LOGGER.info("Clicking the 'Create Retailer' button.");
        waitUtility.waitForElementToBeClickable(submitButton).click();
    }

    /**
     * Creates a new retailer by filling all mandatory details and submitting the form.
     * @param retailerName The name of the retailer.
     * @param address The address.
     * @param city The city.
     * @param state The state.
     * @param zip The zip code.
     * @param contactPerson The contact person's name.
     * @param contactEmail The contact person's email.
     * @param contactPhone The contact person's phone number.
     */
    public void createNewRetailer(String retailerName, String address, String city, String state, String zip,
                                  String contactPerson, String contactEmail, String contactPhone) {
        LOGGER.info("Attempting to create a new retailer with name: {}", retailerName);
        enterRetailerName(retailerName);
        enterAddressDetails(address, city, state, zip);
        enterContactDetails(contactPerson, contactEmail, contactPhone);
        clickCreateRetailerButton();
        LOGGER.info("Retailer creation form submitted for: {}", retailerName);
    }

    /**
     * Verifies if the retailer creation success message is displayed.
     * @return true if the success message is visible, false otherwise.
     */
    public boolean isSuccessMessageDisplayed() {
        try {
            boolean isDisplayed = waitUtility.waitForElementToBeVisible(successMessage).isDisplayed();
            LOGGER.info("Success message displayed status: {}", isDisplayed);
            return isDisplayed;
        } catch (Exception e) {
            LOGGER.warn("Success message not displayed or element not found: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets the text of the success message.
     * @return The text of the success message.
     */
    public String getSuccessMessageText() {
        String message = waitUtility.waitForElementToBeVisible(successMessage).getText();
        LOGGER.info("Retrieved success message: {}", message);
        return message;
    }
}
```

---

## 5. Test Class

`src/test/java/tests/CreateRetailerTests.java`

```java
package tests;

import base.BaseTest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.CreateRetailerPage;
import utilities.ConfigReader;

public class CreateRetailerTests extends BaseTest {

    private static final Logger LOGGER = LogManager.getLogger(CreateRetailerTests.class);

    @Test(priority = 1, description = "Verify successful creation of a new retailer with all mandatory details")
    public void verifyRetailerCreation_Successful() {
        getExtentTest().info("Starting test: verifyRetailerCreation_Successful");
        LOGGER.info("Executing test: verifyRetailerCreation_Successful");

        // Initialize Page Object
        CreateRetailerPage createRetailerPage = new CreateRetailerPage(getDriver());

        // Test Data (can be fetched from ExcelReader or DataProvider in real scenarios)
        String retailerName = "TestRetailer_" + System.currentTimeMillis();
        String address = "123 Main St";
        String city = "Automation City";
        String state = "CA";
        String zip = "90210";
        String contactPerson = "John Doe";
        String contactEmail = "john.doe@testretailer.com";
        String contactPhone = "123-456-7890";

        getExtentTest().info("Entering retailer details.");
        LOGGER.info("Attempting to create retailer: {}", retailerName);
        createRetailerPage.createNewRetailer(retailerName, address, city, state, zip,
                contactPerson, contactEmail, contactPhone);

        // Assertion 1: Verify success message is displayed
        boolean isSuccess = createRetailerPage.isSuccessMessageDisplayed();
        Assert.assertTrue(isSuccess, "Expected success message to be displayed after retailer creation.");
        getExtentTest().pass("Success message was displayed.");
        LOGGER.info("Success message was displayed for retailer: {}", retailerName);

        // Assertion 2: Verify success message text (optional, depends on application)
        String actualSuccessMessage = createRetailerPage.getSuccessMessageText();
        // Assuming a generic success message. Adjust as per actual application.
        Assert.assertTrue(actualSuccessMessage.contains("Retailer created successfully"),
                "Expected success message to contain 'Retailer created successfully' but found: " + actualSuccessMessage);
        getExtentTest().pass("Success message text verified: " + actualSuccessMessage);
        LOGGER.info("Success message text verified: {}", actualSuccessMessage);

        getExtentTest().info("Test completed: verifyRetailerCreation_Successful");
        LOGGER.info("Test 'verifyRetailerCreation_Successful' finished successfully.");
    }

    // Example of another test case (e.g., validation for mandatory fields)
    @Test(priority = 2, description = "Verify validation for missing mandatory retailer name", enabled = false)
    public void verifyRetailerCreation_MissingNameValidation() {
        getExtentTest().info("Starting test: verifyRetailerCreation_MissingNameValidation");
        LOGGER.info("Executing test: verifyRetailerCreation_MissingNameValidation");

        CreateRetailerPage createRetailerPage = new CreateRetailerPage(getDriver());

        String retailerName = ""; // Missing name
        String address = "123 Main St";
        String city = "Automation City";
        String state = "CA";
        String zip = "90210";
        String contactPerson = "John Doe";
        String contactEmail = "john.doe@testretailer.com";
        String contactPhone = "123-456-7890";

        getExtentTest().info("Attempting to create retailer with missing name.");
        LOGGER.info("Attempting to create retailer with missing name.");
        createRetailerPage.createNewRetailer(retailerName, address, city, state, zip,
                contactPerson, contactEmail, contactPhone);

        // This part would depend on how your application handles validation.
        // E.g., check for an error message or that success message is NOT displayed.
        boolean isSuccess = createRetailerPage.isSuccessMessageDisplayed();
        Assert.assertFalse(isSuccess, "Expected success message NOT to be displayed when mandatory name is missing.");
        getExtentTest().pass("Success message was not displayed, as expected.");
        LOGGER.info("Test completed: verifyRetailerCreation_MissingNameValidation");
    }
}
```

---

## 6. Utility Classes

### 6.1. ConfigReader.java

`src/test/java/utilities/ConfigReader.java`

```java
package utilities;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ConfigReader {

    private static Properties properties;
    private static final Logger LOGGER = LogManager.getLogger(ConfigReader.class);
    private static final String CONFIG_FILE_PATH = "src/test/java/config/config.properties";

    // Static block to load properties file once
    static {
        loadProperties();
    }

    private static void loadProperties() {
        properties = new Properties();
        try (FileInputStream fis = new FileInputStream(CONFIG_FILE_PATH)) {
            properties.load(fis);
            LOGGER.info("Successfully loaded properties from: {}", CONFIG_FILE_PATH);
        } catch (IOException e) {
            LOGGER.error("Error loading properties file from {}: {}", CONFIG_FILE_PATH, e.getMessage());
            throw new RuntimeException("Could not load config.properties file: " + e.getMessage());
        }
    }

    /**
     * Retrieves a property value from the config.properties file.
     *
     * @param key The key of the property to retrieve.
     * @return The value of the property, or null if not found.
     */
    public static String getProperty(String key) {
        String value = properties.getProperty(key);
        if (value == null) {
            LOGGER.warn("Property '{}' not found in config.properties.", key);
        }
        return value;
    }

    /**
     * Retrieves a property value from the config.properties file, with a default value.
     *
     * @param key The key of the property to retrieve.
     * @param defaultValue The default value to return if the property is not found.
     * @return The value of the property, or the defaultValue if not found.
     */
    public static String getProperty(String key, String defaultValue) {
        String value = properties.getProperty(key);
        if (value == null) {
            LOGGER.warn("Property '{}' not found in config.properties. Using default value: {}", key, defaultValue);
            return defaultValue;
        }
        return value;
    }
}
```

`src/test/java/config/config.properties`

```properties
# Application Configuration
app.url=http://localhost:8080/retailer-app/create # Replace with actual URL
browser=chrome # Options: chrome, firefox, edge
implicit.wait=10 # In seconds
explicit.wait=30 # In seconds

# Reporting Configuration
extent.report.name=RetailerCreationTestReport
extent.report.title=Retailer Creation Automation Report
```

### 6.2. ExcelReader.java

`src/test/java/utilities/ExcelReader.java`

```java
package utilities;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.poi.ss.usermodel.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ExcelReader {

    private String filePath;
    private static final Logger LOGGER = LogManager.getLogger(ExcelReader.class);

    public ExcelReader(String filePath) {
        this.filePath = filePath;
        LOGGER.info("ExcelReader initialized for file: {}", filePath);
    }

    /**
     * Reads all data from a specified sheet in an Excel file.
     * Assumes the first row contains headers which will be used as keys in the Map.
     *
     * @param sheetName The name of the sheet to read.
     * @return A list of maps, where each map represents a row with header as key and cell value as value.
     */
    public List<Map<String, String>> getSheetData(String sheetName) {
        List<Map<String, String>> sheetData = new ArrayList<>();
        try (FileInputStream fis = new FileInputStream(new File(filePath));
             Workbook workbook = WorkbookFactory.create(fis)) {

            Sheet sheet = workbook.getSheet(sheetName);
            if (sheet == null) {
                LOGGER.error("Sheet '{}' not found in Excel file: {}", sheetName, filePath);
                throw new IllegalArgumentException("Sheet '" + sheetName + "' not found.");
            }

            int firstRow = sheet.getFirstRowNum();
            int lastRow = sheet.getLastRowNum();

            if (lastRow < firstRow) {
                LOGGER.warn("Sheet '{}' is empty in Excel file: {}", sheetName, filePath);
                return sheetData; // Return empty list if sheet is empty
            }

            Row headerRow = sheet.getRow(firstRow);
            if (headerRow == null) {
                LOGGER.error("Header row not found in sheet '{}' in Excel file: {}", sheetName, filePath);
                throw new IllegalStateException("Header row is missing in the sheet.");
            }

            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }

            for (int i = firstRow + 1; i <= lastRow; i++) {
                Row currentRow = sheet.getRow(i);
                if (currentRow == null) {
                    continue; // Skip empty rows
                }
                Map<String, String> rowData = new LinkedHashMap<>();
                for (int j = 0; j < headers.size(); j++) {
                    Cell cell = currentRow.getCell(j);
                    String header = headers.get(j);
                    String value = getCellValueAsString(cell);
                    rowData.put(header, value);
                }
                sheetData.add(rowData);
            }
            LOGGER.info("Successfully read {} rows from sheet '{}' in Excel file: {}", sheetData.size(), sheetName, filePath);

        } catch (IOException e) {
            LOGGER.error("Error reading Excel file '{}': {}", filePath, e.getMessage());
            throw new RuntimeException("Failed to read Excel file: " + e.getMessage(), e);
        }
        return sheetData;
    }

    /**
     * Helper method to get cell value as a String, handling different cell types.
     * @param cell The cell to read.
     * @return The string representation of the cell's value.
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue()); // For integers
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula(); // Or evaluate to get result
            case BLANK:
                return "";
            default:
                return "";
        }
    }

    // Example for reading specific data point
    public String getCellData(String sheetName, String columnName, int rowNum) {
        try (FileInputStream fis = new FileInputStream(new File(filePath));
             Workbook workbook = WorkbookFactory.create(fis)) {

            Sheet sheet = workbook.getSheet(sheetName);
            if (sheet == null) {
                LOGGER.error("Sheet '{}' not found in Excel file: {}", sheetName, filePath);
                return null;
            }

            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            int colNum = -1;
            for (Cell cell : headerRow) {
                if (getCellValueAsString(cell).equalsIgnoreCase(columnName)) {
                    colNum = cell.getColumnIndex();
                    break;
                }
            }

            if (colNum == -1) {
                LOGGER.warn("Column '{}' not found in sheet '{}'.", columnName, sheetName);
                return null;
            }

            Row dataRow = sheet.getRow(rowNum);
            if (dataRow == null) {
                LOGGER.warn("Row {} not found in sheet '{}'.", rowNum, sheetName);
                return null;
            }

            Cell cell = dataRow.getCell(colNum);
            String cellData = getCellValueAsString(cell);
            LOGGER.debug("Read data from sheet '{}', column '{}', row {}: {}", sheetName, columnName, rowNum, cellData);
            return cellData;

        } catch (IOException e) {
            LOGGER.error("Error reading Excel file '{}': {}", filePath, e.getMessage());
            throw new RuntimeException("Failed to read Excel file: " + e.getMessage(), e);
        }
    }
}
```

`src/test/resources/testdata/RetailerData.xlsx` (Example structure, this file needs to be manually created)

| RetailerName      | Address       | City            | State | Zip      | ContactPerson | ContactEmail                 | ContactPhone   |
| :---------------- | :------------ | :-------------- | :---- | :------- | :------------ | :--------------------------- | :------------- |
| RetailerA         | 100 Oak Ave   | Sometown        | NY    | 10001    | Jane Doe      | jane.doe@retailera.com       | 111-222-3333   |
| RetailerB         | 200 Pine St   | Anotherville    | TX    | 75001    | Peter Pan     | peter.pan@retailerb.com      | 444-555-6666   |

### 6.3. WaitUtility.java

`src/test/java/utilities/WaitUtility.java`

```java
package utilities;

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
    private static final Logger LOGGER = LogManager.getLogger(WaitUtility.class);

    public WaitUtility(WebDriver driver) {
        this.driver = driver;
        long explicitWaitTime = Long.parseLong(ConfigReader.getProperty("explicit.wait", "30"));
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(explicitWaitTime));
        LOGGER.debug("WaitUtility initialized with explicit wait time: {} seconds.", explicitWaitTime);
    }

    /**
     * Waits for an element to be visible on the page.
     * @param locator The By locator of the element.
     * @return The WebElement once it is visible.
     */
    public WebElement waitForElementToBeVisible(By locator) {
        try {
            LOGGER.debug("Waiting for element to be visible: {}", locator);
            return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        } catch (Exception e) {
            LOGGER.error("Element not visible within timeout: {} - {}", locator, e.getMessage());
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
            LOGGER.debug("Waiting for element to be clickable: {}", locator);
            return wait.until(ExpectedConditions.elementToBeClickable(locator));
        } catch (Exception e) {
            LOGGER.error("Element not clickable within timeout: {} - {}", locator, e.getMessage());
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
            LOGGER.debug("Waiting for text '{}' to be present in element: {}", text, locator);
            return wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, text));
        } catch (Exception e) {
            LOGGER.error("Text '{}' not present in element '{}' within timeout: {}", text, locator, e.getMessage());
            return false;
        }
    }

    /**
     * Waits for the title of the page to contain a specific text.
     * @param titlePart The part of the title to wait for.
     * @return true if the title contains the text, false otherwise.
     */
    public boolean waitForPageTitleContains(String titlePart) {
        try {
            LOGGER.debug("Waiting for page title to contain: {}", titlePart);
            return wait.until(ExpectedConditions.titleContains(titlePart));
        } catch (Exception e) {
            LOGGER.error("Page title did not contain '{}' within timeout: {}", titlePart, e.getMessage());
            return false;
        }
    }

    /**
     * Waits for the page URL to contain a specific text.
     * @param urlPart The part of the URL to wait for.
     * @return true if the URL contains the text, false otherwise.
     */
    public boolean waitForPageUrlContains(String urlPart) {
        try {
            LOGGER.debug("Waiting for page URL to contain: {}", urlPart);
            return wait.until(ExpectedConditions.urlContains(urlPart));
        } catch (Exception e) {
            LOGGER.error("Page URL did not contain '{}' within timeout: {}", urlPart, e.getMessage());
            return false;
        }
    }
}
```

### 6.4. ScreenshotUtility.java

`src/test/java/utilities/ScreenshotUtility.java`

```java
package utilities;

import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ScreenshotUtility {

    private static final Logger LOGGER = LogManager.getLogger(ScreenshotUtility.class);
    private static final String SCREENSHOT_DIR = "target/screenshots/";

    /**
     * Captures a screenshot and saves it to a specified directory.
     * The file name includes a timestamp and the test method name for uniqueness.
     *
     * @param driver The WebDriver instance.
     * @param testName The name of the test method for which the screenshot is taken.
     * @return The absolute path to the saved screenshot file.
     * @throws IOException If an I/O error occurs during file operations.
     */
    public static String captureScreenshot(WebDriver driver, String testName) throws IOException {
        if (driver == null) {
            LOGGER.error("WebDriver instance is null, cannot capture screenshot.");
            throw new IllegalArgumentException("WebDriver instance cannot be null for screenshot capture.");
        }

        File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String fileName = testName + "_" + timestamp + ".png";
        File destinationFile = new File(SCREENSHOT_DIR + fileName);

        try {
            FileUtils.copyFile(screenshotFile, destinationFile);
            String absolutePath = destinationFile.getAbsolutePath();
            LOGGER.info("Screenshot captured and saved to: {}", absolutePath);
            return absolutePath;
        } catch (IOException e) {
            LOGGER.error("Failed to save screenshot to {}: {}", destinationFile.getAbsolutePath(), e.getMessage());
            throw new IOException("Failed to save screenshot: " + e.getMessage(), e);
        }
    }
}
```

### 6.5. ExtentReportManager.java (Listener Helper)

`src/test/java/listeners/ExtentReportManager.java`

```java
package listeners;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import utilities.ConfigReader;

import java.text.SimpleDateFormat;
import java.util.Date;

public class ExtentReportManager {

    private static ExtentReports extent;

    public static ExtentReports getExtentReports() {
        if (extent == null) {
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String reportFileName = ConfigReader.getProperty("extent.report.name", "AutomationReport") + "_" + timestamp + ".html";
            String reportPath = System.getProperty("user.dir") + "/target/extent-reports/" + reportFileName;

            ExtentSparkReporter htmlReporter = new ExtentSparkReporter(reportPath);
            htmlReporter.config().setDocumentTitle(ConfigReader.getProperty("extent.report.title", "Test Automation Report"));
            htmlReporter.config().setReportName(ConfigReader.getProperty("extent.report.name", "Automation Results"));
            htmlReporter.config().setTheme(Theme.STANDARD);
            htmlReporter.config().setTimeStampFormat("MMM dd, yyyy HH:mm:ss");

            extent = new ExtentReports();
            extent.attachReporter(htmlReporter);
            extent.setSystemInfo("Host Name", System.getProperty("user.name"));
            extent.setSystemInfo("OS", System.getProperty("os.name"));
            extent.setSystemInfo("Java Version", System.getProperty("java.version"));
            extent.setSystemInfo("Environment", "QA");
        }
        return extent;
    }
}
```

### 6.6. TestListener.java (Custom TestNG Listener)

`src/test/java/listeners/TestListener.java`

```java
package listeners;

import base.BaseTest;
import com.aventstack.extentreports.ExtentTest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import utilities.ScreenshotUtility;

import java.io.IOException;

public class TestListener implements ITestListener {

    private static final Logger LOGGER = LogManager.getLogger(TestListener.class);

    @Override
    public void onStart(ITestContext context) {
        LOGGER.info("Test Suite '{}' started.", context.getName());
    }

    @Override
    public void onFinish(ITestContext context) {
        LOGGER.info("Test Suite '{}' finished.", context.getName());
        // No flush here, flush is handled in BaseTest @AfterMethod for each test.
        // If flushing once at the end of suite is desired, move extent.flush() here.
    }

    @Override
    public void onTestStart(ITestResult result) {
        LOGGER.info("Test '{}' started.", result.getMethod().getMethodName());
        // ExtentTest creation is handled in BaseTest @BeforeMethod
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        // Logging and Extent Report update handled in BaseTest @AfterMethod
    }

    @Override
    public void onTestFailure(ITestResult result) {
        // Logging, Extent Report update, and screenshot capture handled in BaseTest @AfterMethod
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        // Logging and Extent Report update handled in BaseTest @AfterMethod
    }

    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
        // Not commonly used, can implement specific logic if needed
    }
}
```

### 6.7. log4j2.xml

`src/test/resources/log4j2.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <Properties>
        <Property name="LOG_PATTERN">
            %d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n
        </Property>
        <Property name="REPORT_DIR">target/logs</Property>
    </Properties>

    <Appenders>
        <!-- Console Appender -->
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="${LOG_PATTERN}"/>
        </Console>

        <!-- File Appender -->
        <RollingFile name="File" fileName="${REPORT_DIR}/automation.log"
                     filePattern="${REPORT_DIR}/automation-%d{yyyy-MM-dd}-%i.log">
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <SizeBasedTriggeringPolicy size="10MB"/>
            </Policies>
            <DefaultRolloverStrategy max="10"/>
        </RollingFile>
    </Appenders>

    <Loggers>
        <Root level="info"> <!-- Default log level for all loggers -->
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Root>

        <!-- Specific logger for Selenium, often set to a higher level to reduce verbose output -->
        <Logger name="org.openqa.selenium" level="warn" additivity="false">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Logger>

        <!-- Specific logger for WebDriverManager -->
        <Logger name="io.github.bonigarcia" level="warn" additivity="false">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Logger>
    </Loggers>
</Configuration>
```

---

## 7. testng.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Enterprise Retailer Automation Suite">

    <listeners>
        <listener class-name="listeners.TestListener"/>
    </listeners>

    <test name="Retailer Creation Tests">
        <classes>
            <class name="tests.CreateRetailerTests"/>
        </classes>
    </test>

</suite>
```

---

## 8. README.md

```markdown
# Enterprise Automation Framework

This project implements an enterprise-grade automation framework designed for robust and scalable web application testing. It leverages industry-standard tools and best practices to ensure high-quality test automation.

## Key Technologies

*   **Selenium WebDriver:** For browser automation.
*   **Java:** The primary programming language.
*   **TestNG:** A powerful testing framework for managing test cases, groups, and parallel execution.
*   **Maven:** For project build automation, dependency management, and reporting.
*   **Page Object Model (POM):** A design pattern to improve test maintenance and reduce code duplication.
*   **WebDriverManager:** Simplifies browser driver management.
*   **Apache POI:** For reading test data from Excel files.
*   **ExtentReports:** For comprehensive and visually appealing test reports.
*   **Log4j2:** For flexible and robust logging within the framework.

## Framework Design and Features

*   **Modular Structure:** Clearly separated concerns (base tests, page objects, test cases, utilities, listeners, configurations).
*   **BaseTest Class:** Provides common setup and teardown logic, WebDriver initialization, and integrated reporting/screenshot capabilities.
*   **Page Object Model:** Each web page has a corresponding Page Object class, encapsulating web elements and actions, making tests more readable and maintainable.
*   **Utility Classes:** Reusable components for common tasks like reading configuration files, handling Excel data, managing explicit waits, and capturing screenshots.
*   **TestNG Listeners:** Custom listeners for integrating ExtentReports, ensuring detailed reporting of test execution status, including screenshots for failures.
*   **Configuration Management:** `config.properties` for externalizing environment-specific parameters (URLs, browser types, timeouts).
*   **Data-Driven Capabilities:** Integrated `ExcelReader` for fetching test data from Excel spreadsheets.
*   **Robust Error Handling:** Comprehensive logging with Log4j2 and screenshot capture on test failures.

## Getting Started

### Prerequisites

*   Java Development Kit (JDK) 11 or higher
*   Maven (installed and configured in your system path)
*   An IDE like IntelliJ IDEA or Eclipse

### Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd EnterpriseAutomationFramework
    ```
2.  **Build the Project:**
    Navigate to the project root directory and run:
    ```bash
    mvn clean install
    ```
    This command will download all necessary dependencies and build the project.

### Execution Steps

Tests can be executed via Maven or TestNG directly.

#### 1. Execute via Maven Command Line

To run the tests using Maven, navigate to the project root directory where `pom.xml` is located and execute:

```bash
mvn clean test
```

This command will:
*   Clean the `target` directory.
*   Compile the test sources.
*   Execute tests defined in `testng.xml` using the `maven-surefire-plugin`.
*   Generate ExtentReports and logs in the `target/extent-reports` and `target/logs` directories, respectively.
*   Generate screenshots (for failed tests) in `target/screenshots`.

#### 2. Execute via TestNG XML

You can also run tests directly from your IDE by right-clicking on the `testng.xml` file and selecting "Run 'testng.xml'".

### Reporting

After execution, the ExtentReports will be generated under `target/extent-reports/`. Open the latest `.html` file in your browser to view the detailed test report.

Logs are generated in `target/logs/automation.log`.

Screenshots for failed tests are saved in `target/screenshots/`.

## Continuous Integration (CI)

This framework is designed to be easily integrated with CI/CD pipelines such as Jenkins, Azure DevOps, or GitHub Actions. The Maven command `mvn clean test` can be used as a build step to execute the tests as part of your pipeline.

### Example for GitHub Actions Workflow (`.github/workflows/maven.yml`)

```yaml
name: Maven CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    - name: Set up JDK 11
      uses: actions/setup-java@v4
      with:
        java-version: '11'
        distribution: 'temurin'
        cache: maven
    - name: Run Maven Tests
      run: mvn -B test --file pom.xml
    - name: Archive Test Results (ExtentReports, Logs, Screenshots)
      uses: actions/upload-artifact@v4
      with:
        name: test-results
        path: |
          target/extent-reports/
          target/logs/
          target/screenshots/
    - name: Publish Test Report (example for ExtentReports, might need custom action or script)
      # This step would typically involve an action to publish HTML reports
      # For a simple artifact, the above upload-artifact is sufficient.
      # For direct viewing in CI, you might need specific report publishing plugins/actions.
      run: echo "ExtentReports generated and available in artifacts."
```

---

## 9. Best Practices

The framework incorporates several best practices to ensure high quality, maintainability, and scalability of test automation:

1.  **Explicit Waits:**
    *   `WaitUtility` class centralizes explicit wait conditions using `WebDriverWait` and `ExpectedConditions`.
    *   Avoids hardcoded `Thread.sleep()` and minimizes implicit waits for better performance and reliability, especially on dynamic web pages.
    *   Configurable explicit wait timeout via `config.properties`.

2.  **Logging (Log4j2):**
    *   Integrated Log4j2 for comprehensive and structured logging.
    *   `Logger` instances are used in all classes (`BaseTest`, `Page Objects`, `Tests`, `Utilities`) to log important actions, errors, and debugging information.
    *   `log4j2.xml` provides flexible configuration for logging levels (INFO, DEBUG, WARN, ERROR), appenders (console, file), and log rolling. This aids in debugging and monitoring test execution.

3.  **Reporting (ExtentReports):**
    *   Seamless integration with ExtentReports via a custom TestNG listener (`TestListener`).
    *   Generates rich, interactive HTML reports with test steps, status, and execution details.
    *   Screenshots are automatically attached to the report for failed test cases, providing immediate visual context for failures.
    *   Test metadata and environment information are included in the report.

4.  **Exception Handling:**
    *   Robust `try-catch` blocks are used in utility classes (`ConfigReader`, `ExcelReader`, `WaitUtility`, `ScreenshotUtility`) and page objects to gracefully handle potential runtime exceptions.
    *   Meaningful error messages are logged, and in some cases, custom `RuntimeException`s are thrown to provide clear context for failures.
    *   This prevents abrupt test termination and provides actionable insights during debugging.

5.  **Reusable Components:**
    *   **BaseTest:** Encapsulates common setup/teardown logic, reducing redundancy in test classes.
    *   **Page Object Model:** Each page object represents a distinct section of the application, and its methods are reusable actions on that page.
    *   **Utility Classes:** `ConfigReader`, `ExcelReader`, `WaitUtility`, `ScreenshotUtility` are designed as standalone, reusable modules that can be called across the framework.
    *   This promotes a "Write Once, Use Many Times" philosophy.

6.  **Naming Standards:**
    *   **Classes:** PascalCase (e.g., `CreateRetailerPage`, `ConfigReader`).
    *   **Methods:** camelCase (e.g., `createNewRetailer`, `getProperty`).
    *   **Variables:** camelCase (e.g., `retailerName`, `driver`).
    *   **Constants:** SCREAMING_SNAKE_CASE (e.g., `CONFIG_FILE_PATH`, `SCREENSHOT_DIR`).
    *   **Locators:** Descriptive names, often following `elementNameInput` or `elementNameButton` conventions.
    *   Consistent naming conventions improve code readability, maintainability, and collaboration within teams.

7.  **Configuration Externalization:**
    *   All configurable parameters (e.g., URL, browser, timeouts) are stored in `config.properties`, separate from the code.
    *   This allows easy modification of environment-specific settings without changing the source code, facilitating deployment across different environments (DEV, QA, UAT, PROD).

8.  **Thread-Safe WebDriver:**
    *   Using `ThreadLocal<WebDriver>` in `BaseTest` ensures that each test method runs with its own isolated WebDriver instance.
    *   This is crucial for parallel test execution, preventing conflicts and ensuring test stability.

These practices collectively contribute to an automation framework that is reliable, easy to extend, and efficient for enterprise-level testing.
```