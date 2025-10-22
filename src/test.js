import fs from 'fs/promises';
import path from 'path';
import {Vjs} from "./vjs.js";

const tmpl = await fs.readFile(path.join(process.cwd(), 'templates', 'three.vjs'), 'utf-8');
const vjs = new Vjs();
const compiled = await vjs.compile(tmpl);
const output = await vjs.render(compiled, {
  name: 'World',
  fn: () => console.log('Hello from the template'),
  age: 26,
  layout: (cb) => {
    const inner = vjs.capture(cb);
    return `<div class="layout">${inner}</div>`;
  },
  xss: '<script>alert("xss")</script>',
});

console.log('=========');
console.log(output);
