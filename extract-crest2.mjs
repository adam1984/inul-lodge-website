import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync } from 'fs';

const pdfBytes = readFileSync('./INUL Agenda June 2026.pdf');
const pdfDoc = await PDFDocument.load(pdfBytes);

const pages = pdfDoc.getPages();
console.log(`Total pages: ${pages.length}`);

// Get all embedded images from the PDF's resource dictionary
const context = pdfDoc.context;
const enumeratedObjects = context.enumerateIndirectObjects();

let imgCount = 0;
for (const [ref, obj] of enumeratedObjects) {
  try {
    if (obj && obj.constructor && obj.constructor.name === 'PDFRawStream') {
      const dict = obj.dict;
      const subtype = dict.get(context.obj('Subtype'));
      if (subtype && subtype.toString() === '/Image') {
        const width = dict.get(context.obj('Width'));
        const height = dict.get(context.obj('Height'));
        const colorSpace = dict.get(context.obj('ColorSpace'));
        const filter = dict.get(context.obj('Filter'));
        console.log(`Image ${imgCount}: ${width}x${height}, CS: ${colorSpace}, Filter: ${filter}`);

        // Save each image
        const imgData = obj.contents;
        if (filter && filter.toString() === '/DCTDecode') {
          writeFileSync(`./public/extracted-img-${imgCount}.jpg`, imgData);
          console.log(`  Saved as JPEG`);
        } else {
          writeFileSync(`./public/extracted-img-${imgCount}.bin`, imgData);
          console.log(`  Saved as binary`);
        }
        imgCount++;
      }
    }
  } catch(e) { /* skip */ }
}
console.log(`Total images found: ${imgCount}`);
