import { TelemetryClient } from 'applicationinsights';
import type { Component } from 'systemic';

interface Config {
  key: string;
  internalLogging?: boolean;
  liveMetrics?: boolean;
  traceW3C?: boolean;
  ignoreURI?: string[];
  insightsConfig?: {
    disableAppInsights?: boolean;
  } & Partial<TelemetryClient['config']>;
  autoDependencyCorrelation?: boolean;
  context?: {
    tags?: Record<string, string>;
  },
  autoCollect?: {
    requests?: boolean;
    performance?: boolean;
    extendedPerformance?: boolean;
    exceptions?: boolean;
    dependencies?: boolean;
    console?: boolean;
  }
}

declare function createMetrics(): Component<TelemetryClient, { config: Config }>;

export default createMetrics;