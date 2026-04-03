// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, FiFileText, FiUsers, FiSettings, FiPlusCircle 
} from 'react-icons/fi';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: FiHome },
  { href: '/invoices', label: 'Invoices', icon: FiFileText },
  { href: '/invoices/new', label: 'New Invoice', icon: FiPlusCircle },
  { href: '/clients', label: 'Clients', icon: FiUsers },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-purple-600">
          📄 InvoiceGen
        </h1>
        <p className="text-xs text-gray-500 mt-1">Invoice Generator</p>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-purple-50 text-purple-700 border-r-3 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}