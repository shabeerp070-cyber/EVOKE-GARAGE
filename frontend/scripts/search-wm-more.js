async function searchWM(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=20`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'EvokeGarageApp/1.0 (https://evokegarage.com; contact@evokegarage.com)'
    }
  });
  const data = await res.json();
  return (data.query?.search || []).map(s => s.title);
}

async function run() {
  const queries = [
    '"spray gun" car',
    '"paint gun" car',
    'car "spray booth" painter',
    'automobile "spray gun"',
    'car paint job',
    'automotive paint'
  ];

  for (const q of queries) {
    const list = await searchWM(q);
    console.log(`\n=== Query: ${q} (${list.length}) ===`);
    list.filter(t => t.endsWith('.jpg') || t.endsWith('.jpeg')).forEach(t => console.log(' ', t));
  }
}

run().catch(console.error);

