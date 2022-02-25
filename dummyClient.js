const dummyClient = {
  trackEvent: () => {},
  trackException: () => {},
  trackMetric: () => {},
  trackTrace: () => {},
  trackDependency: () => {},
  trackRequest: () => {}
};

module.exports = { dummyClient };
