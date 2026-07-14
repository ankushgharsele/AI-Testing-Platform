```markdown
# Maven `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.retailerapp</groupId>
    <artifactId>RetailerAutomationFramework</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <selenium.version>4.19.1</selenium.version>
        <testng.version>7.10.1</testng.version>
        <webdrivermanager.version>5.8.0</webdrivermanager.version>
        <surefire.plugin.version>3.2.5</surefire.plugin.version>
    </properties>

    <dependencies>
        <!-- Selenium WebDriver -->
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

        <!-- WebDriverManager for automatic driver management -->
        <dependency>
            <groupId>io.github.bonigarcia</groupId>
            <artifactId>webdrivermanager</artifactId>
            <version>${webdrivermanager.version}</version>
        </dependency>

        <!-- For logging purposes -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>2.23.1</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.23.1</version>
        </dependency>

        <!-- For reading properties file -->
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.15.1</version>
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
                <version>${surefire.plugin.version}</version>
                <configuration>
                    <suiteXmlFiles>
                        <suiteXmlFile>testng.xml</suiteXmlFile>
                    </suiteXmlFiles>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

# `testng.xml` (Root of the project)

```xml
<!DOCTYPE suite SYSTEM "http://testng.org/testng-1.0.dtd">
<suite name="Retailer App Test Suite" parallel="methods" thread-count="2">
    <listeners>
        <listener class-name="org.testng.reporters.EmailableReporter2"/>
        <listener class-name="org.testng.reporters.FailedReporter"/>
    </listeners>

    <test name="Retailer Creation Functionality">
        <classes>
            <class name="com.retailerapp.tests.RetailerCreationTests"/>
        </classes>
    </test>
</suite>
```

# `src/main/resources/config.properties`

```properties
browser=chrome
baseurl=http://localhost:8080/retailerapp  # Replace with actual application URL
username=admin
password=password123
implicit.wait.seconds=10
page.load.timeout.seconds=30
```

# `src/main/java/com/retailerapp/utilities/ConfigReader.java`

```java
package com.retailerapp.utilities;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Utility class to read configuration properties from config.properties file.
 */
public class ConfigReader {
    private static Properties properties;
    private static final String CONFIG_FILE = "config.properties";

    static {
        properties = new Properties();
        try (InputStream inputStream = ConfigReader.class.getClassLoader().getResourceAsStream(CONFIG_FILE)) {
            if (inputStream != null) {
                properties.load(inputStream);
            } else {
                throw new RuntimeException("Property file '" + CONFIG_FILE + "' not found in the classpath");
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to load properties from " + CONFIG_FILE, e);
        }
    }

    /**
     * Get a property value by its key.
     *
     * @param key The key of the property.
     * @return The value of the property.
     */
    public static String getProperty(String key) {
        return properties.getProperty(key);
    }

    /**
     * Get a property value as an integer.
     *
     * @param key The key of the property.
     * @return The integer value of the property.
     */
    public static int getIntProperty(String key) {
        return Integer.parseInt(properties.getProperty(key));
    }
}
```

# `src/main/java/com/retailerapp/drivers/DriverSetup.java`

