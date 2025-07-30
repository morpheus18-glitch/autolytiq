import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  Users, 
  Car, 
  Calculator, 
  BarChart3, 
  Settings,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Sales & Leads", href: "/sales", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Car },
  { name: "Deal Desk", href: "/deal-desk", icon: Calculator },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AiQ</span>
              </div>
              <span className="font-semibold text-lg">AutolytiQ</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-sm text-gray-600">
              <p>AutolytiQ Enterprise</p>
              <p className="text-xs">v2.1.0</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}