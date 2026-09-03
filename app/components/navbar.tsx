'use client';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import { clsx } from 'clsx';

export default function NavBar(props: React.ComponentProps<any>){
  const { headerVisible } = props;
  const pathName = usePathname();

  const homeNavigation = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/rain', label: 'Rain' },
      { href: '/dashboard', label: 'Dashboard' },
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
      <a
        key={item.label}
        href={item.href}
        className={clsx("rounded-lg px-2 py-1 text-xs uppercase tracking-[0.2em] text-green-200 transition hover:text-white", {
          "text-white font-extrabold" : pathName === item.href
        })}
      >
        {item.label}
      </a>
    ))}
  </nav>
  )
}