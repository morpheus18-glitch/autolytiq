export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (typeof window !== 'undefined' ? '' : 'http://localhost:5000');

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  settings: `${API_BASE_URL}/api/settings`,
  deals: `${API_BASE_URL}/api/deals`,
  customers: `${API_BASE_URL}/api/customers`,
  inventory: `${API_BASE_URL}/api/inventory`,
  accounting: `${API_BASE_URL}/api/accounting`,
  analytics: `${API_BASE_URL}/api/analytics`,
  ml: `${API_BASE_URL}/api/ml`,
  superAdmin: `${API_BASE_URL}/api/superadmin`,
};
