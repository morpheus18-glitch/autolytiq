# VIN Decoder Implementation Guide

## Overview

The VIN Decoder system provides **automatic vehicle information population** when a VIN is entered in any form across the application. When a user types or scans a 17-character VIN, the system:

1. Validates the VIN format
2. Calls NHTSA API to decode vehicle specifications
3. Caches the result in the database
4. Auto-fills all vehicle fields (year, make, model, engine, transmission, etc.)

---

## Architecture

### Backend API (`/api/vin/decode`)

**Location**: `apps/backend/src/routes/vin.ts`

**Endpoints**:
- `POST /api/vin/decode` - Decode a single VIN
- `GET /api/vin/:vin` - Decode VIN via GET request
- `POST /api/vin/bulk-decode` - Decode up to 50 VINs at once

**Features**:
- ✅ Validates VIN format (17 characters, no I/O/Q)
- ✅ Calls NHTSA VIN Decoder API
- ✅ Caches results in database (via Vehicle table)
- ✅ Returns comprehensive vehicle data
- ✅ Multi-tenant isolation
- ✅ Error handling with fallback

**Response Format**:
```typescript
{
  vin: string;
  valid: boolean;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  bodyStyle?: string;
  engineType?: string;
  engineCylinders?: number;
  engineLiters?: number;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  doors?: number;
  manufacturer?: string;
  manufacturerCountry?: string;
  plantCity?: string;
  plantState?: string;
  vehicleType?: string;
  source: 'nhtsa' | 'cache' | 'fallback';
  errorMessage?: string;
}
```

---

## Frontend Integration

### 1. Hook (`useVINDecoder`)

**Location**: `apps/frontend/src/hooks/useVINDecoder.ts`

**Usage**:
```typescript
import { useVINDecoder } from '@/hooks/useVINDecoder';

function MyForm() {
  const { decodeVIN, isDecoding, decodedData, error, getFormFields } = useVINDecoder({
    onSuccess: (data) => {
      console.log('VIN decoded:', data);
    },
    onError: (error) => {
      console.error('Decode failed:', error);
    }
  });

  const handleDecode = async () => {
    const result = await decodeVIN(vinValue);

    // Auto-fill form fields
    const fields = getFormFields(result);
    // fields = { year, make, model, trim, engineType, transmission, etc. }
  };
}
```

**API**:
- `decodeVIN(vin: string)` - Decode VIN and return result
- `isDecoding` - Loading state
- `decodedData` - Last decoded VIN data
- `error` - Error message if decode fails
- `validateVIN(vin)` - Validate VIN format
- `getFormFields(decoded)` - Convert to form field values
- `reset()` - Clear state

**Helper Functions**:
- `formatVINInput(value)` - Format VIN (uppercase, remove invalid chars)
- `isVINComplete(vin)` - Check if VIN is 17 characters
- `getVINCharCount(vin)` - Return "X/17" for display

---

### 2. Service (`vinDecoder.ts`)

**Location**: `apps/frontend/src/services/vinDecoder.ts`

**Functions**:
- `validateVIN(vin)` - Validate VIN format
- `decodeVIN(vin)` - Decode VIN via backend API
- `estimateVehicleValue(decoded, mileage, condition)` - Estimate trade/retail value

**Note**: This service now uses the backend API (`/api/vin/decode`) instead of calling NHTSA directly.

---

## Forms with VIN Auto-Decode

### 1. Vehicle Entry Form ✅

**Location**: `apps/frontend/src/components/forms/VehicleEntryForm.tsx`

**Features**:
- VIN input with auto-decode on blur (when user enters 17 characters)
- Manual "Decode VIN" button
- Auto-fills: year, make, model, trim, body style, engine, transmission, drivetrain, fuel type
- Shows toast notification on success/error
- Displays cached vs. fresh decode source

**Auto-Decode Trigger**:
```typescript
<input
  {...register('vin')}
  onBlur={(e) => {
    const vin = e.target.value;
    if (vin && vin.length === 17 && !isDecoding) {
      handleDecodeVIN(); // Automatically decodes
    }
  }}
/>
```

---

### 2. Trade Appraisal Form ✅

**Location**: `apps/frontend/src/pages/inventory/TradeAppraisal.tsx`

**Features**:
- VIN scanner integration (camera)
- VIN input field
- Auto-decode using `vinDecoder` service
- Populates vehicle info for appraisal
- Estimates trade-in value based on decoded vehicle + mileage + condition

