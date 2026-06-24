#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');

esbuild.buildSync({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: 'dist/cli.js',
  format: 'cjs',
  banner: {
    js: '#!/usr/bin/env node\n'
  }
});

fs.chmodSync('dist/cli.js', 0o755);
