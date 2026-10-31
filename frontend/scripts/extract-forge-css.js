import fs from 'fs';

const html = fs.readFileSync('scripts/forge.html', 'utf-8');

// Find all font-family declarations in the HTML
const fontFamilies = [...html.matchAll(/font-family:[^;]+;/gi)].map(m => m[0]);
console.log('Unique font families:');
const uniqueFonts = [...new Set(fontFamilies)];
uniqueFonts.forEach(f => console.log(' ', f));

// Find @font-face declarations
const fontFaces = [...html.matchAll(/@font-face\s*\{[^}]+\}/gis)].map(m => m[0]);
console.log('\n@font-face count:', fontFaces.length);
fontFaces.slice(0, 5).forEach(f => console.log('\n', f));

// Search for hero section styling and classes
const heroMatches = [...html.matchAll(/<section[^>]*hero[^>]*>.*?<\/section>/gis)].map(m => m[0]);
console.log('\nHero sections found:', heroMatches.length);

// Let's inspect the text content structure of the page
const textNodes = [...html.matchAll(/<(h[1-6]|p)[^>]*>(.*?)<\/\1>/gis)].map(m => ({ tag: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
console.log('\nPage narrative flow (first 25 text items):');
textNodes.slice(0, 25).forEach(t => console.log(`[${t.tag.toUpperCase()}] ${t.text}`));

