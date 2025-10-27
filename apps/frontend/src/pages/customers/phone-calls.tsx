import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, PhoneCall, Clock, CheckCircle, AlertCircle, Plus, ExternalLink, Calendar } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PhoneCall {
  id: number;
  customer_id: number;
  user_id: string;
  direction: 'inbound' | 'outbound';
  phone_number: string;
  status: 'completed' | 'missed' | 'busy' | 'no_answer' | 'failed';
  duration?: number;
  recording_url?: string;
  call_notes?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  call_purpose?: string;
  outcome?: string;
  tags?: any;
  cost?: number;
  external_call_id?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
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

const callStatuses = [
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'missed', label: 'Missed Call', color: 'bg-red-500' },
  { value: 'busy', label: 'Busy', color: 'bg-yellow-500' },
  { value: 'no_answer', label: 'No Answer', color: 'bg-gray-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-600' },
];

const callPurposes = [
  'Sales Inquiry',
  'Service Appointment',
  'Follow-up Call',
  'Customer Support',
  'Lead Qualification',
  'Appointment Confirmation',
  'Payment Discussion',
  'Vehicle Delivery',
  'Other'
];

const callOutcomes = [
  'Sale Made',
  'Appointment Set',
  'Callback Scheduled',
  'Not Interested',
  'Information Provided',
  'Issue Resolved',
  'Follow-up Required',
  'No Contact Made',
  'Other'
];

