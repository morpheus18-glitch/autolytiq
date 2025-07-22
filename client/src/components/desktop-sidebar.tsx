import { useLocation, Link } from "wouter";
import { navigation } from "@/components/navigation-config";

export default function DesktopSidebar() {
  const [location] = useLocation();

  const handleNavClick = (href: string, name: string) => {
    console.log('Desktop Navigation clicked:', href, name);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">AQ</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">AutolytiQ</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dealership Management</p>
          </div>
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
  );
}