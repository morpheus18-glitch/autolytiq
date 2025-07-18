import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  User, 
  Edit, 
  DollarSign, 
  Tag, 
  FileText, 
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface AuditLog {
  id?: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
  type?: 'price_change' | 'status_change' | 'note' | 'edit' | 'tag' | 'media' | 'other';
  oldValue?: string;
  newValue?: string;
}

interface AuditTimelineProps {
  logs: AuditLog[];
  onAddNote?: (note: string) => void;
  showAddNote?: boolean;
  collapsed?: boolean;
}

export default function AuditTimeline({ 
  logs, 
  onAddNote, 
  showAddNote = false,
  collapsed = false
}: AuditTimelineProps) {
  const [newNote, setNewNote] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [showAll, setShowAll] = useState(false);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'price_change':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'status_change':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'note':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'tag':
        return <Tag className="w-4 h-4 text-orange-600" />;
      case 'edit':
        return <Edit className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'price_change':
        return 'bg-green-50 border-green-200';
      case 'status_change':
        return 'bg-blue-50 border-blue-200';
      case 'note':
        return 'bg-purple-50 border-purple-200';
      case 'tag':
        return 'bg-orange-50 border-orange-200';
      case 'edit':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  const displayedLogs = showAll ? logs : logs.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Audit Timeline
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent>
          {showAddNote && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Add Note</h4>
              <div className="flex space-x-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this vehicle..."
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {displayedLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No audit history available</p>
              </div>
            ) : (
              displayedLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(log.type || 'other')}`}>
                    {getActionIcon(log.type || 'other')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      {log.type && (
                        <Badge variant="outline" className="text-xs">
                          {log.type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    
                    {log.details && (
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                    )}
                    
                    {(log.oldValue || log.newValue) && (
                      <div className="text-xs text-gray-500 mb-2">
                        {log.oldValue && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded mr-2">
                            Old: {log.oldValue}
                          </span>
                        )}
                        {log.newValue && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            New: {log.newValue}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{log.user}</span>
                      <span>•</span>
                      <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {logs.length > 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `Show ${logs.length - 5} More`}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}