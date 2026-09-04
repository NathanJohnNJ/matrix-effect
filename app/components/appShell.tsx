'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { normalizeColumnWidth, parseSettingsSearchParams } from '../actions';
import { useSettings } from '../providers';
import MatrixCanvas from './matrixCanvas';

type CanvasMode = 'home' | 'rain';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [canvasMode, setCanvasMode] = useState<CanvasMode>(
    pathname === '/rain' ? 'rain' : 'home',
  );
  const [canvasReset, setCanvasReset] = useState(0);

  useEffect(() => {
    if (pathname === '/ascii-generator' || pathname === '/rain') {
      setCanvasMode(pathname === '/rain' ? 'rain' : 'home');
    }
  }, [pathname]);

  const isDashboard = pathname === '/' || pathname === '/dashboard';

  return (
    <>
      {!isDashboard && (
        <Suspense fallback={null}>
          <CanvasLayer
            canvasMode={canvasMode}
            canvasReset={canvasReset}
            columnWidth={settings.columnWidth}
            isAsciiGenerator={pathname === '/ascii-generator'}
            onReset={() => setCanvasReset((current) => current + 1)}
          />
        </Suspense>
      )}
      <div className="relative z-10">{children}</div>
    </>
  );
}

function CanvasLayer({
  canvasMode,
  canvasReset,
  columnWidth,
  isAsciiGenerator,
  onReset,
}: {
  canvasMode: CanvasMode;
  canvasReset: number;
  columnWidth: number;
  isAsciiGenerator: boolean;
  onReset: () => void;
}) {
  const searchParams = useSearchParams();
  const queryText = isAsciiGenerator
    ? ['string', 'string2', 'string3']
      .map((key) => searchParams.get(key)?.trim() ?? '')
      .filter(Boolean)
      .join('\n') || 'matrix'
    : 'matrix';
  const [initialText, setInitialText] = useState(queryText);

  useEffect(() => {
    if (isAsciiGenerator) {
      setInitialText(queryText);
    }
  }, [isAsciiGenerator, queryText]);
  const settingsOverride = parseSettingsSearchParams(searchParams);
  const effectiveColumnWidth = settingsOverride.columnWidth ?? columnWidth;

  return (
    <div className="fixed inset-0 z-0">
      <MatrixCanvas
        key={`${canvasMode}-${normalizeColumnWidth(effectiveColumnWidth)}-${canvasReset}-${initialText}`}
        showInput={canvasMode === 'home'}
        showStaticArt={canvasMode === 'home'}
        initialText={initialText}
        settingsOverride={settingsOverride}
        onReset={onReset}
      />
    </div>
  );
}