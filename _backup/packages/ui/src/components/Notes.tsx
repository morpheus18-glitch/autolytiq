/**
 * Notes Component - Context-Aware Note Taking
 *
 * Intelligently saves notes based on context:
 * - Customer/Showroom context → Attaches to customer timeline
 * - Appraisal context → Saves with current appraisal
 * - Deal context → Attaches to deal history
 * - Vehicle context → Saves with vehicle record
 *
 * Features:
 * - Auto-save with debounce
 * - Visual indicator of save destination
 * - Character count
 * - Timestamps
 * - History/timeline integration
 */

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';
import { Save, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Textarea } from './Textarea.js';
import { Badge } from './Badge.js';

export type NoteContext =
  | 'customer'           // Saves to customer timeline
  | 'showroom'           // Saves to customer timeline (showroom manager view)
  | 'appraisal'          // Saves with current appraisal
  | 'deal'               // Saves to deal history
  | 'vehicle'            // Saves with vehicle record
  | 'lead'               // Saves to lead timeline
  | 'service'            // Saves to service order
  | 'standalone';        // Generic note, specify entityType

export interface Note {
  id: string;
  content: string;
  context: NoteContext;
  entityId: string;        // Customer ID, Appraisal ID, etc.
  entityType?: string;     // For standalone context
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  isPrivate?: boolean;
  tags?: string[];
}

export interface NotesProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Context determines where the note is saved */
  context: NoteContext;

  /** ID of the entity this note belongs to (customerId, appraisalId, etc.) */
  entityId: string;

  /** For standalone context, specify the entity type */
  entityType?: string;

  /** Initial note value */
  value?: string;

  /** Callback when note is saved */
  onSave?: (note: Note) => void;

  /** Callback when note content changes */
  onChange?: (content: string) => void;

  /** Auto-save delay in milliseconds (default: 2000ms) */
  autoSaveDelay?: number;

  /** Show character count */
  showCharacterCount?: boolean;

  /** Maximum characters allowed */
  maxLength?: number;

  /** Show save status indicator */
  showSaveStatus?: boolean;

  /** Mark note as private (only visible to creator) */
  isPrivate?: boolean;

  /** User ID creating the note */
  userId?: string;

  /** User name creating the note */
  userName?: string;

  /** Additional tags for categorization */
  tags?: string[];

  /** Custom placeholder based on context */
  contextPlaceholder?: boolean;

  /** Height variant */
  height?: 'sm' | 'md' | 'lg' | 'xl';

  className?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const notesVariants = cva('w-full', {
  variants: {
    height: {
      sm: 'min-h-[100px]',
      md: 'min-h-[150px]',
      lg: 'min-h-[200px]',
      xl: 'min-h-[300px]',
    },
  },
  defaultVariants: {
    height: 'md',
  },
});

const CONTEXT_LABELS: Record<NoteContext, { label: string; icon: React.ReactNode; destination: string }> = {
  customer: {
    label: 'Customer Note',
    icon: <User className="h-3 w-3" />,
    destination: 'Saves to customer timeline',
  },
  showroom: {
    label: 'Showroom Note',
    icon: <User className="h-3 w-3" />,
    destination: 'Saves to customer timeline',
  },
  appraisal: {
    label: 'Appraisal Note',
    icon: <FileText className="h-3 w-3" />,
    destination: 'Saves with this appraisal',
  },
  deal: {
    label: 'Deal Note',
    icon: <FileText className="h-3 w-3" />,
    destination: 'Saves to deal history',
  },
  vehicle: {
    label: 'Vehicle Note',
    icon: <FileText className="h-3 w-3" />,
    destination: 'Saves with vehicle record',
  },
  lead: {
    label: 'Lead Note',
    icon: <User className="h-3 w-3" />,
    destination: 'Saves to lead timeline',
  },
  service: {
    label: 'Service Note',
    icon: <FileText className="h-3 w-3" />,
    destination: 'Saves to service order',
  },
  standalone: {
    label: 'Note',
    icon: <FileText className="h-3 w-3" />,
    destination: 'Saves to record',
  },
};

