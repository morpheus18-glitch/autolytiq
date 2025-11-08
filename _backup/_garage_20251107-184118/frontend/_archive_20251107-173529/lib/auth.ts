/**
 * Authentication token storage utilities
 * Handles JWT token persistence in localStorage
 */

const AUTH_TOKEN_KEY = 'authToken';

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Retrieve authentication token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Remove authentication token from localStorage
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Check if user has a stored authentication token
 */
export function hasAuthToken(): boolean {
  return getAuthToken() !== null;
}
