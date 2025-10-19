export const DEPLOY_MODE = (process.env.DEPLOY_MODE ?? 'replit') as 'replit' | 'self_hosted';
export const FEATURE_DOCKER = DEPLOY_MODE === 'self_hosted';
export const FEATURE_K8S = DEPLOY_MODE === 'self_hosted';
export const FEATURE_MONITOR = true;
export const FEATURE_CLICKHOUSE = Boolean(process.env.CLICKHOUSE_HOST);
export const FEATURE_FLOWER = DEPLOY_MODE === 'self_hosted';
