import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  Users,
  Shield,
  FileText,
  Home,
  MapPin
} from "lucide-react";

interface PageLink {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const allPages: PageLink[] = [
  {
    path: "/",
    title: "Sitemap",
    description: "This page - overview of all available pages",
    icon: <MapPin className="h-5 w-5" />,
    category: "Navigation"
  },
  {
    path: "/dashboard",
    title: "Dashboard",
    description: "Main dashboard with system overview and quick actions",
    icon: <LayoutDashboard className="h-5 w-5" />,
    category: "Main"
  },
  {
    path: "/settings",
    title: "Settings",
    description: "Application settings and configuration",
    icon: <Settings className="h-5 w-5" />,
    category: "Configuration"
  },
  {
    path: "/settings/profile",
    title: "Profile Settings",
    description: "User profile and account settings",
    icon: <Settings className="h-5 w-5" />,
    category: "Configuration"
  },
  {
    path: "/settings/security",
    title: "Security Settings",
    description: "Password and security settings",
    icon: <Shield className="h-5 w-5" />,
    category: "Configuration"
  },
  {
    path: "/admin/user-permissions",
    title: "User Permissions",
    description: "Manage user permissions and access control",
    icon: <Users className="h-5 w-5" />,
    category: "Admin"
  },
  {
    path: "/admin/role-presets",
    title: "Role Presets",
    description: "Configure role presets and permission templates",
    icon: <Shield className="h-5 w-5" />,
    category: "Admin"
  },
];

export default function Sitemap() {
  const categories = Array.from(new Set(allPages.map(p => p.category)));

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Home className="h-8 w-8" />
          Application Sitemap
        </h1>
        <p className="text-muted-foreground">
          Testing index - Quick access to all pages in the application
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPages
              .filter((page) => page.category === category)
              .map((page) => (
                <Link key={page.path} to={page.path} className="block">
                  <Card className="h-full hover:border-primary transition-colors cursor-pointer hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {page.icon}
                        {page.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {page.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Go to {page.title}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {page.path}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      ))}

      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle>Testing Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • This sitemap page is a temporary addition for testing purposes
          </p>
          <p className="text-sm text-muted-foreground">
            • All pages should be accessible from this index
          </p>
          <p className="text-sm text-muted-foreground">
            • Some pages may require specific permissions based on your user role
          </p>
          <p className="text-sm text-muted-foreground">
            • Dark mode toggle is available in the top navigation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
