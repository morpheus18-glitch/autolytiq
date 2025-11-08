import * as React from 'react';

/**
 * FeatureFlag component
 * Conditionally renders children based on feature flags
 */

type FeatureFlags = Record<string, boolean>;

interface FeatureFlagContextValue {
  flags: FeatureFlags;
  isEnabled: (flag: string) => boolean;
  enable: (flag: string) => void;
  disable: (flag: string) => void;
  toggle: (flag: string) => void;
}

const FeatureFlagContext = React.createContext<FeatureFlagContextValue | undefined>(
  undefined
);

/**
 * FeatureFlagProvider component
 * Provides feature flag context to children
 */
export interface FeatureFlagProviderProps {
  children: React.ReactNode;
  flags?: FeatureFlags;
  fallback?: React.ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  flags: initialFlags = {},
  fallback,
}) => {
  const [flags, setFlags] = React.useState<FeatureFlags>(initialFlags);

  const isEnabled = React.useCallback(
    (flag: string): boolean => {
      return flags[flag] === true;
    },
    [flags]
  );

  const enable = React.useCallback((flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: true }));
  }, []);

  const disable = React.useCallback((flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: false }));
  }, []);

  const toggle = React.useCallback((flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const value: FeatureFlagContextValue = {
    flags,
    isEnabled,
    enable,
    disable,
    toggle,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

/**
 * useFeatureFlags hook
 * Access feature flags from context
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = React.useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}

/**
 * useFeatureFlag hook
 * Check if a specific feature is enabled
 */
export function useFeatureFlag(flag: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}

/**
 * FeatureFlag component
 * Renders children only if feature is enabled
 */
export interface FeatureFlagProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  children,
  fallback = null,
}) => {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * FeatureFlagSwitch component
 * Renders different children based on feature flag state
 */
export interface FeatureFlagSwitchProps {
  flag: string;
  on: React.ReactNode;
  off: React.ReactNode;
}

export const FeatureFlagSwitch: React.FC<FeatureFlagSwitchProps> = ({ flag, on, off }) => {
  const isEnabled = useFeatureFlag(flag);

  return <>{isEnabled ? on : off}</>;
};

/**
 * withFeatureFlag HOC
 * Wraps a component with feature flag check
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flag: string,
  fallback?: React.ReactNode
) {
  const Wrapped: React.FC<P> = (props) => {
    const isEnabled = useFeatureFlag(flag);

    if (!isEnabled) {
      return <>{fallback}</>;
    }

    return <Component {...props} />;
  };

  Wrapped.displayName = `withFeatureFlag(${Component.displayName || Component.name})`;

  return Wrapped;
}

/**
 * MultiFeatureFlag component
 * Renders children only if ALL specified features are enabled
 */
export interface MultiFeatureFlagProps {
  flags: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = AND, false = OR
}

export const MultiFeatureFlag: React.FC<MultiFeatureFlagProps> = ({
  flags,
  children,
  fallback = null,
  requireAll = true,
}) => {
  const { isEnabled } = useFeatureFlags();

  const shouldRender = requireAll
    ? flags.every((flag) => isEnabled(flag))
    : flags.some((flag) => isEnabled(flag));

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
