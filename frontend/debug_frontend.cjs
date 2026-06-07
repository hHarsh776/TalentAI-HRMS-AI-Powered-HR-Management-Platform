const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\Users\\hhsta\\.cache\\puppeteer\\chrome\\win64-149.0.7827.22\\chrome-win64\\chrome.exe', headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]: ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED]: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log("Navigating to http://localhost:5174/candidates ...");
  try {
    await page.goto('http://localhost:5174/candidates', { waitUntil: 'networkidle2', timeout: 10000 });
  } catch (e) {
    console.log(`Navigation error: ${e.message}`);
  }

  console.log("Navigating to http://localhost:5174/resumes ...");
  try {
    await page.goto('http://localhost:5174/resumes', { waitUntil: 'networkidle2', timeout: 10000 });
  } catch (e) {
    console.log(`Navigation error: ${e.message}`);
  }

  await browser.close();
})();
