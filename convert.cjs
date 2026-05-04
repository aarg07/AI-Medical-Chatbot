const fs = require('fs');
let content = fs.readFileSync('src/data/medicalDataset.js', 'utf-8');
content = content.replace('export const medicalDataset = ', 'module.exports = ');
fs.writeFileSync('temp_data.cjs', content);
const data = require('./temp_data.cjs');
fs.writeFileSync('backend/medical_data.json', JSON.stringify(data, null, 2));
fs.unlinkSync('temp_data.cjs');
