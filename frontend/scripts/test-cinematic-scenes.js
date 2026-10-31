import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCinematicScenes() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const errors = [];

  // ==========================================
  // 1. DESKTOP 1440px TESTING
  // ==========================================
  console.log('Testing Desktop 1440px...');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  desktopPage.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[Desktop Console Error] ${msg.text()}`);
  });
  desktopPage.on('pageerror', err => errors.push(`[Desktop Page Error] ${err.message}`));

  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 1: Desktop Hero
  await desktopPage.screenshot({ path: 'screenshots/cinematic-1-hero-desktop.png' });

  // Scroll to About
  await desktopPage.evaluate(() => {
    document.querySelector('#about')?.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await desktopPage.screenshot({ path: 'screenshots/cinematic-2-about-desktop.png' });

  // Scroll into Showcase (Scene 1)
  await desktopPage.evaluate(() => {
    document.querySelector('#showcase')?.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 700));
  await desktopPage.screenshot({ path: 'screenshots/cinematic-3-showcase-desktop-scene1.png' });

  // Scrub showcase to Scene 2
  await desktopPage.evaluate(() => {
    window.scrollBy(0, 700);
  });
  await new Promise(r => setTimeout(r, 600));
  await desktopPage.screenshot({ path: 'screenshots/cinematic-3-showcase-desktop-scene2.png' });

  // Scroll to Services (Painting & Denting)
  await desktopPage.evaluate(() => {
    document.querySelector('#services')?.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 700));
  await desktopPage.screenshot({ path: 'screenshots/cinematic-4-services-painting-desktop.png' });

  await desktopPage.evaluate(() => {
    window.scrollBy(0, 900);
  });
  await new Promise(r => setTimeout(r, 600));
  await desktopPage.screenshot({ path: 'screenshots/cinematic-4-services-denting-desktop.png' });

  // Scroll to Contact
  await desktopPage.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await desktopPage.screenshot({ path: 'screenshots/cinematic-5-contact-desktop.png' });

  // Check desktop horizontal overflow
  const desktopOverflow = await desktopPage.evaluate(() => {
    return {
      windowWidth: window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      hasOverflow: document.body.scrollWidth > window.innerWidth
    };
  });
  console.log('Desktop Overflow Check:', desktopOverflow);

  await desktopPage.close();

  // ==========================================
  // 2. MOBILE 390px TESTING
  // ==========================================
  console.log('Testing Mobile 390px...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  mobilePage.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[Mobile Console Error] ${msg.text()}`);
  });
  mobilePage.on('pageerror', err => errors.push(`[Mobile Page Error] ${err.message}`));

  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Mobile Hero
  await mobilePage.screenshot({ path: 'screenshots/cinematic-mobile-hero.png' });

  // Mobile Showcase
  await mobilePage.evaluate(() => {
    document.querySelector('#showcase')?.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await mobilePage.screenshot({ path: 'screenshots/cinematic-mobile-showcase.png' });

  // Mobile Services
  await mobilePage.evaluate(() => {
    document.querySelector('#services')?.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await mobilePage.screenshot({ path: 'screenshots/cinematic-mobile-services.png' });

  // Mobile Contact
  await mobilePage.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await mobilePage.screenshot({ path: 'screenshots/cinematic-mobile-contact.png' });

  // Check mobile horizontal overflow
  const mobileOverflow = await mobilePage.evaluate(() => {
    return {
      windowWidth: window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      hasOverflow: document.body.scrollWidth > window.innerWidth
    };
  });
  console.log('Mobile Overflow Check:', mobileOverflow);

  await mobilePage.close();
  await browser.close();

  console.log('\n--- FINAL TEST RESULTS ---');
  console.log('Total Console Errors:', errors.length);
  if (errors.length) console.log(errors);
  console.log('Desktop Overflow:', desktopOverflow.hasOverflow ? 'FAIL' : 'PASS');
  console.log('Mobile Overflow:', mobileOverflow.hasOverflow ? 'FAIL' : 'PASS');
}

testCinematicScenes().catch(console.error);

