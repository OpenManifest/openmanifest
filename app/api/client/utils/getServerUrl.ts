import config from 'app/constants/expo';

export function getServerUrl(): string {
  if (!config?.url) {
    throw new Error('No server url found in config');
  }
  console.debug({ URL: config?.url });
  return config?.url;
}
