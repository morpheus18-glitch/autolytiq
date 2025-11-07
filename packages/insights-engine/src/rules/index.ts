/**
 * Rules Index - Auto-registers all insight rules on import
 */

// Import all rules to trigger registration
import './deal-funding-risk.js';
import './recon-stalled.js';
import './title-delay-risk.js';
import './lead-revisit-opportunity.js';

// Re-export for explicit imports if needed
export * from './deal-funding-risk.js';
export * from './recon-stalled.js';
export * from './title-delay-risk.js';
export * from './lead-revisit-opportunity.js';
