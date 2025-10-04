'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, FileText, Shield } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Crime Map',
      icon: MapPin,
      description: 'View crime incidents on map'
    },
    {
      href: '/submit',
      label: 'Report Crime',
      icon: FileText,
      description: 'Submit a new crime report'
    }
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">Crime Tracker</h1>
              <p className="text-xs text-slate-400">New Brunswick, NJ</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-slate-800 text-blue-400'
                      : 'hover:bg-slate-800 hover:text-blue-300 text-slate-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs opacity-75 hidden sm:block">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}