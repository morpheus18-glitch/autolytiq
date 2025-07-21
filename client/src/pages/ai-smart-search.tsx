import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Search, Zap, TrendingUp, Users, Car, Target } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: number;
  type: 'customer' | 'lead' | 'vehicle';
  title: string;
  description: string;
  score: number;
  metadata?: any;
}

export default function AISmartSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'customer' | 'lead' | 'vehicle'>('customer');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  // Mock ML insights data for demo
  const mlInsights = {
    todayStats: {
      searches: 47,
      avgResponseTime: 245,
      accuracy: 92.5,
      userSatisfaction: 4.3
    },
    topSearches: [
      { query: "customers interested in hybrid vehicles", count: 12 },
      { query: "high credit score buyers", count: 9 },
      { query: "customers from downtown area", count: 8 },
      { query: "leads requiring follow-up", count: 7 },
    ],
    modelPerformance: {
      leadScoring: { accuracy: 89.2, version: "v2.1" },
      semanticSearch: { precision: 87.6, version: "v1.8" },
      recommendations: { hitRate: 34.7, version: "v1.5" },
      priceOptimization: { accuracy: 91.3, version: "v3.0" }
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query.',
        variant: 'destructive',
      });
      return;
    }

    // Mock semantic search results for demo
    const mockResults: SearchResult[] = [
      {
        id: 1,
        type: 'customer',
        title: 'Jennifer Wilson',
        description: 'High-income customer from downtown, interested in luxury vehicles. Credit score: 780',
        score: 0.94,
        metadata: { creditScore: 780, income: 95000, location: 'Downtown' }
      },
      {
        id: 2,
        type: 'customer', 
        title: 'Michael Johnson',
        description: 'Repeat customer with trade-in, looking for fuel-efficient options. Previous purchases: 2 vehicles',
        score: 0.87,
        metadata: { creditScore: 720, income: 67000, previousPurchases: 2 }
      },
      {
        id: 3,
        type: 'customer',
        title: 'Sarah Davis',
        description: 'First-time buyer, excellent credit, interested in certified pre-owned vehicles',
        score: 0.82,
        metadata: { creditScore: 750, income: 58000, firstTimeBuyer: true }
      }
    ];

    // Filter results based on search query (basic demo logic)
    const filteredResults = mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (searchQuery.toLowerCase().includes('high') && result.metadata?.creditScore > 750) ||
      (searchQuery.toLowerCase().includes('downtown') && result.description.toLowerCase().includes('downtown')) ||
      (searchQuery.toLowerCase().includes('luxury') && result.description.toLowerCase().includes('luxury'))
    );

    setSearchResults(filteredResults.length > 0 ? filteredResults : mockResults.slice(0, 2));

    toast({
      title: 'Search Complete',
      description: `Found ${filteredResults.length > 0 ? filteredResults.length : 2} relevant results using AI semantic search.`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Users className="w-4 h-4" />;
      case 'lead':
        return <Target className="w-4 h-4" />;
      case 'vehicle':
        return <Car className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.8) return 'bg-blue-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Smart Search & ML Insights</h1>
        <Badge variant="outline" className="ml-auto">
          Powered by Vector Search + ML
        </Badge>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Semantic Search</TabsTrigger>
          <TabsTrigger value="insights">ML Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                AI-Powered Natural Language Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  <Input
                    placeholder="Try: 'customers interested in hybrid vehicles' or 'high credit score buyers from downtown'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                    className="text-base"
                  />
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Search Type:</span>
                      <Tabs value={searchType} onValueChange={(value) => setSearchType(value as any)} className="w-auto">
                        <TabsList className="h-8">
                          <TabsTrigger value="customer" className="px-3 py-1 text-xs">Customers</TabsTrigger>
                          <TabsTrigger value="lead" className="px-3 py-1 text-xs">Leads</TabsTrigger>
                          <TabsTrigger value="vehicle" className="px-3 py-1 text-xs">Inventory</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    <Button onClick={performSearch} className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      AI Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sample Queries */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Try these example queries:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "high income customers interested in luxury",
                    "leads from downtown area",
                    "customers with trade-ins",
                    "first-time buyers with good credit"
                  ].map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery(example)}
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({searchResults.length} found)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeIcon(result.type)}
                            <h3 className="font-semibold">{result.title}</h3>
                            <Badge variant="secondary" className="capitalize">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{result.description}</p>
                          
                          {result.metadata && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(result.metadata).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500">Relevance:</span>
                            <div className={`w-3 h-3 rounded-full ${getScoreColor(result.score)}`}></div>
                            <span className="text-sm font-medium">{(result.score * 100).toFixed(1)}%</span>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* ML Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Today's Searches</p>
                    <p className="text-2xl font-bold">{mlInsights.todayStats.searches}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">{mlInsights.todayStats.avgResponseTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-600">Search Accuracy</p>
                    <p className="text-2xl font-bold">{mlInsights.todayStats.accuracy}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-600">User Satisfaction</p>
                    <p className="text-2xl font-bold">{mlInsights.todayStats.userSatisfaction}/5.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model Performance */}
          <Card>
            <CardHeader>
              <CardTitle>ML Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(mlInsights.modelPerformance).map(([model, stats]) => (
                  <div key={model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">{model.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <Badge variant="outline">{stats.version}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.accuracy || stats.precision || stats.hitRate}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Performance</span>
                      <span>{(stats.accuracy || stats.precision || stats.hitRate).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Popular AI Search Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mlInsights.topSearches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="font-medium">{search.query}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{search.count} searches</span>
                      <Button variant="ghost" size="sm" onClick={() => setSearchQuery(search.query)}>
                        Try
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}