**VIN Scanner**:
```typescript
<VINScanner
  onScan={(scannedVIN) => {
    setVin(scannedVIN);
    handleDecodeVIN(scannedVIN); // Auto-decode scanned VIN
  }}
  onClose={() => setShowScanner(false)}
/>
```

---

### 3. Universal Search with VIN Decode ✅

**Location**: `apps/backend/src/routes/search.ts`

**Features**:
- Detects VIN pattern in search query (`/\b[A-HJ-NPR-Z0-9]{17}\b/`)
- Automatically decodes VIN when detected
- Returns decoded vehicle info as search result
- Shows "Add to Inventory" button if vehicle not in database

**Search Response with VIN**:
```json
{
  "results": [
    {
      "type": "vin_decode",
      "id": "vin-1HGBH41JXMN109186",
      "data": {
        "vin": "1HGBH41JXMN109186",
        "decoded": {
          "year": 2021,
          "make": "Honda",
          "model": "Accord",
          "trim": "EX-L"
        },
        "message": "VIN decoded successfully. This vehicle is not in your inventory yet."
      },
      "score": 1.0
    }
  ],
  "vinDecode": { /* full decode data */ }
}
```

---

## Components

### VIN Scanner (`VINScanner.tsx`)

**Location**: `apps/frontend/src/components/shared/VINScanner.tsx`

**Features**:
- Camera access for scanning VIN barcodes
- OCR placeholder (ready for Tesseract.js integration)
- Manual VIN entry fallback
- Full-screen modal with camera preview

**Usage**:
```typescript
<VINScanner
  onScan={(vin) => {
    console.log('Scanned VIN:', vin);
  }}
  onClose={() => setShowScanner(false)}
/>
```

---

### Vehicle Lookup (`VehicleLookup.tsx`)

**Location**: `apps/frontend/src/components/vehicle/VehicleLookup.tsx`

**Features**:
- VIN input with scanner button
- Auto-decode on VIN entry
- Shows decoded vehicle information
- Searches existing inventory for matching VIN
- "Add to Inventory" button if vehicle not found

**Usage**:
```typescript
<VehicleLookup
  onVehicleSelect={(vehicle) => console.log('Selected:', vehicle)}
  onVINDecoded={(decoded) => console.log('Decoded:', decoded)}
  showAddToInventory={true}
/>
```

---

## Search Results Page Enhancement

**Location**: `apps/frontend/src/pages/search.tsx`

**New Result Type**: `vin_decode`

