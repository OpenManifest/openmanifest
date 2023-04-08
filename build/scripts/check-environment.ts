import eas from '../../eas.json';

// All environments must be declared in eas.json
const validEnvironments = Object.keys(eas.build);

// If EXPO_ENV is not set to a key defined in eas.json, exit with error
if (!validEnvironments.includes(process.env.EXPO_ENV || '')) {
  console.error(`EXPO_ENV=${process.env.EXPO_ENV || ''}. Valid environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

process.exit(0);
