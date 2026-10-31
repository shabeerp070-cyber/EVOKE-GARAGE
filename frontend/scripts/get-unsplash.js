async function getUnsplashPhotos() {
  const url = 'https://unsplash.com/s/photos/car-painting';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const regex = /https:\/\/images\.unsplash\.com\/(photo-[a-zA-Z0-9_-]+)/g;
  const matches = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push(m[1]);
  }
  const unique = [...new Set(matches)];
  console.log(`Found ${unique.length} photo IDs for car-painting:`, unique);

  // Also try paint-sprayer
  const res2 = await fetch('https://unsplash.com/s/photos/paint-sprayer', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html2 = await res2.text();
  const matches2 = [];
  while ((m = regex.exec(html2)) !== null) {
    matches2.push(m[1]);
  }
  const unique2 = [...new Set(matches2)];
  console.log(`Found ${unique2.length} photo IDs for paint-sprayer:`, unique2);
}

getUnsplashPhotos().catch(console.error);