**Display**:
- Green success card with checkmark icon
- Shows decoded vehicle info (year, make, model, trim)
- Displays engine, transmission, drive type, body style
- "Add to Inventory" button with pre-filled params
- Non-clickable (doesn't navigate to detail page)

---

## Database Schema

VIN decode results are cached in the `Vehicle` table with `status: 'PENDING'` to differentiate from actual inventory vehicles.

**Cached Fields**:
- `vin` (indexed)
- `year`, `make`, `model`, `trim`
- `bodyStyle`, `engine`, `transmission`, `drivetrain`, `fuelType`
- `updatedAt` (for cache freshness)

**Cache Benefits**:
- Faster subsequent lookups
- Reduced NHTSA API calls
- Works offline after first decode
- Tenant-isolated

---

## How It Works (Step-by-Step)

### Example: Adding a Vehicle to Inventory

1. **User opens "Add Vehicle" form**
2. **User types VIN**: `1HGBH41JXMN109186`
3. **On blur (or manual button click)**:
   - Frontend validates format (17 chars, no I/O/Q)
   - Calls `POST /api/vin/decode`
4. **Backend checks cache**:
   - Queries `Vehicle` table for existing VIN
   - If found, returns cached data (fast)
   - If not found, calls NHTSA API
5. **NHTSA responds** with vehicle specs
6. **Backend caches** result in database
7. **Backend returns** decoded data to frontend
8. **Frontend auto-fills** form fields:
   - Year: 2021
   - Make: Honda
   - Model: Accord
   - Trim: EX-L
   - Engine: 4 cyl 1.5L
   - Transmission: Automatic
   - Drive Type: FWD
   - Fuel Type: Gasoline
9. **User completes** other fields (stock number, price, etc.)
10. **User submits** form with pre-filled vehicle data

---

## API Integration Points

### Forms That Need VIN Decode

✅ **Implemented**:
- Vehicle Entry Form (inventory add)
- Trade Appraisal Form

🔲 **To Implement**:
- Deal creation (when adding vehicle to deal)
- Service appointment (when selecting vehicle)
- Any other form with vehicle selection

---

## Testing Checklist

### Backend API
- [ ] Test valid VIN decode
- [ ] Test invalid VIN format
- [ ] Test cache hit (second decode is instant)
- [ ] Test bulk decode endpoint
- [ ] Test multi-tenant isolation
- [ ] Test NHTSA API error handling

### Frontend Forms
- [ ] Vehicle Entry Form auto-decode on blur
- [ ] Trade Appraisal Form with scanner
- [ ] Search with VIN detection
- [ ] VehicleLookup component
- [ ] Error states display correctly
- [ ] Loading states show spinner

### Integration
- [ ] VIN → form fields mapping correct
- [ ] Cached decodes show "from cache" indicator
- [ ] Failed decodes show error message
- [ ] Scanner captures VIN correctly
- [ ] Manual entry works as fallback

---

## Example VINs for Testing

**Honda Accord 2021**:
`1HGCV1F16MA000001`

**Ford F-150 2022**:
`1FTFW1E85NFA00001`

**Toyota Camry 2023**:
`4T1G11AK8PU000001`

**Tesla Model 3 2024**:
`5YJ3E1EA4PF000001`

**Invalid VIN (contains O)**:
`1HGBH41JXMN1O9186` ❌ Should reject

**Too short**:
`1HGBH41JX` ❌ Should reject

---

## Future Enhancements

### Phase 2
- [ ] Add OCR integration (Tesseract.js) for camera scanning
- [ ] Batch import via CSV with VIN decode
- [ ] VIN decode analytics dashboard
- [ ] Integration with pricing APIs (KBB, Edmunds)
- [ ] Vehicle history reports (Carfax/AutoCheck)

### Phase 3
- [ ] ML-powered VIN recognition from photos
- [ ] Mobile app with native camera
- [ ] Barcode scanner for window stickers
- [ ] Auto-populate from license plate

---

## Troubleshooting

### "Failed to decode VIN"
- Check VIN format (17 characters, no I/O/Q)
- Verify backend is running
- Check NHTSA API status (https://vpic.nhtsa.dot.gov/)
- Review backend logs for errors

### "VIN already exists"
- Check if vehicle is already in inventory
- Cache may have stale data (clear Vehicle with PENDING status)

### Auto-decode not triggering
- Ensure VIN is exactly 17 characters
- Check `onBlur` event is firing
- Verify no JavaScript errors in console
- Test manual "Decode VIN" button

---

## Files Changed/Created

**Backend**:
- ✅ `apps/backend/src/routes/vin.ts` (NEW)
- ✅ `apps/backend/src/routes/search.ts` (MODIFIED - added VIN decode)

**Frontend**:
- ✅ `apps/frontend/src/hooks/useVINDecoder.ts` (NEW)
- ✅ `apps/frontend/src/components/vehicle/VehicleLookup.tsx` (NEW)
- ✅ `apps/frontend/src/components/forms/VehicleEntryForm.tsx` (MODIFIED)
- ✅ `apps/frontend/src/services/vinDecoder.ts` (MODIFIED - use backend API)
- ✅ `apps/frontend/src/pages/search.tsx` (MODIFIED - added VIN decode result display)

**Documentation**:
- ✅ `VIN_DECODER_IMPLEMENTATION.md` (NEW - this file)

---

## Next Steps

1. **Register Routes**: Add VIN routes to Express app
   ```typescript
   // In apps/backend/src/index.ts
   import vinRoutes from './routes/vin';
   app.use('/api/vin', vinRoutes);
   ```

2. **Test in Browser**:
   - Open Vehicle Entry Form
   - Enter VIN: `1HGCV1F16MA000001`
   - Tab out of field (blur)
   - Watch form auto-fill

3. **Add to Other Forms**:
   - Deal creation
   - Service scheduling
   - Any form with vehicle input

4. **Deploy**:
   - Run backend with new routes
   - Test with real NHTSA API
   - Monitor cache hit rates

---

**Created**: 2025-11-06
**Status**: ✅ Implementation Complete
**Next**: Route Registration & Testing

