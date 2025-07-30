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
  { name: "ML Enterprise", href: "/ml-enterprise-dashboard", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden p-2">
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 sm:w-72 p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header - Mobile Optimized */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">AiQ</span>
              </div>
              <span className="font-semibold text-base sm:text-lg">AutolytiQ</span>
            </div>
          </div>

          {/* Navigation - Mobile Optimized */}
          <nav className="flex-1 p-3 sm:p-4">
            <div className="space-y-1 sm:space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto flex-shrink-0" />
                  </Button>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer - Mobile Optimized */}
          <div className="p-3 sm:p-4 border-t">
            <div className="text-xs sm:text-sm text-gray-600">
              <p className="font-medium">AutolytiQ Enterprise</p>
              <p className="text-xs opacity-75">v2.1.0</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}