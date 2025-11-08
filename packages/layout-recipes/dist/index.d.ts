/**
 * Layout Recipe Types
 */
interface NavItem {
    id: string;
    label: string;
    icon?: string;
    path?: string;
    guard?: string;
    children?: NavItem[];
}
interface ComponentSlot {
    id: string;
    component: string;
    props?: Record<string, any>;
    guard?: string;
    layout?: {
        col?: number;
        row?: number;
        span?: number;
    };
}
interface Command {
    id: string;
    label: string;
    description?: string;
    action: string;
    guard?: string;
    keywords?: string[];
    icon?: string;
}
interface LayoutRecipe {
    id: string;
    name: string;
    description?: string;
    version: string;
    nav: NavItem[];
    slots: Record<string, ComponentSlot[]>;
    commands?: Command[];
}

/**
 * Layout Recipes - Dashboard Layout Configurations
 *
 * Provides predefined layouts for different user roles and workflows.
 */

declare const layoutRecipes: {};

export { type Command, type ComponentSlot, type LayoutRecipe, type NavItem, layoutRecipes };
