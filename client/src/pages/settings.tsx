import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-500">Manage your dealership settings</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Smith" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@dealership.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              <Button className="bg-primary hover:bg-blue-700">Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Dealership Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dealershipName">Dealership Name</Label>
                <Input id="dealershipName" defaultValue="Premier Auto Sales" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Main Street, City, State 12345" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dealershipPhone">Phone</Label>
                  <Input id="dealershipPhone" type="tel" defaultValue="+1 (555) 987-6543" />
                </div>
                <div>
                  <Label htmlFor="dealershipEmail">Email</Label>
                  <Input id="dealershipEmail" type="email" defaultValue="info@premierauto.com" />
                </div>
              </div>
              <Button className="bg-primary hover:bg-blue-700">Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch id="emailNotifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch id="smsNotifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="leadAlerts">Lead Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when new leads arrive</p>
                </div>
                <Switch id="leadAlerts" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="saleAlerts">Sale Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when sales are completed</p>
                </div>
                <Switch id="saleAlerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
