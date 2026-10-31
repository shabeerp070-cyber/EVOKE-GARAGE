import fs from 'fs';

async function testUrl() {
  const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Spray_painting_car.jpg/1280px-Spray_painting_car.jpg';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('Status:', res.status);
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync('scripts/spray_painting_car.jpg', buf);
    console.log('Saved spray_painting_car.jpg:', buf.length);
  }
}

testUrl().catch(console.error);

