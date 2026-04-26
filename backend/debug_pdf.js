const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Keys of pdf:', Object.keys(pdf));
console.log('Type of pdf.PDFParse:', typeof pdf.PDFParse);
if (typeof pdf.PDFParse === 'function') {
    console.log('pdf.PDFParse is a function!');
}
process.exit(0);
