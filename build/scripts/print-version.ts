import { APP_VERSION, BUILD_VERSION } from '../constants';
import { getArguments } from './utils/argv';

const args = getArguments({
  app: {
    description: 'Print app version used on AppStore',
    default: false
  },
  build: {
    description: 'Print build version used in TestFlight',
    default: true
  },
  cacheKey: {
    description: 'Print app version used on AppStore as a cache key',
    default: false
  }
});

if (args.cacheKey) {
  console.log(`VERSION_${APP_VERSION.replace(/\./g, '_')}`);
} else if (args.app) {
  console.log(APP_VERSION);
} else if (args.build) {
  console.log(BUILD_VERSION);
}
