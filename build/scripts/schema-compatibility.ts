/* eslint-disable import/no-extraneous-dependencies */
import { globSync } from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';
import { encode } from 'base-64';
import fetch from 'isomorphic-fetch';
import URI from 'urijs';
import { getEndpoint, getEnvironment, APP_VERSION, APP_NAME } from '../constants';

interface IValidationError {
  path?: string[];
  nodes?: unknown[];
  message?: string;
  type_name?: string;
  field_name?: string;
}

interface IFileValidationResponse {
  id?: string;
  errors?: IValidationError[];
}
interface IValidationResponse {
  valid: boolean;
  error: string;
  data?: IFileValidationResponse[];
}
const EXCLUDE = [/schema\.graphql$/];
const GLOB_PATTERN = 'app/**/*.{gql,graphql}';

const root = join(__dirname, '..');
const environment = getEnvironment();
const endpoint = getEndpoint();
const validationUrl = new URI(endpoint).segment(['graphql', 'validate']);
const pathFromroot = (path: string) => join(root, path);

function createValidationJSON(filepath: string) {
  const contents = readFileSync(filepath);
  return {
    id: filepath.replace(root, '').replace(/^\//, ''),
    data: encode(contents.toString())
  };
}

function debug(...args: unknown[]) {
  const prefix = `${APP_NAME} v${APP_VERSION} (env: ${environment.toUpperCase()}): `;
  console.log(prefix, ...args);
}

async function main() {
  try {
    const graphqlFiles = globSync(pathFromroot(GLOB_PATTERN));

    debug(`Validating schema compatibility against environment ${environment} (${validationUrl})`);

    debug(`Found ${graphqlFiles.length || 0} graphql files to validate in ${GLOB_PATTERN}`);
    const data = graphqlFiles
      .map((path) => {
        if (EXCLUDE.some((regex) => regex.test(path))) return null;
        return createValidationJSON(path);
      })
      .filter(Boolean);

    debug(`Parsed ${data.length || 0} graphql files, skipped ${graphqlFiles.length - data.length}`);

    const response = await fetch(validationUrl.toString(), {
      method: 'POST',
      body: JSON.stringify({ data }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // If the server doesn't support schema validation yet, we just skip it,
    // because that means it hasn't been deployed to this environment yet
    if (response.status === 404) {
      debug(`Server at ${endpoint} does not support schema validation yet. Skipping...`);
      process.exit(0);
    } else if (response.status !== 200) {
      debug('Something went wrong? Response status was', response.status);
    }

    const json: IValidationResponse = await response.json();
    if (json.valid) {
      debug('Success!');
    } else {
      debug(`Schema is incompatible with the server at ${endpoint}`);
      json.data?.forEach(({ id: filename, errors }) => {
        debug(`In file ${filename}:`);
        errors?.forEach((error) => {
          console.error(JSON.stringify(error, null, 2));
        });
      });
      debug(`Validation failed`);
      process.exit(1);
    }
  } catch (e) {
    debug('Failed to parse response from server', e);
    process.exit(1);
  }
}

main();
