import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Car, CheckCircle, AlertCircle } from 'lucide-react';

interface VinDecoderProps {
  onVinDecoded: (vehicleInfo: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  }) => void;
  initialVin?: string;
}

export default function VinDecoder({ onVinDecoded, initialVin = '' }: VinDecoderProps) {
  const [vin, setVin] = useState(initialVin);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedInfo, setDecodedInfo] = useState<any>(null);
  const { toast } = useToast();

  const decodeVin = async () => {
    if (!vin || vin.length !== 17) {
      toast({
        title: 'Invalid VIN',
        description: 'VIN must be exactly 17 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsDecoding(true);
    try {
      // Use NHTSA vPIC API (free government service)
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
      const data = await response.json();

      if (data.Results && data.Results.length > 0) {
        const results = data.Results;
        const vehicleInfo = {
          year: parseInt(results.find((r: any) => r.Variable === 'Model Year')?.Value) || 0,
          make: results.find((r: any) => r.Variable === 'Make')?.Value || '',
          model: results.find((r: any) => r.Variable === 'Model')?.Value || '',
          trim: results.find((r: any) => r.Variable === 'Trim')?.Value || '',
          bodyClass: results.find((r: any) => r.Variable === 'Body Class')?.Value || '',
          engineSize: results.find((r: any) => r.Variable === 'Engine Number of Cylinders')?.Value || '',
          fuelType: results.find((r: any) => r.Variable === 'Fuel Type - Primary')?.Value || '',
          transmission: results.find((r: any) => r.Variable === 'Transmission Style')?.Value || '',
        };

        setDecodedInfo(vehicleInfo);
        onVinDecoded({
          year: vehicleInfo.year,
          make: vehicleInfo.make,
          model: vehicleInfo.model,
          trim: vehicleInfo.trim,
        });

        toast({
          title: 'VIN Decoded Successfully',
          description: `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
        });
      } else {
        throw new Error('Unable to decode VIN');
      }
    } catch (error) {
      console.error('VIN decoding error:', error);
      
      // Provide fallback basic VIN validation and partial decoding
      const year = 2020 + parseInt(vin.charAt(9)) || new Date().getFullYear() - 3;
      const basicInfo = {
        year: year,
        make: 'Unknown',
        model: 'Unknown',
        trim: '',
      };
      
      setDecodedInfo(basicInfo);
      onVinDecoded(basicInfo);
      
      toast({
        title: 'VIN Service Unavailable',
        description: 'Using basic VIN validation. Please verify vehicle details manually.',
        variant: 'destructive',
      });
    } finally {
      setIsDecoding(false);
    }
  };

  const formatVin = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    return value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 17);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          VIN Decoder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
            <Input
              id="vin"
              value={vin}
              onChange={(e) => setVin(formatVin(e.target.value))}
              placeholder="Enter 17-character VIN"
              maxLength={17}
              className="font-mono text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              {vin.length}/17 characters
            </p>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={decodeVin}
              disabled={isDecoding || vin.length !== 17}
              className="mb-6"
            >
              {isDecoding ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Decoding...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Decode VIN
                </>
              )}
            </Button>
          </div>
        </div>

        {decodedInfo && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">VIN Successfully Decoded</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Vehicle Information</Label>
                <div className="mt-2 space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Year:</span> {decodedInfo.year}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Make:</span> {decodedInfo.make}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Model:</span> {decodedInfo.model}
                  </div>
                  {decodedInfo.trim && (
                    <div className="text-sm">
                      <span className="font-medium">Trim:</span> {decodedInfo.trim}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Additional Details</Label>
                <div className="mt-2 space-y-1">
                  {decodedInfo.bodyClass && (
                    <div className="text-sm">
                      <span className="font-medium">Body Style:</span> {decodedInfo.bodyClass}
                    </div>
                  )}
                  {decodedInfo.engineSize && (
                    <div className="text-sm">
                      <span className="font-medium">Engine:</span> {decodedInfo.engineSize} cylinder
                    </div>
                  )}
                  {decodedInfo.fuelType && (
                    <div className="text-sm">
                      <span className="font-medium">Fuel Type:</span> {decodedInfo.fuelType}
                    </div>
                  )}
                  {decodedInfo.transmission && (
                    <div className="text-sm">
                      <span className="font-medium">Transmission:</span> {decodedInfo.transmission}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}