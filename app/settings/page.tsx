'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import ColorSelector from '../components/colorSelector';
import { useSettings } from '../providers';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const [showNewColor, setShowNewColor] = useState(false);

  const updateColor = (index: number, value: string) => {
    const nextColors = [...settings.gradientColors];
    nextColors[index] = value;
    setSettings((current) => ({ ...current, gradientColors: nextColors }));
    if(showNewColor){
      setShowNewColor(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-green-500/10 backdrop-blur-sm">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-green-300">Matrix effect</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Settings</h1>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-200 transition hover:bg-green-500/20"
          >
            Back home
          </Link>
        </div>

        
        <div className="space-y-4">
          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="text-lg font-semibold text-white">Hide nav bar? <label className="inline ms-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={settings.hideHeader}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      hideHeader: event.target.checked,
                    }))}
                  className="cursor-pointer rounded-lg border border-zinc-300 bg-transparent"
                />
              </label></h2>
              { settings.hideHeader && 
              <>
                <p className="mb-4 text-sm">(with this setting enabled, the nav bar will auto hide after the amount of seconds chosen below. Uncheck to have the nav bar visible at all times)</p>
                <label className="block text-sm text-zinc-300">
                <span className="mb-2 block">Seconds: <input type="text" min={4} max={30} value={settings.navHideSpeed} 
                  className="rounded-2xl border-zinc-300 text-zinc-300 border py-1.5 px-2 max-w-12 text-right focus:font-extrabold"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      navHideSpeed: Number(event.target.value),
                    }))
                  } /></span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={settings.navHideSpeed}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      navHideSpeed: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-green-400"
                />
              </label>
              </>
              }
            
          </section>

          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="text-lg font-semibold text-white">Hide input? <label className="inline ms-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={settings.hideInput}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      hideInput: event.target.checked,
                    }))}
                  className="cursor-pointer rounded-lg border border-zinc-300 bg-transparent"
                />
              </label></h2>
              { settings.hideInput && 
              <>
                <p className="mb-4 text-sm">(with this setting enabled, the text box will auto hide after the amount of seconds chosen below. Uncheck to have the text box visible at all times)</p>
                <label className="block text-sm text-zinc-300">
                <span className="mb-2 block">Seconds: <input type="text" min={4} max={30} value={settings.inputHideSpeed} 
                  className="rounded-2xl border-zinc-300 text-zinc-300 border py-1.5 px-2 max-w-12 text-right focus:font-extrabold"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      inputHideSpeed: Number(event.target.value),
                    }))
                  } /></span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={settings.inputHideSpeed}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      inputHideSpeed: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-green-400"
                />
              </label>
              </>
              }
            
          </section>

          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="mb-4 text-lg font-semibold text-white">Gradient colors</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {settings.gradientColors.map((color, index) => (
                <ColorSelector key={index} color={color} index={index} settings={settings} setSettings={setSettings} />
              ))}
              <label className="flex w-full md:w-fit items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 relative">
                <p className="flex items-center justify-center h-8 w-8 rounded-md border border-white/20 hover:border-white/40 cursor-pointer" onClick={()=>{setShowNewColor(true)}}>
                  <span className="text-zinc-300/40 hover:text-zinc-300/60 font-black text-2xl">+</span>
                </p>
                <input
                  type="color"
                  value=""
                  onChange={(event) => updateColor(settings.gradientColors.length+1, event.target.value)}
                  className="h-10 min-w-37 w-full cursor-pointer"
                  style={{ display: showNewColor ? 'inline' : 'none' }}
                />
                { showNewColor &&
                
                <span className="bg-stone-900 border-zinc-300/40 p-1 border rounded-full text-zinc-300/40 hover:text-red-800/80 hover:border-red-800/80 hover:font-extrabold absolute top-2 z-50 right-2"><TrashIcon className="w-4 h-4" /></span>
                
                }
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="mb-4 text-lg font-semibold text-white">ASCII column width</h2>
            <label className="block text-sm text-zinc-300">
              <span className="mb-2 block">Glyphs: <input type="text" min={4} max={30} value={settings.columnWidth} 
                className="rounded-2xl border-zinc-300 border py-1.5 px-2 max-w-12 text-right focus:font-extrabold"
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    columnWidth: Number(event.target.value),
                  }))
                } /></span>
              <input
                type="range"
                min={1}
                max={8}
                value={settings.columnWidth}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    columnWidth: Number(event.target.value),
                  }))
                }
                className="w-full accent-green-400"
              />
            </label>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="mb-4 text-lg font-semibold text-white">Animation speed</h2>
            <label className="block text-sm text-zinc-300">
              <span className="mb-2 block">Frames per second: <input type="text" min={4} max={30} value={settings.speed} 
                className="rounded-2xl border-zinc-300 border py-1.5 px-2 max-w-12 text-right focus:font-extrabold"
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    speed: Number(event.target.value),
                  }))
                } /></span>
              <input
                type="range"
                min={4}
                max={30}
                value={settings.speed}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    speed: Number(event.target.value),
                  }))
                }
                className="w-full accent-green-400"
              />
            </label>
          </section>

          
          
        </div>
      </div>
    </main>
  );
}
