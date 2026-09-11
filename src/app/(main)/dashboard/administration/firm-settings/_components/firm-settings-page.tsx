"use client";

import { useState } from "react";

import { Bell, Building2, CheckCircle, CreditCard, Key, Palette, Save, Settings, Shield, Upload } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/ca-nexus/page-blocks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const firmSettingsTabs = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "security", label: "Security", icon: Key },
];

interface FirmSettingsFormData {
  // Organization
  name: string;
  registrationNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  tan: string;
  logoUrl: string;

  // Preferences
  timezone: string;
  dateFormat: string;
  currency: string;
  fiscalYearStart: number;
  defaultLanguage: string;

  // Compliance
  defaultReminderDays: string;
  escalationDays: string;
  autoGenerateMatter: boolean;
  defaultAssignmentRule: "round_robin" | "least_loaded" | "specialist";

  // Notifications
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  digestFrequency: "immediate" | "hourly" | "daily" | "weekly";

  // Billing
  defaultBillingMethod: string;
  defaultPaymentTerms: number;
  latePaymentInterest: number;
  invoicePrefix: string;
  invoiceSequence: number;

  // Branding
  primaryColor: string;
  companyName: string;
  faviconUrl: string;

  // Security
  mfaRequired: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordRequireNumber: boolean;
  passwordRequireUppercase: boolean;
  ipWhitelist: string;
  auditLogRetention: number;
}

const initialFormData: FirmSettingsFormData = {
  name: "CA Nexus Professional Services",
  registrationNumber: "CA-FIRM-2024-001",
  addressLine1: "123 Business Park, Tower A",
  addressLine2: "10th Floor, Sector 18",
  city: "Gurugram",
  state: "Haryana",
  postalCode: "122001",
  country: "India",
  phone: "+91-124-4567890",
  email: "info@canexus.com",
  website: "https://canexus.com",
  gstin: "06AAACC1234A1Z5",
  pan: "AAACC1234A",
  tan: "DELH12345A",
  logoUrl: "https://example.com/logo.png",

  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  currency: "INR",
  fiscalYearStart: 4,
  defaultLanguage: "en",

  defaultReminderDays: "7,3,1",
  escalationDays: "15,30,60",
  autoGenerateMatter: true,
  defaultAssignmentRule: "least_loaded",

  emailEnabled: true,
  whatsappEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  digestFrequency: "daily",

  defaultBillingMethod: "hourly",
  defaultPaymentTerms: 30,
  latePaymentInterest: 18,
  invoicePrefix: "INV",
  invoiceSequence: 1,

  primaryColor: "#3B82F6",
  companyName: "CA Nexus",
  faviconUrl: "https://example.com/favicon.ico",

  mfaRequired: true,
  sessionTimeout: 480,
  passwordMinLength: 8,
  passwordRequireSpecial: true,
  passwordRequireNumber: true,
  passwordRequireUppercase: true,
  ipWhitelist: "",
  auditLogRetention: 365,
};

