import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { COMPLIANCE_ITEMS } from "./compliance-data";

interface UpdateForm {
  assignedTo: string;
  dueDate: string;
  escalation: boolean;
  notes: string;
}

export default function ComplianceItemSettings() {
  const params = useParams<{ id: string }>();
  const item = useMemo(
    () => COMPLIANCE_ITEMS.find((entry) => entry.id === params?.id),
    [params?.id]
  );

  const [form, setForm] = useState<UpdateForm>(() => ({
    assignedTo: item?.assignedTo ?? "",
    dueDate: item?.dueDate ?? new Date().toISOString().slice(0, 10),
    escalation: item?.status === "non-compliant" || item?.status === "warning",
    notes: "",
  }));
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance item not found</CardTitle>
          <CardDescription>
            The requested compliance record does not exist. Please return to the
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/finance/compliance">Back to compliance</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleChange = <K extends keyof UpdateForm>(key: K, value: UpdateForm[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setSavedAt(new Date().toISOString());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configure {item.title}</h1>
          <p className="text-gray-600">
            Update ownership, due dates, and escalation preferences for this compliance
            requirement.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/finance/compliance/${item.id}`}>View details</Link>
          </Button>
          <Button asChild>
            <Link href="/finance/compliance">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment &amp; Deadlines</CardTitle>
          <CardDescription>Control who owns this requirement and key due dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">Assigned to</span>
              <Input
                value={form.assignedTo}
                onChange={(event) => handleChange("assignedTo", event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">Due date</span>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) => handleChange("dueDate", event.target.value)}
              />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Escalate if overdue</p>
              <p className="text-sm text-gray-600">
                Send alerts to compliance leadership when this item is not completed by the
                due date.
              </p>
            </div>
            <Switch
              checked={form.escalation}
              onCheckedChange={(checked) => handleChange("escalation", checked)}
            />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-gray-700">Notes</span>
            <Textarea
              rows={5}
              placeholder="Record remediation steps or upcoming audit actions"
              value={form.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
            />
          </label>

          <Button onClick={handleSave}>Save updates</Button>

          {savedAt && (
            <p className="text-sm text-green-600">
              Updates saved {new Date(savedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
