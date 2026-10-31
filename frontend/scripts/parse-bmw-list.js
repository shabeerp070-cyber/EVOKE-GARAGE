async function parse() {
  const res = await fetch('https://pngimg.com/images/car/bmw/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  const re = /<img[^>]+src=["'](\/uploads\/bmw\/small\/[^"']+)["'][^>]*alt=["']([^"']+)["']/gi;
  let match;
  const list = [];
  while ((match = re.exec(html)) !== null) {
    list.push({ src: match[1], alt: match[2] });
  }
  console.log('Total:', list.length);
  list.slice(0, 40).forEach(item => {
    console.log(item.src, '-->', item.alt);
  });
}
parse();

