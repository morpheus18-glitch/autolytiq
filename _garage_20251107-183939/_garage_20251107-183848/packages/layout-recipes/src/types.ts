/**
 * Layout Recipe Types
 */

export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  guard?: string; // e.g. "deal.view", "fi.profit.view"
  children?: NavItem[];
}

export interface ComponentSlot {
  id: string;
  component: string; // Registry key, e.g. "DossierHeader"
  props?: Record<string, any>;
  guard?: string; // Required capability
  layout?: {
    col?: number;
    row?: number;
    span?: number;
  };
}

export interface Command {
  id: string;
  label: string;
  description?: string;
  action: string; // e.g. "/deals/new", "search:customers"
  guard?: string;
  keywords?: string[];
  icon?: string;
}

export interface LayoutRecipe {
  id: string;
  name: string;
  description?: string;
  version: string;
  nav: NavItem[];
  slots: Record<string, ComponentSlot[]>;
  commands?: Command[];
}
