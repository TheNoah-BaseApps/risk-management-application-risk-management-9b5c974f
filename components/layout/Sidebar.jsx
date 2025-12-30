'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { checkPermission } from '@/lib/permissions';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileText,
  User,
} from 'lucide-react';

export default function Sidebar({ open, user }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
    { name: 'Risks', href: '/risks', icon: AlertTriangle, permission: 'view_risks' },
    { name: 'Assignments', href: '/assignments', icon: Users, permission: 'view_assignments' },
    { name: 'Reports', href: '/reports', icon: FileText, permission: 'view_reports' },
    { name: 'Risk Reports', href: '/risk-reports', icon: FileText, permission: 'view_reports' },
    { name: 'Profile', href: '/profile', icon: User, permission: 'view_profile' },
  ];

  const filteredNavigation = navigation.filter((item) =>
    checkPermission(user?.role, item.permission)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-900/50 lg:hidden z-40"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="flex flex-col h-full p-4">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}