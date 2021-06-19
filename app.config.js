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
        : "http://172.20.10.7:5000/graphql"
    },
  }
}