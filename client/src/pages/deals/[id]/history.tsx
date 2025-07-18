import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  User, 
  FileText, 
  MessageSquare,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { Deal } from '@shared/schema';

interface DealHistoryTabProps {
  deal: Deal;
}

export default function DealHistoryTab({ deal }: DealHistoryTabProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Mock history data - in real app this would come from API
  const dealHistory = [
    {
      id: 1,
      timestamp: new Date(deal.createdAt).toISOString(),
      type: 'status_change',
      action: 'Deal Created',
      user: 'System',
      details: `Deal #${deal.dealNumber} created`,
      previousValue: null,
      newValue: 'open',
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'field_change',
      action: 'Sale Price Updated',
      user: 'Mike Johnson',
      details: 'Vehicle sale price modified',
      previousValue: '$32,500',
      newValue: deal.salePrice ? `$${deal.salePrice.toLocaleString()}` : null,
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      type: 'note',
      action: 'Note Added',
      user: 'Sarah Wilson',
      details: 'Customer requested extended warranty information. Provided quotes for 3-year and 5-year coverage options.',
      previousValue: null,
      newValue: null,
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'document',
      action: 'Document Generated',
      user: 'System',
      details: "Buyer's Order generated and sent to customer",
      previousValue: null,
      newValue: 'buyers_order.pdf',
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)} days ago`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'field_change':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'note':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'border-green-200 bg-green-50';
      case 'field_change':
        return 'border-blue-200 bg-blue-50';
      case 'note':
        return 'border-purple-200 bg-purple-50';
      case 'document':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    // In real app, this would call API to add note
    console.log('Adding note:', newNote);
    setNewNote('');
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-6">
      {/* Deal Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Deal Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Note Section */}
            <div className="border-b pb-4">
              {!isAddingNote ? (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNote(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a note about this deal..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-20"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote} size="sm">
                      Add Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Items */}
            <div className="space-y-4">
              {dealHistory.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                  {/* Timeline line */}
                  {index < dealHistory.length - 1 && (
                    <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  {/* Activity icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getActivityColor(item.type)}`}>
                    {getActivityIcon(item.type)}
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{item.action}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{getTimeAgo(item.timestamp)}</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{item.details}</p>
                      
                      {item.previousValue && item.newValue && (
                        <div className="mt-2 text-xs">
                          <span className="text-red-600">From: {item.previousValue}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">To: {item.newValue}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{item.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Changes Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Status Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Created</p>
              </div>
              
              <div className="flex-1 h-0.5 bg-blue-200"></div>
              
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full ${deal.status === 'pending' || deal.status === 'approved' || deal.status === 'finalized' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center mb-2`}>
                  {deal.status === 'pending' || deal.status === 'approved' || deal.status === 'finalized' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
              
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full ${deal.status === 'approved' || deal.status === 'finalized' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center mb-2`}>
                  {deal.status === 'approved' || deal.status === 'finalized' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600">Approved</p>
              </div>
              
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full ${deal.status === 'finalized' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center mb-2`}>
                  {deal.status === 'finalized' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600">Finalized</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {dealHistory.filter(h => h.type === 'field_change').length}
            </p>
            <p className="text-sm text-gray-600">Changes Made</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {dealHistory.filter(h => h.type === 'note').length}
            </p>
            <p className="text-sm text-gray-600">Notes Added</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {dealHistory.filter(h => h.type === 'document').length}
            </p>
            <p className="text-sm text-gray-600">Documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">
              {dealHistory.filter(h => h.type === 'status_change').length}
            </p>
            <p className="text-sm text-gray-600">Status Updates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}