```java
package com.retailerapp.drivers;

import com.retailerapp.utilities.ConfigReader;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.time.Duration;

/**
 * Manages WebDriver initialization and setup.
 */
public class DriverSetup {
    private static final Logger logger = LogManager.getLogger(DriverSetup.class);
    private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    /**
     * Initializes the WebDriver based on the browser specified in config.properties.
     * Sets implicit wait and page load timeouts.
     *
     * @return Initialized WebDriver instance.
     */
    public static WebDriver initializeDriver() {
        String browser = ConfigReader.getProperty("browser").toLowerCase();
        int implicitWait = ConfigReader.getIntProperty("implicit.wait.seconds");
        int pageLoadTimeout = ConfigReader.getIntProperty("page.load.timeout.seconds");

        logger.info("Initializing WebDriver for browser: {}", browser);

        try {
            switch (browser) {
                case "chrome":
                    WebDriverManager.chromedriver().setup();
                    ChromeOptions chromeOptions = new ChromeOptions();
                    chromeOptions.addArguments("--start-maximized");
                    // chromeOptions.addArguments("--headless"); // Uncomment for headless execution
                    driver.set(new ChromeDriver(chromeOptions));
                    break;
                case "firefox":
                    WebDriverManager.firefoxdriver().setup();
                    FirefoxOptions firefoxOptions = new FirefoxOptions();
                    firefoxOptions.addArguments("--start-maximized");
                    // firefoxOptions.addArguments("--headless"); // Uncomment for headless execution
                    driver.set(new FirefoxDriver(firefoxOptions));
                    break;
                case "edge":
                    WebDriverManager.edgedriver().setup();
                    EdgeOptions edgeOptions = new EdgeOptions();
                    edgeOptions.addArguments("--start-maximized");
                    // edgeOptions.addArguments("--headless"); // Uncomment for headless execution
                    driver.set(new EdgeDriver(edgeOptions));
                    break;
                default:
                    logger.error("Unsupported browser specified: {}. Defaulting to Chrome.", browser);
                    WebDriverManager.chromedriver().setup();
                    driver.set(new ChromeDriver());
                    break;
            }

            getDriver().manage().timeouts().implicitlyWait(Duration.ofSeconds(implicitWait));
            getDriver().manage().timeouts().pageLoadTimeout(Duration.ofSeconds(pageLoadTimeout));
            getDriver().manage().window().maximize();
            logger.info("WebDriver initialized successfully for {}", browser);
            return getDriver();
        } catch (Exception e) {
            logger.error("Failed to initialize WebDriver: {}", e.getMessage(), e);
            throw new RuntimeException("WebDriver initialization failed: " + e.getMessage(), e);
        }
    }

    /**
     * Returns the WebDriver instance for the current thread.
     *
     * @return WebDriver instance.
     */
    public static WebDriver getDriver() {
        return driver.get();
    }

    /**
     * Quits the WebDriver instance for the current thread.
     */
    public static void quitDriver() {
        if (getDriver() != null) {
            logger.info("Quitting WebDriver instance.");
            getDriver().quit();
            driver.remove();
        }
    }
}
```

# `src/main/java/com/retailerapp/base/BaseTest.java`

```java
package com.retailerapp.base;

import com.retailerapp.drivers.DriverSetup;
import com.retailerapp.utilities.ConfigReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.WebDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

/**
 * Base class for all test classes.
 * Handles WebDriver setup and teardown, and navigates to the base URL.
 */
public class BaseTest {
    protected WebDriver driver;
    protected String baseUrl;
    private static final Logger logger = LogManager.getLogger(BaseTest.class);

    @BeforeMethod
    public void setup() {
        try {
            driver = DriverSetup.initializeDriver();
            baseUrl = ConfigReader.getProperty("baseurl");
            logger.info("Navigating to URL: {}", baseUrl);
            driver.get(baseUrl);
            logger.info("Successfully navigated to {}", baseUrl);
        } catch (Exception e) {
            logger.error("Setup failed: {}", e.getMessage(), e);
            throw new RuntimeException("Test setup failed: " + e.getMessage(), e);
        }
    }

    @AfterMethod
    public void tearDown() {
        try {
            DriverSetup.quitDriver();
            logger.info("WebDriver successfully quit.");
        } catch (Exception e) {
            logger.error("Teardown failed: {}", e.getMessage(), e);
            // Even if teardown fails, we don't want to fail the test run itself
        }
    }
}
```

# `src/main/java/com/retailerapp/pages/LoginPage.java`

