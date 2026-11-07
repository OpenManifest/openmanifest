// Counts the UI debt of design plan §3.5 in source files, with the TypeScript parser (so strings in comments and
// template text are not mistaken for code). Used by scripts/ui-debt.mjs.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const METRICS = [
  'paperImports',
  'colourLiterals',
  'rawTouchables',
  'numericFontSizes',
  'literalStrings',
];
const LABELS = {
  paperImports: 'Paper imports',
  colourLiterals: 'Colour literals',
  rawTouchables: 'Raw touchables',
  numericFontSizes: 'Numeric font sizes',
  literalStrings: 'Literal JSX strings',
};

const COLOUR = /^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla)\(.*|white|black)$/;
const RAW_TOUCHABLE = new Set([
  'Pressable',
  'TouchableOpacity',
  'TouchableWithoutFeedback',
  'TouchableHighlight',
]);
// Props whose string value is shown to people or read by a screen reader
const TEXT_PROPS = new Set([
  'label',
  'title',
  'placeholder',
  'description',
  'accessibilityLabel',
  'accessibilityHint',
  'aria-label',
  'helperText',
  'subtitle',
]);
// Folders that are not app code
const SKIP_DIRS = new Set(['__tests__', '__mocks__', '__fixtures__', 'node_modules']);
const SKIP_FILES = /(\.test\.|\.d\.ts$|\.mock\.|\.fixture\.)/;
// Generated or data-only files
const GENERATED = new Set([
  'app/api/operations.ts',
  'app/api/reflection.tsx',
  'app/api/schema.d.ts',
]);

function empty() {
  return Object.fromEntries(METRICS.map((metric) => [metric, 0]));
}

/** Counts the debt of one source file. */
function countSource(code, fileName = 'file.tsx') {
  const counts = empty();
  const kind = fileName.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, kind);

  const hasOnPress = (attributes) =>
    attributes.properties.some(
      (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'onPress'
    );
  const isTextLike = (text) => /[\p{L}\p{N}]/u.test(text);

  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      if (/^react-native-paper(\/|$)/.test(node.moduleSpecifier.text)) counts.paperImports += 1;
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      // The module specifier of an import is not a colour
      if (COLOUR.test(node.text) && !ts.isImportDeclaration(node.parent))
        counts.colourLiterals += 1;
      if (
        ts.isJsxAttribute(node.parent) &&
        TEXT_PROPS.has(node.parent.name.getText()) &&
        isTextLike(node.text)
      ) {
        counts.literalStrings += 1;
      }
    } else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (RAW_TOUCHABLE.has(node.tagName.getText()) && hasOnPress(node.attributes))
        counts.rawTouchables += 1;
    } else if (ts.isPropertyAssignment(node)) {
      const name =
        ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : '';
      if (name === 'fontSize' && ts.isNumericLiteral(node.initializer))
        counts.numericFontSizes += 1;
    } else if (ts.isJsxText(node)) {
      if (isTextLike(node.text)) counts.literalStrings += 1;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return counts;
}

function* walk(dir, root) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full).split(path.sep).join('/');
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(full, root);
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !SKIP_FILES.test(entry.name) &&
      !GENERATED.has(relative)
    ) {
      yield { full, relative };
    }
  }
}

/** The directory a file is counted under: `app/<dir>`, and `app/screens/<area>/<dir>` for screens. */
function directoryOf(relative) {
  const parts = relative.split('/');
  const depth = parts[1] === 'screens' ? 4 : 2;
  return parts.length > depth
    ? parts.slice(0, depth).join('/')
    : parts.slice(0, parts.length - 1).join('/') || 'app';
}

/** Counts the debt of every source file under `<root>/app`, per directory. */
function countTree(root, { skip = [] } = {}) {
  const directories = {};
  const total = empty();
  for (const { full, relative } of walk(path.join(root, 'app'), root)) {
    if (skip.some((glob) => relative.startsWith(glob))) continue;
    const counts = countSource(fs.readFileSync(full, 'utf8'), relative);
    const directory = directoryOf(relative);
    directories[directory] ||= empty();
    for (const metric of METRICS) {
      directories[directory][metric] += counts[metric];
      total[metric] += counts[metric];
    }
  }
  return { directories, total };
}

module.exports = { METRICS, LABELS, countSource, countTree, directoryOf };
