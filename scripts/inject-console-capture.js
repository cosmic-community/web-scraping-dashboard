const fs = require('fs');
const path = require('path');

const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'dashboard-console-capture.js'), 'utf8');

function injectScript(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('dashboard-console-capture.js')) {
    console.log(`Script already injected in ${filePath}`);
    return;
  }
  
  const scriptTag = '<script src="/dashboard-console-capture.js"></script>';
  
  if (content.includes('</head>')) {
    content = content.replace('</head>', `  ${scriptTag}\n</head>`);
  } else if (content.includes('<body>')) {
    content = content.replace('<body>', `<body>\n  ${scriptTag}`);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Injected script into ${filePath}`);
}

const outDir = path.join(__dirname, '..', 'out');
if (fs.existsSync(outDir)) {
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (path.extname(file) === '.html') {
        injectScript(filePath);
      }
    });
  };
  walkDir(outDir);
} else {
  console.log('No out directory found. Build the project first.');
}