import Constants from 'expo-constants';

const config = Constants.manifest?.extra || Constants.manifest2?.extra?.expoClient?.extra;

export default config;