const CONTEXT_PLACEHOLDERS: Record<NoteContext, string> = {
  customer: 'Add a note about this customer... (e.g., "Prefers trucks", "Budget-conscious")',
  showroom: 'Add notes from showroom visit... (e.g., "Interested in F-150", "Test drove Camry")',
  appraisal: 'Add appraisal notes... (e.g., "Needs new tires", "Clean interior")',
  deal: 'Add notes about this deal... (e.g., "Customer wants to close by Friday")',
  vehicle: 'Add vehicle notes... (e.g., "Recent paint touch-up", "New battery installed")',
  lead: 'Add lead notes... (e.g., "Responded to Facebook ad", "Looking for SUV")',
  service: 'Add service notes... (e.g., "Customer mentioned brake noise")',
  standalone: 'Add a note...',
};

export const Notes = React.forwardRef<HTMLTextAreaElement, NotesProps>(
  (
    {
      context,
      entityId,
      entityType,
      value: initialValue = '',
      onSave,
      onChange,
      autoSaveDelay = 2000,
      showCharacterCount = true,
      maxLength = 5000,
      showSaveStatus = true,
      isPrivate = false,
      userId = 'current-user',
      userName = 'Current User',
      tags = [],
      contextPlaceholder = true,
      height = 'md',
      placeholder,
      className,
      ...props
    },
    ref
  ) => {
    const [content, setContent] = useState(initialValue);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Auto-save logic
    const saveNote = useCallback(async () => {
      if (!content.trim()) {
        setSaveStatus('idle');
        return;
      }

      setSaveStatus('saving');

      try {
        // TODO: Replace with actual API call
        const note: Note = {
          id: `note-${Date.now()}`,
          content: content.trim(),
          context,
          entityId,
          entityType,
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date().toISOString(),
          isPrivate,
          tags,
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Call the onSave callback
        onSave?.(note);

        setSaveStatus('saved');
        setLastSaved(new Date());

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save note:', error);
        setSaveStatus('error');
      }
    }, [content, context, entityId, entityType, userId, userName, isPrivate, tags, onSave]);

    // Debounced auto-save
    useEffect(() => {
      if (content !== initialValue) {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout
        saveTimeoutRef.current = setTimeout(() => {
          saveNote();
        }, autoSaveDelay);
      }

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [content, initialValue, autoSaveDelay, saveNote]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      onChange?.(newContent);
    };

    const contextInfo = CONTEXT_LABELS[context];
    const defaultPlaceholder = contextPlaceholder ? CONTEXT_PLACEHOLDERS[context] : 'Add a note...';

    return (
      <div className="space-y-2">
        {/* Header with context info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm" className="gap-1">
              {contextInfo.icon}
              {contextInfo.label}
            </Badge>
            <span className="text-xs text-text-tertiary">{contextInfo.destination}</span>
          </div>

          {/* Save status indicator */}
          {showSaveStatus && saveStatus !== 'idle' && (
            <div className="flex items-center gap-1.5 text-xs">
              {saveStatus === 'saving' && (
                <>
                  <Clock className="h-3 w-3 animate-spin text-text-tertiary" />
                  <span className="text-text-tertiary">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle className="h-3 w-3 text-status-success" />
                  <span className="text-status-success">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="h-3 w-3 text-status-error" />
                  <span className="text-status-error">Failed to save</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Textarea */}
        <Textarea
          ref={ref}
          value={content}
          onChange={handleChange}
          placeholder={placeholder || defaultPlaceholder}
          maxLength={maxLength}
          className={cn(notesVariants({ height }), className)}
          {...props}
        />

        {/* Footer with character count and last saved */}
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <div className="flex items-center gap-3">
            {showCharacterCount && (
              <span>
                {content.length} / {maxLength} characters
              </span>
            )}
            {lastSaved && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          {isPrivate && (
            <Badge variant="outline" size="sm">
              Private
            </Badge>
          )}
        </div>
      </div>
    );
  }
);

Notes.displayName = 'Notes';

export { notesVariants };
