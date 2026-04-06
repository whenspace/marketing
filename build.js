#!/usr/bin/env node
// Super-simple static site builder — zero dependencies, pure Node.js core.
//
// Source pages live in src/*.html (not starting with _).
// Partials live anywhere under src/ and start with _ (e.g. src/_partials/nav.html).
//
// In source pages:
//   <!-- key: value -->          front-matter variables (must be at the very top)
//   <!-- include path/file.html --> inserts a partial (path relative to src/)
//   {{key}}                      replaced with the matching front-matter variable
//
// Run:  node build.js
// Output HTML is written to dist/. assets/ and .static live there permanently.
// Deploy: git subtree push --prefix dist dokku main

const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'src');
const OUT  = path.join(__dirname, 'dist');

// ── helpers ──────────────────────────────────────────────────────────────────


function applyVars(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : ''));
}

function processIncludes(str, vars) {
  return str.replace(/[ \t]*<!-- include ([\w/._-]+) -->\n?/g, (_, relPath) => {
    const fullPath = path.join(SRC, relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`  ERROR: partial not found: ${relPath}`);
      process.exit(1);
    }
    const partial = fs.readFileSync(fullPath, 'utf8');
    return applyVars(partial, vars);
  });
}

function build(file) {
  const raw   = fs.readFileSync(path.join(SRC, file), 'utf8');
  const lines = raw.split('\n');

  // Parse front-matter: consecutive <!-- key: value --> lines at the top of the file.
  const vars = {};
  let i = 0;
  while (i < lines.length && /^\s*<!--\s*\w[\w-]*\s*:/.test(lines[i])) {
    const m = lines[i].match(/<!--\s*([\w-]+)\s*:\s*(.*?)\s*-->/);
    if (m) vars[m[1]] = m[2];
    i++;
  }

  let content = lines.slice(i).join('\n');
  content = processIncludes(content, vars);
  content = applyVars(content, vars);

  fs.writeFileSync(path.join(OUT, file), content);
  console.log(`  ${file}`);
}

const pages = fs.readdirSync(SRC)
  .filter(f => !f.startsWith('_') && f.endsWith('.html'));

if (pages.length === 0) {
  console.error('No source pages found in src/');
  process.exit(1);
}

// Prepare dist/
fs.mkdirSync(OUT, { recursive: true });

console.log('Building...');
pages.forEach(build);

console.log(`Done — ${pages.length} page(s) built → dist/`);
