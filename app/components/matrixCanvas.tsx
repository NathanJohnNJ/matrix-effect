'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import InputForm from './inputForm';
import {
  Effect,
  createGradient,
  createStaticArt,
  renderStaticText,
  type StaticArt,
} from '../actions';
import { useSettings } from '../providers';

type MatrixCanvasProps = {
  showInput?: boolean;
  showStaticArt?: boolean;
};

export default function MatrixCanvas({
  showInput = true,
  showStaticArt = true,
}: MatrixCanvasProps) {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectRef = useRef<Effect | null>(null);
  const staticArtRef = useRef<StaticArt | null>(null);
  const gradientRef = useRef<CanvasGradient | null>(null);
  const lastTimeRef = useRef(0);
  const timerRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const hideNavTimerRef = useRef<number | null>(null);
  const hideInputTimerRef = useRef<number | null>(null);
  const [inputValue, setInputValue] = useState('matrix');
  const [staticText, setStaticText] = useState('matrix');
  const [inputVisible, setInputVisible] = useState(false);
  const [inputInteractionActive, setInputInteractionActive] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  const handleInputInteractionStart = () => {
    setInputInteractionActive(true);
    if (hideInputTimerRef.current) {
      window.clearTimeout(hideInputTimerRef.current);
    }
    setInputVisible(true);
  };

  const handleInputInteractionEnd = () => {
    setInputInteractionActive(false);
    setInputVisible(true);
    if (hideInputTimerRef.current) {
      window.clearTimeout(hideInputTimerRef.current);
    }
    if (settings.hideInput) {
      hideInputTimerRef.current = window.setTimeout(() => {
        setInputVisible(false);
      }, settings.inputHideSpeed * 1000);
    }
  };

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      
      if(settings.hideHeader === true){
        const nearTopEdge = event.clientY <= window.innerHeight * 0.2;
        setHeaderVisible(nearTopEdge);
        if (hideNavTimerRef.current) {
          window.clearTimeout(hideNavTimerRef.current);
        }
        hideNavTimerRef.current = window.setTimeout(() => {
          setHeaderVisible(false);
        }, settings.navHideSpeed*1000);
      } else {
        setHeaderVisible(true);
      }
      if (showInput && !inputInteractionActive && settings.hideInput) {
        setInputVisible(true);
        if (hideInputTimerRef.current) {
          window.clearTimeout(hideInputTimerRef.current);
        }
        hideInputTimerRef.current = window.setTimeout(() => {
          setInputVisible(false);
        }, settings.inputHideSpeed*1000);
      } else if (showInput && !inputInteractionActive) {
        setInputVisible(true);
      }
    };

    window.addEventListener('mousemove', handlePointerMove);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (hideNavTimerRef.current) {
        window.clearTimeout(hideNavTimerRef.current);
      }

      if (hideInputTimerRef.current) {
        window.clearTimeout(hideInputTimerRef.current);
      }
    };
  }, [inputInteractionActive, settings, showInput]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const syncCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      return { width, height, dpr };
    };

    const logicalSize = syncCanvasSize();
    const currentEffect = new Effect(logicalSize.width, logicalSize.height, settings.columnWidth);
    effectRef.current = currentEffect;
    gradientRef.current = createGradient(ctx, logicalSize.width, logicalSize.height, settings.gradientColors);
    staticArtRef.current = showStaticArt
      ? createStaticArt({
          text: staticText,
          effect: currentEffect,
          canvasWidth: logicalSize.width,
          canvasHeight: logicalSize.height,
          columnWidth: settings.columnWidth,
        })
      : null;

    const resizeCanvas = () => {
      const { width, height } = syncCanvasSize();

      const nextEffect = new Effect(width, height, settings.columnWidth);
      effectRef.current = nextEffect;
      gradientRef.current = createGradient(ctx, width, height, settings.gradientColors);
      staticArtRef.current = showStaticArt
        ? createStaticArt({
            text: staticText,
            effect: nextEffect,
            canvasWidth: width,
            canvasHeight: height,
            columnWidth: settings.columnWidth,
          })
        : null;
    };

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    const animate = (timeStamp: number) => {
      const currentEffect = effectRef.current;
      const currentCanvas = canvasRef.current;
      if (!currentEffect || !currentCanvas) {
        return;
      }

      const currentContext = currentCanvas.getContext('2d');
      if (!currentContext || !gradientRef.current) {
        return;
      }

      const deltaTime = timeStamp - lastTimeRef.current;
      lastTimeRef.current = timeStamp;
      const fps = settings.speed;
      const nextFrame = 1000 / fps;

      if (timerRef.current > nextFrame) {
        const logicalWidth = currentCanvas.width / (window.devicePixelRatio || 1);
        const logicalHeight = currentCanvas.height / (window.devicePixelRatio || 1);

        currentContext.fillStyle = 'rgba(0, 0, 0, 0.09)';
        currentContext.fillRect(0, 0, logicalWidth, logicalHeight);
        currentContext.fillStyle = gradientRef.current;
        currentContext.font = `${currentEffect.fontSize}px monospace`;

        const occupiedColumns = staticArtRef.current
          ? staticArtRef.current.occupiedColumns
          : null;
        const wordComplete =
          staticArtRef.current !== null &&
          staticArtRef.current.cells.length > 0 &&
          staticArtRef.current.cells.every((cell) => cell.settled);
        const reducedColumns = wordComplete ? null : occupiedColumns;
        const dimColumns = wordComplete ? occupiedColumns : null;

        currentEffect.symbols.forEach((symbol) =>
          symbol.draw(currentContext, reducedColumns, dimColumns),
        );
        renderStaticText(currentContext, staticArtRef.current, gradientRef.current);
        timerRef.current = 0;
      } else {
        timerRef.current += deltaTime;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [settings.columnWidth, settings.gradientColors, settings.speed, showStaticArt, staticText]);

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
    <div className="relative h-screen w-full overflow-hidden bg-black">
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
            className="rounded-lg px-2 py-1 text-xs uppercase tracking-[0.2em] text-green-200 transition hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </nav>
      {showInput && (
        <InputForm
          visible={inputVisible}
          setVisible={setInputVisible}
          value={inputValue}
          onChange={setInputValue}
          onInteractionStart={handleInputInteractionStart}
          onInteractionEnd={handleInputInteractionEnd}
          onSubmit={(value) => setStaticText(value)}
        />
      )}
      <canvas ref={canvasRef} id="canvas" className="block h-screen w-screen bg-black" />
    </div>
  );
}