export function FirmSettingsPage() {
  const [activeTab, setActiveTab] = useState("organization");
  const [formData, setFormData] = useState<FirmSettingsFormData>(initialFormData);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key: keyof FirmSettingsFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleBooleanChange = (key: keyof FirmSettingsFormData) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Settings"
        description="Configure organization details, preferences, and practice settings"
        actions={
          <Button variant="outline" size="sm" onClick={() => handleSave()} disabled={saving}>
            {saving ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-labelledby="spinner-title">
                  <title id="spinner-title">Loading spinner</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        }
      />

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 text-sm dark:text-green-400">Settings saved successfully!</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {firmSettingsTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <FirmOrganizationTab formData={formData} onChange={handleChange} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <FirmPreferencesTab formData={formData} onChange={handleChange} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <FirmComplianceTab formData={formData} onChange={handleChange} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <FirmNotificationsTab formData={formData} onChange={handleChange} onBooleanChange={handleBooleanChange} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <FirmBillingTab formData={formData} onChange={handleChange} />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <FirmBrandingTab formData={formData} onChange={handleChange} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <FirmSecurityTab formData={formData} onChange={handleChange} onBooleanChange={handleBooleanChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FirmOrganizationTab({
  formData,
  onChange,
}: {
  formData: FirmSettingsFormData;
  onChange: (key: keyof FirmSettingsFormData, value: string | number | boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Firm Details">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name">Firm Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Enter firm name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => onChange("registrationNumber", e.target.value)}
              placeholder="CA-FIRM-2024-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Display Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => onChange("companyName", e.target.value)}
              placeholder="CA Nexus"
            />
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => onChange("addressLine1", e.target.value)}
              placeholder="123 Business Park, Tower A"
            />
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => onChange("addressLine2", e.target.value)}
              placeholder="10th Floor, Sector 18"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Gurugram"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => onChange("state", e.target.value)}
              placeholder="Haryana"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => onChange("postalCode", e.target.value)}
              placeholder="122001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => onChange("country", e.target.value)}
              placeholder="India"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact Information">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+91-124-4567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="info@canexus.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => onChange("website", e.target.value)}
              placeholder="https://canexus.com"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Tax Registrations">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              value={formData.gstin}
              onChange={(e) => onChange("gstin", e.target.value)}
              placeholder="06AAACC1234A1Z5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pan">PAN</Label>
            <Input
              id="pan"
              value={formData.pan}
              onChange={(e) => onChange("pan", e.target.value)}
              placeholder="AAACC1234A"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tan">TAN</Label>
            <Input
              id="tan"
              value={formData.tan}
              onChange={(e) => onChange("tan", e.target.value)}
              placeholder="DELH12345A"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Logo">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.logoUrl} alt="Firm Logo" />
              <AvatarFallback className="text-2xl">CN</AvatarFallback>
            </Avatar>
            <label className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-primary p-1 text-primary-foreground">
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && onChange("logoUrl", URL.createObjectURL(e.target.files[0]))}
              />
            </label>
          </div>
          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => onChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <p className="text-muted-foreground text-sm">Recommended: 200x200px, PNG or SVG format</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function FirmPreferencesTab({
  formData,
  onChange,
}: {
  formData: FirmSettingsFormData;
  onChange: (key: keyof FirmSettingsFormData, value: string | number | boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Regional Settings">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone *</Label>
            <Select value={formData.timezone} onValueChange={(v) => onChange("timezone", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format *</Label>
            <Select value={formData.dateFormat} onValueChange={(v) => onChange("dateFormat", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY (31-Dec-2024)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={formData.currency} onValueChange={(v) => onChange("currency", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
                <SelectItem value="SGD">SGD (S$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiscalYearStart">Fiscal Year Start Month *</Label>
            <Select
              value={String(formData.fiscalYearStart)}
              onValueChange={(v) => onChange("fiscalYearStart", parseInt(v, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(2024, m - 1).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultLanguage">Default Language *</Label>
            <Select value={formData.defaultLanguage} onValueChange={(v) => onChange("defaultLanguage", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="gu">Gujarati</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Default Settings">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="defaultBillingMethod">Default Billing Method</Label>
            <Select value={formData.defaultBillingMethod} onValueChange={(v) => onChange("defaultBillingMethod", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="fixed_fee">Fixed Fee</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
            <Input
              id="defaultPaymentTerms"
              type="number"
              value={formData.defaultPaymentTerms}
              onChange={(e) => onChange("defaultPaymentTerms", parseInt(e.target.value, 10))}
              min="0"
              max="365"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latePaymentInterest">Late Payment Interest (% p.a.)</Label>
            <Input
              id="latePaymentInterest"
              type="number"
              step="0.1"
              value={formData.latePaymentInterest}
              onChange={(e) => onChange("latePaymentInterest", parseFloat(e.target.value))}
              min="0"
              max="50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
            <Input
              id="invoicePrefix"
              value={formData.invoicePrefix}
              onChange={(e) => onChange("invoicePrefix", e.target.value)}
              placeholder="INV"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceSequence">Invoice Sequence Start</Label>
            <Input
              id="invoiceSequence"
              type="number"
              value={formData.invoiceSequence}
              onChange={(e) => onChange("invoiceSequence", parseInt(e.target.value, 10))}
              min="1"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function FirmComplianceTab({
  formData,
  onChange,
}: {
  formData: FirmSettingsFormData;
  onChange: (key: keyof FirmSettingsFormData, value: string | number | boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Reminder & Escalation Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="defaultReminderDays">Default Reminder Days (comma-separated)</Label>
            <Input
              id="defaultReminderDays"
              value={formData.defaultReminderDays}
              onChange={(e) => onChange("defaultReminderDays", e.target.value)}
              placeholder="7,3,1"
            />
            <p className="text-muted-foreground text-sm">Days before due date to send reminders</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="escalationDays">Escalation Days (comma-separated)</Label>
            <Input
              id="escalationDays"
              value={formData.escalationDays}
              onChange={(e) => onChange("escalationDays", e.target.value)}
              placeholder="15,30,60"
            />
            <p className="text-muted-foreground text-sm">Days overdue before escalation</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Assignment Rules">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="autoGenerateMatter">Auto-generate Matter on Compliance Cycle Creation</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="autoGenerateMatter"
                checked={formData.autoGenerateMatter}
                onCheckedChange={() => handleBooleanChange("autoGenerateMatter")}
              />
              <span className="text-sm">Automatically create matters when new compliance cycles are created</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultAssignmentRule">Default Assignment Rule</Label>
            <Select value={formData.defaultAssignmentRule} onValueChange={(v) => onChange("defaultAssignmentRule", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select rule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round_robin">Round Robin</SelectItem>
                <SelectItem value="least_loaded">Least Loaded</SelectItem>
                <SelectItem value="specialist">Specialist Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Compliance Configuration Defaults">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Default Reminder Template</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Standard Reminder</SelectItem>
                <SelectItem value="urgent">Urgent Reminder</SelectItem>
                <SelectItem value="final">Final Notice</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default Checklist Template</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="itr">ITR Filing Checklist</SelectItem>
                <SelectItem value="gst">GST Return Checklist</SelectItem>
                <SelectItem value="tds">TDS Filing Checklist</SelectItem>
                <SelectItem value="audit">Audit Planning Checklist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function handleBooleanChange(_key: keyof FirmSettingsFormData) {
  // This will be passed as prop
}

function FirmNotificationsTab({
  formData,
  onChange,
  onBooleanChange,
}: {
  formData: FirmSettingsFormData;
  onChange: (key: keyof FirmSettingsFormData, value: string | number | boolean) => void;
  onBooleanChange: (key: keyof FirmSettingsFormData) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Notification Channels">
        <div className="space-y-4">
          {[
            { key: "emailEnabled", label: "Email Notifications", description: "Send notifications via email" },
            {
              key: "whatsappEnabled",
              label: "WhatsApp Notifications",
              description: "Send notifications via WhatsApp Business API",
            },
            { key: "smsEnabled", label: "SMS Notifications", description: "Send notifications via SMS gateway" },
            {
              key: "inAppEnabled",
              label: "In-App Notifications",
              description: "Show notifications within the application",
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
              <Switch
                checked={formData[key as keyof FirmSettingsFormData] as boolean}
                onCheckedChange={() => onBooleanChange(key as keyof FirmSettingsFormData)}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Digest Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="digestFrequency">Notification Digest Frequency</Label>
            <Select value={formData.digestFrequency} onValueChange={(v) => onChange("digestFrequency", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest (9 AM)</SelectItem>
                <SelectItem value="weekly">Weekly Digest (Monday 9 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Default Notification Templates">
        <div className="space-y-4">
          {[
            "Compliance Reminder",
            "Document Request",
            "Task Assignment",
            "Payment Received",
            "Review Request",
            "Notice Received",
          ].map((template) => (
            <div key={template} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{template}</p>
                <p className="text-muted-foreground text-sm">Configure template content and variables</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function FirmBillingTab({
  formData,
  onChange,
}: {
  formData: FirmSettingsFormData;
  onChange: (key: keyof FirmSettingsFormData, value: string | number | boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Billing Configuration">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="defaultBillingMethod">Default Billing Method</Label>
            <Select value={formData.defaultBillingMethod} onValueChange={(v) => onChange("defaultBillingMethod", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="fixed_fee">Fixed Fee</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
            <Input
              id="defaultPaymentTerms"
              type="number"
              value={formData.defaultPaymentTerms}
              onChange={(e) => onChange("defaultPaymentTerms", parseInt(e.target.value, 10))}
              min="0"
              max="365"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latePaymentInterest">Late Payment Interest (% p.a.)</Label>
            <Input
              id="latePaymentInterest"
              type="number"
              step="0.1"
              value={formData.latePaymentInterest}
              onChange={(e) => onChange("latePaymentInterest", parseFloat(e.target.value))}
              min="0"
              max="50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
            <Input
              id="invoicePrefix"
              value={formData.invoicePrefix}
              onChange={(e) => onChange("invoicePrefix", e.target.value)}
              placeholder="INV"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceSequence">Invoice Sequence Start</Label>
            <Input
              id="invoiceSequence"
              type="number"
              value={formData.invoiceSequence}
              onChange={(e) => onChange("invoiceSequence", parseInt(e.target.value, 10))}
              min="1"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Tax Configuration">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Default GST Rate (%)</Label>
            <Select defaultValue="18">
              <SelectTrigger>
                <SelectValue placeholder="Select rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% (Exempt)</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18% (Standard)</SelectItem>
                <SelectItem value="28">28%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>TDS Section Defaults</Label>
            <Select defaultValue="194J">
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="194J">194J - Professional Fees (10%)</SelectItem>
                <SelectItem value="194C">194C - Contractor (1-2%)</SelectItem>
                <SelectItem value="194H">194H - Commission (5%)</SelectItem>
                <SelectItem value="194I">194I - Rent (10%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Advance Tax Installments</Label>
            <Select defaultValue="standard">
              <SelectTrigger>
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (15%, 45%, 75%, 100%)</SelectItem>
                <SelectItem value="corporate">Corporate (15%, 45%, 75%, 100%)</SelectItem>
                <SelectItem value="presumptive">Presumptive (100% by Mar 15)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Payment Gateway Integration (Placeholder)">
        <div className="grid gap-4 md:grid-cols-3">
          {["Razorpay", "PayU", "CCAvenue", "BillDesk", "Instamojo", "Cashfree"].map((gateway) => (
            <div key={gateway} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{gateway}</p>
                <Badge variant="secondary">Not Configured</Badge>
              </div>
              <p className="mt-1 text-muted-foreground text-sm">Click to configure API keys and webhook URLs</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Configure
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function FirmBrandingTab({
  formData,
  onChange,
}: {
  formData: FirmSettingsFormData;
  onChange: (key: keyof FirmSettingsFormData, value: string | number | boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Brand Identity">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Display Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => onChange("companyName", e.target.value)}
              placeholder="CA Nexus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => onChange("primaryColor", e.target.value)}
                className="h-10 w-16"
              />
              <Input
                id="primaryColorHex"
                value={formData.primaryColor}
                onChange={(e) => onChange("primaryColor", e.target.value)}
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="faviconUrl">Favicon URL</Label>
            <Input
              id="faviconUrl"
              value={formData.faviconUrl}
              onChange={(e) => onChange("faviconUrl", e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Document Templates">
        <div className="space-y-4">
          {[
            "Invoice Template",
            "Engagement Letter",
            "Proposal Template",
            "Report Cover Page",
            "Email Signature",
            "Letterhead",
          ].map((template) => (
            <div key={template} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{template}</p>
                <p className="text-muted-foreground text-sm">Customize layout, fields, and branding</p>
              </div>
              <Button variant="outline" size="sm">
                Customize
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Client Portal Branding">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Portal Subdomain</Label>
            <Input placeholder="firm.canexus.com" />
            <p className="text-muted-foreground text-sm">Your client portal will be accessible at this subdomain</p>
          </div>
          <div className="space-y-2">
            <Label>Portal Logo</Label>
            <Input type="file" accept="image/*" />
            <p className="text-muted-foreground text-sm">Separate logo for client portal (optional)</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function FirmSecurityTab({
  formData,
  onChange,
  onBooleanChange,
}: {
  formData: FirmSettingsFormData;
  onChange: (key: keyof FirmSettingsFormData, value: string | number | boolean) => void;
  onBooleanChange: (key: keyof FirmSettingsFormData) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Authentication & Access">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Multi-Factor Authentication (MFA)</p>
              <p className="text-muted-foreground text-sm">Require MFA for all users</p>
            </div>
            <Switch checked={formData.mfaRequired} onCheckedChange={() => onBooleanChange("mfaRequired")} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">IP Whitelist</p>
              <p className="text-muted-foreground text-sm">Restrict access to specific IP ranges (CIDR notation)</p>
            </div>
            <Input
              placeholder="e.g., 192.168.1.0/24, 10.0.0.0/8"
              value={formData.ipWhitelist}
              onChange={(e) => onChange("ipWhitelist", e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Session Management">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={formData.sessionTimeout}
              onChange={(e) => onChange("sessionTimeout", parseInt(e.target.value, 10))}
              min="15"
              max="1440"
            />
          </div>
          <div className="space-y-2">
            <Label>Concurrent Sessions</Label>
            <Select defaultValue="single">
              <SelectTrigger>
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Session Per User</SelectItem>
                <SelectItem value="multiple">Multiple Sessions Allowed</SelectItem>
                <SelectItem value="device">Per Device Limit (3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Password Policy">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">Minimum Length</Label>
            <Input
              id="passwordMinLength"
              type="number"
              value={formData.passwordMinLength}
              onChange={(e) => onChange("passwordMinLength", parseInt(e.target.value, 10))}
              min="6"
              max="64"
            />
          </div>
          <div className="space-y-2">
            <Label>Require Uppercase</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.passwordRequireUppercase}
                onCheckedChange={() => onBooleanChange("passwordRequireUppercase")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Require Numbers</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.passwordRequireNumber}
                onCheckedChange={() => onBooleanChange("passwordRequireNumber")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Require Special Characters</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.passwordRequireSpecial}
                onCheckedChange={() => onBooleanChange("passwordRequireSpecial")}
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Password Expiry (days)</Label>
            <Input type="number" defaultValue={90} min="0" max="365" />
            <p className="text-muted-foreground text-sm">0 = never expires</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>History Count (prevent reuse)</Label>
            <Input type="number" defaultValue={5} min="1" max="24" />
            <p className="text-muted-foreground text-sm">Number of previous passwords to remember</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Audit & Compliance">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
            <Input
              id="auditLogRetention"
              type="number"
              value={formData.auditLogRetention}
              onChange={(e) => onChange("auditLogRetention", parseInt(e.target.value, 10))}
              min="30"
              max="2555"
            />
          </div>
          <div className="space-y-2">
            <Label>Failed Login Lockout</Label>
            <Select defaultValue="5">
              <SelectTrigger>
                <SelectValue placeholder="Select attempts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Attempts</SelectItem>
                <SelectItem value="5">5 Attempts</SelectItem>
                <SelectItem value="10">10 Attempts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
