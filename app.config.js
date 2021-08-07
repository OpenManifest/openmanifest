export default ({config}) => {
  return {
    ...config,
    name: "OpenManifest",
    version: '1.0.0',
    slug: "openmanifest",
    
    // All values in extra will be passed to your app.
    extra: {
      url: process.env.EXPO_ENV === 'production'
        ? "https://openmanifest.org/graphql"
        : "https://openmanifest.org/graphql"
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios.config,
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS
      },
    },
  }
}