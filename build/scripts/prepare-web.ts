// Prepare the web build
import { lstatSync, existsSync, rmSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { APP_NAME, BUILD_NUMBER, BUILD_VERSION, getEndpoint, getEnvironment, getFrontend } from '../constants';
import URI from 'urijs';
import { globSync } from 'glob';
import { publish } from 'gh-pages';

const ROOT_DIR = join(__dirname, '..', '..');
const WEB_BUILD_DIRECTORY = join(ROOT_DIR, 'build', 'web');
const WEB_TEMPLATE_FILES = join(ROOT_DIR, 'web');
const DEFAULT_EXPO_WEB_OUTPUT = join(ROOT_DIR, 'web-build');

// Delete the current build directory
if (existsSync(WEB_BUILD_DIRECTORY)) {
  console.log('Removing previous web build');
  rmSync(WEB_BUILD_DIRECTORY, { recursive: true });
}

// Create a new build directory
mkdirSync(WEB_BUILD_DIRECTORY, { recursive: true });
console.log('Created build directory');

// Write the domain name into CNAME file for github pages
const domain = new URI(getFrontend()).hostname();
const cnameFile = join(WEB_BUILD_DIRECTORY, 'CNAME');
console.log('Writing CNAME ', domain);
writeFileSync(cnameFile, domain);

// Copy the index.html file into the build directory
// Copy the index file as a 404 file for react-navigation
// routes to work correctly on github pages

globSync(join(WEB_TEMPLATE_FILES, '**', '*'), { dot: true }).forEach((file) => {
  const relativePath = file.replace(WEB_TEMPLATE_FILES, '');
  const output = join(WEB_BUILD_DIRECTORY, relativePath);

  if (lstatSync(file).isDirectory()) {
    mkdirSync(output, { recursive: true });
    return;
  }
  copyFileSync(file, output);
});

// Check if expo has built the web app, and if not, throw
if (!existsSync(DEFAULT_EXPO_WEB_OUTPUT) || globSync(join(DEFAULT_EXPO_WEB_OUTPUT, '**', '*')).length === 0) {
  throw new Error(`No files found in ${DEFAULT_EXPO_WEB_OUTPUT}. Did you run expo build:web?`);
}

if (['production', 'staging'].includes(getEnvironment())) {
  console.log('Publishing web build to github pages');
  publish(WEB_BUILD_DIRECTORY, {
    repo: getEnvironment() === 'production' ? 'https://github.com/OpenManifest/openmanifest-web.git' : 'https://github.com/OpenManifest/openmanifest-web.git',
    dotfiles: true,
  })
}