const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const adminDir = path.join(rootDir, 'admin');

if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

const indexPath = path.join(rootDir, 'index.html');
const adminIndexPath = path.join(adminDir, 'index.html');
const adminHtmlPath = path.join(rootDir, 'admin.html');

fs.copyFileSync(indexPath, adminIndexPath);
fs.copyFileSync(indexPath, adminHtmlPath);

console.log('✅ Synchronized admin/index.html and admin.html for Vercel static routing.');
