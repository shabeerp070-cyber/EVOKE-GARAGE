import fs from 'fs';

const html = fs.readFileSync('scripts/forge.html', 'utf-8');

// Find the main sections
const sections = [...html.matchAll(/<(section|header|footer|nav|main)[^>]*>/gi)].map(m => m[0]);
console.log('Sections/structural elements:');
sections.forEach(s => console.log('  ', s.slice(0, 120)));

// Find hero section content
const heroSnippet = html.slice(html.indexOf('<h1') - 300, html.indexOf('<h1') + 1200);
console.log('\n--- HERO SNIPPET ---');
console.log(heroSnippet);

// Find navigation snippet
const navSnippet = html.slice(html.indexOf('<nav') || html.indexOf('<header'), (html.indexOf('<nav') || html.indexOf('<header')) + 1000);
console.log('\n--- NAV/HEADER SNIPPET ---');
console.log(navSnippet.slice(0, 1000));

// Find any CSS classes or style tags
const styles = [...html.matchAll(/<style[^>]*>(.*?)<\/style>/gis)].map(m => m[1]);
console.log('\nFound style tags count:', styles.length);
if (styles.length > 0) {
  console.log('Style snippet:', styles[0].slice(0, 800));
}

