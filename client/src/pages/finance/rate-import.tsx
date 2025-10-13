import { useState } from "react";
import { Link } from "wouter";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type RateTier = "Tier 1" | "Tier 2" | "Tier 3";

interface ImportedRate {
  lender: string;
  tier: RateTier;
  term: number;
  rate: number;
  reserve: number;
}

export default function RateImport() {
  const [file, setFile] = useState<File | null>(null);
  const [rates, setRates] = useState<ImportedRate[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "complete" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    setFile(nextFile);
    setStatus("processing");
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text) as ImportedRate[];
        if (!Array.isArray(parsed)) {
          throw new Error("Invalid rate file structure");
        }
        setRates(parsed);
        setStatus("complete");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unable to parse file");
      }
    };
    reader.onerror = () => {
      setStatus("error");
      setError("Failed to read selected file");
    };

    reader.readAsText(nextFile);
  };

  const handleCommitImport = () => {
    if (!rates.length) {
      setConfirmation("Upload rate data before committing.");
      return;
    }
    setConfirmation(`${rates.length} rate entries prepared for import.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Rate Sheets</h1>
          <p className="text-gray-600">
            Upload lender rate manifests to populate new terms, rates, and reserve
            structures.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/rates">Back to rate sheets</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload file</CardTitle>
          <CardDescription>Accepts JSON exports from lender partners</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept="application/json" onChange={handleFileChange} />

          {file && (
            <div className="rounded-lg border bg-gray-50 p-4 text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}

          {status === "processing" && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Upload className="w-4 h-4 animate-spin" />
              Processing lender data...
            </div>
          )}

          {status === "complete" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Loaded {rates.length} rate entries.
            </div>
          )}

          {status === "error" && error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {rates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Review the imported rate changes before committing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rates.slice(0, 10).map((entry, index) => (
              <div key={`${entry.lender}-${entry.term}-${index}`} className="flex items-center justify-between border rounded-lg p-3">
                <div className="space-y-1">
                  <p className="font-medium">{entry.lender}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline" className="capitalize">{entry.tier}</Badge>
                    <span>{entry.term} months</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Rate</p>
                  <p className="font-semibold">{entry.rate.toFixed(2)}%</p>
                  <p className="text-sm text-gray-600">Reserve {entry.reserve.toFixed(2)}%</p>
                </div>
              </div>
            ))}
            <Button onClick={handleCommitImport}>Commit import</Button>
            {confirmation && <p className="text-sm text-green-600">{confirmation}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
