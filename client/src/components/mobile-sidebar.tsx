import { useLocation, Link } from "wouter";
import { 
  BarChart3, 
  Users, 
  Car, 
  Handshake, 
  Calculator, 
  TrendingUp, 
  Shield, 
  Settings, 
  DollarSign,
  Wrench,
  User,
  Target,
  FileText,
  Timer,
  Brain,
  Workflow,
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigation } from "@/components/navigation-config";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function MobileSidebar({ isOpen, onClose, onToggle }: MobileSidebarProps) {
  const [location] = useLocation();

  const handleNavClick = (href: string, name: string) => {
    console.log('Mobile Navigation clicked:', href, name);
    onClose();
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-3 left-3 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 p-2.5 rounded-lg"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-72 sm:w-80
        bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 
        flex flex-col z-30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-hidden
      `}>
        {/* Logo and Brand */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">AQ</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">AutolytiQ</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dealership Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            if (item.isSection) {
              return (
                <div key={item.name} className="mb-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {item.name}
                  </h3>
                  <div className="space-y-1">
                    {item.children?.map((child) => {
                      const isActive = location === child.href;
                      const Icon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href || '#'}
                          onClick={() => handleNavClick(child.href || '#', child.name)}
                        >
                          <div className={`
                            flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer w-full
                            ${isActive 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                            }
                          `}>
                            {Icon && <Icon className="mr-3 h-4 w-4 flex-shrink-0" />}
                            <span className="truncate">{child.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href || '#'}
                  onClick={() => handleNavClick(item.href || '#', item.name)}
                >
                  <div className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mb-2 cursor-pointer w-full
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}>
                    {Icon && <Icon className="mr-3 h-4 w-4 flex-shrink-0" />}
                    <span className="truncate">{item.name}</span>
                  </div>
                </Link>
              );
            }
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>© 2025 AutolytiQ System</p>
            <p className="text-gray-400 dark:text-gray-500">v2.0.0 Enterprise</p>
          </div>
        </div>
      </div>
    </>
  );
}