import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart3,
  Users,
  Car,
  MessageSquare,
  Brain,
  Workflow,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickNavItems = [
  { name: 'Dashboard', href: '/', icon: BarChart3, color: 'text-blue-600' },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600' },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-orange-600' },
  { name: 'Workflows', href: '/workflow-assistant', icon: Workflow, color: 'text-purple-600' },
  { name: 'AI Search', href: '/ai-smart-search', icon: Brain, color: 'text-indigo-600' },
  { name: 'Messages', href: '/communication-demo', icon: MessageSquare, color: 'text-emerald-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' }
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <>
      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40">
        <div className="grid grid-cols-4 gap-1">
          {quickNavItems.slice(0, 3).map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center p-2 transition-colors ${
                  isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.name}</span>
                </div>
              </Link>
            );
          })}
          
          {/* More Menu */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Navigation</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {quickNavItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <div className={`flex items-center p-3 rounded-lg border transition-colors ${
                      isActive ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      <div className={`p-2 rounded-lg ${item.color} bg-opacity-10 mr-3`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}