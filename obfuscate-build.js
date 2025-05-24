const javascriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const buildJsDir = path.join(__dirname, 'build', 'static', 'js');

// Get all JS files in the build/static/js folder
const jsFiles = fs.readdirSync(buildJsDir).filter(file => file.endsWith('.js'));

jsFiles.forEach(file => {
  const filePath = path.join(buildJsDir, file);
  const code = fs.readFileSync(filePath, 'utf-8');

  const obfuscatedCode = javascriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    debugProtection: true,
    disableConsoleOutput: true,
  }).getObfuscatedCode();

  fs.writeFileSync(filePath, obfuscatedCode, 'utf-8');
  console.log(`Obfuscated ${file}`);
});
