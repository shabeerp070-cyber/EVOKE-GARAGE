async function getFileInfo(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'EvokeGarageApp/1.0 (https://evokegarage.com; contact@evokegarage.com)'
    }
  });
  const data = await res.json();
  const pages = data.query?.pages || {};
  for (const k in pages) {
    return pages[k].imageinfo?.[0];
  }
}

async function searchAndGet(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=8`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'EvokeGarageApp/1.0 (https://evokegarage.com; contact@evokegarage.com)'
    }
  });
  const data = await res.json();
  const results = [];
  if (data.query?.search) {
    for (const item of data.query.search) {
      if (item.title.endsWith('.jpg') || item.title.endsWith('.jpeg')) {
        const info = await getFileInfo(item.title);
        if (info) {
          results.push({ title: item.title, width: info.width, height: info.height, url: info.url });
        }
      }
    }
  }
  return results;
}

async function run() {
  const queries = [
    'A man is painting a car',
    '"paint booth" car',
    '"spray painting" automobile booth',
    'car painting technician'
  ];

  for (const q of queries) {
    console.log(`\n=== Query: ${q} ===`);
    const res = await searchAndGet(q);
    res.forEach(r => console.log(`${r.title} (${r.width}x${r.height}): ${r.url}`));
  }
}

run().catch(console.error);

