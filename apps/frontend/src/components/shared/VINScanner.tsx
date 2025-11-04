import { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VINScannerProps {
  onScan: (vin: string) => void;
  onClose: () => void;
}

export default function VINScanner({ onScan, onClose }: VINScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualVIN, setManualVIN] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not available. Please enter VIN manually.');
        setIsScanning(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsScanning(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please enter VIN manually.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    // In production, use OCR library like Tesseract.js to extract VIN
    // For demo, show manual input
    setError('OCR processing... Please enter VIN manually for now.');

    // Example OCR integration (commented out):
    // const imageData = canvas.toDataURL('image/png');
    // Tesseract.recognize(imageData, 'eng').then(({ data: { text } }) => {
    //   const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/);
    //   if (vinMatch) {
    //     onScan(vinMatch[0]);
    //   }
    // });
  };

  const handleManualSubmit = () => {
    const cleanVIN = manualVIN.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    if (cleanVIN.length === 17) {
      onScan(cleanVIN);
    } else {
      setError('VIN must be exactly 17 characters');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black/50 flex items-center justify-between">
        <h2 className="text-white font-semibold">Scan VIN</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative">
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {error ? (
          <div className="text-center p-6 text-white max-w-md">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-w-full max-h-full"
              style={{ transform: 'scaleX(-1)' }} // Mirror for selfie effect
            />

            {/* VIN targeting overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-white rounded-lg w-80 h-24 relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm bg-black/70 px-3 py-1 rounded">
                    Align VIN in frame
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Manual Entry */}
      <div className="p-4 bg-black/50 space-y-3">
        <div>
          <label className="text-white text-sm mb-2 block">Or enter VIN manually:</label>
          <input
            type="text"
            value={manualVIN}
            onChange={(e) => setManualVIN(e.target.value.toUpperCase())}
            maxLength={17}
            placeholder="Enter 17-character VIN"
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-lg tracking-wider"
          />
          <p className="text-xs text-white/70 mt-1">{manualVIN.length}/17 characters</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={captureImage}
            disabled={isScanning || !!error}
            className="flex-1 gap-2"
            size="lg"
          >
            <Camera className="w-5 h-5" />
            Capture
          </Button>
          <Button
            onClick={handleManualSubmit}
            disabled={manualVIN.length !== 17}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Submit VIN
          </Button>
        </div>
      </div>
    </div>
  );
}
