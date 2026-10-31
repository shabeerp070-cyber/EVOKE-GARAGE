import puppeteer from 'puppeteer-core';

async function verifyScreensAndDrawer() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Test iPhone SE (375 x 667)
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/verify-iphonese-375x667.png' });
  console.log('Saved iPhone SE screenshot');

  // Test iPhone Pro Max (430 x 932)
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/verify-promax-430x932.png' });
  console.log('Saved iPhone Pro Max screenshot');

  // Test Mobile Drawer Interaction (393 x 852)
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Click hamburger button (second button in header)
  const menuButtons = await page.$$('header.site-header button');
  if (menuButtons.length >= 2) {
    await menuButtons[1].click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scripts/verify-mobile-drawer-open.png' });
    console.log('Saved Mobile Drawer Open screenshot');

    // Click close button
    const closeButtons = await page.$$('header.site-header button');
    await closeButtons[1].click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scripts/verify-mobile-drawer-closed.png' });
    console.log('Saved Mobile Drawer Closed screenshot');
  }

  await browser.close();
}

verifyScreensAndDrawer().catch(console.error);