```java
package com.retailerapp.pages;

import com.retailerapp.utilities.ConfigReader;
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
 */
public class LoginPage {
    private WebDriver driver;
    private WebDriverWait wait;
    private static final Logger logger = LogManager.getLogger(LoginPage.class);

    // Locators
    @FindBy(id = "username")
    private WebElement usernameInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;

    @FindBy(css = ".alert.alert-danger")
    private WebElement errorMessage; // Assuming a common error message locator

    /**
     * Constructor for LoginPage.
     *
     * @param driver The WebDriver instance.
     */
    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(ConfigReader.getIntProperty("implicit.wait.seconds")));
    }

    /**
     * Enters the username into the username field.
     *
     * @param username The username to enter.
     */
    public void enterUsername(String username) {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameInput)).sendKeys(username);
            logger.info("Entered username: {}", username);
        } catch (Exception e) {
            logger.error("Failed to enter username '{}': {}", username, e.getMessage(), e);
            throw new RuntimeException("Failed to enter username: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the password into the password field.
     *
     * @param password The password to enter.
     */
    public void enterPassword(String password) {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordInput)).sendKeys(password);
            logger.info("Entered password.");
        } catch (Exception e) {
            logger.error("Failed to enter password: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to enter password: " + e.getMessage(), e);
        }
    }

    /**
     * Clicks the login button.
     */
    public void clickLoginButton() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
            logger.info("Clicked login button.");
        } catch (Exception e) {
            logger.error("Failed to click login button: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to click login button: " + e.getMessage(), e);
        }
    }

    /**
     * Performs the login action with provided credentials.
     *
     * @param username The username for login.
     * @param password The password for login.
     * @return A new instance of DashboardPage after successful login.
     */
    public DashboardPage login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
        logger.info("Login attempt completed for user: {}", username);
        return new DashboardPage(driver); // Assuming successful login leads to DashboardPage
    }

    /**
     * Checks if an error message is displayed on the login page.
     *
     * @return True if an error message is displayed, false otherwise.
     */
    public boolean isErrorMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).isDisplayed();
        } catch (Exception e) {
            logger.warn("Error message not found or not visible: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets the text of the error message displayed on the login page.
     *
     * @return The text of the error message.
     */
    public String getErrorMessageText() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).getText();
        } catch (Exception e) {
            logger.error("Failed to get error message text: {}", e.getMessage(), e);
            return null;
        }
    }
}
```

# `src/main/java/com/retailerapp/pages/DashboardPage.java`

```java
package com.retailerapp.pages;

import com.retailerapp.utilities.ConfigReader;
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
 * Page Object Model for the Dashboard Page after login.
 */
public class DashboardPage {
    private WebDriver driver;
    private WebDriverWait wait;
    private static final Logger logger = LogManager.getLogger(DashboardPage.class);

    // Locators
    @FindBy(id = "dashboard-title") // Assuming a title element
    private WebElement dashboardTitle;

    @FindBy(xpath = "//nav/ul/li/a[contains(text(), 'Retailers')]") // Assuming a navigation link for Retailers
    private WebElement retailersNavLink;

    @FindBy(xpath = "//nav/ul/li/a[contains(text(), 'Create Retailer')]") // Assuming a sub-menu or direct link for Create Retailer
    private WebElement createRetailerLink;

    /**
     * Constructor for DashboardPage.
     *
     * @param driver The WebDriver instance.
     */
    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(ConfigReader.getIntProperty("implicit.wait.seconds")));
    }

    /**
     * Verifies if the dashboard title is displayed, indicating successful navigation to the dashboard.
     *
     * @return True if dashboard title is displayed, false otherwise.
     */
    public boolean isDashboardTitleDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(dashboardTitle)).isDisplayed();
        } catch (Exception e) {
            logger.error("Dashboard title not displayed or element not found: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Clicks on the 'Retailers' navigation link.
     * This might open a dropdown or navigate directly. Assuming it makes 'Create Retailer' visible.
     */
    public void clickRetailersNavLink() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(retailersNavLink)).click();
            logger.info("Clicked 'Retailers' navigation link.");
        } catch (Exception e) {
            logger.error("Failed to click 'Retailers' navigation link: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to click 'Retailers' navigation link: " + e.getMessage(), e);
        }
    }

    /**
     * Clicks on the 'Create Retailer' link.
     *
     * @return A new instance of RetailerCreationPage.
     */
    public RetailerCreationPage clickCreateRetailerLink() {
        try {
            // First ensure the Retailers nav link is clicked or hovered if it's a dropdown
            // For simplicity, assuming direct click on a menu item
            wait.until(ExpectedConditions.elementToBeClickable(createRetailerLink)).click();
            logger.info("Clicked 'Create Retailer' link.");
            return new RetailerCreationPage(driver);
        } catch (Exception e) {
            logger.error("Failed to click 'Create Retailer' link: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to click 'Create Retailer' link: " + e.getMessage(), e);
        }
    }

    /**
     * Navigates to the Retailer Creation page.
     * This method encapsulates the steps to reach the page.
     *
     * @return A new instance of RetailerCreationPage.
     */
    public RetailerCreationPage navigateToRetailerCreationPage() {
        logger.info("Navigating to Retailer Creation page.");
        // Depending on UI, you might need to hover over 'Retailers' first, then click 'Create Retailer'
        // For this example, assuming 'Create Retailer' is directly clickable or visible after clicking 'Retailers'
        // If 'Create Retailer' is a sub-menu of 'Retailers' that appears on hover,
        // you might need Actions class for hover.
        // For simplicity, let's assume 'createRetailerLink' is a top-level link or appears on a simple click.
        // If 'Retailers' itself is a link that leads to a list, and then there's a 'New' button, adjust here.

        // Assuming a direct click path or 'Create Retailer' link is always visible.
        // If `retailersNavLink` is a container/parent that reveals `createRetailerLink`
        // on click or hover:
        // this.clickRetailersNavLink(); // If 'Retailers' is a button/menu item
        // wait.until(ExpectedConditions.visibilityOf(createRetailerLink)); // Wait for visibility if it's dynamic
        return clickCreateRetailerLink();
    }
}
```