export default function PhoneCalls() {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || '0');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [callData, setCallData] = useState({
    direction: 'outbound' as 'inbound' | 'outbound',
    phoneNumber: '',
    status: 'completed' as const,
    duration: '',
    callNotes: '',
    followUpRequired: false,
    followUpDate: '',
    callPurpose: '',
    outcome: '',
    recordingUrl: '',
  });

  // Fetch customer data
  const { data: customer } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
  });

  // Fetch phone calls for this customer
  const { data: calls = [], isLoading: callsLoading } = useQuery<PhoneCall[]>({
    queryKey: ['/api/customers', customerId, 'calls'],
    enabled: !!customerId,
  });

  // Set default phone number when customer data loads
  useEffect(() => {
    if (customer && !callData.phoneNumber) {
      setCallData(prev => ({
        ...prev,
        phoneNumber: customer.cellPhone || customer.phone || ''
      }));
    }
  }, [customer, callData.phoneNumber]);

  // Log call mutation
  const logCallMutation = useMutation({
    mutationFn: async (logData: any) => {
      return await apiRequest(`/api/customers/${customerId}/calls`, {
        method: 'POST',
        body: JSON.stringify({
          ...logData,
          duration: logData.duration ? parseInt(logData.duration) : null,
          userId: 'current-user', // In real app, get from auth context
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'calls'] });
      setIsLogCallOpen(false);
      resetCallData();
      toast({
        title: 'Call Logged',
        description: 'Phone call has been logged successfully.',
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

  const resetCallData = () => {
    setCallData({
      direction: 'outbound',
      phoneNumber: customer?.cellPhone || customer?.phone || '',
      status: 'completed',
      duration: '',
      callNotes: '',
      followUpRequired: false,
      followUpDate: '',
      callPurpose: '',
      outcome: '',
      recordingUrl: '',
    });
  };

  const handleLogCall = () => {
    if (!callData.phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number.',
        variant: 'destructive',
      });
      return;
    }

    const logData = {
      direction: callData.direction,
      phoneNumber: callData.phoneNumber.trim(),
      status: callData.status,
      duration: callData.duration || null,
      callNotes: callData.callNotes || null,
      followUpRequired: callData.followUpRequired,
      followUpDate: callData.followUpDate || null,
      callPurpose: callData.callPurpose || null,
      outcome: callData.outcome || null,
    };

    logCallMutation.mutate(logData);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getStatusInfo = (status: string) => {
    const statusInfo = callStatuses.find(s => s.value === status);
    return statusInfo || { value: status, label: status, color: 'bg-gray-500' };
  };

  const initiateCall = (phoneNumber: string) => {
    // In a real implementation, this would integrate with a phone system
    // For now, we'll just open the phone app
    window.open(`tel:${phoneNumber}`);
    
    // Auto-open the log call dialog after initiating
    setTimeout(() => {
      setCallData(prev => ({
        ...prev,
        phoneNumber,
        direction: 'outbound',
        status: 'completed'
      }));
      setIsLogCallOpen(true);
    }, 1000);
  };

  if (callsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading call history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PhoneCall className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">
            Phone Call Management
          </h1>
          {customer && (
            <Badge variant="outline">
              {customer.name}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {customer?.cellPhone && (
            <Button
              onClick={() => initiateCall(customer.cellPhone!)}
              variant="outline"
              size="sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Cell
            </Button>
          )}
          {customer?.phone && customer.phone !== customer.cellPhone && (
            <Button
              onClick={() => initiateCall(customer.phone!)}
              variant="outline"
              size="sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Main
            </Button>
          )}
          
          <Dialog open={isLogCallOpen} onOpenChange={setIsLogCallOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Log Call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log Phone Call</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Call Direction</label>
                  <Select value={callData.direction} onValueChange={(value) => 
                    setCallData(prev => ({ ...prev, direction: value as 'inbound' | 'outbound' }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound Call</SelectItem>
                      <SelectItem value="inbound">Inbound Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={callData.phoneNumber}
                    onChange={(e) => setCallData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Call Status</label>
                  <Select value={callData.status} onValueChange={(value) => 
                    setCallData(prev => ({ ...prev, status: value as any }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {callStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Duration (seconds)</label>
                  <Input
                    type="number"
                    value={callData.duration}
                    onChange={(e) => setCallData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 120"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Call Purpose</label>
                  <Select value={callData.callPurpose} onValueChange={(value) => 
                    setCallData(prev => ({ ...prev, callPurpose: value }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {callPurposes.map(purpose => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Call Outcome</label>
                  <Select value={callData.outcome} onValueChange={(value) => 
                    setCallData(prev => ({ ...prev, outcome: value }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {callOutcomes.map(outcome => (
                        <SelectItem key={outcome} value={outcome}>
                          {outcome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Call Notes</label>
                  <Textarea
                    value={callData.callNotes}
                    onChange={(e) => setCallData(prev => ({ ...prev, callNotes: e.target.value }))}
                    placeholder="Add any notes about this call..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Recording URL (optional)</label>
                  <Input
                    value={callData.recordingUrl}
                    onChange={(e) => setCallData(prev => ({ ...prev, recordingUrl: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="followUp"
                    checked={callData.followUpRequired}
                    onCheckedChange={(checked) => 
                      setCallData(prev => ({ ...prev, followUpRequired: checked as boolean }))
                    }
                  />
                  <label htmlFor="followUp" className="text-sm font-medium">
                    Follow-up required
                  </label>
                </div>

                {callData.followUpRequired && (
                  <div>
                    <label className="text-sm font-medium">Follow-up Date</label>
                    <Input
                      type="datetime-local"
                      value={callData.followUpDate}
                      onChange={(e) => setCallData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleLogCall} disabled={logCallMutation.isPending} className="flex-1">
                  {logCallMutation.isPending ? 'Logging...' : 'Log Call'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsLogCallOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Call History
            <Badge variant="secondary">
              {calls.length} call{calls.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <PhoneCall className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-2">No calls logged yet</p>
              <p className="text-sm">Start by making a call or logging a previous conversation.</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {calls.map((call) => {
                  const statusInfo = getStatusInfo(call.status);
                  return (
                    <div
                      key={call.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${statusInfo.color} mt-2`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">
                                {call.direction} Call
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {statusInfo.label}
                              </Badge>
                              {call.call_purpose && (
                                <Badge variant="secondary" className="text-xs">
                                  {call.call_purpose}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {call.phone_number} • {formatCallTime(call.created_at)}
                              {call.duration && (
                                <> • {formatDuration(call.duration)}</>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {call.recording_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(call.recording_url)}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            {call.follow_up_required && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                Follow-up
                              </Badge>
                            )}
                          </div>
                        </div>

                        {call.outcome && (
                          <div className="text-sm text-muted-foreground mt-2">
                            <strong>Outcome:</strong> {call.outcome}
                          </div>
                        )}

                        {call.call_notes && (
                          <div className="mt-2 p-3 bg-muted/50 rounded text-sm">
                            {call.call_notes}
                          </div>
                        )}

                        {call.follow_up_date && (
                          <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Follow-up: {new Date(call.follow_up_date).toLocaleDateString()} at{' '}
                            {new Date(call.follow_up_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}