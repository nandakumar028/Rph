"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconLayoutDashboard,
  IconUsers,
  IconBook,
  IconCalendarCheck,
  IconAward,
  IconCreditCard,
  IconMenu2,
  IconX,
  IconInfoCircle,
  IconMail,
} from '@tabler/icons-react';
import { cn } from '@/app/lib/utils';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: IconLayoutDashboard },
  { name: 'Students', href: '/students', icon: IconUsers },
  { name: 'Courses', href: '/courses', icon: IconBook },
  { name: 'Attendance', href: '/attendance', icon: IconCalendarCheck },
  { name: 'Grades', href: '/grades', icon: IconAward },
  { name: 'Finance', href: '/finance', icon: IconCreditCard },
];

const secondaryNav = [
  { name: 'About', href: '/about', icon: IconInfoCircle },
  { name: 'Contact', href: '/contact', icon: IconMail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Skip rendering sidebar on landing page (if landing page is just /)
  if (pathname === '/') return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-black/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/dashboard" className="text-sm font-bold tracking-[0.2em] text-white">
          A C A D E M Y
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-400 hover:text-white p-1"
        >
          {isOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Sidebar Panel */}
          <nav className="relative flex flex-col w-64 max-w-xs bg-neutral-950 border-r border-neutral-900 p-6 h-full z-10">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-[0.3em] text-neutral-500">MANAGEMENT</span>
            </div>
            <div className="flex-1 space-y-1">
              {mainNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white text-black font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-neutral-900 pt-4 mt-4 space-y-1">
              {secondaryNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white text-black font-semibold"
                        : "text-neutral-500 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-900 bg-neutral-950 p-6 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="mb-10 px-4">
          <Link href="/" className="text-base font-bold tracking-[0.25em] text-white block">
            A C A D E M Y
          </Link>
          <span className="text-[10px] tracking-wider text-neutral-500 uppercase mt-1 block">Student Management</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-600 uppercase px-4 pb-2">Main</p>
          {mainNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-white text-black font-semibold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-black md:bg-neutral-950" />
                )}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-600 uppercase px-4 pb-2">Info</p>
            {secondaryNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-white text-black font-semibold shadow-md"
                      : "text-neutral-500 hover:text-white hover:bg-neutral-900/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-black md:bg-neutral-950" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile footer */}
        <div className="border-t border-neutral-900 pt-6 px-2 mt-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-semibold text-sm text-white">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-neutral-200 truncate">Administrator</span>
              <span className="text-[10px] text-neutral-500 truncate">admin@academy.edu</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
