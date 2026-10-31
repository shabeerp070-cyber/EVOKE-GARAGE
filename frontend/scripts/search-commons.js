import fs from 'fs';

async function searchCommons(term) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size`;
  const res = await fetch(url, { headers: { 'User-Agent': 'EvokeGarageBot/1.0' } });
  const data = await res.json();
  const pages = data.query?.pages || {};
  const results = [];
  for (const k in pages) {
    const info = pages[k].imageinfo?.[0];
    if (info && (info.url.endsWith('.jpg') || info.url.endsWith('.jpeg') || info.url.endsWith('.png'))) {
      results.push({
        title: pages[k].title,
        url: info.url,
        width: info.width,
        height: info.height
      });
    }
  }
  return results;
}

async function run() {
  const queries = [
    'automobile spray paint booth',
    'car body repair hammer',
    'car engine bay mechanic',
    'car electrical wiring repair',
    'car paint spray gun'
  ];

  for (const q of queries) {
    const list = await searchCommons(q);
    console.log(`\n=== Query: ${q} (${list.length} results) ===`);
    list.forEach(item => console.log(' ', item.title, item.url));
  }
}

run();

