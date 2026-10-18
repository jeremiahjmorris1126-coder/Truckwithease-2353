// Injects secrets from the environment so they are never committed.
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    config: { googleMapsApiKey: process.env.GOOGLE_MAPS_MOBILE_API_KEY },
  },
  android: {
    ...config.android,
    config: {
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_MOBILE_API_KEY },
    },
  },
});
