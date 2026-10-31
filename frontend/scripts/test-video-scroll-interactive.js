import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTest() {
  console.log('--- Starting Cinematic Video Scroll Interactive Test ---');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Listen for console logs and errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  // 1. DESKTOP VIEWPORT TEST (1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Check section existence
  const sectionExists = await page.evaluate(() => {
    const el = document.getElementById('cinematic-motion');
    const v = el ? el.querySelector('video') : null;
    return {
      hasSection: !!el,
      hasVideo: !!v,
      videoSrc: v ? v.currentSrc : null,
      videoReadyState: v ? v.readyState : null,
      videoDuration: v ? v.duration : null,
    };
  });
  console.log('Desktop Initial Check:', sectionExists);

  // Scroll to section
  const sectionCoords = await page.evaluate(() => {
    const el = document.getElementById('cinematic-motion');
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: rect.height,
    };
  });
  console.log('Section Coords:', sectionCoords);

  // Take screenshot before scrolling into it
  await page.screenshot({ path: 'screenshots/cinematic-video-before.png' });

  // Scroll into the pinned section
  // Let's test scroll positions across the pinned range
  // Total scroll span of the pinned section is sectionCoords.height - window.innerHeight
  const scrollStart = sectionCoords.top;
  const pinDuration = sectionCoords.height - 900;
  console.log(`Pin start: ${scrollStart}, Pin duration: ${pinDuration}`);

  // Capture at 5 key scroll checkpoints:
  // 0%: Front start
  // 25%: Front detail (~3s)
  // 45%: Rear profile (~5.5s)
  // 60%: Exhaust flame (~7.3s)
  // 85%: Forged wheel (~10.4s)
  const checkpoints = [
    { label: 'phase-1-front-start', fraction: 0.05 },
    { label: 'phase-1-front-mid', fraction: 0.25 },
    { label: 'phase-2-rear', fraction: 0.45 },
    { label: 'phase-3-exhaust-flame', fraction: 0.60 },
    { label: 'phase-4-forged-wheel', fraction: 0.88 },
  ];

  for (const cp of checkpoints) {
    const targetY = scrollStart + pinDuration * cp.fraction;
    await page.evaluate((y) => {
      window.scrollTo(0, y);
    }, targetY);

    // Allow GSAP and video seek to settle
    await new Promise(r => setTimeout(r, 600));

    const videoState = await page.evaluate(() => {
      const v = document.querySelector('#cinematic-motion video');
      const timecode = document.querySelector('#cinematic-motion [class*="tabular-nums"]');
      const progress = document.querySelector('#cinematic-motion [class*="from-red-600"]');
      return {
        currentTime: v ? v.currentTime : null,
        duration: v ? v.duration : null,
        timecodeText: timecode ? timecode.textContent : null,
        progressWidth: progress ? progress.style.width : null,
      };
    });

    console.log(`[Desktop ${cp.label}] fraction=${cp.fraction.toFixed(2)}: videoTime=${videoState.currentTime?.toFixed(2)}s, HUD timecode="${videoState.timecodeText}", progress="${videoState.progressWidth}"`);

    await page.screenshot({ path: `screenshots/desktop-${cp.label}.png` });
  }

  // TEST REVERSE SCROLL: Scroll back to phase 1
  console.log('Testing reverse scroll back to 10%...');
  const reverseY = scrollStart + pinDuration * 0.10;
  await page.evaluate((y) => {
    window.scrollTo(0, y);
  }, reverseY);
  await new Promise(r => setTimeout(r, 600));

  const reverseVideoState = await page.evaluate(() => {
    const v = document.querySelector('#cinematic-motion video');
    return {
      currentTime: v ? v.currentTime : null,
    };
  });
  console.log(`[Reverse Scroll] Back to videoTime=${reverseVideoState.currentTime?.toFixed(2)}s (should be near 1.2s)`);
  await page.screenshot({ path: 'screenshots/desktop-reverse-scroll.png' });

  // 2. MOBILE VIEWPORT TEST (390x844 - iPhone 14)
  console.log('--- Testing Mobile Viewport (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Check mobile overflow
  const overflowCheck = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });
  console.log('Mobile Overflow Check:', overflowCheck);

  const mobileCoords = await page.evaluate(() => {
    const el = document.getElementById('cinematic-motion');
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: rect.height,
    };
  });
  console.log('Mobile Section Coords:', mobileCoords);

  const mobilePinDuration = mobileCoords.height - 844;

  for (const cp of checkpoints) {
    const targetY = mobileCoords.top + mobilePinDuration * cp.fraction;
    await page.evaluate((y) => {
      window.scrollTo(0, y);
    }, targetY);

    await new Promise(r => setTimeout(r, 600));

    const mVideoState = await page.evaluate(() => {
      const v = document.querySelector('#cinematic-motion video');
      return {
        currentTime: v ? v.currentTime : null,
      };
    });

    console.log(`[Mobile ${cp.label}] fraction=${cp.fraction.toFixed(2)}: videoTime=${mVideoState.currentTime?.toFixed(2)}s`);
    await page.screenshot({ path: `screenshots/mobile-${cp.label}.png` });
  }

  console.log('Console Errors caught:', consoleErrors);

  await browser.close();
  console.log('--- Test Completed Successfully ---');
}

runTest().catch(console.error);

