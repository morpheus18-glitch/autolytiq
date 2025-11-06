import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, Filter } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { Input } from './Input.js';

export interface SearchSuggestion {
  text: string;
  category: 'entity' | 'filter' | 'recent' | 'popular';
  icon?: string;
  count?: number;
  type?: string;
}

export interface IntelligentSearchProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularSearches?: string[];
  shortcuts?: Array<{ label: string; query: string }>;
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  className?: string;
}

export function IntelligentSearch({
  placeholder = 'Search customers, deals, vehicles... or ask a question',
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  shortcuts = [],
  onSearch,
  onSuggestionClick,
  className,
}: IntelligentSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const allItems = [...suggestions, ...recentSearches.map(r => ({ text: r, category: 'recent' as const }))];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && allItems[highlightedIndex]) {
        handleSelectSuggestion(allItems[highlightedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion | { text: string; category: string }) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    if (onSuggestionClick && 'icon' in suggestion) {
      onSuggestionClick(suggestion);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          leftIcon={<Search className="h-4 w-4" />}
          inputSize="sm"
          className="w-full pr-16 h-9"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-text-tertiary bg-surface-muted rounded border border-border-base">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {/* Dropdown */}
      {isOpen && (query.length > 0 || recentSearches.length > 0 || shortcuts.length > 0) && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 w-full min-w-[400px] max-h-96 overflow-y-auto rounded-lg border border-border-base bg-surface-elevated shadow-lg z-20"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-xs font-medium text-text-tertiary">Suggestions</div>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={cn(
                      'w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-surface-muted',
                      highlightedIndex === idx && 'bg-surface-muted'
                    )}
                  >
                    {suggestion.category === 'filter' && <Filter className="h-4 w-4 text-text-tertiary" />}
                    <span className="flex-1 text-sm text-text-primary">{suggestion.text}</span>
                    {suggestion.count && (
                      <span className="text-xs text-text-tertiary">{suggestion.count} results</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && query.length === 0 && (
              <div className="py-2 border-t border-border-base">
                <div className="px-3 py-1 text-xs font-medium text-text-tertiary">Recent</div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion({ text: search, category: 'recent' })}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-surface-muted"
                  >
                    <Clock className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-primary">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && query.length === 0 && (
              <div className="py-2 border-t border-border-base">
                <div className="px-3 py-1 text-xs font-medium text-text-tertiary">Popular</div>
                {popularSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion({ text: search, category: 'popular' })}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-surface-muted"
                  >
                    <TrendingUp className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-primary">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Shortcuts */}
            {shortcuts.length > 0 && query.length === 0 && (
              <div className="py-2 border-t border-border-base">
                <div className="px-3 py-1 text-xs font-medium text-text-tertiary">Shortcuts</div>
                {shortcuts.map((shortcut, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion({ text: shortcut.query, category: 'entity' })}
                    className="w-full px-3 py-2 text-left hover:bg-surface-muted"
                  >
                    <span className="text-sm text-text-primary">{shortcut.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

IntelligentSearch.displayName = 'IntelligentSearch';
