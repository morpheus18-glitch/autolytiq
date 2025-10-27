declare module 'js-yaml' {
  export interface LoadOptions {
    schema?: unknown;
    json?: boolean;
    onWarning?: (warning: unknown) => void;
  }

  export function load(content: string, options?: LoadOptions): unknown;
}
