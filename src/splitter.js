export class Splitter {
  constructor(start = '<%', end = '%>', escape = '=', print = '-') {
    this.stage = 'text';
    this.buffer = '';
    this.start = start;
    this.end = end;
    this.escape = escape;
    this.print = print;
  }

  *split(code) {
    let i = 0;

    while (i < code.length) {
      const next = (text) => code.slice(i, i + text.length) === text;

      if (this.stage === 'text') {
        if (next(this.start)) {
          if (this.buffer) {
            yield { type: this.stage, content: this.buffer };
            this.buffer = '';
          }

          i += this.start.length;

          if (next(this.print)) {
            this.stage = 'code-output';
            i += this.print.length;
          } else if (next(this.escape)) {
            this.stage = 'code-escape';
            i += this.escape.length;
          } else {
            this.stage = 'code';
          }

          continue;
        }
      } else {
        if (next(this.end)) {
          if (this.buffer.trim()) {
            yield { type: this.stage, content: this.buffer.trim() };
          }

          this.buffer = '';
          this.stage = 'text';

          i += this.end.length;

          continue;
        }
      }

      this.buffer += code[i];
      i += 1;
    }

    if (this.buffer) {
      yield { type: this.stage, content: this.buffer };
      this.buffer = '';
    }
  }
}