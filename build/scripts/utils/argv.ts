import camelize from 'lodash/camelCase';
import kebabCase from 'lodash/kebabCase';

interface ArgumentDescriptor<T = unknown> {
  // Optional flag name, dash-separated
  key?: string;
  // Description shown when --help is passed
  description: string;

  // Default value, if any
  default?: T;
}

function isFlag(args: string[], index = 0): boolean {
  return args?.[index].startsWith('--');
}

function isBooleanFlag(args: string[], index = 0): boolean {
  // If it's not a flag, it's not a boolean flag either
  if (!isFlag(args, index)) return false;

  // If the next argument doesn't exist, OR the next argument is another
  // flag, then this is a boolean flag and will have the value 'true'
  if (!args?.[index + 1] || isFlag(args, index + 1)) return true;
  return false;
}

// Formats --argument to `argument` and `--argument-name` to `argumentName`
function formatName(key?: string): string {
  return camelize((key || '').replace(/^-+/, '').replaceAll(/-/g, '_'));
}

// Creates a new object with a camelized key and the argument value
function createParser(args: string[]) {
  return (key: string, index: number) => {
    if (isBooleanFlag(args, index)) {
      return { [formatName(key)]: true };
    }

    if (isFlag(args, index)) {
      return { [formatName(key)]: args[index + 1] };
    }

    return {};
  };
}

// Super simple argument parser without requiring a whole framework
// just to parse some basic argv values
export function getArguments<T extends { [key: string]: ArgumentDescriptor }>(
  config?: T
): { [K in keyof T]: T[K]['default'] } {
  // Copy the arguments into a new array
  const args = process.argv
    .slice(2)
    .map((str) => str.split(/=/))
    .flat();

  // Print help if --help is passed
  if (args.includes('--help')) {
    console.log('Usage: yarn <script> [options]');
    console.log('');
    console.log('Options:');
    Object.entries(config || {}).forEach(([key, descriptor]) => {
      const flagName = kebabCase(descriptor?.key || key);
      const { description = '', default: defaultValue } = descriptor;
      console.log(`  --${flagName}  ${description}${defaultValue ? ` (default: ${descriptor.default})` : ''}`);
    });
    process.exit(0);
  }

  // Create a parser for these arguments
  const parse = createParser(args);

  // Create default values
  const defaults = Object.assign(
    {},
    ...Object.entries(config || {}).map(([key, descriptor]) => {
      if (!descriptor.default) return {};
      return {
        [descriptor?.key || key]: descriptor.default
      };
    })
  );

  // Valid keys are either the keys in the config, or any defined
  // key in the descriptor
  const validKeys = Object.entries(config || {}).map(([key, descriptor]) => descriptor?.key || key);

  const parsed = Object.assign(defaults || {}, ...args.map(parse));

  Object.entries(parsed).forEach(([key, value]) => {
    const descriptor =
      config?.[key] || Object.entries(config || {}).find(([, desc]) => formatName(desc?.key) === key)?.[1];

    if (!descriptor) {
      throw new Error(`${key} is not a valid argument. Valid arguments: ${validKeys.join(', ')}`);
    }

    if (typeof descriptor.default === 'number' && typeof value !== 'number') {
      try {
        parsed[key] = parseInt(value as string, 10);
      } catch {
        throw new Error(`${key} must be a number`);
      }
    }
    if (typeof descriptor.default === 'boolean' && typeof value !== 'boolean') {
      throw new Error(`${key} is a boolean flag, and should not receive a value`);
    }
    if (typeof descriptor.default === 'string' && typeof value !== 'string') {
      parsed[key] = `${value}`;
    }
  });

  return parsed;
}
