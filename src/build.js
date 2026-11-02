// Genera las dos salidas del plan desde src/:
//   plan-de-negocios.html  → para publicar como Artifact (sin <html>/<head>, el visor los agrega)
//   index.html             → página completa para GitHub Pages
// Uso: node src/build.js
const fs = require('fs');
const path = require('path');
const dir = __dirname, out = path.join(dir, '..');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');

const page = read('template.html')
  .replace('/*MODELS*/', () => read('models.js'))
  .replace('/*APP*/', () => read('app.js'));
fs.writeFileSync(path.join(out, 'plan-de-negocios.html'), page);

const corte = page.indexOf('</style>') + '</style>'.length;
const web = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>
${page.slice(0, corte)}
</head>
<body>
${page.slice(corte)}
</body>
</html>
`;
fs.writeFileSync(path.join(out, 'index.html'), web);
console.log('plan-de-negocios.html e index.html generados');
