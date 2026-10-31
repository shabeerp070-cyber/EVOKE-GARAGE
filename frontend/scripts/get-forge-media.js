import fs from 'fs';

const html = fs.readFileSync('scripts/forge.html', 'utf-8');

// Find all media URLs (video, webm, mp4, jpg, webp)
const media = [...html.matchAll(/(https:\/\/[^"'\s)]+\.(jpg|jpeg|png|webp|mp4|webm)[^"'\s)]*)/gi)].map(m => m[1]);
console.log('Total media URLs found:', media.length);
const uniqueMedia = [...new Set(media)];
console.log('Unique media URLs (first 20):');
uniqueMedia.slice(0, 20).forEach(u => console.log(' ', u));

// Look for video tags
const videos = [...html.matchAll(/<video[^>]*>.*?<\/video>/gis)].map(m => m[0]);
console.log('\nVideo elements found:', videos.length);
videos.forEach(v => console.log(v.slice(0, 300)));

