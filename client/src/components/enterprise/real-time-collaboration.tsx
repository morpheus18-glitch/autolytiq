import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Send, 
  Plus,
  Filter,
  Archive,
  Star,
  Paperclip
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface RealTimeCollaborationProps {
  entityType: string;
  entityId: number;
}

export function RealTimeCollaboration({ entityType, entityId }: RealTimeCollaborationProps) {
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ['/api/collaboration/threads', entityType, entityId, filter],
    enabled: !!entityType && !!entityId,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/collaboration/messages', selectedThread],
    enabled: !!selectedThread,
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const createThreadMutation = useMutation({
    mutationFn: async ({ title, priority, assignedTo }: { title: string; priority: string; assignedTo?: string }) => {
      return apiRequest('/api/collaboration/threads', 'POST', {
        entityType,
        entityId,
        title,
        priority,
        assignedTo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/threads'] });
      setNewThreadTitle('');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, message, messageType, mentions }: { 
      threadId: number; 
      message: string; 
      messageType: string;
      mentions?: string[];
    }) => {
      return apiRequest('/api/collaboration/messages', 'POST', {
        threadId,
        message,
        messageType,
        mentions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/messages'] });
      setNewMessage('');
    },
  });

  const updateThreadMutation = useMutation({
    mutationFn: async ({ threadId, updates }: { threadId: number; updates: any }) => {
      return apiRequest(`/api/collaboration/threads/${threadId}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/threads'] });
    },
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedThread) {
        queryClient.invalidateQueries({ queryKey: ['/api/collaboration/messages', selectedThread] });
      }
    }, 10000); // Poll every 10 seconds for demo

    return () => clearInterval(interval);
  }, [selectedThread, queryClient]);

  const handleCreateThread = () => {
    if (newThreadTitle.trim()) {
      createThreadMutation.mutate({
        title: newThreadTitle,
        priority: 'normal',
      });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedThread) {
      sendMessageMutation.mutate({
        threadId: selectedThread,
        message: newMessage,
        messageType: 'comment',
      });
    }
  };

  const handleUpdateThreadStatus = (threadId: number, status: string) => {
    updateThreadMutation.mutate({
      threadId,
      updates: { status },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-500" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collaboration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Team Collaboration
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Threads</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setSelectedThread(null)}>
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Real-time collaboration and communication for {entityType} #{entityId}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discussion Threads</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {threads?.map((thread: any) => (
                    <div
                      key={thread.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedThread === thread.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      } border`}
                      onClick={() => setSelectedThread(thread.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium line-clamp-2">{thread.title}</h4>
                        {getStatusIcon(thread.status)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-white text-xs ${getPriorityColor(thread.priority)}`}
                          >
                            {thread.priority}
                          </Badge>
                          {thread.assignedTo && (
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                {users?.find((u: any) => u.id === thread.assignedTo)?.name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(thread.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* New Thread Form */}
                  {selectedThread === null && (
                    <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
                      <Input
                        placeholder="Thread title..."
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        className="mb-2"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleCreateThread}
                        disabled={!newThreadTitle.trim() || createThreadMutation.isPending}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Thread
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {threads?.find((t: any) => t.id === selectedThread)?.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateThreadStatus(selectedThread, 'resolved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateThreadStatus(selectedThread, 'archived')}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-96">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 pr-4">
                    {messages?.map((message: any) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {users?.find((u: any) => u.id === message.userId)?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">
                              {users?.find((u: any) => u.id === message.userId)?.name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                            {message.messageType !== 'comment' && (
                              <Badge variant="outline" className="text-xs">
                                {message.messageType}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-sm">{message.message}</p>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="flex items-center mt-2 space-x-2">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {message.attachments.length} attachment(s)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-96">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Select a thread to view messages
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Choose an existing conversation or create a new thread to start collaborating
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                createThreadMutation.mutate({
                  title: `Urgent: Review ${entityType} #${entityId}`,
                  priority: 'urgent',
                });
              }}
            >
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              Create Urgent Thread
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                createThreadMutation.mutate({
                  title: `Follow-up needed for ${entityType} #${entityId}`,
                  priority: 'normal',
                });
              }}
            >
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              Schedule Follow-up
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                createThreadMutation.mutate({
                  title: `Manager approval required - ${entityType} #${entityId}`,
                  priority: 'high',
                });
              }}
            >
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Request Approval
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}