const fs = require('fs');
const path = require('path');
const dir = 'E:/AB_Applications/VISUAL STUDIO CODE/PROJECT/graduation-2027/src/app/api';
const walk = (d) => {
  let results = [];
  const list = fs.readdirSync(d);
  list.forEach((file) => {
    file = path.join(d, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('route.ts')) results.push(file);
  });
  return results;
};
walk(dir).forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('isDev ? os.tmpdir() : process.cwd()')) {
    content = content.replace(/const isDev = process\.env\.NODE_ENV !== "production";\n/, '');
    content = content.replace(/const (\w+FilePath) = path\.join\(isDev \? os\.tmpdir\(\) : process\.cwd\(\), isDev \? "graduation_db" : "node_modules\/\.cache\/graduation_db", "([^"]+)"\);/g, 'const $1 = path.join(os.tmpdir(), "graduation_db", "$2");');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed ' + f);
  }
});
