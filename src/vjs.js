import $escape from 'html-escape';
import { Compiler } from "./compiler.js";

export class Vjs {
  constructor() {
    this.compiler = new Compiler();
  }

  async compile(text) {
    return this.compiler.compile(text);
  }

  async render(compiled, params) {
    this.buffer = '';

    const append = (content) => this.buffer += content;
    const escape = (content) => append($escape(content));

    const entries = Object.entries({ ...params, append, escape });
    const keys = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value);

    const fn = new Function(...keys, compiled);
    fn(...values);

    const output = this.buffer;
    this.buffer = '';

    return output;
  }

  capture(cb) {
    const content = this.buffer;
    this.buffer = '';
    cb();
    const captured = this.buffer;
    this.buffer = content;
    return captured;
  }
}
