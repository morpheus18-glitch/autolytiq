/**
 * Seed Module Exports
 * Central export point for all seed functions and data
 */

// Configuration
export * from './config';

// Static Data
export { GL_ACCOUNTS } from './data/glAccounts';
export { DEFAULT_WORKFLOW_STAGES } from './data/workflowStages';

// Seeders
export { seedTenant } from './seeders/seedTenant';
export { seedUsers } from './seeders/seedUsers';
export { seedGLAccounts } from './seeders/seedGLAccounts';
export { seedLenders } from './seeders/seedLenders';
export { seedWorkflows } from './seeders/seedWorkflows';

// Additional seeders to be added:
// export { seedCustomers } from './seeders/seedCustomers';
// export { seedLeads } from './seeders/seedLeads';
// export { seedVehicles } from './seeders/seedVehicles';
// export { seedDeals } from './seeders/seedDeals';
// etc...
