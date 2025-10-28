import $escape from 'html-escape';
import { Compiler } from "./compiler.js";

export class Vjs {
  constructor() {
    this.compiler = new Compiler();
  }

  async compile(text) {
    const code = await this.compiler.compile(text);

    return new Function('$', 'append', 'escape', 'yield', code);
  }

  append(content) {
    this.buffer += content;
  }

  escape(content) {
    this.append($escape(content));
  }

  async render(fn, params, content) {
    this.buffer = '';

    const append = this.append.bind(this);
    const escape = this.escape.bind(this);

    fn(params, append, escape, content);

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
