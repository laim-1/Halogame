const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src');
const files = fs.readdirSync(dir).filter(f => /^\d\d_/.test(f)).sort();
let out = '';
for (const f of files) {
  let s = fs.readFileSync(path.join(dir, f), 'utf8');
  if (!s.endsWith('\n')) s += '\n';
  out += s;
}
const js = files.filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const bad = [];
js.split('\n').forEach((l, i) => {
  const t = l.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, '""');
  if (/\/\/|\/\*/.test(t)) bad.push((i + 1) + ': ' + l.trim().slice(0, 80));
});
if (bad.length) { console.log('COMMENT-LIKE LINES:\n' + bad.join('\n')); }
fs.writeFileSync(path.join(__dirname, 'index.html'), out);
fs.writeFileSync(path.join(__dirname, 'check.js'), js);
console.log('built', out.length, 'bytes,', out.split('\n').length, 'lines');
