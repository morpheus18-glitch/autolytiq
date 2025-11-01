/**
 * AppShell Layout Component
 * Main application layout with sidebar, topbar, and content area
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  className?: string;
}

export function AppShell({ children, sidebar, topbar, className }: AppShellProps) {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-[var(--semantic-surface-base)]', className)}>
      {/* Sidebar */}
      {sidebar && (
        <aside className="flex-shrink-0 w-64 border-r border-[var(--semantic-border-base)] overflow-y-auto">
          {sidebar}
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        {topbar && (
          <header className="flex-shrink-0 h-16 border-b border-[var(--semantic-border-base)]">
            {topbar}
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn('h-full bg-[var(--semantic-surface-elevated)] p-4', className)}>
      {children}
    </div>
  );
}

export interface TopbarProps {
  children: React.ReactNode;
  className?: string;
}

export function Topbar({ children, className }: TopbarProps) {
  return (
    <div className={cn('h-full flex items-center px-6 bg-[var(--semantic-surface-elevated)]', className)}>
      {children}
    </div>
  );
}

export interface SidebarNavProps {
  items: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            item.active
              ? 'bg-[var(--semantic-accent-primarySubtle)] text-[var(--semantic-accent-primary)]'
              : 'text-[var(--semantic-text-secondary)] hover:bg-[var(--semantic-surface-subtle)] hover:text-[var(--semantic-text-primary)]'
          )}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
