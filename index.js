const debug = require('debug')('systemic-azure-metrics');
const appInsights = require('applicationinsights');
const { dummyClient } = require('./dummyClient');

module.exports = () => {
  // samplingPercentage, disableAppInsights, etc
  const setupConfig = (client) => (property, value) => {
    debug(`Setting up config: ${property} = ${value}`);
    client.config.property = value;
  };

  const setupTag = (client) => (property, value) => {
    debug(`Setting up context tag: ${property} = ${value}`);
    client.context.tags[property] = value;
  };

  const start = async ({ config }) => {
    const {
      key,
      internalLogging = true,
      liveMetrics = true,
      traceW3C = false,
      ignoreURI = ['/__/manifest'],
      insightsConfig = {},
      context: {
        tags = {}
      },
      autoCollect: {
        requests = true,
        performance = true,
        extendedPerformance = true,
        exceptions = true,
        dependencies = true,
        console = true
      }
    } = config;
    if (!key) throw new Error('No insights key has been provided!');

    const { disableAppInsights } = insightsConfig;

    // appInsights is NEVER 100% disabled unless we use this hack; eg:
    // - complains about wrong instrumentation keys
    // - creates correlationKeys POSTing to Azure endpoint
    // if you know of any better approach, please shout!
    if (disableAppInsights) {
      debug('appInsights disabled: returning dummy client');
      return dummyClient;
    }

    const requestURIFilter = (envelope) => {
      const { data: { baseType, baseData } } = envelope;

      if (baseType === 'RequestData') {
        const [, uri] = baseData.name.split(/[ ,]+/);
        const shouldIgnore = ignoreURI.some(ignored => ignored === uri);
        if (shouldIgnore) {
          debug(`Ignoring URI ${uri}`);
        }
        return !shouldIgnore;
      }
    };

    const distributedTracingMode = traceW3C
      ? appInsights.DistributedTracingModes.AI_AND_W3C
      : appInsights.DistributedTracingModes.AI;

    appInsights
      .setup(key)
      .setInternalLogging(internalLogging)
      .setAutoCollectRequests(requests)
      .setAutoCollectPerformance(performance, extendedPerformance)
      .setAutoCollectExceptions(exceptions)
      .setAutoCollectDependencies(dependencies)
      .setAutoCollectConsole(console, console)
      .setSendLiveMetrics(liveMetrics)
      .setDistributedTracingMode(distributedTracingMode)
      .start();

    const { defaultClient } = appInsights;

    const configureClient = setupConfig(defaultClient);
    Object.keys(insightsConfig).forEach((key) => configureClient(key, insightsConfig[key]));
    defaultClient.addTelemetryProcessor(requestURIFilter);

    const configureTag = setupTag(defaultClient);
    Object.keys(tags).forEach((key) => configureTag(key, tags[key]));

    return defaultClient;
  };

  return { start };
};
