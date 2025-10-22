import { Splitter } from "./splitter.js";

export class Compiler {
  constructor() {
    this.splitter = new Splitter();
  }

  async compile(sourceCode) {
    const output = [];
    const stack = [];

    const add = (type, cmd) => {
      if (type === 'code-output') {
        cmd = `append(${cmd})`;
      } else if (type === 'code-escape') {
        cmd = `escape(${cmd})`;
      } else if (type === 'text') {
        cmd = `append("${cmd}")`;
      }

      if (stack.length > 0) {
        stack[stack.length - 1].content += `\n${cmd}`;
      } else {
        output.push(cmd);
      }
    };

    for (const chunk of this.splitter.split(sourceCode)) {
      console.log(chunk);

      const content = chunk.content
        .replace(/;$/, '')
        .replaceAll('\n', '\\n')
        .replaceAll('"', '\\"');

      if (chunk.type === 'text') {
        add(chunk.type, content);
      } else if (chunk.type === 'code') {
        chunk.content = content.trim();

        if (chunk.content.startsWith('}')) {
          if (stack.length === 0) {
            throw new Error('Unexpected closing brace');
          }

          const last = stack.pop();

          chunk.type = last.type;
          chunk.content = last.content + chunk.content;
        }

        if (chunk.content.endsWith('{')) {
          stack.push({ content: chunk.content, type: chunk.type });
          continue;
        }

        add(chunk.type, chunk.content);
      } else if (chunk.type === 'code-output' || chunk.type === 'code-escape') {
        const trimmed = content.trim();

        if (trimmed.endsWith('{')) {
          stack.push({ content: trimmed, type: chunk.type });
        } else {
          add(chunk.type, trimmed);
        }
      }
    }

    console.log(output);
    return output.join(';\n');
  }
}
