
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plane, Map, Wrench, StickyNote, Settings, BarChart3 } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const navItems = [
    { name: "Trips", path: "Trips", icon: Map },
    { name: "Tools", path: "TravelTools", icon: Wrench },
    { name: "Stats", path: "Statistics", icon: BarChart3 },
    { name: "Settings", path: "Settings", icon: Settings }
  ];

  const isActive = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-teal-50 pb-20">
      <style>{`
        :root {
          --primary: #0ea5e9;
          --primary-dark: #0284c7;
          --secondary: #f97316;
          --accent: #14b8a6;
          --success: #10b981;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium">
          📡 You're offline — all features still work!
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PackIt</h1>
              <p className="text-xs text-gray-500">Your Travel Companion</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 animate-slide-up">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                    active 
                      ? "text-blue-600" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "scale-110" : ""} transition-transform`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