# `src/main/java/com/retailerapp/pages/RetailerCreationPage.java`

```java
package com.retailerapp.pages;

import com.retailerapp.utilities.ConfigReader;
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
 * Page Object Model for the Retailer Creation Page.
 * This page handles entering new retailer details.
 */
public class RetailerCreationPage {
    private WebDriver driver;
    private WebDriverWait wait;
    private static final Logger logger = LogManager.getLogger(RetailerCreationPage.class);

    // Locators for input fields
    @FindBy(id = "retailerName")
    private WebElement retailerNameInput;

    @FindBy(id = "addressLine1")
    private WebElement addressLine1Input;

    @FindBy(id = "addressLine2")
    private WebElement addressLine2Input;

    @FindBy(id = "city")
    private WebElement cityInput;

    @FindBy(id = "state")
    private WebElement stateInput;

    @FindBy(id = "zipCode")
    private WebElement zipCodeInput;

    @FindBy(id = "contactPerson")
    private WebElement contactPersonInput;

    @FindBy(id = "contactEmail")
    private WebElement contactEmailInput;

    @FindBy(id = "contactPhone")
    private WebElement contactPhoneInput;

    // Locator for action buttons
    @FindBy(css = "button[type='submit'][name='createRetailer']")
    private WebElement createRetailerButton;

    @FindBy(css = "button[type='reset']")
    private WebElement resetButton;

    // Locator for success/error messages
    @FindBy(css = ".alert.alert-success")
    private WebElement successMessage;

    @FindBy(css = ".alert.alert-danger")
    private WebElement errorMessage;

    /**
     * Constructor for RetailerCreationPage.
     *
     * @param driver The WebDriver instance.
     */
    public RetailerCreationPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(ConfigReader.getIntProperty("implicit.wait.seconds")));
    }

    /**
     * Enters the retailer name.
     *
     * @param retailerName The name of the retailer.
     */
    public void enterRetailerName(String retailerName) {
        try {
            wait.until(ExpectedConditions.visibilityOf(retailerNameInput)).sendKeys(retailerName);
            logger.info("Entered retailer name: {}", retailerName);
        } catch (Exception e) {
            logger.error("Failed to enter retailer name '{}': {}", retailerName, e.getMessage(), e);
            throw new RuntimeException("Failed to enter retailer name: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the first line of the address.
     *
     * @param addressLine1 The first line of the address.
     */
    public void enterAddressLine1(String addressLine1) {
        try {
            wait.until(ExpectedConditions.visibilityOf(addressLine1Input)).sendKeys(addressLine1);
            logger.info("Entered address line 1: {}", addressLine1);
        } catch (Exception e) {
            logger.error("Failed to enter address line 1 '{}': {}", addressLine1, e.getMessage(), e);
            throw new RuntimeException("Failed to enter address line 1: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the second line of the address (optional).
     *
     * @param addressLine2 The second line of the address.
     */
    public void enterAddressLine2(String addressLine2) {
        try {
            wait.until(ExpectedConditions.visibilityOf(addressLine2Input)).sendKeys(addressLine2);
            logger.info("Entered address line 2: {}", addressLine2);
        } catch (Exception e) {
            logger.warn("Failed to enter address line 2 '{}', continuing: {}", addressLine2, e.getMessage());
            // This field might be optional, so log a warning but don't fail.
        }
    }

    /**
     * Enters the city.
     *
     * @param city The city.
     */
    public void enterCity(String city) {
        try {
            wait.until(ExpectedConditions.visibilityOf(cityInput)).sendKeys(city);
            logger.info("Entered city: {}", city);
        } catch (Exception e) {
            logger.error("Failed to enter city '{}': {}", city, e.getMessage(), e);
            throw new RuntimeException("Failed to enter city: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the state.
     *
     * @param state The state.
     */
    public void enterState(String state) {
        try {
            wait.until(ExpectedConditions.visibilityOf(stateInput)).sendKeys(state);
            logger.info("Entered state: {}", state);
        } catch (Exception e) {
            logger.error("Failed to enter state '{}': {}", state, e.getMessage(), e);
            throw new RuntimeException("Failed to enter state: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the zip code.
     *
     * @param zipCode The zip code.
     */
    public void enterZipCode(String zipCode) {
        try {
            wait.until(ExpectedConditions.visibilityOf(zipCodeInput)).sendKeys(zipCode);
            logger.info("Entered zip code: {}", zipCode);
        } catch (Exception e) {
            logger.error("Failed to enter zip code '{}': {}", zipCode, e.getMessage(), e);
            throw new RuntimeException("Failed to enter zip code: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the contact person's name.
     *
     * @param contactPerson The name of the contact person.
     */
    public void enterContactPerson(String contactPerson) {
        try {
            wait.until(ExpectedConditions.visibilityOf(contactPersonInput)).sendKeys(contactPerson);
            logger.info("Entered contact person: {}", contactPerson);
        } catch (Exception e) {
            logger.error("Failed to enter contact person '{}': {}", contactPerson, e.getMessage(), e);
            throw new RuntimeException("Failed to enter contact person: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the contact email.
     *
     * @param contactEmail The contact email.
     */
    public void enterContactEmail(String contactEmail) {
        try {
            wait.until(ExpectedConditions.visibilityOf(contactEmailInput)).sendKeys(contactEmail);
            logger.info("Entered contact email: {}", contactEmail);
        } catch (Exception e) {
            logger.error("Failed to enter contact email '{}': {}", contactEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to enter contact email: " + e.getMessage(), e);
        }
    }

    /**
     * Enters the contact phone number.
     *
     * @param contactPhone The contact phone number.
     */
    public void enterContactPhone(String contactPhone) {
        try {
            wait.until(ExpectedConditions.visibilityOf(contactPhoneInput)).sendKeys(contactPhone);
            logger.info("Entered contact phone: {}", contactPhone);
        } catch (Exception e) {
            logger.error("Failed to enter contact phone '{}': {}", contactPhone, e.getMessage(), e);
            throw new RuntimeException("Failed to enter contact phone: " + e.getMessage(), e);
        }
    }

    /**
     * Clicks the 'Create Retailer' button.
     */
    public void clickCreateRetailerButton() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(createRetailerButton)).click();
            logger.info("Clicked 'Create Retailer' button.");
        } catch (Exception e) {
            logger.error("Failed to click 'Create Retailer' button: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to click 'Create Retailer' button: " + e.getMessage(), e);
        }
    }

    /**
     * Fills out the retailer creation form with provided details.
     *
     * @param name         Retailer name.
     * @param address1     Address line 1.
     * @param address2     Address line 2 (can be null/empty).
     * @param city         City.
     * @param state        State.
     * @param zip          Zip code.
     * @param contactP     Contact person.
     * @param email        Contact email.
     * @param phone        Contact phone.
     */
    public void createRetailer(String name, String address1, String address2, String city, String state, String zip,
                               String contactP, String email, String phone) {
        enterRetailerName(name);
        enterAddressLine1(address1);
        if (address2 != null && !address2.isEmpty()) {
            enterAddressLine2(address2);
        }
        enterCity(city);
        enterState(state);
        enterZipCode(zip);
        enterContactPerson(contactP);
        enterContactEmail(email);
        enterContactPhone(phone);
        clickCreateRetailerButton();
        logger.info("Attempted to create retailer: {}", name);
    }

    /**
     * Checks if the success message is displayed after retailer creation.
     *
     * @return True if success message is displayed, false otherwise.
     */
    public boolean isSuccessMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(successMessage)).isDisplayed();
        } catch (Exception e) {
            logger.warn("Success message not displayed or element not found: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets the text of the success message.
     *
     * @return The text of the success message, or null if not found.
     */
    public String getSuccessMessageText() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(successMessage)).getText();
        } catch (Exception e) {
            logger.error("Failed to get success message text: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Checks if an error message is displayed on the retailer creation page.
     *
     * @return True if an error message is displayed, false otherwise.
     */
    public boolean isErrorMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).isDisplayed();
        } catch (Exception e) {
            logger.warn("Error message not found or not visible: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets the text of the error message displayed on the retailer creation page.
     *
     * @return The text of the error message.
     */
    public String getErrorMessageText() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).getText();
        } catch (Exception e) {
            logger.error("Failed to get error message text: {}", e.getMessage(), e);
            return null;
        }
    }
}
```

