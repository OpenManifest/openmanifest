// The rename map of GENERALISATION.md §3 (config/vocabulary.yml): finds and rewrites old terms in identifiers.
// Mirrors lib/vocabulary.rb of the backend; both are tested with the same cases (scripts/__tests__/vocabulary.test.ts).
//
// An identifier is split into words (snake, kebab, camel, Pascal, SCREAMING); word sequences equal to an entry's `old`
// words are replaced by its `new` words in the style of the identifier. Words are never split inside, so `airplane`
// does not contain `vehicle`.
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config', 'vocabulary.yml');
const TOKEN = /[A-Za-z][A-Za-z0-9]*(?:[_-][A-Za-z0-9]+)*/g;
// A word of an identifier: an acronym (DutyOfficer), a Capitalised or lowercase word, or digits
const WORD = /[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[0-9]+/g;

function loadConfig(file = CONFIG_PATH) {
  return YAML.parse(fs.readFileSync(file, 'utf8'));
}

/** Entries of the given groups (all when none), longest phrase first */
function entries(groups, config = loadConfig()) {
  const wanted = [].concat(groups || []).map(String);
  return Object.entries(config.groups)
    .filter(([group]) => wanted.length === 0 || wanted.includes(group))
    .flatMap(([group, items]) =>
      items.map(({ old, new: replacement }) => ({
        group,
        old,
        new: replacement,
        oldWords: old.split('_'),
        newWords: replacement.split('_'),
      }))
    )
    .sort((a, b) => b.oldWords.length - a.oldWords.length);
}

/** Words of an identifier with the separator ('', '_' or '-') in front of each */
function partsOf(token) {
  const parts = [];
  let sep = '';
  for (const chunk of token.split(/([_-])/)) {
    if (/^[_-]$/.test(chunk)) {
      sep = chunk;
      continue;
    }
    (chunk.match(WORD) || []).forEach((text, index) =>
      parts.push({ text, sep: index === 0 ? sep : '' })
    );
    sep = '';
  }
  return parts;
}

/** Does `entry` start at words[index]? The last old word may carry a plural suffix. Returns [size, suffix] or null */
function matchAt(words, index, entry) {
  const old = entry.oldWords;
  if (index + old.length > words.length) return null;
  for (let offset = 0; offset < old.length; offset += 1) {
    const word = words[index + offset];
    const last = offset === old.length - 1;
    const base = old[offset];
    if (!(word === base || (last && (word === `${base}s` || word === `${base}es`)))) return null;
  }
  return [old.length, words[index + old.length - 1].slice(old[old.length - 1].length)];
}

function firstMatch(words, index, list) {
  for (const entry of list) {
    const found = matchAt(words, index, entry);
    if (found) return [entry, found];
  }
  return null;
}

// Words that have no plural: the plural of `equipment` is `equipment`
const UNCOUNTABLE = ['equipment'];

function pluralize(word, suffix) {
  if (!suffix || UNCOUNTABLE.includes(word)) return word;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return /(s|x|ch|sh)$/.test(word) ? `${word}es` : `${word}s`;
}

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Rewrites one identifier; returns it unchanged when no entry matches. A lowercase one-word identifier that becomes
 * several words is joined with `singleWordSep` (the client writes camelCase, the backend snake_case).
 */
function rewriteToken(token, list, singleWordSep = '') {
  const parts = partsOf(token);
  const words = parts.map((part) => part.text.toLowerCase());
  const screaming = token.includes('_') && !/[a-z]/.test(token);
  const tokenSep = token.includes('_')
    ? '_'
    : token.includes('-')
      ? '-'
      : parts.length === 1 && /^[a-z]/.test(token)
        ? singleWordSep
        : '';
  const out = [];
  let index = 0;
  let changed = false;

  while (index < parts.length) {
    const hit = firstMatch(words, index, list);
    if (!hit) {
      out.push(parts[index]);
      index += 1;
      continue;
    }
    changed = true;
    const [entry, [size, suffix]] = hit;
    const originals = parts.slice(index, index + size);
    const newWords = [...entry.newWords];
    newWords[newWords.length - 1] = pluralize(newWords[newWords.length - 1], suffix);
    const joiner = size > 1 ? originals[1].sep : tokenSep;

    newWords.forEach((word, i) => {
      const sep = i === 0 ? originals[0].sep : joiner;
      const firstOfToken = out.length === 0 && i === 0;
      let cased;
      if (screaming) cased = word.toUpperCase();
      else if (firstOfToken) cased = /^[A-Z]/.test(originals[0].text) ? capitalize(word) : word;
      else if (sep === '') cased = capitalize(word);
      else cased = word;
      out.push({ text: cased, sep });
    });
    index += size;
  }

  return changed ? out.map((part) => `${part.sep}${part.text}`).join('') : token;
}

/** Rewrites every identifier in `text` */
function rewrite(text, list, singleWordSep = '') {
  return text.replace(TOKEN, (token) => rewriteToken(token, list, singleWordSep));
}

const CODE_FILE = /\.(?:[cm]?[jt]sx?)$/;
const COPY_PROPS =
  'label|title|placeholder|helperText|subtitle|description|accessibilityLabel|headline|text';
const TEXT_QUERIES = '(?:get|find|query)(?:All)?ByText';
// Regions of a source file that are text for people: kept as they are by `rewriteKeepingProse` (terminology moves the
// visible copy to translated terms in P7.19/P7.20, so a rename task must not change what users read)
const PROSE_PATTERNS = [
  // JSX text: <Text>Select a dropzone</Text>
  />([^<>{}\n]*[A-Za-z][^<>{}\n]*)</g,
  // string literals with at least two words
  /(['"])((?:\\.|(?!\1)[^\\\n])*?[A-Za-z]+[ \t]+[A-Za-z]+(?:\\.|(?!\1)[^\\\n])*?)\1/g,
  // the one-word value of a copy prop: label="Dropzone"
  new RegExp(`\\b(?:${COPY_PROPS})=(["'])([^"'\\n]+)\\1`, 'g'),
  // the text a test looks for: getByText('Dropzone')
  new RegExp(`\\b${TEXT_QUERIES}\\(\\s*(['"])([^'"\\n]+)\\1`, 'g'),
];

/**
 * Like `rewrite`, but prose in source files stays as it is: JSX text, strings of several words (outside `${...}` in
 * template literals), the one-word value of a copy prop and the text a test looks for.
 */
function rewriteKeepingProse(text, list, singleWordSep = '', file = '') {
  if (!CODE_FILE.test(file)) return rewrite(text, list, singleWordSep);
  const kept = [];
  // Template literals: the text around `${...}` is prose when it has two words, the expressions are code
  let masked = text.replace(/`(?:\\.|[^`\\])*`/g, (literal) =>
    literal.replace(/(\$\{[^}]*\})|([^$]+|\$)/g, (part, expression, staticText) => {
      if (expression || !/[A-Za-z]+[ \t]+[A-Za-z]+/.test(staticText)) return part;
      kept.push(staticText);
      return `\uE000${kept.length - 1}\uE001`;
    })
  );
  for (const pattern of PROSE_PATTERNS) {
    masked = masked.replace(pattern, (match, ...groups) => {
      const quoteOrText = groups[0];
      const body = groups.length > 3 && typeof groups[1] === 'string' ? groups[1] : quoteOrText;
      const start = match.lastIndexOf(body);
      kept.push(body);
      return `${match.slice(0, start)}\uE000${kept.length - 1}\uE001${match.slice(start + body.length)}`;
    });
  }
  const rewritten = rewrite(masked, list, singleWordSep);
  let restored = rewritten;
  // A kept region can hold another one (a copy prop whose value was a string of several words)
  while (/\uE000\d+\uE001/.test(restored)) {
    restored = restored.replace(/\uE000(\d+)\uE001/g, (_, index) => kept[Number(index)]);
  }
  return restored;
}

/** Counts the old terms in `text`, by the entry's old name */
function scan(text, list) {
  const counts = {};
  for (const token of text.match(TOKEN) || []) {
    const words = partsOf(token).map((part) => part.text.toLowerCase());
    let index = 0;
    while (index < words.length) {
      const hit = firstMatch(words, index, list);
      if (hit) {
        counts[hit[0].old] = (counts[hit[0].old] || 0) + 1;
        index += hit[0].oldWords.length;
      } else {
        index += 1;
      }
    }
  }
  return counts;
}

/** Glob to RegExp: `**\/` any directories (or none), `**` anything, `*` anything but a slash, `?` one character */
function globRegexp(glob) {
  const source = glob
    .split(/(\*\*\/|\*\*|\*|\?)/)
    .map((piece) => {
      if (piece === '**/') return '(?:.*/)?';
      if (piece === '**') return '.*';
      if (piece === '*') return '[^/]*';
      if (piece === '?') return '[^/]';
      return piece.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${source}$`);
}

function isAllowed(file, allow) {
  return allow.some((glob) => globRegexp(glob).test(file));
}

module.exports = {
  loadConfig,
  entries,
  partsOf,
  rewrite,
  rewriteKeepingProse,
  rewriteToken,
  scan,
  isAllowed,
  globRegexp,
};
