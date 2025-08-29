const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist', 'server');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add .js extension to relative imports
  content = content.replace(
    /from\s+['"](?:\.\.?\/)+([^.'"\/][^"']*)(?<!\.js)['"]/g,
    (match, p1) => `from '${p1}.js'`
  );
  
  // Fix @shared imports
  content = content.replace(
    /from\s+['"]@shared\/([^'"\/]+)(?<!\.js)['"]/g,
    "from '../../shared/$1.js'"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

processDirectory(distDir);
console.log('Added .js extensions to imports');