# `src/main/java/com/retailerapp/pages/RetailerListPage.java`

```java
package com.retailerapp.pages;

import com.retailerapp.utilities.ConfigReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * Page Object Model for the Retailer List Page.
 * This page displays a list of all retailers and allows verification.
 */
public class RetailerListPage {
    private WebDriver driver;
    private WebDriverWait wait;
    private static final Logger logger = LogManager.getLogger(RetailerListPage.class);

    // Locators
    @FindBy(id = "retailersTable") // Assuming an ID for the retailers table
    private WebElement retailersTable;

    @FindBy(css = "#retailersTable tbody tr") // Assuming rows are within tbody
    private List<WebElement> retailerRows;

    @FindBy(css = ".alert.alert-success")
    private WebElement successMessage;

    /**
     * Constructor for RetailerListPage.
     *
     * @param driver The WebDriver instance.
     */
    public RetailerListPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(ConfigReader.getIntProperty("implicit.wait.seconds")));
    }

    /**
     * Checks if the retailer list table is displayed.
     *
     * @return True if the table is displayed, false otherwise.
     */
    public boolean isRetailersTableDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(retailersTable)).isDisplayed();
        } catch (Exception e) {
            logger.error("Retailers table not displayed or element not found: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Checks if a retailer with the given name exists in the list.
     *
     * @param retailerName The name of the retailer to search for.
     * @return True if the retailer is found, false otherwise.
     */
    public boolean isRetailerPresentInList(String retailerName) {
        logger.info("Checking if retailer '{}' is present in the list.", retailerName);
        try {
            wait.until(ExpectedConditions.visibilityOf(retailersTable)); // Wait for the table to be present

            // More robust way to find element in table using XPath
            String xpath = String.format("//table[@id='retailersTable']//td[normalize-space()='%s']", retailerName);
            return driver.findElements(By.xpath(xpath)).size() > 0;

        } catch (Exception e) {
            logger.error("Error checking for retailer '{}' in list: {}", retailerName, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Gets the number of retailers displayed in the table.
     *
     * @return The count of retailer rows.
     */
    public int getRetailerCount() {
        try {
            wait.until(ExpectedConditions.visibilityOf(retailersTable));
            return retailerRows.size();
        } catch (Exception e) {
            logger.error("Failed to get retailer count: {}", e.getMessage(), e);
            return 0;
        }
    }

    /**
     * Checks if a success message is displayed on the page.
     *
     * @return True if success message is displayed, false otherwise.
     */
    public boolean isSuccessMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(successMessage)).isDisplayed();
        } catch (Exception e) {
            logger.warn("Success message not displayed or element not found: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets the text of the success message.
     *
     * @return The text of the success message, or null if not found.
     */
    public String getSuccessMessageText() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(successMessage)).getText();
        } catch (Exception e) {
            logger.error("Failed to get success message text: {}", e.getMessage(), e);
            return null;
        }
    }
}
```

