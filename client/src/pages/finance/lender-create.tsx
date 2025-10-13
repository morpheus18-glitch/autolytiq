import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

interface FormState {
  name: string;
  rep: string;
  email: string;
  phone: string;
  type: "Captive" | "Bank" | "Credit Union";
  priority: "Tier 1" | "Tier 2" | "Tier 3";
  notes: string;
}

export default function LenderCreate() {
  const [form, setForm] = useState<FormState>({
    name: "",
    rep: "",
    email: "",
    phone: "",
    type: "Captive",
    priority: "Tier 1",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add lender partner</h1>
          <p className="text-gray-600">
            Capture lender contact information and priority routing details for your finance
            team.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/lenders">Back to lender list</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lender profile</CardTitle>
          <CardDescription>Provide the contact and routing basics</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">Lender name</span>
                <Input
                  required
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">Primary representative</span>
                <Input
                  required
                  value={form.rep}
                  onChange={(event) => handleChange("rep", event.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">Phone</span>
                <Input
                  required
                  value={form.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">Lender type</span>
                <Select value={form.type} onValueChange={(value) => handleChange("type", value as FormState["type"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Captive">Captive</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="Credit Union">Credit Union</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">Priority tier</span>
                <Select value={form.priority} onValueChange={(value) => handleChange("priority", value as FormState["priority"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                    <SelectItem value="Tier 3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">Notes</span>
              <Textarea
                rows={4}
                placeholder="Share onboarding details, reserve structures, or next steps"
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
              />
            </label>

            <div className="flex items-center gap-3">
              <Button type="submit">Create lender</Button>
              {submitted && (
                <span className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Lender saved for review
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
