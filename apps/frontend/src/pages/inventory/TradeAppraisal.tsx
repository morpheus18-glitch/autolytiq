import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Scan,
  Car,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader,
  Save,
  Printer,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VINScanner from '@/components/shared/VINScanner';
import NotesPanel from '@/components/shared/NotesPanel';
import { decodeVIN, validateVIN, estimateVehicleValue, type VINDecodeResult } from '@/services/vinDecoder';

interface TradeAppraisal {
  id: string;
  vin: string;
  vehicleInfo: VINDecodeResult;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  exteriorCondition: number; // 1-10
  interiorCondition: number; // 1-10
  mechanicalCondition: number; // 1-10
  hasAccidents: boolean;
  accidentDetails?: string;
  customerName: string;
  customerPhone: string;
  estimatedValue: {
    trade: number;
    retail: number;
    wholesale: number;
  };
  offerAmount?: number;
  status: 'pending' | 'offered' | 'accepted' | 'declined';
  createdAt: string;
  createdBy: string;
  photos?: string[];
}

export default function TradeAppraisal() {
  const [showScanner, setShowScanner] = useState(false);
  const [vin, setVin] = useState('');
  const [decodedVIN, setDecodedVIN] = useState<VINDecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [exteriorCondition, setExteriorCondition] = useState(7);
  const [interiorCondition, setInteriorCondition] = useState(7);
  const [mechanicalCondition, setMechanicalCondition] = useState(7);
  const [hasAccidents, setHasAccidents] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState('');

  // Estimated values
  const [estimatedValues, setEstimatedValues] = useState<{
    trade: number;
    retail: number;
    wholesale: number;
  } | null>(null);

  const [offerAmount, setOfferAmount] = useState('');
  const [currentAppraisalId, setCurrentAppraisalId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const handleVINScan = (scannedVIN: string) => {
    setVin(scannedVIN);
    setShowScanner(false);
    handleDecodeVIN(scannedVIN);
  };

  const handleDecodeVIN = async (vinToDate?: string) => {
    const vinValue = vinToDate || vin;

    if (!vinValue) {
      setDecodeError('Please enter a VIN');
      return;
    }

    const validation = validateVIN(vinValue);
    if (!validation.valid) {
      setDecodeError(validation.error || 'Invalid VIN');
      return;
    }

    setIsDecoding(true);
    setDecodeError(null);
    setDecodedVIN(null);

    try {
      const result = await decodeVIN(vinValue);
      setDecodedVIN(result);

      // Auto-estimate value if mileage is entered
      if (mileage && parseInt(mileage) > 0) {
        const values = await estimateVehicleValue(result, parseInt(mileage), condition);
        setEstimatedValues(values);
      }
    } catch (error) {
      setDecodeError(error instanceof Error ? error.message : 'Failed to decode VIN');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleEstimateValue = async () => {
    if (!decodedVIN) return;

    try {
      const values = await estimateVehicleValue(
        decodedVIN,
        mileage ? parseInt(mileage) : undefined,
        condition
      );
      setEstimatedValues(values);

      // Auto-set offer to trade value
      setOfferAmount(values.trade.toString());
    } catch (error) {
      console.error('Failed to estimate value:', error);
    }
  };

  const saveAppraisalMutation = useMutation({
    mutationFn: async () => {
      if (!decodedVIN || !estimatedValues) {
        throw new Error('Missing required information');
      }

      const appraisal: TradeAppraisal = {
        id: currentAppraisalId || `APR${Date.now()}`,
        vin,
        vehicleInfo: decodedVIN,
        mileage: parseInt(mileage),
        condition,
        exteriorCondition,
        interiorCondition,
        mechanicalCondition,
        hasAccidents,
        accidentDetails: hasAccidents ? accidentDetails : undefined,
        customerName,
        customerPhone,
        estimatedValue: estimatedValues,
        offerAmount: offerAmount ? parseInt(offerAmount) : undefined,
        status: offerAmount ? 'offered' : 'pending',
        createdAt: new Date().toISOString(),
        createdBy: 'Current User', // Replace with actual user
      };

      // Save to localStorage (in production, use API)
      const stored = localStorage.getItem('trade-appraisals');
      const appraisals = stored ? JSON.parse(stored) : [];

      const existingIndex = appraisals.findIndex((a: TradeAppraisal) => a.id === appraisal.id);
      if (existingIndex >= 0) {
        appraisals[existingIndex] = appraisal;
      } else {
        appraisals.push(appraisal);
      }

      localStorage.setItem('trade-appraisals', JSON.stringify(appraisals));

      return appraisal;
    },
    onSuccess: (appraisal) => {
      setCurrentAppraisalId(appraisal.id);
      alert('Appraisal saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['trade-appraisals'] });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-4 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trade Appraisal</h1>
          <p className="text-sm text-muted-foreground">VIN scanning with automated valuation</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => saveAppraisalMutation.mutate()}
            disabled={!decodedVIN || !estimatedValues || saveAppraisalMutation.isPending}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button variant="outline" disabled={!decodedVIN} className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Content */}
        <div className="col-span-8 space-y-4">
          {/* VIN Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    maxLength={17}
                    placeholder="Enter VIN (17 characters)"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg font-mono text-lg tracking-wider uppercase"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{vin.length}/17 characters</p>
                </div>
                <Button onClick={() => setShowScanner(true)} variant="outline" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Scan
                </Button>
                <Button
                  onClick={() => handleDecodeVIN()}
                  disabled={isDecoding || vin.length !== 17}
                  className="gap-2"
                >
                  {isDecoding ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scan className="w-4 h-4" />
                  )}
                  Decode
                </Button>
              </div>

              {decodeError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{decodeError}</span>
                </div>
              )}

              {decodedVIN && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      VIN Decoded Successfully
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Year:</span>
                      <span className="ml-2 font-medium">{decodedVIN.year || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Make:</span>
                      <span className="ml-2 font-medium">{decodedVIN.make || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <span className="ml-2 font-medium">{decodedVIN.model || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trim:</span>
                      <span className="ml-2 font-medium">{decodedVIN.trim || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Body:</span>
                      <span className="ml-2 font-medium">{decodedVIN.bodyStyle || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Engine:</span>
                      <span className="ml-2 font-medium">{decodedVIN.engineType || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="555-0123"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Condition */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vehicle Condition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mileage</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    placeholder="75000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Overall Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span>Exterior Condition</span>
                    <Badge variant="secondary">{exteriorCondition}/10</Badge>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={exteriorCondition}
                    onChange={(e) => setExteriorCondition(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span>Interior Condition</span>
                    <Badge variant="secondary">{interiorCondition}/10</Badge>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={interiorCondition}
                    onChange={(e) => setInteriorCondition(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span>Mechanical Condition</span>
                    <Badge variant="secondary">{mechanicalCondition}/10</Badge>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mechanicalCondition}
                    onChange={(e) => setMechanicalCondition(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasAccidents}
                    onChange={(e) => setHasAccidents(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Has accident history</span>
                </label>
                {hasAccidents && (
                  <textarea
                    value={accidentDetails}
                    onChange={(e) => setAccidentDetails(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none"
                    rows={2}
                    placeholder="Describe accident damage..."
                  />
                )}
              </div>

              <Button
                onClick={handleEstimateValue}
                disabled={!decodedVIN || !mileage}
                className="w-full gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Calculate Value
              </Button>
            </CardContent>
          </Card>

          {/* Valuation */}
          {estimatedValues && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estimated Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Trade-In</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(estimatedValues.trade)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Retail</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(estimatedValues.retail)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Wholesale</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {formatCurrency(estimatedValues.wholesale)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Offer Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg"
                      placeholder="Enter offer..."
                    />
                    <Button
                      onClick={() => setOfferAmount(estimatedValues.trade.toString())}
                      variant="outline"
                      size="sm"
                    >
                      Use Trade Value
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Notes */}
        <div className="col-span-4">
          {currentAppraisalId && (
            <NotesPanel
              entityType="trade-appraisal"
              entityId={currentAppraisalId}
              title="Appraisal Notes"
            />
          )}
          {!currentAppraisalId && (
            <Card className="p-4">
              <div className="text-center py-8 text-sm text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Save appraisal to add notes</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* VIN Scanner Modal */}
      {showScanner && (
        <VINScanner onScan={handleVINScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
