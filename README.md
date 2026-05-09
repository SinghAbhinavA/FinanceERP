# FinanceERP - JNLP + Playwright Framework

A hybrid framework combining Java JNLP/Sikuli automation with Playwright test automation for FinanceERP applications.

## Project Structure

```
FinanceERP/
│
├── java-jnlp/                         ← Java JNLP launcher for CI-friendly execution
│   ├── pom.xml
│   ├── src/main/java/jnlp/
│   │   └── JNLPLauncher.java
│   ├── setup-deployment-properties.sh
│   ├── import-cert.sh
│   └── target/jnlp-runner.jar
│
├── playwright/                        ← Playwright Test Framework
│   ├── node_modules/
│   ├── package.json
│   ├── playwright.config.js
│   │
│   ├── base/
│   │   └── BaseTest.js
│   │
│   ├── pages/
│   │   └── LoginPage.js
│   │
│   ├── utils/
│   │   └── jnlpHelper.js
│   │
│   ├── config/
│   │   └── env.js
│   │
│   └── tests/
│       └── login.spec.js
│
├── url.txt                            ← bridge file (login URL)
└── README.md                          ← This file
```

## Setup & Usage

### Java JNLP Module

Build the Java module:

```bash
cd java-jnlp
mvn clean package
```

This produces `target/jnlp-runner.jar` which can launch JNLP applications silently for CI-friendly execution.

### Silent JNLP execution on Linux/Jenkins

Before invoking the launcher, generate or update the Java deployment properties for headless automation:

```bash
cd java-jnlp
./setup-deployment-properties.sh
```

This script updates `$HOME/.java/deployment/deployment.properties` with the required flags to:

- disable Java update checks
- disable JNLP security prompt dialogs
- lower the Java deployment security level for automation

If your JNLP host uses a custom or self-signed certificate, import it into the Java truststore:

```bash
cd java-jnlp
./import-cert.sh my.jnlp.server:443 ./server-cert.pem
```

For headless Jenkins or Docker environments, ensure a valid display is available, for example:

```bash
xvfb-run -a java -jar target/jnlp-runner.jar /path/to/app.jnlp
```

### Playwright Tests

Install dependencies:

```bash
cd playwright
npm install
```

Run tests:

```bash
npm test
```

Or use the Playwright CLI directly:

```bash
npx playwright test
```

## Bridge File

`url.txt` contains the application URL used by Playwright tests. Update this file to point to your FinanceERP login page.

## Notes

- Java code intentionally minimal to preserve existing JNLP launcher logic
- Playwright configuration in `playwright/playwright.config.js`
- Test environment variables in `playwright/config/env.js`
