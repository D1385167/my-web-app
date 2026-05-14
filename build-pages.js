const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'public');
const targetDir = path.join(__dirname, 'docs');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    entries.forEach((entry) => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

if (!fs.existsSync(sourceDir)) {
    console.error('Missing public/ directory.');
    process.exit(1);
}

if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
}

copyDir(sourceDir, targetDir);
console.log('Copied public/ to docs/ for GitHub Pages.');
