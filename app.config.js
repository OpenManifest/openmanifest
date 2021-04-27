export default ({config}) => {
  return {
    ...config,
    name: "Deezed",
    version: '1.0.0',
    slug: "Deezed",
    // All values in extra will be passed to your app.
    extra: {
      url: process.env.EXPO_ENV === 'production'
        ? "https://deezed.herokuapp.com/graphql"
        : "http://localhost:5000/graphql"
    },
  }
}