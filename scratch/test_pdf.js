const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'backend', 'uploads', '1777187694099-Pranitha_Saripudi_SDE.pdf');

if (fs.existsSync(testFile)) {
    const dataBuffer = fs.readFileSync(testFile);
    pdf(dataBuffer).then(data => {
        console.log('PDF Parse Success!');
        console.log('Text length:', data.text.length);
        console.log('Sample:', data.text.substring(0, 100));
        process.exit(0);
    }).catch(err => {
        console.error('PDF Parse Failed:', err);
        process.exit(1);
    });
} else {
    console.error('Test file not found');
    process.exit(1);
}
