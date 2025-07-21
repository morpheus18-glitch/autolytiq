import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Send, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  cellPhone?: string;
  email?: string;
}

interface TextMessage {
  id: number;
  customer_id: number;
  direction: 'inbound' | 'outbound';
  message_body: string;
  status: 'sent' | 'delivered' | 'failed';
  created_at: string;
}

interface PhoneCall {
  id: number;
  customer_id: number;
  direction: 'inbound' | 'outbound';
  phone_number: string;
  duration?: number;
  status: 'completed' | 'missed' | 'no_answer';
  call_notes?: string;
  created_at: string;
}

export default function CommunicationDemo() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch messages for selected customer
  const { data: messages = [] } = useQuery<TextMessage[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'messages'],
    enabled: !!selectedCustomerId,
  });

  // Fetch calls for selected customer
  const { data: calls = [] } = useQuery<PhoneCall[]>({
    queryKey: ['/api/customers', selectedCustomerId, 'calls'],
    enabled: !!selectedCustomerId,
  });

  // Send text message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { customer_id: number; message_body: string; phone_number: string }) => {
      return await apiRequest(`/api/customers/${messageData.customer_id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          direction: 'outbound',
          message_body: messageData.message_body,
          phone_number: messageData.phone_number,
          message_type: 'sms',
          status: 'sent',
          sender_id: 'demo-user'
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', selectedCustomerId, 'messages'] });
      setNewMessage('');
      toast({
        title: 'Message Sent',
        description: 'Text message sent successfully.',
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

  // Log phone call mutation
  const logCallMutation = useMutation({
    mutationFn: async (callData: { customer_id: number; phone_number: string; call_notes: string }) => {
      return await apiRequest(`/api/customers/${callData.customer_id}/calls`, {
        method: 'POST',
        body: JSON.stringify({
          direction: 'outbound',
          phone_number: callData.phone_number,
          status: 'completed',
          duration: Math.floor(Math.random() * 300) + 60, // Random duration 1-6 minutes
          call_notes: callData.call_notes,
          user_id: 'demo-user',
          follow_up_required: false
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', selectedCustomerId, 'calls'] });
      setCallNotes('');
      toast({
        title: 'Call Logged',
        description: 'Phone call logged successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log call.',
        variant: 'destructive',
      });
    },
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleSendMessage = () => {
    if (!selectedCustomer || !newMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a customer and enter a message.',
        variant: 'destructive',
      });
      return;
    }

    const phoneNumber = selectedCustomer.cellPhone || selectedCustomer.phone || '';
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Customer has no phone number.',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate({
      customer_id: selectedCustomer.id,
      message_body: newMessage,
      phone_number: phoneNumber
    });
  };

  const handleLogCall = () => {
    if (!selectedCustomer || !callNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a customer and enter call notes.',
        variant: 'destructive',
      });
      return;
    }

    const phoneNumber = selectedCustomer.cellPhone || selectedCustomer.phone || '';
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Customer has no phone number.',
        variant: 'destructive',
      });
      return;
    }

    logCallMutation.mutate({
      customer_id: selectedCustomer.id,
      phone_number: phoneNumber,
      call_notes: callNotes
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Communication Demo</h1>
      </div>

      {/* Customer Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCustomerId?.toString() || ""} onValueChange={(value) => setSelectedCustomerId(parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a customer to communicate with..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.firstName} {customer.lastName} 
                  {(customer.phone || customer.cellPhone) && ` - ${customer.cellPhone || customer.phone}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Text Messages
                <Badge variant="secondary">{messages.length} messages</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message History */}
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No messages yet
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                        message.direction === 'outbound' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100'
                      }`}>
                        <p>{message.message_body}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                          <span>{formatTime(message.created_at)}</span>
                          {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                          {message.status === 'delivered' && <CheckCircle className="w-3 h-3 text-green-400" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Send Message */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={sendMessageMutation.isPending}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phone Calls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Phone Calls
                <Badge variant="secondary">{calls.length} calls</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Call History */}
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                {calls.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No calls logged yet
                  </div>
                ) : (
                  calls.map((call) => (
                    <div key={call.id} className="border-b pb-2 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className={`w-4 h-4 ${call.direction === 'outbound' ? 'text-blue-500' : 'text-green-500'}`} />
                          <span className="font-medium">{call.direction === 'outbound' ? 'Outbound' : 'Inbound'}</span>
                          <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                            {call.status}
                          </Badge>
                        </div>
                        {call.duration && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      {call.call_notes && (
                        <p className="text-sm text-gray-600 mt-1">{call.call_notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatTime(call.created_at)}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Log Call */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter call notes..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleLogCall} 
                  disabled={logCallMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {logCallMutation.isPending ? 'Logging...' : 'Log Phone Call'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}