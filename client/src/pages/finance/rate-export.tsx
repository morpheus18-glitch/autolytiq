import { useState } from "react";
import { Link } from "wouter";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ExportForm {
  includeReserves: boolean;
  includeHistory: boolean;
  format: "csv" | "xlsx" | "json";
  email: string;
}

const SAMPLE_RATES = [
  { lender: "Honda Finance", tier: "Tier 1", term: 60, rate: 4.3, reserve: 1.45 },
  { lender: "Bank of America", tier: "Tier 1", term: 72, rate: 5.4, reserve: 1.85 },
  { lender: "Capital One Auto Finance", tier: "Tier 2", term: 60, rate: 7.9, reserve: 2.75 },
];

export default function RateExport() {
  const [form, setForm] = useState<ExportForm>({
    includeReserves: true,
    includeHistory: false,
    format: "csv",
    email: "",
  });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleToggle = (key: keyof ExportForm) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
  };

  const handleChange = (key: keyof ExportForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerate = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      options: form,
      data: SAMPLE_RATES,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Export Rate Sheets</h1>
          <p className="text-gray-600">
            Choose fields and a delivery method to export the most recent lender rate
            sheets.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/rates">Back to rate sheets</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Export configuration</CardTitle>
            <CardDescription>Select data sets and delivery preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 rounded-lg border p-4">
              <Checkbox
                checked={form.includeReserves}
                onCheckedChange={() => handleToggle("includeReserves")}
              />
              <div>
                <p className="font-medium">Include reserve structures</p>
                <p className="text-sm text-gray-600">
                  Export lender reserve participation values alongside rate tiers.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border p-4">
              <Checkbox
                checked={form.includeHistory}
                onCheckedChange={() => handleToggle("includeHistory")}
              />
              <div>
                <p className="font-medium">Include historical changes</p>
                <p className="text-sm text-gray-600">
                  Append weekly rate changes and effective dates for audit purposes.
                </p>
              </div>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">Format</span>
              <div className="flex flex-wrap gap-2">
                {["csv", "xlsx", "json"].map((format) => (
                  <Button
                    key={format}
                    variant={form.format === format ? "default" : "outline"}
                    type="button"
                    onClick={() => handleChange("format", format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">Email a copy</span>
              <Input
                type="email"
                placeholder="finance@dealership.com"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
              />
            </label>

            <Button onClick={handleGenerate}>
              <Download className="w-4 h-4 mr-2" />
              Generate export
            </Button>

            {downloadUrl && (
              <div className="rounded-lg border bg-green-50 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-700">Export ready</p>
                  <p className="text-sm text-green-600">
                    Download the {form.format.toUpperCase()} file and review before sharing.
                  </p>
                </div>
                <Button asChild>
                  <a href={downloadUrl} download={`rate-sheets.${form.format}`}>
                    Download
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Included lenders</CardTitle>
            <CardDescription>Snapshot of data in this export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SAMPLE_RATES.map((entry) => (
              <div key={`${entry.lender}-${entry.term}`} className="border rounded-lg p-3">
                <p className="font-medium">{entry.lender}</p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <Badge variant="outline">{entry.tier}</Badge>
                  <span>{entry.term} months</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                  <span>Rate {entry.rate.toFixed(2)}%</span>
                  {form.includeReserves && <span>Reserve {entry.reserve.toFixed(2)}%</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
