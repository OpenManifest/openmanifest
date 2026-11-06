// The files of the git checkout that the vocabulary scripts read and rewrite.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vocabulary = require('./vocabulary');

class Tree {
  constructor(root = path.join(__dirname, '..', '..'), config = vocabulary.loadConfig()) {
    this.root = root;
    this.allow = config.allow;
  }

  /** Tracked files, relative to the root */
  get paths() {
    if (!this.cached) {
      const output = execFileSync('git', ['-C', this.root, 'ls-files', '-z'], {
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
      });
      this.cached = output
        .split('\0')
        .filter(
          (file) =>
            file &&
            fs.existsSync(path.join(this.root, file)) &&
            fs.statSync(path.join(this.root, file)).isFile()
        );
    }
    return this.cached;
  }

  allowed(file) {
    return vocabulary.isAllowed(file, this.allow);
  }

  isText(file) {
    const fd = fs.openSync(path.join(this.root, file), 'r');
    try {
      const buffer = Buffer.alloc(8000);
      const bytes = fs.readSync(fd, buffer, 0, 8000, 0);
      return !buffer.subarray(0, bytes).includes(0);
    } finally {
      fs.closeSync(fd);
    }
  }

  read(file) {
    return fs.readFileSync(path.join(this.root, file), 'utf8');
  }

  /** Hits per term in files that must be renamed (pending) and in allowed paths, and pending hits per directory */
  count(list) {
    const pending = {};
    const allowed = {};
    const byDirectory = {};
    for (const file of this.paths) {
      const bucket = this.allowed(file) ? allowed : pending;
      const hits = { ...vocabulary.scan(file, list) };
      if (this.isText(file)) {
        for (const [term, n] of Object.entries(vocabulary.scan(this.read(file), list)))
          hits[term] = (hits[term] || 0) + n;
      }
      let total = 0;
      for (const [term, n] of Object.entries(hits)) {
        bucket[term] = (bucket[term] || 0) + n;
        total += n;
      }
      if (bucket === pending && total) {
        const top = file.split('/')[0];
        byDirectory[top] = (byDirectory[top] || 0) + total;
      }
    }
    return { pending, allowed, byDirectory };
  }
}

module.exports = { Tree };
