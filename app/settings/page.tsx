'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import ColorSelector from '../components/colorSelector';
import { characters, createGradient, normalizeColumnWidth, normalizeGradientAngle, Symbol as MatrixSymbol } from '../actions';
import { useSettings } from '../providers';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const [showNewColor, setShowNewColor] = useState(false);
  const speedPreviewRef = useRef<HTMLCanvasElement | null>(null);
  const [gradientAngleInput, setGradientAngleInput] = useState(
    String(settings.gradientAngle),
  );
  const [previewGlyphs, setPreviewGlyphs] = useState(() => Array.from(
    { length: normalizeColumnWidth(settings.columnWidth) },
    (_, index) => characters[index % characters.length],
  ).join(''));

  useEffect(() => {
    setGradientAngleInput(String(settings.gradientAngle));
  }, [settings.gradientAngle]);

  useEffect(() => {
    setPreviewGlyphs(Array.from(
      { length: normalizeColumnWidth(settings.columnWidth) },
      () => characters[Math.floor(Math.random() * characters.length)],
    ).join(''));
  }, [settings.columnWidth]);

  const updateColor = (index: number, value: string) => {
    const nextColors = [...settings.gradientColors];
    nextColors[index] = value;
    const nextStops = [...settings.gradientStops];
    nextStops[index] = nextStops[index] ?? 1;
    setSettings((current) => ({
      ...current,
      gradientColors: nextColors,
      gradientStops: nextStops,
    }));
    if(showNewColor){
      setShowNewColor(false);
    }
  };

  const updateGradientStop = (
    index: number,
    value: number | ((currentValue: number) => number),
  ) => {
    setSettings((current) => {
      const nextStops = [...current.gradientStops];
      const minimum = index === 0 ? 0 : current.gradientStops[index - 1] ?? 0;
      const maximum = index === current.gradientColors.length - 1
        ? 1
        : current.gradientStops[index + 1] ?? 1;
      const currentValue = current.gradientStops[index] ?? minimum;
      const nextValue = typeof value === 'function' ? value(currentValue) : value;

      nextStops[index] = Math.min(maximum, Math.max(minimum, nextValue));
      return { ...current, gradientStops: nextStops };
    });
  };

  useEffect(() => {
    const canvas = speedPreviewRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const width = 120;
    const height = 72;
    const fontSize = 12;
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.font = `${fontSize}px monospace`;

    const symbols = Array.from(
      { length: Math.ceil(width / fontSize) },
      (_, column) => new MatrixSymbol(
        column,
        Math.floor(Math.random() * (height / fontSize)),
        fontSize,
        height,
      ),
    );
    const gradient = createGradient(
      context,
      width,
      height,
      settings.gradientColors,
      settings.gradientAngle,
      settings.gradientStops,
    );
    let animationFrame = 0;
    let lastTime = 0;
    let elapsed = 0;

    const animate = (time: number) => {
      if (lastTime === 0) {
        lastTime = time;
      }
      elapsed += time - lastTime;
      lastTime = time;

      if (elapsed >= 1000 / settings.speed) {
        context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        context.fillRect(0, 0, width, height);
        context.fillStyle = gradient;
        symbols.forEach((symbol) => symbol.draw(context, null, null));
        elapsed = 0;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [settings.gradientAngle, settings.gradientColors, settings.gradientStops, settings.speed]);

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
            <h2 className="text-lg font-semibold text-white">
              Rain out?
              <label className="inline ms-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={settings.rainOut}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      rainOut: event.target.checked,
                    }))}
                  className="cursor-pointer rounded-lg border border-zinc-300 bg-transparent"
                />
              </label>
            </h2>
            
            {settings.rainOut && (
                <>
                  <p className="mb-4 text-sm">(with this setting enabled, ASCII art will start to rain out after being completed and remaining complete for the amount of seconds below)</p>
                  <h2 className="text-lg font-semibold text-white">
                    Loop animation?
                    <label className="inline ms-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={settings.loopAnimation}
                        onChange={(event) =>
                          setSettings((current) => ({
                            ...current,
                            loopAnimation: event.target.checked,
                          }))}
                        className="cursor-pointer rounded-lg border border-zinc-300 bg-transparent"
                      />
                    </label>
                  </h2>
                  <p className="mb-4 font-normal text-sm">(with this setting enabled, once the ASCII art has completely rained out, it will start forming again)</p>
                </>
              
            )}
            {settings.rainOut && (
              <label className="mt-4 block text-sm text-zinc-300">
                <span className="mb-2 block">Seconds: <input type="text" min={0} max={30} value={settings.rainOutSpeed}
                  className="max-w-12 rounded-2xl border border-zinc-300 px-2 py-1.5 text-right text-zinc-300 focus:font-extrabold"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      rainOutSpeed: Number(event.target.value),
                    }))}
                /></span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={settings.rainOutSpeed}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      rainOutSpeed: Number(event.target.value),
                    }))}
                  className="w-full accent-green-400"
                />
              </label>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Gradient colors</h2>
              <div className="relative h-7 min-w-32 flex-1 overflow-visible rounded-md border border-white/20" style={{
                background: `linear-gradient(90deg, ${settings.gradientColors.map((color, index) => `${color} ${(settings.gradientStops[index] ?? 0) * 100}%`).join(', ')})`,
              }}>
                {settings.gradientColors.map((_, index) => {
                  const currentStop = settings.gradientStops[index] ?? 0;

                  return (
                    <button
                      key={`gradient-stop-${index}`}
                      type="button"
                      role="slider"
                      aria-label={`Position for gradient color ${index + 1}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(currentStop * 100)}
                      onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                      onPointerMove={(event) => {
                        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                          return;
                        }

                        const swatch = event.currentTarget.parentElement;
                        if (!swatch) {
                          return;
                        }

                        const bounds = swatch.getBoundingClientRect();
                        const nextValue = (event.clientX - bounds.left) / bounds.width;
                        updateGradientStop(index, nextValue);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                          event.preventDefault();
                          updateGradientStop(index, (value) => value - 0.01);
                        } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                          event.preventDefault();
                          updateGradientStop(index, (value) => value + 0.01);
                        } else if (event.key === 'Home') {
                          event.preventDefault();
                          updateGradientStop(index, 0);
                        } else if (event.key === 'End') {
                          event.preventDefault();
                          updateGradientStop(index, 1);
                        }
                      }}
                      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-white bg-zinc-900 shadow-sm shadow-black/80 focus:outline-none focus:ring-2 focus:ring-green-300"
                      style={{ left: `${currentStop * 100}%`, touchAction: 'none' }}
                    />
                  );
                })}
              </div>
            </div>
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
                  onChange={(event) => updateColor(settings.gradientColors.length, event.target.value)}
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
            <h2 className="mb-4 text-lg font-semibold text-white">Gradient angle</h2>
            <label className="block text-sm text-zinc-300">
              <span className="mb-2 flex items-center gap-2">
                <span>Degrees:</span>
                <input type="text" inputMode="decimal" value={gradientAngleInput}
                  className="rounded-2xl border-zinc-300 border py-1.5 px-2 max-w-14 text-right focus:font-extrabold"
                  onChange={(event) => {
                    const value = event.target.value;
                    setGradientAngleInput(value);

                    if (value.trim() !== '' && Number.isFinite(Number(value))) {
                      setSettings((current) => ({
                        ...current,
                        gradientAngle: normalizeGradientAngle(Number(value)),
                      }));
                    }
                  }} />
                <ArrowRightIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-green-300 transition-none"
                  style={{ transform: `rotate(${settings.gradientAngle}deg)` }}
                />
              </span>
              <input
                type="range"
                min={-360}
                max={360}
                value={settings.gradientAngle}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    gradientAngle: Number(event.target.value),
                  }))
                }
                className="w-full accent-green-400"
              />
            </label>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-white">ASCII column width</h2>
              <span
                aria-hidden="true"
                className="flex min-h-12 items-center rounded-md border border-green-400/30 bg-black/50 px-2 font-mono leading-none text-green-300"
                style={{ fontSize: '12px' }}
              >
                {previewGlyphs}
              </span>
            </div>
            <label className="block text-sm text-zinc-300">
              <span className="mb-2 block">Glyphs: <input type="text" min={1} max={8} value={settings.columnWidth} 
                className="rounded-2xl border-zinc-300 border py-1.5 px-2 max-w-12 text-right focus:font-extrabold"
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    columnWidth: normalizeColumnWidth(Number(event.target.value)),
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
            <div className="grid items-start justify-start gap-4 sm:grid-cols-[auto_auto]">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-white">Animation speed</h2>
                <label className="block text-sm text-zinc-300">
                  <span className="block">Frames per second: <input type="text" min={4} max={30} value={settings.speed}
                    className="rounded-2xl border-zinc-300 border py-1.5 px-2 max-w-12 text-right focus:font-extrabold"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        speed: Number(event.target.value),
                      }))
                    } /></span>
                </label>
              </div>
              <canvas
                ref={speedPreviewRef}
                aria-label="Animated rain preview"
                className="h-18 w-30 rounded-md border border-green-400/30 bg-black"
              />
            </div>
            <input
              type="range"
              min={4}
              max={30}
              value={settings.speed}
              aria-label="Frames per second"
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  speed: Number(event.target.value),
                }))
              }
              className="mt-4 w-full accent-green-400"
            />
          </section>

          
          
        </div>
      </div>
    </main>
  );
}
