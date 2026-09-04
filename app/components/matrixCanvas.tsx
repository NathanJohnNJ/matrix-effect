'use client';

import { useEffect, useRef, useState } from 'react';
import InputForm from './inputForm';
import NavBar from './navbar';
import {
  Effect,
  createGradient,
  createStaticArt,
  renderStaticText,
  beginStaticArtRainOut,
  isStaticArtGone,
  normalizeColumnWidth,
  normalizeRainOutSpeed,
  type MatrixSettings,
  type StaticArt,
} from '../actions';
import { useSettings } from '../providers';

type MatrixCanvasProps = {
  showInput?: boolean;
  showStaticArt?: boolean;
  initialText?: string;
  settingsOverride?: Partial<MatrixSettings>;
  onReset?: () => void;
};

export default function MatrixCanvas({
  showInput = true,
  showStaticArt = true,
  initialText = 'matrix',
  settingsOverride,
  onReset,
}: MatrixCanvasProps) {
  const { settings, isLoaded } = useSettings();
  const effectiveSettings = { ...settings, ...settingsOverride };
  const settingsRef = useRef(effectiveSettings);
  const initialLines = initialText.split('\n');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectRef = useRef<Effect | null>(null);
  const staticArtRef = useRef<StaticArt | null>(null);
  const gradientRef = useRef<CanvasGradient | null>(null);
  const lastTimeRef = useRef(0);
  const timerRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const hideNavTimerRef = useRef<number | null>(null);
  const hideInputTimerRef = useRef<number | null>(null);
  const rainOutTimerRef = useRef(0);
  const [inputValue, setInputValue] = useState(initialLines[0] ?? 'matrix');
  const [staticText, setStaticText] = useState(initialText);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputInteractionActive, setInputInteractionActive] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  settingsRef.current = effectiveSettings;

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
    if (effectiveSettings.hideInput) {
      hideInputTimerRef.current = window.setTimeout(() => {
        setInputVisible(false);
      }, effectiveSettings.inputHideSpeed * 1000);
    }
  };

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      
      if(effectiveSettings.hideNav === true){
        const nearTopEdge = event.clientY <= window.innerHeight * 0.2;
        setHeaderVisible(nearTopEdge);
        if (hideNavTimerRef.current) {
          window.clearTimeout(hideNavTimerRef.current);
        }
        hideNavTimerRef.current = window.setTimeout(() => {
          setHeaderVisible(false);
        }, effectiveSettings.navHideSpeed*1000);
      } else {
        setHeaderVisible(true);
      }
      if (showInput && !inputInteractionActive && effectiveSettings.hideInput) {
        setInputVisible(true);
        if (hideInputTimerRef.current) {
          window.clearTimeout(hideInputTimerRef.current);
        }
        hideInputTimerRef.current = window.setTimeout(() => {
          setInputVisible(false);
        }, effectiveSettings.inputHideSpeed*1000);
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
  }, [effectiveSettings, inputInteractionActive, showInput]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

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
    const initialSettings = settingsRef.current;
    const columnWidth = normalizeColumnWidth(initialSettings.columnWidth);
    const currentEffect = new Effect(logicalSize.width, logicalSize.height, columnWidth);
    effectRef.current = currentEffect;
    gradientRef.current = createGradient(
      ctx,
      logicalSize.width,
      logicalSize.height,
      initialSettings.gradientColors,
      initialSettings.gradientAngle,
      initialSettings.gradientStops,
    );
    staticArtRef.current = showStaticArt
      ? createStaticArt({
          text: staticText,
          effect: currentEffect,
          canvasWidth: logicalSize.width,
          canvasHeight: logicalSize.height,
          columnWidth,
        })
      : null;

    const resizeCanvas = () => {
      const { width, height } = syncCanvasSize();

      const nextEffect = new Effect(width, height, columnWidth);
      effectRef.current = nextEffect;
      gradientRef.current = createGradient(
        ctx,
        width,
        height,
        settingsRef.current.gradientColors,
        settingsRef.current.gradientAngle,
        settingsRef.current.gradientStops,
      );
      staticArtRef.current = showStaticArt
        ? createStaticArt({
            text: staticText,
            effect: nextEffect,
            canvasWidth: width,
            canvasHeight: height,
            columnWidth,
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
      const currentSettings = settingsRef.current;
      const fps = currentSettings.speed;
      const nextFrame = 1000 / fps;
      const currentArt = staticArtRef.current;
      const wordComplete =
        currentArt !== null &&
        currentArt.phase === 'in' &&
        currentArt.cells.length > 0 &&
        currentArt.cells.every((cell) => cell.settled);

      if (currentArt && wordComplete && currentSettings.rainOut) {
        rainOutTimerRef.current += deltaTime;
        const rainOutSpeed = normalizeRainOutSpeed(currentSettings.rainOutSpeed);
        if (rainOutTimerRef.current >= rainOutSpeed * 1000) {
          beginStaticArtRainOut(currentArt);
          rainOutTimerRef.current = 0;
        }
      } else if (!wordComplete) {
        rainOutTimerRef.current = 0;
      }

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
        const reducedColumns = wordComplete ? null : occupiedColumns;
        const dimColumns = wordComplete ? occupiedColumns : null;

        currentEffect.symbols.forEach((symbol) =>
          symbol.draw(currentContext, reducedColumns, dimColumns),
        );
        renderStaticText(currentContext, currentArt, gradientRef.current);

        if (currentArt && isStaticArtGone(currentArt)) {
          if (currentSettings.loopAnimation && currentSettings.rainOut) {
            staticArtRef.current = createStaticArt({
              text: staticText,
              effect: currentEffect,
              canvasWidth: logicalWidth,
              canvasHeight: logicalHeight,
              columnWidth,
            });
          } else {
            currentArt.phase = 'gone';
          }
        }
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
  }, [
    isLoaded,
    showStaticArt,
    staticText,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    gradientRef.current = createGradient(
      context,
      canvas.width / (window.devicePixelRatio || 1),
      canvas.height / (window.devicePixelRatio || 1),
      effectiveSettings.gradientColors,
      effectiveSettings.gradientAngle,
      effectiveSettings.gradientStops,
    );
  }, [settings.gradientAngle, settings.gradientColors, settings.gradientStops]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <NavBar headerVisible={headerVisible} onReset={onReset} />
      {showInput && (
        <InputForm
          visible={inputVisible}
          setVisible={setInputVisible}
          value={inputValue}
          initialAdditionalValues={initialLines.slice(1)}
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
