const fs = require('fs');
const path = require('path');

const dir = 'E:/AB_Applications/VISUAL STUDIO CODE/PROJECT/graduation-2027/src/app/api';
const walk = (d) => {
  let results = [];
  const list = fs.readdirSync(d);
  list.forEach((file) => {
    file = path.join(d, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk(dir);
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('const ') && content.includes('FilePath = path.join(process.cwd(), "node_modules", ".cache", "graduation_db"')) {
    if (!content.includes('import os from')) {
      content = content.replace('import path from "path";', 'import path from "path";\nimport os from "os";');
    }
    
    content = content.replace(
      /const (\w+FilePath) = path\.join\(process\.cwd\(\), "node_modules", "\.cache", "graduation_db", "([^"]+\.json)"\);/g,
      'const isDev = process.env.NODE_ENV !== "production";\nconst $1 = path.join(isDev ? os.tmpdir() : process.cwd(), isDev ? "graduation_db" : "node_modules/.cache/graduation_db", "$2");'
    );
    
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});
