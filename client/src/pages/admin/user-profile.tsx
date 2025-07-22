import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Settings,
  Edit,
  Save,
  Key,
  Bell,
  Clock,
  Building,
  Users,
  FileText
} from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  department: string;
  phone?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
  preferences: {
    theme: string;
    notifications: boolean;
    emailUpdates: boolean;
    timezone: string;
  };
  activityLog: Array<{
    id: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
}

export default function UserProfile() {
  // const { user } = useAuth();
  const user = null; // Mock user for now
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("profile");

  // Mock user profile data - replace with real API call
  const userProfile: UserProfile = {
    id: user?.id || '1',
    email: user?.email || 'user@autolytiq.com',
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    username: 'johndoe',
    role: 'Sales Manager',
    department: 'Sales',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, ST 12345',
    bio: 'Experienced automotive sales professional with 10+ years in the industry.',
    profileImage: '',
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-15T00:00:00Z',
    permissions: ['inventory.read', 'sales.write', 'customers.read'],
    preferences: {
      theme: 'light',
      notifications: true,
      emailUpdates: true,
      timezone: 'America/New_York'
    },
    activityLog: [
      {
        id: '1',
        action: 'Updated customer record',
        timestamp: '2025-01-22T10:30:00Z',
        details: 'Modified contact information for Customer ID: 12345'
      },
      {
        id: '2',
        action: 'Created new lead',
        timestamp: '2025-01-22T09:15:00Z',
        details: 'Lead created from website inquiry - Hot lead priority'
      },
      {
        id: '3',
        action: 'Approved deal',
        timestamp: '2025-01-22T08:45:00Z',
        details: 'Deal #D-2025-001 approved for $45,000'
      }
    ]
  };

  const handleSaveProfile = (formData: FormData) => {
    const profileData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      bio: formData.get('bio') as string,
    };

    console.log('Saving profile:', profileData);
    toast({ title: 'Profile updated successfully' });
    setIsEditing(false);
  };

  const handleSavePreferences = (formData: FormData) => {
    const preferences = {
      theme: formData.get('theme') as string,
      notifications: formData.get('notifications') === 'on',
      emailUpdates: formData.get('emailUpdates') === 'on',
      timezone: formData.get('timezone') as string,
    };

    console.log('Saving preferences:', preferences);
    toast({ title: 'Preferences updated successfully' });
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Profile Header Card */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold">{userProfile.firstName} {userProfile.lastName}</h2>
                <p className="text-sm text-gray-600">@{userProfile.username}</p>
                <Badge className="mt-2" variant="default">{userProfile.role}</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>{userProfile.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Joined {new Date(userProfile.createdAt).toLocaleDateString()}</span>
                </div>
                {userProfile.lastLogin && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Last login: {new Date(userProfile.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {userProfile.permissions.length} permissions
                  </Badge>
                  <Badge variant={userProfile.isActive ? "default" : "secondary"} className="text-xs">
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Profile Management
              </CardTitle>
              <CardDescription>
                Manage your personal information and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs md:text-sm">Settings</TabsTrigger>
                  <TabsTrigger value="permissions" className="text-xs md:text-sm">Access</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs md:text-sm">Activity</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base md:text-lg font-semibold">Personal Information</h3>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs md:text-sm"
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleSaveProfile(formData);
                  }}>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-sm">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            defaultValue={userProfile.firstName}
                            disabled={!isEditing}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            defaultValue={userProfile.lastName}
                            disabled={!isEditing}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={userProfile.email}
                          disabled={!isEditing}
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={userProfile.phone}
                            disabled={!isEditing}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="username" className="text-sm">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            defaultValue={userProfile.username}
                            disabled={true}
                            className="text-sm bg-gray-100"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-sm">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          defaultValue={userProfile.address}
                          disabled={!isEditing}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio" className="text-sm">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          defaultValue={userProfile.bio}
                          disabled={!isEditing}
                          rows={3}
                          className="text-sm"
                        />
                      </div>

                      {isEditing && (
                        <div className="flex gap-2">
                          <Button type="submit" className="text-sm">Save Changes</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Account Preferences</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleSavePreferences(formData);
                  }}>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="theme" className="text-sm">Theme</Label>
                        <Select name="theme" defaultValue={userProfile.preferences.theme}>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                        <Select name="timezone" defaultValue={userProfile.preferences.timezone}>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Notifications</h4>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="notifications"
                            name="notifications"
                            defaultChecked={userProfile.preferences.notifications}
                          />
                          <Label htmlFor="notifications" className="text-sm">
                            Enable desktop notifications
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="emailUpdates"
                            name="emailUpdates"
                            defaultChecked={userProfile.preferences.emailUpdates}
                          />
                          <Label htmlFor="emailUpdates" className="text-sm">
                            Receive email updates
                          </Label>
                        </div>
                      </div>

                      <Button type="submit" className="text-sm">
                        Save Preferences
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Access Permissions</h3>
                  
                  <div className="grid gap-3">
                    {userProfile.permissions.map((permission) => (
                      <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium text-sm capitalize">{permission.replace('.', ' ')}</p>
                          <p className="text-xs text-gray-600">{permission}</p>
                        </div>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <Shield className="h-4 w-4 inline mr-1" />
                      Need additional permissions? Contact your administrator.
                    </p>
                  </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Recent Activity</h3>
                  
                  <div className="space-y-3">
                    {userProfile.activityLog.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-600 mb-1">{activity.details}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Activity Log
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}