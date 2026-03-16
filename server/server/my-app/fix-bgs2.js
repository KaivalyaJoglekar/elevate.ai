const fs = require('fs');

const files = [
  'src/components/Hero.tsx',
  'src/components/Work.tsx',
  'src/components/About.tsx',
  'src/components/Experience.tsx',
  'src/components/Contact.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[#030305\]/g, '');
  content = content.replace(/bg-black(?=[\s"])/g, ''); // match bg-black followed by space or quote
  
  // Try to remove grid div
  const gridDivMatch = /\{\/\*\s*(Grid\s*Background|Grid\s*overlay|Fixed\s*Grid\s*Background)\s*\*\/\}\s*<div.*?\/div>\s*<\/div>/gs;
  content = content.replace(gridDivMatch, '');

  fs.writeFileSync(file, content);
}
console.log("Done fixing bgs!");
