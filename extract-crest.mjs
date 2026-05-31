import { createCanvas } from 'canvas';
import { readFileSync, writeFileSync } from 'fs';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Render page 2 of the PDF to a full image, then we'll crop the crest area
const data = new Uint8Array(readFileSync('./INUL Agenda June 2026.pdf'));
const loadingTask = getDocument({ data });
const pdf = await loadingTask.promise;

// Page 2 has the crest
const page = await pdf.getPage(2);
const scale = 3; // high res
const viewport = page.getViewport({ scale });

const canvas = createCanvas(viewport.width, viewport.height);
const ctx = canvas.getContext('2d');

await page.render({
  canvasContext: ctx,
  viewport,
}).promise;

// Save full page 2 first
const fullBuf = canvas.toBuffer('image/png');
writeFileSync('./public/page2-full.png', fullBuf);

// The crest appears in the top-right quadrant of page 2
// Approximately x: 55-85%, y: 0-35% of the page
const crestX = Math.floor(viewport.width * 0.52);
const crestY = Math.floor(viewport.height * 0.02);
const crestW = Math.floor(viewport.width * 0.44);
const crestH = Math.floor(viewport.height * 0.33);

const crestCanvas = createCanvas(crestW, crestH);
const crestCtx = crestCanvas.getContext('2d');
crestCtx.drawImage(canvas, crestX, crestY, crestW, crestH, 0, 0, crestW, crestH);

const crestBuf = crestCanvas.toBuffer('image/png');
writeFileSync('./public/inul-crest.png', crestBuf);

console.log(`Done. Full page: ${viewport.width}x${viewport.height}, Crest: ${crestW}x${crestH}`);
