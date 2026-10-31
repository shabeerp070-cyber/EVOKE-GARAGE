async function searchWM() {
  const query = 'spray painting car';
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=15`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'EvokeGarageApp/1.0 (https://evokegarage.com; contact@evokegarage.com)'
    }
  });
  const data = await res.json();
  console.log('Results count:', data.query?.search?.length);
  if (data.query?.search) {
    for (const item of data.query.search) {
      console.log(item.title);
    }
  }
}

searchWM().catch(console.error);

