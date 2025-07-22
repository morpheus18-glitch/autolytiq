import { useLocation, Link } from "wouter";
import { 
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigation } from "@/components/navigation-config";
import { useIsMobile } from '@/hooks/useIsMobile';

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function CollapsibleSidebar({ isOpen, onClose, onToggle }: CollapsibleSidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const handleNavClick = (href: string, name: string) => {
    console.log('Navigation clicked:', href, name);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Hamburger Menu Button - Always visible */}
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

      {/* Collapsible Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 h-screen 
        bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 
        flex flex-col z-30 transform transition-all duration-300 ease-in-out
        overflow-hidden
        ${isOpen 
          ? 'w-72 sm:w-80 md:w-64 translate-x-0' 
          : 'w-0 md:w-16 -translate-x-full md:translate-x-0'
        }
      `}>
        {/* Logo and Brand */}
        <div className={`
          p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0
          ${!isOpen && !isMobile ? 'hidden' : ''}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">AQ</span>
              </div>
              {isOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">AutolytiQ</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dealership Management</p>
                </div>
              )}
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Desktop collapsed state - show only icons */}
        {!isMobile && !isOpen && (
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
            {navigation.slice(0, 8).map((item) => {
              if (item.isSection) return null;
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href || '#'}
                  onClick={() => handleNavClick(item.href || '#', item.name)}
                >
                  <div 
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    title={item.name}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Full Navigation Menu - when open */}
        {isOpen && (
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
        )}

        {/* Footer - only when open */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>© 2025 AutolytiQ System</p>
              <p className="text-gray-400 dark:text-gray-500">v2.0.0 Enterprise</p>
            </div>
          </div>
        )}

        {/* Desktop expand/collapse toggle - when collapsed */}
        {!isMobile && !isOpen && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}