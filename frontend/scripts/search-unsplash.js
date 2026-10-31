import fs from 'fs';

async function searchUnsplash(query, count = 5) {
  try {
    const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    // Match photo URLs like https://images.unsplash.com/photo-xxxxxxxxxxxx
    const matches = [...html.matchAll(/https:\/\/images\.unsplash\.com\/(photo-[a-zA-Z0-9_-]+)/g)].map(m => m[1]);
    const unique = [...new Set(matches)];
    console.log(`Query "${query}" found ${unique.length} photos`);
    return unique.slice(0, count);
  } catch (e) {
    console.error(`Error searching ${query}:`, e.message);
    return [];
  }
}

async function run() {
  const queries = [
    'car-spray-painting',
    'car-paint-booth',
    'car-dent-repair',
    'car-body-repair',
    'car-air-conditioning-mechanic',
    'car-wiring-diagnostics'
  ];

  const results = {};
  for (const q of queries) {
    results[q] = await searchUnsplash(q, 4);
  }
  fs.writeFileSync('scripts/unsplash-results.json', JSON.stringify(results, null, 2));
  console.log('Saved unsplash-results.json');
}

run();

