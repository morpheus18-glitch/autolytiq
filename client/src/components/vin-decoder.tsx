import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

interface VINDecodeResult {
  make: string;
  model: string;
  year: number;
  vin: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  bodyStyle?: string;
  doors?: number;
  drivetrain?: string;
  trim?: string;
}

interface VINDecoderProps {
  onDecodeSuccess: (data: VINDecodeResult) => void;
  defaultVin?: string;
}

export default function VINDecoder({ onDecodeSuccess, defaultVin = '' }: VINDecoderProps) {
  const [vin, setVin] = useState(defaultVin);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedData, setDecodedData] = useState<VINDecodeResult | null>(null);
  const { toast } = useToast();

  const handleDecode = async () => {
    if (!vin || vin.length !== 17) {
      toast({
        title: 'Invalid VIN',
        description: 'VIN must be exactly 17 characters long',
        variant: 'destructive'
      });
      return;
    }

    setIsDecoding(true);
    try {
      const response = await axios.post('/api/decode-vin', { vin });
      const decoded = response.data;
      
      setDecodedData(decoded);
      onDecodeSuccess(decoded);
      
      toast({
        title: 'VIN Decoded Successfully',
        description: `Found: ${decoded.year} ${decoded.make} ${decoded.model}`
      });
    } catch (error) {
      console.error('VIN decode error:', error);
      toast({
        title: 'VIN Decode Failed',
        description: 'Unable to decode this VIN. Please check and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDecoding(false);
    }
  };

  const handleVinChange = (value: string) => {
    // Allow only alphanumeric characters and convert to uppercase
    const cleanVin = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (cleanVin.length <= 17) {
      setVin(cleanVin);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          VIN Decoder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="vin-input">Vehicle Identification Number (VIN)</Label>
            <Input
              id="vin-input"
              placeholder="Enter 17-character VIN"
              value={vin}
              onChange={(e) => handleVinChange(e.target.value)}
              maxLength={17}
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              {vin.length}/17 characters
            </p>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleDecode}
              disabled={isDecoding || vin.length !== 17}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDecoding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Decoding...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Decode
                </>
              )}
            </Button>
          </div>
        </div>

        {decodedData && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Decoded Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-green-700">Make:</span>
                <span className="ml-2">{decodedData.make}</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Model:</span>
                <span className="ml-2">{decodedData.model}</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Year:</span>
                <span className="ml-2">{decodedData.year}</span>
              </div>
              {decodedData.trim && (
                <div>
                  <span className="font-medium text-green-700">Trim:</span>
                  <span className="ml-2">{decodedData.trim}</span>
                </div>
              )}
              {decodedData.engine && (
                <div>
                  <span className="font-medium text-green-700">Engine:</span>
                  <span className="ml-2">{decodedData.engine}</span>
                </div>
              )}
              {decodedData.transmission && (
                <div>
                  <span className="font-medium text-green-700">Transmission:</span>
                  <span className="ml-2">{decodedData.transmission}</span>
                </div>
              )}
              {decodedData.fuelType && (
                <div>
                  <span className="font-medium text-green-700">Fuel Type:</span>
                  <span className="ml-2">{decodedData.fuelType}</span>
                </div>
              )}
              {decodedData.bodyStyle && (
                <div>
                  <span className="font-medium text-green-700">Body Style:</span>
                  <span className="ml-2">{decodedData.bodyStyle}</span>
                </div>
              )}
              {decodedData.doors && (
                <div>
                  <span className="font-medium text-green-700">Doors:</span>
                  <span className="ml-2">{decodedData.doors}</span>
                </div>
              )}
              {decodedData.drivetrain && (
                <div>
                  <span className="font-medium text-green-700">Drivetrain:</span>
                  <span className="ml-2">{decodedData.drivetrain}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}