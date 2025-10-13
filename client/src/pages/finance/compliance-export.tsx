import { useState } from "react";
import { Link } from "wouter";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COMPLIANCE_ITEMS } from "./compliance-data";

interface ExportOptions {
  includeDocuments: boolean;
  includeTraining: boolean;
  includeAudits: boolean;
  includeHistory: boolean;
  rangeStart: string;
  rangeEnd: string;
  format: "csv" | "xlsx" | "json";
}

export default function ComplianceExport() {
  const [options, setOptions] = useState<ExportOptions>({
    includeDocuments: true,
    includeTraining: true,
    includeAudits: true,
    includeHistory: false,
    rangeStart: "2024-01-01",
    rangeEnd: "2025-12-31",
    format: "xlsx",
  });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const toggle = (key: keyof ExportOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
  };

  const updateOption = (key: keyof ExportOptions, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerate = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      options,
      items: COMPLIANCE_ITEMS.filter((item) => {
        if (item.type === "document" && !options.includeDocuments) return false;
        if (item.type === "training" && !options.includeTraining) return false;
        if (item.type === "audit" && !options.includeAudits) return false;
        return true;
      }),
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
        <div className="flex items-center gap-3">
          <Download className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Export Compliance Report</h1>
            <p className="text-gray-600">
              Configure document coverage, history, and export format to generate a
              downloadable compliance report.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/compliance">Back to Compliance</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Select the sections to include with the export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox
                  checked={options.includeDocuments}
                  onCheckedChange={() => toggle("includeDocuments")}
                />
                <div>
                  <p className="font-medium">Policy &amp; Disclosure Documents</p>
                  <p className="text-sm text-gray-600">
                    Include all regulatory policies, forms, and signed disclosures.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox
                  checked={options.includeTraining}
                  onCheckedChange={() => toggle("includeTraining")}
                />
                <div>
                  <p className="font-medium">Training &amp; Certifications</p>
                  <p className="text-sm text-gray-600">
                    Export attendance, completion dates, and outstanding training tasks.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox
                  checked={options.includeAudits}
                  onCheckedChange={() => toggle("includeAudits")}
                />
                <div>
                  <p className="font-medium">Audits &amp; Reviews</p>
                  <p className="text-sm text-gray-600">
                    Include completed audit findings and open remediation items.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox
                  checked={options.includeHistory}
                  onCheckedChange={() => toggle("includeHistory")}
                />
                <div>
                  <p className="font-medium">Change History</p>
                  <p className="text-sm text-gray-600">
                    Append all change logs and approval workflows for the selected period.
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">Start date</span>
                <Input
                  type="date"
                  value={options.rangeStart}
                  onChange={(event) => updateOption("rangeStart", event.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">End date</span>
                <Input
                  type="date"
                  value={options.rangeEnd}
                  onChange={(event) => updateOption("rangeEnd", event.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">Export format</span>
              <div className="flex flex-wrap gap-2">
                {["csv", "xlsx", "json"].map((format) => (
                  <Button
                    key={format}
                    type="button"
                    variant={options.format === format ? "default" : "outline"}
                    onClick={() => updateOption("format", format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="mt-2" onClick={handleGenerate}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Generate Export
            </Button>

            {downloadUrl && (
              <div className="rounded-lg border p-4 bg-green-50 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-green-700">Report generated</p>
                  <p className="text-sm text-green-600">
                    Download the generated {options.format.toUpperCase()} file.
                  </p>
                </div>
                <Button asChild variant="default">
                  <a href={downloadUrl} download={`compliance-report.${options.format}`}>
                    Download
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Summary of included compliance items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {COMPLIANCE_ITEMS.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.title}</p>
                  <Badge className="capitalize" variant="outline">
                    {item.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  <span>Owner: {item.assignedTo}</span>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
