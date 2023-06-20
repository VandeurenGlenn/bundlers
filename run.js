import {spawnSync} from 'child_process'
import { join } from 'path';


console.time('rollup')
let a = spawnSync('npm', ['run', 'build:rollup'], {cwd: './test/app'})
console.log(a.output.toString());
console.timeEnd('rollup')

console.time('esbuild')
spawnSync('npm', ['run', 'build:esbuild'], {cwd: './test/app'})
console.timeEnd('esbuild')

console.time('webpack')
spawnSync('npm', ['run', 'build:webpack'], {cwd: './test/app'})
console.timeEnd('webpack')