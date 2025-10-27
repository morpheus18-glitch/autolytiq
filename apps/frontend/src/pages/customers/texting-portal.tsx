import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TextMessage {
  id: number;
  customer_id: number;
  sender_id: string;
  direction: 'inbound' | 'outbound';
  phone_number: string;
  message_body: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  message_type: 'sms' | 'mms';
  attachments?: any;
  thread_id?: string;
  cost?: number;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

interface MessageTemplate {
  id: number;
  name: string;
  category: string;
  subject?: string;
  body: string;
  variables?: any;
  is_active: boolean;
}

interface Customer {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  cellPhone?: string;
  email?: string;
}

export default function TextingPortal() {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || '0');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Fetch customer data
  const { data: customer } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
  });

  // Fetch text messages for this customer
  const { data: messages = [], isLoading: messagesLoading } = useQuery<TextMessage[]>({
    queryKey: ['/api/customers', customerId, 'messages'],
    enabled: !!customerId,
  });

  // Fetch message templates
  const { data: templates = [] } = useQuery<MessageTemplate[]>({
    queryKey: ['/api/message-templates'],
  });

  // Set default phone number when customer data loads
  useEffect(() => {
    if (customer && !phoneNumber) {
      setPhoneNumber(customer.cellPhone || customer.phone || '');
    }
  }, [customer, phoneNumber]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      direction: string;
      phoneNumber: string;
      messageBody: string;
      messageType: string;
      senderId?: string;
    }) => {
      return await apiRequest(`/api/customers/${customerId}/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'messages'] });
      setNewMessage('');
      toast({
        title: 'Message Sent',
        description: 'Text message has been sent successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message.',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both phone number and message.',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate({
      direction: 'outbound',
      phoneNumber: phoneNumber.trim(),
      messageBody: newMessage.trim(),
      messageType: 'sms',
      senderId: 'current-user', // In real app, get from auth context
    });
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    let messageBody = template.body;
    
    // Replace common variables
    if (customer) {
      messageBody = messageBody.replace(/{customerName}/g, customer.name || `${customer.firstName} ${customer.lastName}`.trim());
      messageBody = messageBody.replace(/{firstName}/g, customer.firstName || '');
      messageBody = messageBody.replace(/{lastName}/g, customer.lastName || '');
    }
    
    // Replace dealership variables (could come from settings)
    messageBody = messageBody.replace(/{dealerName}/g, 'AutolytiQ Motors');
    messageBody = messageBody.replace(/{dealerPhone}/g, '(555) 123-4567');
    
    setNewMessage(messageBody);
    setSelectedTemplate(template);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const groupTemplatesByCategory = (templates: MessageTemplate[]) => {
    return templates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, MessageTemplate[]>);
  };

  if (messagesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">
          Customer Texting Portal
        </h1>
        {customer && (
          <Badge variant="outline" className="ml-auto">
            {customer.name}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Message History
                <Badge variant="secondary">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === 'outbound' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.message_body}</p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className="text-xs opacity-70">
                              {formatMessageTime(message.created_at)}
                            </span>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(message.status)}
                              {message.cost && (
                                <span className="text-xs opacity-70">
                                  ${message.cost}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Compose Message */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="mt-1 min-h-[120px]"
                  maxLength={1000}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {newMessage.length}/1000 characters
                </div>
              </div>

              <Button 
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !newMessage.trim() || !phoneNumber.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Message Templates
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Manage Templates</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground">
                      Template management interface would go here.
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {Object.entries(groupTemplatesByCategory(templates.filter(t => t.is_active))).map(([category, categoryTemplates]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="space-y-1">
                      {categoryTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTemplateSelect(template)}
                          className="w-full justify-start h-auto p-2 text-left"
                        >
                          <div>
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {template.body.substring(0, 50)}...
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
                
                {templates.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    <p className="text-sm">No templates available.</p>
                    <p className="text-xs">Create templates in settings.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}