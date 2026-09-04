'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

type NavBarProps = {
  headerVisible: boolean;
  onReset?: () => void;
};

export default function NavBar({ headerVisible, onReset }: NavBarProps){
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const homeNavigation = useMemo(
    () => [
      { href: '/', label: 'Dashboard' },
      { href: '/rain', label: 'Rain' },
      { href: '/ascii-generator', label: 'ASCII Generator' },
      { href: '/settings', label: 'Settings' },
    ],
    [],
  );

  return (
    <nav
    className={`absolute left-5 top-3.75 z-20 flex items-center gap-3 rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-sm transition-all duration-300 ${
      headerVisible
        ? 'translate-y-0 opacity-100'
        : '-translate-y-4 opacity-0 pointer-events-none'
    }`}
  >
    {homeNavigation.map((item) => (
        <Link
        key={item.label}
        href={item.href === '/settings'
          ? `/settings?from=${encodeURIComponent(`${pathName}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}`
          : item.href}
        className={clsx("rounded-lg px-2 py-1 text-xs uppercase tracking-[0.2em] text-green-200 transition hover:text-white", {
          "text-white font-extrabold" : pathName === item.href
        })}
      >
        {item.label}
        </Link>
    ))}
    {onReset && (
      <button
        type="button"
        aria-label="Reset animation"
        title="Reset animation"
        onClick={onReset}
        className="rounded-lg p-1 text-green-200 transition hover:text-white"
      >
        <ArrowPathIcon className="h-4 w-4" />
      </button>
    )}
  </nav>
  )
}