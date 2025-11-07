/**
 * Universal Search Results Page
 *
 * Displays search results across all entities:
 * - Customers
 * - Vehicles
 * - Deals
 * - Leads
 * - Appraisals
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge, Button, Skeleton, Alert } from '@repo/ui';
import { Search, User, Car, FileText, TrendingUp, ArrowRight, Clock, CheckCircle, Plus } from 'lucide-react';

interface SearchResult {
  type: 'customer' | 'vehicle' | 'deal' | 'lead' | 'appraisal' | 'vin_decode';
  id: string;
  data: any;
  score: number;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          limit: 50,
          offset: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
      setExecutionTime(data.executionTime || 0);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'customer': return <User className="h-5 w-5" />;
      case 'vehicle': return <Car className="h-5 w-5" />;
      case 'deal': return <FileText className="h-5 w-5" />;
      case 'lead': return <TrendingUp className="h-5 w-5" />;
      case 'vin_decode': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypePath = (type: string, id: string) => {
    switch (type) {
      case 'customer': return `/customers/${id}`;
      case 'vehicle': return `/inventory/${id}`;
      case 'deal': return `/deals/${id}`;
      case 'lead': return `/leads/${id}`;
      case 'appraisal': return `/appraisals/${id}`;
      default: return '#';
    }
  };

  const renderResultData = (result: SearchResult) => {
    const { type, data } = result;

    switch (type) {
      case 'customer':
        return (
          <div className="space-y-1">
            <div className="font-semibold text-text-primary">
              {data.firstName} {data.lastName}
            </div>
            {data.email && (
              <div className="text-sm text-text-secondary">{data.email}</div>
            )}
            {data.phone && (
              <div className="text-sm text-text-secondary">{data.phone}</div>
            )}
            {data.creditScore && (
              <Badge variant={data.creditScore >= 700 ? 'success' : 'warning'} size="sm">
                FICO: {data.creditScore}
              </Badge>
            )}
          </div>
        );

      case 'vehicle':
        return (
          <div className="space-y-1">
            <div className="font-semibold text-text-primary">
              {data.year} {data.make} {data.model} {data.trim}
            </div>
            <div className="text-sm text-text-secondary">
              VIN: {data.vin} | Stock: {data.stockNumber}
            </div>
            <div className="flex items-center gap-2">
              {data.price && (
                <span className="font-medium text-text-primary">
                  ${data.price.toLocaleString()}
                </span>
              )}
              {data.status && (
                <Badge variant="outline" size="sm">{data.status}</Badge>
              )}
            </div>
          </div>
        );

      case 'deal':
        return (
          <div className="space-y-1">
            <div className="font-semibold text-text-primary">
              Deal #{data.dealNumber}
            </div>
            {data.customer && (
              <div className="text-sm text-text-secondary">
                Customer: {data.customer.firstName} {data.customer.lastName}
              </div>
            )}
            {data.vehicle && (
              <div className="text-sm text-text-secondary">
                Vehicle: {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
              </div>
            )}
            <div className="flex items-center gap-2">
              {data.totalAmount && (
                <span className="font-medium text-text-primary">
                  ${data.totalAmount.toLocaleString()}
                </span>
              )}
              {data.status && (
                <Badge variant="default" size="sm">{data.status}</Badge>
              )}
            </div>
          </div>
        );

      case 'vin_decode':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">VIN Decoded Successfully</h4>
            </div>

            {data.decoded && (
              <>
                <div>
                  <div className="font-semibold text-lg text-text-primary">
                    {data.decoded.year} {data.decoded.make} {data.decoded.model}
                  </div>
                  {data.decoded.trim && (
                    <div className="text-sm text-text-secondary">{data.decoded.trim}</div>
                  )}
                  <div className="text-sm text-text-tertiary font-mono mt-1">
                    VIN: {data.vin}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {data.decoded.bodyStyle && (
                    <div>
                      <div className="text-xs text-text-tertiary">Body Style</div>
                      <div className="font-medium">{data.decoded.bodyStyle}</div>
                    </div>
                  )}
                  {data.decoded.engineType && (
                    <div>
                      <div className="text-xs text-text-tertiary">Engine</div>
                      <div className="font-medium">{data.decoded.engineType}</div>
                    </div>
                  )}
                  {data.decoded.transmission && (
                    <div>
                      <div className="text-xs text-text-tertiary">Transmission</div>
                      <div className="font-medium">{data.decoded.transmission}</div>
                    </div>
                  )}
                  {data.decoded.driveType && (
                    <div>
                      <div className="text-xs text-text-tertiary">Drive Type</div>
                      <div className="font-medium">{data.decoded.driveType}</div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <p className="text-sm text-text-secondary">{data.message}</p>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const params = new URLSearchParams({
                        vin: data.vin,
                        year: data.decoded.year?.toString() || '',
                        make: data.decoded.make || '',
                        model: data.decoded.model || '',
                        trim: data.decoded.trim || '',
                      });
                      navigate(`/inventory/add?${params.toString()}`);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Inventory
                  </Button>
                </div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-text-secondary">
            {JSON.stringify(data)}
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Search className="h-6 w-6" />
            Search Results
          </h1>
          <p className="text-text-secondary mt-1">
            {query && `Searching for "${query}"`}
          </p>
        </div>

        {!loading && total > 0 && (
          <div className="text-sm text-text-tertiary flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {total} results in {executionTime}ms
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && total === 0 && query && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No results found
            </h3>
            <p className="text-text-secondary">
              Try searching for a customer name, vehicle VIN, or deal number
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <Card
              key={`${result.type}-${result.id}`}
              className={result.type !== 'vin_decode' ? 'hover:border-accent-primary transition-colors cursor-pointer' : 'border-green-200 bg-green-50'}
              onClick={() => result.type !== 'vin_decode' && navigate(getTypePath(result.type, result.id))}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-2 rounded-lg bg-surface-muted text-text-secondary">
                    {getIcon(result.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" size="sm">
                        {getTypeLabel(result.type)}
                      </Badge>
                      {result.score && result.score > 0.9 && (
                        <Badge variant="success" size="sm">
                          Best Match
                        </Badge>
                      )}
                    </div>

                    {renderResultData(result)}
                  </div>

                  {/* Arrow */}
                  <div>
                    <ArrowRight className="h-5 w-5 text-text-tertiary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination (TODO) */}
      {total > 20 && (
        <div className="flex justify-center">
          <Button variant="outline">Load More Results</Button>
        </div>
      )}
    </div>
  );
}
