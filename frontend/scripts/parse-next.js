async function parseNextData() {
  const url = 'https://unsplash.com/s/photos/car-paint';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  if (nextMatch) {
    try {
      const data = JSON.parse(nextMatch[1]);
      console.log('Next data keys:', Object.keys(data));
      const jsonStr = JSON.stringify(data);
      const photoMatches = [...jsonStr.matchAll(/https:\/\/images\.unsplash\.com\/photo-[^"?]+/g)].map(m => m[0]);
      console.log('Found photo URLs in Next data:', [...new Set(photoMatches)]);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  } else {
    console.log('__NEXT_DATA__ not found');
  }
}

parseNextData().catch(console.error);

