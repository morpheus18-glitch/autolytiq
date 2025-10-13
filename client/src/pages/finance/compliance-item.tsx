import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Calendar, FileText, UserCircle } from "lucide-react";
import { COMPLIANCE_ITEMS, ComplianceItem } from "./compliance-data";

const STATUS_BADGE: Record<ComplianceItem["status"], string> = {
  compliant: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  "non-compliant": "bg-red-100 text-red-800",
  pending: "bg-blue-100 text-blue-800",
};

export default function ComplianceItemDetail() {
  const params = useParams<{ id: string }>();
  const item = COMPLIANCE_ITEMS.find((entry) => entry.id === params?.id);

  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance item not found</CardTitle>
          <CardDescription>
            The compliance record you are looking for does not exist or was removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/finance/compliance">Return to compliance dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-gray-600">
            Detailed compliance history, responsibilities, and documentation for this item.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/finance/compliance">Back to dashboard</Link>
          </Button>
          <Button asChild>
            <Link href={`/finance/compliance/${item.id}/settings`}>
              Configure item
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Current status and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`capitalize ${STATUS_BADGE[item.status]}`}>
                {item.status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {item.type}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Due {new Date(item.dueDate).toLocaleDateString()}
              </div>
            </div>
            <p className="text-gray-700">{item.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner</CardTitle>
            <CardDescription>Primary responsible team member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <UserCircle className="w-5 h-5" />
              {item.assignedTo}
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Calendar className="w-4 h-4" />
              Last updated {new Date(item.lastUpdated).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              {item.status === "non-compliant" || item.status === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {item.status === "compliant"
                ? "All requirements satisfied"
                : "Action required"}
            </div>
          </CardContent>
        </Card>
      </div>

      {item.relatedDocuments && (
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>Version history for compliance evidence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.relatedDocuments.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between border rounded-lg p-4">
                <div className="space-y-1">
                  <p className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {doc.name}
                  </p>
                  <p className="text-sm text-gray-600">Version {doc.version}</p>
                  <p className="text-sm text-gray-600">
                    Last reviewed {new Date(doc.lastReviewed).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a href={doc.url} download>
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
