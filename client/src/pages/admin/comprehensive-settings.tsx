import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Save, RefreshCw, Users, Phone, Mail, CreditCard, 
  DollarSign, BarChart3, Bell, Database, Calendar, Clock,
  FileText, AlertCircle, CheckCircle, Target, TrendingUp
} from "lucide-react";

export default function ComprehensiveSettings() {
  const [settings, setSettings] = useState({
    dealership: {
      name: "AutolytiQ Motors",
      address: "123 Dealership Way, City, ST 12345",
      phone: "(555) 123-4567",
      website: "https://autolytiq.com",
      dealerLicense: "DL123456789"
    },
    prospects: {
      unsoldDaysUntilMarkedMissed: 15,
      ownerBaseDaysUntilMarked: 30,
      leaseProspectsShowUp: 90,
      leaseProspectsDaysUntilMarked: 30,
      daysSinceLastContactToAvoidStaking: 30,
      followUpRules: {
        newShowroomVisits: 21,
        previousShowroomVisits: 30,
        previousInternetLeads: 30,
        newInternetLeads: 30
      }
    },
    finance: {
      serviceToFinanceReport: {
        mileageLessThan: 36000,
        serviceToSalesReport: 3,
        yearsGreaterThan: 3,
        annualGreaterThan: 500,
        mileageGreaterThan: 36000
      },
      workADealSetup: {
        documentationFee: 0,
        payDepositFee: 0,
        licenseFee: 0,
        miscFee: 0,
        stateInspection: 0,
        titleFee: 0
      },
      taxes: {
        cityTax: 0,
        countySalesTax: 0,
        stateSalesTax: 0,
        inventoryTaxRate: 0,
        dealerCashTaxRate: 0,
        busTaxRate: 0,
        retailMSRPTaxRate: 0,
        leaseCashCapReductionTax: 0
      }
    },
    dsp: {
      noShowAppointments: true,
      serviceHighMileage: 35000,
      matureDays: 45,
      birthdays: true,
      announcementCustomers: true,
      mergeCustomers: false,
      lockOutEmployee: false,
      automaticallyGenerateLetters: false,
      lockDownDatabase: false
    },
    marketing: {
      letterMargins: {
        top: 1,
        left: 1,
        right: 1,
        bottom: 1
      },
      quickPrintForms: {
        desking: "Form 1",
        form2: "Form 2",
        form3: "Form 3"
      },
      gasVoucher: "Standard",
      ballment: "Standard",
      driversLicenseScanner: "PDLR v16.50"
    },
    automation: {
      internetLeads: {
        emailAddress: "callright11839@car-crm.com",
        measurement: "https://measurement.car-research.com/",
        callMeasurement: "https://callmeasurement.car-research.com",
        dialSourceService: "http://calldialogservice.car-research.com",
        postAddress: "http://callright11839.car-research.com/"
      },
      newInternetLeads: {
        alwaysFollowUp: true,
        retainCurrentEmployee: true,
        enableDuplicationChecking: true,
        assignEmpToBDCEmp: true,
        resolveBookingOut: true,
        viewAllCustomers: true
      }
    }
  });

  const handleSettingChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = () => {
    console.log("Saving comprehensive settings:", settings);
    // API call to save settings
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Enterprise Settings</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Comprehensive dealership management configuration</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button onClick={saveSettings} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Comprehensive Settings Tabs */}
      <Tabs defaultValue="dealership" className="w-full">
        <div className="overflow-x-auto mb-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 min-w-max">
            <TabsTrigger value="dealership" className="text-xs px-2">Dealership</TabsTrigger>
            <TabsTrigger value="prospects" className="text-xs px-2">Prospects</TabsTrigger>
            <TabsTrigger value="finance" className="text-xs px-2">Finance</TabsTrigger>
            <TabsTrigger value="dsp" className="text-xs px-2">DSP Settings</TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs px-2">Marketing</TabsTrigger>
            <TabsTrigger value="automation" className="text-xs px-2">Automation</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs px-2">Reports</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs px-2">Integration</TabsTrigger>
          </TabsList>
        </div>

        {/* Dealership Information */}
        <TabsContent value="dealership" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Dealership Information
              </CardTitle>
              <CardDescription>Core dealership details and business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Dealership Name</Label>
                  <Input 
                    value={settings.dealership.name}
                    onChange={(e) => handleSettingChange('dealership', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dealer License Number</Label>
                  <Input 
                    value={settings.dealership.dealerLicense}
                    onChange={(e) => handleSettingChange('dealership', 'dealerLicense', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input 
                  value={settings.dealership.address}
                  onChange={(e) => handleSettingChange('dealership', 'address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={settings.dealership.phone}
                    onChange={(e) => handleSettingChange('dealership', 'phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input 
                    value={settings.dealership.website}
                    onChange={(e) => handleSettingChange('dealership', 'website', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prospects Settings */}
        <TabsContent value="prospects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Prospect Management Settings
              </CardTitle>
              <CardDescription>Configure prospect lifecycle and follow-up rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Unsold Days Until Marked Missed</Label>
                  <Input 
                    type="number"
                    value={settings.prospects.unsoldDaysUntilMarkedMissed}
                    onChange={(e) => handleSettingChange('prospects', 'unsoldDaysUntilMarkedMissed', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner Base Days Until Marked</Label>
                  <Input 
                    type="number"
                    value={settings.prospects.ownerBaseDaysUntilMarked}
                    onChange={(e) => handleSettingChange('prospects', 'ownerBaseDaysUntilMarked', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lease Prospects Show Up (days)</Label>
                  <Input 
                    type="number"
                    value={settings.prospects.leaseProspectsShowUp}
                    onChange={(e) => handleSettingChange('prospects', 'leaseProspectsShowUp', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Days Since Last Contact</Label>
                  <Input 
                    type="number"
                    value={settings.prospects.daysSinceLastContactToAvoidStaking}
                    onChange={(e) => handleSettingChange('prospects', 'daysSinceLastContactToAvoidStaking', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold mb-4">Follow-Up Rules (Days)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>New Showroom Visits</Label>
                    <Input 
                      type="number"
                      value={settings.prospects.followUpRules.newShowroomVisits}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Previous Showroom Visits</Label>
                    <Input 
                      type="number"
                      value={settings.prospects.followUpRules.previousShowroomVisits}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Previous Internet Leads</Label>
                    <Input 
                      type="number"
                      value={settings.prospects.followUpRules.previousInternetLeads}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Internet Leads</Label>
                    <Input 
                      type="number"
                      value={settings.prospects.followUpRules.newInternetLeads}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Settings */}
        <TabsContent value="finance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Finance & Tax Configuration
              </CardTitle>
              <CardDescription>Configure financial settings, taxes, and fee structures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Work-A-Deal Setup</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Documentation Fee</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.workADealSetup.documentationFee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Deposit Fee</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.workADealSetup.payDepositFee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Fee</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.workADealSetup.licenseFee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Misc Fee</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.workADealSetup.miscFee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State Inspection</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.workADealSetup.stateInspection}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title Fee</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.workADealSetup.titleFee}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold mb-4">Tax Configuration</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>City Tax (%)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.taxes.cityTax}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>County Sales Tax (%)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.taxes.countySalesTax}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State Sales Tax (%)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.taxes.stateSalesTax}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Inventory Tax Rate (%)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={settings.finance.taxes.inventoryTaxRate}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DSP Settings */}
        <TabsContent value="dsp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                DSP Automation Settings
              </CardTitle>
              <CardDescription>Configure digital service provider automation options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>No Show Appointments</Label>
                    <Switch checked={settings.dsp.noShowAppointments} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>DSP Automation: Birthdays</Label>
                    <Switch checked={settings.dsp.birthdays} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>DSP Automation: Announcement Customers</Label>
                    <Switch checked={settings.dsp.announcementCustomers} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Merge Customers - Copy Credit Data</Label>
                    <Switch checked={settings.dsp.mergeCustomers} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>DSP Automation: Service - High Mileage Script</Label>
                    <Input 
                      type="number"
                      value={settings.dsp.serviceHighMileage}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DSP Automation: Sold - Maturity Days Script</Label>
                    <Input 
                      type="number"
                      value={settings.dsp.matureDays}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Lock Out Employee if Follow-Up Incomplete</Label>
                    <Switch checked={settings.dsp.lockOutEmployee} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Automatically Generate Daily Letters</Label>
                    <Switch checked={settings.dsp.automaticallyGenerateLetters} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Settings */}
        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Marketing & Print Configuration
              </CardTitle>
              <CardDescription>Configure marketing materials and print settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Letter Margins</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Top Margin</Label>
                    <Input 
                      type="number"
                      value={settings.marketing.letterMargins.top}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Left Margin</Label>
                    <Input 
                      type="number"
                      value={settings.marketing.letterMargins.left}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Right Margin</Label>
                    <Input 
                      type="number"
                      value={settings.marketing.letterMargins.right}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bottom Margin</Label>
                    <Input 
                      type="number"
                      value={settings.marketing.letterMargins.bottom}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Print Forms</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Desking Form</Label>
                    <Select value={settings.marketing.quickPrintForms.desking}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Form 1">Form 1</SelectItem>
                        <SelectItem value="Form 2">Form 2</SelectItem>
                        <SelectItem value="Form 3">Form 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gas Voucher</Label>
                    <Select value={settings.marketing.gasVoucher}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Driver's License Scanner</Label>
                    <Select value={settings.marketing.driversLicenseScanner}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDLR v16.50">PDLR v16.50</SelectItem>
                        <SelectItem value="PDLR v17.00">PDLR v17.00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Settings */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Internet Lead Automation
              </CardTitle>
              <CardDescription>Configure automated internet lead processing and integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Internet Lead E-Mail Addresses</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary E-Mail Address</Label>
                    <Input 
                      value={settings.automation.internetLeads.emailAddress}
                      onChange={(e) => handleSettingChange('automation', 'internetLeads', { ...settings.automation.internetLeads, emailAddress: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Call Measurement Post Address</Label>
                    <Input 
                      value={settings.automation.internetLeads.measurement}
                      onChange={(e) => handleSettingChange('automation', 'internetLeads', { ...settings.automation.internetLeads, measurement: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Call Source Service Post Address</Label>
                    <Input 
                      value={settings.automation.internetLeads.callMeasurement}
                      onChange={(e) => handleSettingChange('automation', 'internetLeads', { ...settings.automation.internetLeads, callMeasurement: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold mb-4">New Internet Leads Configuration</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Always Follow Up</Label>
                      <Switch checked={settings.automation.newInternetLeads.alwaysFollowUp} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Retain Current Employee</Label>
                      <Switch checked={settings.automation.newInternetLeads.retainCurrentEmployee} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enable Duplication Checking</Label>
                      <Switch checked={settings.automation.newInternetLeads.enableDuplicationChecking} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Assign Employee to BDC Employee</Label>
                      <Switch checked={settings.automation.newInternetLeads.assignEmpToBDCEmp} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Resolve Booking Out</Label>
                      <Switch checked={settings.automation.newInternetLeads.resolveBookingOut} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>View All Customers in ILM</Label>
                      <Switch checked={settings.automation.newInternetLeads.viewAllCustomers} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Placeholder */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>Configure automated reports and analytics settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Report configuration settings will be available in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Placeholder */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Integrations
              </CardTitle>
              <CardDescription>Configure third-party system integrations and API connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Integration configuration will be available in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}