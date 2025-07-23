import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Car,
  Handshake,
  Calculator,
  Timer,
  Menu,
  X,
  Home,
  Settings,
  Bell,
  TrendingUp,
  FileText,
  MessageSquare,
  Building
} from 'lucide-react';

const primaryNavItems = [
  { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600' },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-purple-600' },
  { name: 'More', href: '#', icon: Menu, color: 'text-gray-600', isMenu: true }
];

const allNavItems = [
  { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
  { name: 'Sales & Leads', href: '/sales', icon: Handshake, color: 'text-indigo-600' },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600' },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-purple-600' },
  { name: 'Deal Desk', href: '/deal-desk', icon: Calculator, color: 'text-orange-600' },
  { name: 'Showroom', href: '/showroom-manager', icon: Timer, color: 'text-cyan-600' },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, color: 'text-pink-600' },
  { name: 'Reports', href: '/reports', icon: BarChart3, color: 'text-yellow-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
  { name: 'Admin', href: '/enterprise-admin', icon: Building, color: 'text-red-600' }
];

export function MobileFooterMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const handleNavClick = (item: typeof primaryNavItems[0]) => {
    if (item.isMenu) {
      setIsMenuOpen(true);
    } else {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Sticky Bottom Mobile Footer - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-pb">
        <div className="grid grid-cols-4 gap-0">
          {primaryNavItems.map((item, index) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            if (item.isMenu) {
              return (
                <button
                  key={index}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center p-3 min-h-[60px] transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </button>
              );
            }
            
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`flex flex-col items-center justify-center p-3 min-h-[60px] transition-colors ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-t-xl">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AutolytiQ Navigation</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Navigation Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {allNavItems.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className={`flex items-center p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        isActive 
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                        <div className={`p-2 rounded-lg bg-opacity-10 mr-3 ${item.color.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.name === 'Dashboard' && 'Overview & KPIs'}
                            {item.name === 'Sales & Leads' && 'Lead management'}
                            {item.name === 'Customers' && 'CRM & contacts'}
                            {item.name === 'Inventory' && 'Vehicle catalog'}
                            {item.name === 'Deal Desk' && 'Finance & deals'}
                            {item.name === 'Showroom' && 'Live tracking'}
                            {item.name === 'Analytics' && 'Data insights'}
                            {item.name === 'Reports' && 'Business reports'}
                            {item.name === 'Settings' && 'Configuration'}
                            {item.name === 'Admin' && 'System admin'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/customers" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Users className="w-3 h-3 mr-2" />
                      Add Customer
                    </Button>
                  </Link>
                  <Link href="/inventory" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Car className="w-3 h-3 mr-2" />
                      Add Vehicle
                    </Button>
                  </Link>
                  <Link href="/deal-desk" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Calculator className="w-3 h-3 mr-2" />
                      New Deal
                    </Button>
                  </Link>
                  <Link href="/showroom-manager" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Timer className="w-3 h-3 mr-2" />
                      Track Visit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}