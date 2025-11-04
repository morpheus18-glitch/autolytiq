import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Note interface with full audit trail
export interface Note {
  id: string;
  content: string;
  entityType: string; // 'lead', 'customer', 'deal', 'vehicle', 'visit', etc.
  entityId: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt?: string;
  updatedBy?: {
    id: string;
    name: string;
  };
  isEdited: boolean;
  isPinned: boolean;
  tags?: string[];
}

interface NotesPanelProps {
  entityType: string;
  entityId: string;
  title?: string;
  allowEdit?: boolean;
  allowDelete?: boolean;
  maxHeight?: string;
}

// Demo current user
const CURRENT_USER = {
  id: 'U001',
  name: 'Sarah Johnson',
  role: 'Sales Manager',
};

export default function NotesPanel({
  entityType,
  entityId,
  title = 'Notes',
  allowEdit = true,
  allowDelete = true,
  maxHeight = '500px',
}: NotesPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes', entityType, entityId],
    queryFn: async () => {
      // In production, this would be an API call
      // const response = await fetch(`/api/notes/${entityType}/${entityId}`);
      // return response.json();

      // Demo data from localStorage
      const stored = localStorage.getItem(`notes_${entityType}_${entityId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const note: Note = {
        id: `N${Date.now()}`,
        content,
        entityType,
        entityId,
        createdBy: CURRENT_USER,
        createdAt: new Date().toISOString(),
        isEdited: false,
        isPinned: false,
      };

      // Save to localStorage (in production, this would be an API call)
      const updated = [...notes, note];
      localStorage.setItem(`notes_${entityType}_${entityId}`, JSON.stringify(updated));

      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
      setNewNote('');
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const updated = notes.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            content,
            updatedAt: new Date().toISOString(),
            updatedBy: { id: CURRENT_USER.id, name: CURRENT_USER.name },
            isEdited: true,
          };
        }
        return note;
      });

      localStorage.setItem(`notes_${entityType}_${entityId}`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
      setEditingNoteId(null);
      setEditContent('');
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const updated = notes.filter((note) => note.id !== noteId);
      localStorage.setItem(`notes_${entityType}_${entityId}`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
    },
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote.trim());
    }
  };

  const handleUpdateNote = (noteId: string) => {
    if (editContent.trim()) {
      updateNoteMutation.mutate({ noteId, content: editContent.trim() });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this note?')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {notes.length}
        </Badge>
      </div>

      {/* Add Note Form */}
      <div className="mb-4">
        <textarea
          className="w-full p-3 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Add a note..."
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleAddNote();
            }
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">Cmd/Ctrl + Enter to send</span>
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!newNote.trim() || addNoteMutation.isPending}
            className="gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3" style={{ maxHeight, overflowY: 'auto' }}>
        {isLoading && (
          <div className="text-center py-8 text-sm text-muted-foreground">Loading notes...</div>
        )}

        {!isLoading && notes.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No notes yet. Add one to get started.
          </div>
        )}

        {notes
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
            >
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full p-2 bg-background border border-border rounded text-sm resize-none"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{note.createdBy.name}</p>
                        <p className="text-xs text-muted-foreground">{note.createdBy.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {allowEdit && (
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditContent(note.content);
                          }}
                          className="p-1 hover:bg-background rounded transition-colors"
                          title="Edit note"
                        >
                          <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                      {allowDelete && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-background rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground whitespace-pre-wrap mb-2">{note.content}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                    {note.isEdited && note.updatedAt && (
                      <span className="text-xs italic">
                        Edited {formatDate(note.updatedAt)}
                        {note.updatedBy && ` by ${note.updatedBy.name}`}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </Card>
  );
}
