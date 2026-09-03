'use client';
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  DEFAULT_MATRIX_SETTINGS,
  MATRIX_SETTINGS_STORAGE_KEY,
  type MatrixSettings,
} from './actions';

type SettingsContextValue = {
  settings: MatrixSettings;
  setSettings: Dispatch<SetStateAction<MatrixSettings>>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export default function Providers({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<MatrixSettings>(DEFAULT_MATRIX_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(MATRIX_SETTINGS_STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<MatrixSettings>;
        setSettings({
          ...DEFAULT_MATRIX_SETTINGS,
          ...parsed,
          gradientColors: parsed.gradientColors?.length
            ? parsed.gradientColors
            : DEFAULT_MATRIX_SETTINGS.gradientColors,
          gradientStops: parsed.gradientStops && parsed.gradientColors
            && parsed.gradientStops.length === parsed.gradientColors.length
            ? parsed.gradientStops
            : DEFAULT_MATRIX_SETTINGS.gradientStops,
        });
      } catch {
        setSettings(DEFAULT_MATRIX_SETTINGS);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(MATRIX_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [isLoaded, settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within a Providers component');
  }

  return context;
}