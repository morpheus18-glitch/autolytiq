/**
 * Card Resolver
 *
 * Filters and resolves dashboard cards based on:
 * - User roles
 * - User permissions
 * - Feature flags
 * - Context availability
 *
 * This is where RBAC enforcement happens at the card level.
 */

import type { CardDef } from '@repo/shared';
import type { User, Role, Permission } from '@repo/ui';
import { getAllCards, getCardDef } from './cardRegistry.js';

/**
 * Resolve context for cards
 */
export interface CardContext {
  /**
   * Current user
   */
  user: User;
  /**
   * Feature flags enabled for this tenant/user
   */
  featureFlags?: string[];
  /**
   * Context entity IDs (for context-specific cards)
   */
  entityContext?: {
    dealId?: string;
    customerId?: string;
    vehicleId?: string;
    storeId?: string;
    tenantId?: string;
  };
}

/**
 * Check if user has required permissions
 *
 * @param user User object with permissions
 * @param requiredPermissions Array of required permission strings
 * @returns true if user has all required permissions
 */
function hasRequiredPermissions(user: User, requiredPermissions: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No permissions required
  }

  // If user.permissions is an array of Permission objects
  if (user.permissions && Array.isArray(user.permissions)) {
    const userPermissionStrings = user.permissions.map((p) =>
      typeof p === 'string' ? p : (p as Permission).toString()
    );
    return requiredPermissions.every((perm) => userPermissionStrings.includes(perm));
  }

  return false;
}

/**
 * Check if user has required roles
 *
 * @param user User object with roles
 * @param requiredRoles Array of required role strings
 * @returns true if user has any of the required roles
 */
function hasRequiredRoles(user: User, requiredRoles?: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No roles required
  }

  // If user.roles is an array of Role objects or strings
  if (user.roles && Array.isArray(user.roles)) {
    const userRoleStrings = user.roles.map((r) =>
      typeof r === 'string' ? r : (r as Role).toString()
    );
    return requiredRoles.some((role) => userRoleStrings.includes(role));
  }

  return false;
}

/**
 * Check if feature flags are satisfied
 *
 * @param cardFlags Feature flags required by card
 * @param userFlags Feature flags enabled for user
 * @returns true if all required flags are enabled
 */
function hasRequiredFeatureFlags(cardFlags?: string[], userFlags?: string[]): boolean {
  if (!cardFlags || cardFlags.length === 0) {
    return true; // No feature flags required
  }

  if (!userFlags || userFlags.length === 0) {
    return false; // Card requires flags, but user has none
  }

  return cardFlags.every((flag) => userFlags.includes(flag));
}

/**
 * Check if context is satisfied
 *
 * @param cardContext Context required by card
 * @param entityContext Entity context available
 * @returns true if context is satisfied
 */
function hasRequiredContext(
  cardContext: CardDef['context'],
  entityContext?: CardContext['entityContext']
): boolean {
  if (cardContext === 'none') {
    return true; // No context required
  }

  if (!entityContext) {
    return false; // Card requires context, but none provided
  }

  // Check if required context entity is present
  switch (cardContext) {
    case 'deal':
      return !!entityContext.dealId;
    case 'customer':
      return !!entityContext.customerId;
    case 'vehicle':
      return !!entityContext.vehicleId;
    case 'store':
      return !!entityContext.storeId;
    case 'tenant':
      return !!entityContext.tenantId;
    default:
      return false;
  }
}

/**
 * Resolve cards for a user based on permissions, roles, and feature flags
 *
 * @param context Card resolution context (user, flags, entity context)
 * @param cardKeys Optional array of specific card keys to resolve (default: all cards)
 * @returns Array of CardDef that user can access
 */
export function resolveCards(context: CardContext, cardKeys?: string[]): CardDef[] {
  const { user, featureFlags, entityContext } = context;

  // Get cards to resolve
  const cardsToResolve = cardKeys
    ? cardKeys.map((key) => getCardDef(key)).filter((card): card is CardDef => card !== undefined)
    : getAllCards();

  // Filter cards based on permissions, roles, feature flags, and context
  return cardsToResolve.filter((card) => {
    // Check permissions (required)
    if (!hasRequiredPermissions(user, card.requiredPermissions)) {
      return false;
    }

    // Check roles (optional - if specified, must match)
    if (card.roles && card.roles.length > 0) {
      if (!hasRequiredRoles(user, card.roles)) {
        return false;
      }
    }

    // Check feature flags (optional)
    if (!hasRequiredFeatureFlags(card.featureFlags, featureFlags)) {
      return false;
    }

    // Check context (required if card specifies context)
    if (!hasRequiredContext(card.context, entityContext)) {
      return false;
    }

    return true;
  });
}

/**
 * Resolve a single card by key
 *
 * @param cardKey Card key to resolve
 * @param context Card resolution context
 * @returns CardDef if user can access, undefined otherwise
 */
export function resolveCard(cardKey: string, context: CardContext): CardDef | undefined {
  const resolved = resolveCards(context, [cardKey]);
  return resolved.length > 0 ? resolved[0] : undefined;
}

/**
 * Check if a user can access a specific card
 *
 * @param cardKey Card key to check
 * @param context Card resolution context
 * @returns true if user can access the card
 */
export function canAccessCard(cardKey: string, context: CardContext): boolean {
  return resolveCard(cardKey, context) !== undefined;
}

/**
 * Get cards by tag
 *
 * @param tag Tag to filter by
 * @param context Card resolution context
 * @returns Array of CardDef matching the tag and user permissions
 */
export function getCardsByTag(tag: string, context: CardContext): CardDef[] {
  const allResolved = resolveCards(context);
  return allResolved.filter((card) => card.tags && card.tags.includes(tag));
}

/**
 * Get cards by priority
 *
 * @param priority Priority level to filter by
 * @param context Card resolution context
 * @returns Array of CardDef matching the priority and user permissions
 */
export function getCardsByPriority(
  priority: CardDef['priority'],
  context: CardContext
): CardDef[] {
  const allResolved = resolveCards(context);
  return allResolved.filter((card) => card.priority === priority);
}

/**
 * Get cards sorted by priority (critical → high → normal → low)
 *
 * @param context Card resolution context
 * @returns Array of CardDef sorted by priority
 */
export function getCardsSortedByPriority(context: CardContext): CardDef[] {
  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
  };

  const allResolved = resolveCards(context);
  return allResolved.sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'normal'];
    const bPriority = priorityOrder[b.priority || 'normal'];
    return aPriority - bPriority;
  });
}
