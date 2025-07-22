import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Car, DollarSign, Phone, Mail, MessageSquare, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface Customer360IntelligenceProps {
  customerId: number;
}

export function Customer360Intelligence({ customerId }: Customer360IntelligenceProps) {
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['/api/customers', customerId, 'timeline'],
    enabled: !!customerId,
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai-insights', 'customer', customerId],
    enabled: !!customerId,
  });

  const { data: predictiveScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['/api/predictive-scores', 'customer', customerId],
    enabled: !!customerId,
  });

  const { data: duplicates, isLoading: duplicatesLoading } = useQuery({
    queryKey: ['/api/duplicate-customers', customerId],
    enabled: !!customerId,
  });

  if (timelineLoading || insightsLoading || scoresLoading || duplicatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sales': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'service': return <Car className="w-4 h-4 text-blue-500" />;
      case 'finance': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'marketing': return <Mail className="w-4 h-4 text-orange-500" />;
      case 'web': return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'phone': return <Phone className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-500 bg-red-50 border-red-200';
    if (score >= 0.6) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    return 'text-green-500 bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-6">
      {/* Predictive Scores Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictiveScores?.map((score: any) => (
          <Card key={score.id} className={`border-2 ${getScoreColor(score.score)}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {score.scoreType.replace('_', ' ').toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(score.score * 100)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Confidence: {Math.round(score.confidence * 100)}%
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Valid until: {new Date(score.validUntil).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Intelligent recommendations and warnings for this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight: any) => (
                <div key={insight.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {insight.status === 'pending' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{insight.insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.insight.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {insight.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Detection */}
      {duplicates && duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Potential Duplicates Detected
            </CardTitle>
            <CardDescription>
              Similar customer records that may need to be merged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {duplicates.map((duplicate: any) => (
                <div key={duplicate.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium">
                      Similarity: {Math.round(duplicate.similarityScore * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Matching fields: {duplicate.matchingFields.join(', ')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Review</Button>
                    <Button variant="default" size="sm">Merge</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Timeline */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Complete Timeline</TabsTrigger>
          <TabsTrigger value="sales">Sales Events</TabsTrigger>
          <TabsTrigger value="service">Service History</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Touchpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Customer Timeline</CardTitle>
              <CardDescription>
                Unified view of all customer interactions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {timeline?.map((event: any) => (
                    <div key={event.id} className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.eventType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{event.eventDescription}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {event.metadata && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            {JSON.stringify(event.metadata, null, 2)}
                          </div>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {event.source}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.eventType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Events Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {timeline?.filter((event: any) => event.eventType === 'sales').map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.eventDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {timeline?.filter((event: any) => event.eventType === 'service').map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Car className="w-4 h-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.eventDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Touchpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {timeline?.filter((event: any) => ['marketing', 'web', 'chat', 'phone'].includes(event.eventType)).map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      {getEventIcon(event.eventType)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.eventDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}