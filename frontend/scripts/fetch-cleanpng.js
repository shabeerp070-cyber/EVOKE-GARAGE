async function fetchPage() {
  const urls = [
    'https://www.cleanpng.com/png-drifting-bmw-sports-car-684277/',
    'https://www.cleanpng.com/png-bmw-m4-gts-safety-car-6447547/',
    'https://www.cleanpng.com/png-silver-bmw-m3-front-view-371477/'
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await res.text();
      const matches = html.match(/https:\/\/[^"'<>\s]+\.(?:png|jpg|webp)/gi) || [];
      const img = matches.find(m => m.includes('banner') || m.includes('transparent') || m.includes('cleanpng.com/download') || m.includes('icon2.cleanpng.com'));
      console.log(u, '=>', img);
    } catch (e) {
      console.error(e.message);
    }
  }
}
fetchPage();

