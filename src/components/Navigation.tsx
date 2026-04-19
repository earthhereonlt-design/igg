import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Home, LineChart, User, Shield, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const navItems = [
    { to: "/dashboard", icon: <Home size={24} />, label: "Home" },
    { to: "/reports", icon: <LineChart size={24} />, label: "Reports" },
    { to: "/profile", icon: <User size={24} />, label: "Profile" },
  ];

  if (user?.isAdmin) {
    navItems.push({ to: "/admin", icon: <Shield size={24} />, label: "Admin" });
  }

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden glass-nav fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-all ${
                isActive ? 'text-[#2997FF]' : 'text-[var(--text-sec)] hover:text-[var(--text)]'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex glass-nav fixed top-0 bottom-0 left-0 w-64 flex-col border-r border-[var(--border)] p-6 z-50">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6600] to-[#2997FF]" />
          <h1 className="font-bold text-xl tracking-tight">Tracker</h1>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#2997FF]/10 text-[#2997FF] font-medium' 
                    : 'text-[var(--text-sec)] hover:bg-[var(--border)] hover:text-[var(--text)]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {deferredPrompt && (
          <button 
            onClick={handleInstall}
            className="mt-auto flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#2997FF] to-[#0071E3] text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Download size={20} />
            Install App
          </button>
        )}
      </nav>
    </>
  );
}
