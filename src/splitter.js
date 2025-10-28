export class Splitter {
  static textSymbol = Symbol('Text');
  static codeSymbol = Symbol('Code');
  static codeOutputSymbol = Symbol('Code Output');
  static codeEscapeSymbol = Symbol('Code Escape');

  constructor(start = '<%', end = '%>', escape = '=', print = '-') {
    this.stage = Splitter.textSymbol;
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

      if (this.stage === Splitter.textSymbol) {
        if (next(this.start)) {
          if (this.buffer) {
            yield { type: this.stage, content: this.buffer };
            this.buffer = '';
          }

          i += this.start.length;

          if (next(this.print)) {
            this.stage = Splitter.codeOutputSymbol;
            i += this.print.length;
          } else if (next(this.escape)) {
            this.stage = Splitter.codeEscapeSymbol;
            i += this.escape.length;
          } else {
            this.stage = Splitter.codeSymbol;
          }

          continue;
        }
      } else {
        if (next(this.end)) {
          if (this.buffer.trim()) {
            yield { type: this.stage, content: this.buffer.trim() };
          }

          this.buffer = '';
          this.stage = Splitter.textSymbol;

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