# `src/test/java/com/retailerapp/tests/RetailerCreationTests.java`

```java
package com.retailerapp.tests;

import com.retailerapp.base.BaseTest;
import com.retailerapp.pages.DashboardPage;
import com.retailerapp.pages.LoginPage;
import com.retailerapp.pages.RetailerCreationPage;
import com.retailerapp.pages.RetailerListPage;
import com.retailerapp.utilities.ConfigReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Test class for creating new retailers.
 * Extends BaseTest to inherit WebDriver setup and teardown.
 */
public class RetailerCreationTests extends BaseTest {
    private static final Logger logger = LogManager.getLogger(RetailerCreationTests.class);

    @Test(description = "Verify successful creation of a new retailer with valid data.")
    public void testCreateNewRetailerSuccessfully() {
        String testRetailerName = "Automation Retailer " + new SimpleDateFormat("HHmmss").format(new Date());
        logger.info("Starting test: testCreateNewRetailerSuccessfully for retailer: {}", testRetailerName);

        try {
            // 1. Login to the application
            LoginPage loginPage = new LoginPage(driver);
            DashboardPage dashboardPage = loginPage.login(
                    ConfigReader.getProperty("username"),
                    ConfigReader.getProperty("password")
            );
            Assert.assertTrue(dashboardPage.isDashboardTitleDisplayed(), "User should be on the Dashboard page after login.");
            logger.info("Successfully logged in as: {}", ConfigReader.getProperty("username"));

            // 2. Navigate to Create Retailer page
            RetailerCreationPage retailerCreationPage = dashboardPage.navigateToRetailerCreationPage();
            logger.info("Navigated to Retailer Creation page.");

            // 3. Fill retailer details and submit
            retailerCreationPage.createRetailer(
                    testRetailerName,
                    "123 Test St",
                    "Suite 100",
                    "Test City",
                    "TX",
                    "12345",
                    "John Doe",
                    "john.doe@" + System.currentTimeMillis() + ".com",
                    "555-123-4567"
            );
            logger.info("Submitted retailer creation form for: {}", testRetailerName);

            // 4. Verify success message
            Assert.assertTrue(retailerCreationPage.isSuccessMessageDisplayed(), "Success message should be displayed after creating retailer.");
            String successMessageText = retailerCreationPage.getSuccessMessageText();
            Assert.assertTrue(successMessageText.contains("Retailer created successfully"),
                    "Success message should indicate successful creation. Actual: " + successMessageText);
            logger.info("Verified success message: {}", successMessageText);

            // 5. Navigate to Retailer List page and verify the new retailer is present (Optional but good practice)
            // Assuming there's a way to go to a list page to verify.
            // For simplicity, let's assume the success message itself is enough, or the page redirects to a list view.
            // If the page redirects or provides a link to list:
            // Example:
            // driver.navigate().to(ConfigReader.getProperty("baseurl") + "/retailers/list");
            // RetailerListPage retailerListPage = new RetailerListPage(driver);
            // Assert.assertTrue(retailerListPage.isRetailerPresentInList(testRetailerName),
            //         "Newly created retailer should be present in the retailer list.");
            // logger.info("Verified retailer '{}' is present in the list.", testRetailerName);


        } catch (Exception e) {
            logger.error("Test 'testCreateNewRetailerSuccessfully' failed for retailer '{}': {}", testRetailerName, e.getMessage(), e);
            Assert.fail("Test failed due to exception: " + e.getMessage());
        }
    }

    @Test(description = "Verify retailer creation fails with missing required fields (e.g., Retailer Name).")
    public void testCreateRetailerWithMissingName() {
        String invalidRetailerName = ""; // Missing retailer name
        logger.info("Starting test: testCreateRetailerWithMissingName");

        try {
            // 1. Login to the application
            LoginPage loginPage = new LoginPage(driver);
            DashboardPage dashboardPage = loginPage.login(
                    ConfigReader.getProperty("username"),
                    ConfigReader.getProperty("password")
            );
            Assert.assertTrue(dashboardPage.isDashboardTitleDisplayed(), "User should be on the Dashboard page after login.");
            logger.info("Successfully logged in for 'missing name' test.");

            // 2. Navigate to Create Retailer page
            RetailerCreationPage retailerCreationPage = dashboardPage.navigateToRetailerCreationPage();
            logger.info("Navigated to Retailer Creation page for 'missing name' test.");

            // 3. Attempt to create retailer with missing name
            retailerCreationPage.createRetailer(
                    invalidRetailerName, // Missing name
                    "123 Test St",
                    "", // Optional
                    "Test City",
                    "TX",
                    "12345",
                    "Jane Doe",
                    "jane.doe@" + System.currentTimeMillis() + ".com",
                    "555-987-6543"
            );
            logger.info("Submitted retailer creation form with missing name.");

            // 4. Verify error message is displayed
            Assert.assertTrue(retailerCreationPage.isErrorMessageDisplayed(), "Error message should be displayed for missing retailer name.");
            String errorMessageText = retailerCreationPage.getErrorMessageText();
            Assert.assertTrue(errorMessageText.contains("Retailer name is required") || errorMessageText.contains("Validation error"),
                    "Error message should indicate missing retailer name. Actual: " + errorMessageText);
            logger.info("Verified error message for missing name: {}", errorMessageText);

        } catch (Exception e) {
            logger.error("Test 'testCreateRetailerWithMissingName' failed: {}", e.getMessage(), e);
            Assert.fail("Test failed due to exception: " + e.getMessage());
        }
    }

    // Add more test cases as per manual test cases (e.g., invalid email, duplicate retailer name, etc.)
}
```