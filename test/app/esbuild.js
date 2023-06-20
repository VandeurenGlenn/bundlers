await esbuild.build({
  entryPoints: ['./src/shell.ts', './src/views/todo.js', './node_modules/@leofcoin/storage/exports/browser-store.js'],
  bundle: true,
  outdir: 'exports/esbuild',
  format: 'esm'
})