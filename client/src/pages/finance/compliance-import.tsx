import { useState } from "react";
import { Link } from "wouter";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ImportStatus = "idle" | "processing" | "complete" | "error";

interface ParsedDocument {
  name: string;
  type: string;
  uploadedAt: string;
  status: "validated" | "needs-review";
}

export default function ComplianceImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<ParsedDocument[]>([]);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setStatus("processing");
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text) as ParsedDocument[];
        if (!Array.isArray(parsed)) {
          throw new Error("Invalid document manifest");
        }
        setDocuments(
          parsed.map((doc) => ({
            ...doc,
            uploadedAt: doc.uploadedAt ?? new Date().toISOString(),
            status: doc.status ?? "needs-review",
          }))
        );
        setStatus("complete");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Unable to read the selected document manifest."
        );
      }
    };
    reader.onerror = () => {
      setStatus("error");
      setError("Failed to read the selected file.");
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!documents.length) {
      setConfirmation("Add documents before confirming import.");
      return;
    }
    setConfirmation(`${documents.length} document${documents.length > 1 ? 's' : ''} queued for import.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Upload className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Import Compliance Documents</h1>
            <p className="text-gray-600">
              Upload JSON manifests to bulk import compliance documentation and training
              records.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/compliance">
            Back to Compliance
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Manifest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="manifest">
              Select JSON manifest
            </label>
            <Input
              id="manifest"
              type="file"
              accept="application/json"
              onChange={handleFileSelect}
            />
            <p className="text-sm text-gray-500">
              The manifest should include an array of documents with name, type, and status
              fields.
            </p>
          </div>

          {selectedFile && (
            <div className="rounded-lg border p-4 bg-gray-50">
              <p className="text-sm font-medium">Selected file</p>
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
            </div>
          )}

          {status === "processing" && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Upload className="w-4 h-4 animate-spin" />
              Processing document manifest...
            </div>
          )}

          {status === "complete" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Successfully processed {documents.length} document(s).
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

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-600">Type: {doc.type}</p>
                  <p className="text-sm text-gray-600">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={doc.status === "validated" ? "default" : "secondary"}>
                  {doc.status === "validated" ? "Validated" : "Needs Review"}
                </Badge>
              </div>
            ))}
            <Button className="self-start" onClick={handleConfirmImport}>Confirm Import</Button>
            {confirmation && <p className="text-sm text-green-600">{confirmation}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
