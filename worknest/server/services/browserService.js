const puppeteer = require('puppeteer');

let browserInstance = null;

/**
 * A robust health check that ensures the browser can create and close a page.
 */
const isBrowserHealthy = async () => {
  if (!browserInstance?.isConnected()) return false;
  try {
    const page = await browserInstance.newPage();
    await page.close();
    return true;
  } catch (err) {
    console.error('[Browser Service] Health check failed:', err.message);
    return false;
  }
};

/**
 * Initializes a single, shared Puppeteer browser instance with optimized arguments.
 */
const initializeBrowser = async () => {
  if (browserInstance) await browserInstance.close(); // Close existing instance if any

  console.log('[Browser Service] Initializing new browser instance...');
  try {
    browserInstance = await puppeteer.launch({
      headless: true,
      pipe: true, // More stable connection method on some systems
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process', // Can improve stability in some environments
      ],
    });
    console.log('[Browser Service] Browser initialized successfully.');
  } catch (error) {
    console.error('[Browser Service] ❌ FATAL: Failed to launch browser:', error);
    browserInstance = null;
    throw error; // Rethrow to notify the server startup process
  }
};

/**
 * Returns the active browser instance.
 */
const getBrowser = () => {
  if (!browserInstance) {
    throw new Error('Browser is not initialized. It may have failed to start.');
  }
  return browserInstance;
};

/**
 * Creates and returns a new page from the shared browser instance.
 */
const getPage = async () => {
  if (!await isBrowserHealthy()) {
      console.warn('[Browser Service] Browser is unhealthy, attempting to restart...');
      await restartBrowser();
  }
  const browser = getBrowser();
  return await browser.newPage();
};


/**
 * Closes the shared browser instance during shutdown.
 */
const closeBrowser = async () => {
  if (browserInstance) {
    console.log('[Browser Service] Closing browser instance...');
    await browserInstance.close();
    browserInstance = null;
  }
};

/**
 * Force-restarts the browser.
 */
const restartBrowser = async () => {
  await closeBrowser();
  await initializeBrowser();
};

// This is the crucial part: ensure all functions are correctly exported.
module.exports = {
  initializeBrowser,
  getBrowser,
  getPage,
  closeBrowser,
  isBrowserHealthy,
  restartBrowser,
};