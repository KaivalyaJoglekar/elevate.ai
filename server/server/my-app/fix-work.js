const fs = require('fs');

function cleanFile(fileName) {
  let content = fs.readFileSync(fileName, 'utf8');
  const gridMatch = /\s*\{\/\*\s*Grid (overlay|Background)\s*\*\/\}\s*<div className="absolute inset-0 overflow-hidden opacity-\[0\.04\]">\s*<div\s*className="absolute inset-0"\s*style=\{\{\s*backgroundImage: `[^`]+`,\s*backgroundSize: '60px 60px',\s*\}\}\s*\/>\s*<\/div>/g;
  content = content.replace(gridMatch, '');
  fs.writeFileSync(fileName, content);
}

cleanFile('src/components/Work.tsx');
cleanFile('src/components/About.tsx');
cleanFile('src/components/Contact.tsx');
