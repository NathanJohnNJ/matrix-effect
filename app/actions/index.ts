export type MatrixSettings = {
  gradientColors: string[];
  gradientStops: number[];
  gradientAngle: number;
  speed: number;
  columnWidth: number;
  inputHideSpeed: number;
  navHideSpeed: number;
  rainOutSpeed: number;
  hideNav: boolean;
  hideInput: boolean;
  rainOut: boolean;
  loopAnimation: boolean;
};

export const MATRIX_SETTINGS_STORAGE_KEY = 'matrix-effect-settings';

export function normalizeGradientAngle(value: number) {
  return Number.isFinite(value) ? Math.min(360, Math.max(-360, value)) : 0;
}

export function normalizeColumnWidth(value: number) {
  return Number.isFinite(value) ? Math.min(8, Math.max(1, Math.round(value))) : 1;
}

export function normalizeRainOutSpeed(value: number) {
  return Number.isFinite(value) ? Math.min(30, Math.max(0, value)) : DEFAULT_MATRIX_SETTINGS.rainOutSpeed;
}

export function parseSettingsSearchParams(searchParams: URLSearchParams): Partial<MatrixSettings> {
  const settings: Partial<MatrixSettings> = {};
  type NumericSetting = 'navHideSpeed' | 'inputHideSpeed' | 'rainOutSpeed' | 'gradientAngle' | 'columnWidth' | 'speed';
  type BooleanSetting = 'hideNav' | 'hideInput' | 'rainOut' | 'loopAnimation';
  const readNumber = (name: NumericSetting, normalize: (value: number) => number) => {
    const value = searchParams.get(name);
    if (value === null || value.trim() === '') {
      return;
    }

    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      settings[name] = normalize(parsed);
    }
  };
  const readBoolean = (name: BooleanSetting) => {
    const value = searchParams.get(name);
    if (value === 'true' || value === 'false') {
      settings[name] = value === 'true';
    }
  };

  readNumber('navHideSpeed', (value) => Math.min(30, Math.max(0, value)));
  readNumber('inputHideSpeed', (value) => Math.min(30, Math.max(0, value)));
  readNumber('rainOutSpeed', normalizeRainOutSpeed);
  readNumber('gradientAngle', normalizeGradientAngle);
  readNumber('columnWidth', normalizeColumnWidth);
  readNumber('speed', (value) => Math.min(30, Math.max(4, value)));
  readBoolean('hideNav');
  readBoolean('hideInput');
  readBoolean('rainOut');
  readBoolean('loopAnimation');

  const gradientValues = searchParams.getAll('gradient');
  const gradients = gradientValues.flatMap((value) => {
    const match = value.match(/^#?([\da-f]{6}|[\da-f]{8})(?:-(\d{1,3}))?$/i);
    if (!match) {
      return [];
    }

    const percentage = match[2] === undefined ? undefined : Number(match[2]);
    return percentage === undefined || percentage <= 100
      ? [{ color: `#${match[1]}`, percentage }]
      : [];
  });

  if (gradients.length > 0) {
    const evenlySpacedStops = createEvenlySpacedStops(gradients.length);
    settings.gradientColors = gradients.map(({ color }) => color);
    settings.gradientStops = gradients.map(({ percentage }, index) =>
      percentage === undefined ? evenlySpacedStops[index] : percentage / 100,
    );
  }

  return settings;
}

export function createEvenlySpacedStops(colorCount: number) {
  return Array.from(
    { length: colorCount },
    (_, index) => colorCount > 1 ? index / (colorCount - 1) : 0,
  );
}

export const DEFAULT_MATRIX_SETTINGS: MatrixSettings = {
  gradientColors: ['#fff200', '#ff7f00', '#ff0000', '#ffb3de', '#00ffff', '#00ff00'],
  gradientStops: createEvenlySpacedStops(6),
  gradientAngle: 0,
  speed: 10,
  columnWidth: 3,
  inputHideSpeed: 3,
  navHideSpeed: 3,
  rainOutSpeed: 3,
  hideNav: true,
  hideInput: true,
  rainOut: false,
  loopAnimation: false,
};

export type StaticCell = {
  x: number;
  targetY: number;
  y: number;
  fontSize: number;
  character: string;
  settled: boolean;
  active: boolean;
  removed: boolean;
  startFrame?: number;
  outStartFrame?: number;
  nextCell: StaticCell | null;
};

export type StaticArt = {
  cells: StaticCell[];
  occupiedColumns: Set<number>;
  frame: number;
  canvasHeight: number;
  phase: 'in' | 'out' | 'gone';
  animationDuration: number;
};

export const characters = '0123456789アァカタナハマヤャ/|[]!@£$&*()ラワイィキシチニヒミリビピウゥクスツヌフムユュルグズブヅプエケセテネヘメレヱデベペオォコソトモヨロヲゴゾッンABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class Symbol {
  x: number;
  y: number;
  fontSize: number;
  canvasHeight: number;
  text: string;

  constructor(x: number, y: number, fontSize: number, canvasHeight: number) {
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.canvasHeight = canvasHeight;
    this.text = '';
  }

  draw(
    context: CanvasRenderingContext2D,
    reducedColumns: Set<number> | null,
    dimColumns: Set<number> | null,
  ) {
    this.text = characters.charAt(Math.floor(Math.random() * characters.length));
    const isWordColumn = reducedColumns && reducedColumns.has(this.x);

    if (!isWordColumn || Math.random() > 0.75) {
      if (dimColumns && dimColumns.has(this.x)) {
        context.save();
        context.globalAlpha = 0.85;
      }

      context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);

      if (dimColumns && dimColumns.has(this.x)) {
        context.restore();
      }
    }

    if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.98) {
      this.y = 0;
    } else {
      this.y += 1;
    }
  }
}

export class Effect {
  canvasWidth: number;
  canvasHeight: number;
  baseFontSize: number;
  fontSize: number;
  columns: number;
  rows: number;
  symbols: Symbol[];

  constructor(canvasWidth: number, canvasHeight: number, columnWidth = DEFAULT_MATRIX_SETTINGS.columnWidth) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.baseFontSize = Math.max(10, columnWidth * 4);
    this.fontSize = this.baseFontSize;
    this.columns = this.canvasWidth / this.fontSize;
    this.rows = this.canvasHeight / this.fontSize;
    this.symbols = [];
    this.initialize();
  }

  initialize() {
    for (let i = 0; i < this.columns; i += 1) {
      this.symbols[i] = new Symbol(
        i,
        Math.floor(Math.random() * this.rows),
        this.fontSize,
        this.canvasHeight,
      );
    }
  }

  setFontSize(fontSize: number) {
    this.fontSize = fontSize;
    this.columns = this.canvasWidth / this.fontSize;
    this.rows = this.canvasHeight / this.fontSize;
    this.symbols = [];
    this.initialize();
  }

  resize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.fontSize = this.baseFontSize;
    this.columns = this.canvasWidth / this.fontSize;
    this.rows = this.canvasHeight / this.fontSize;
    this.symbols = [];
    this.initialize();
  }
}

export function createGradient(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[] = DEFAULT_MATRIX_SETTINGS.gradientColors,
  angle = DEFAULT_MATRIX_SETTINGS.gradientAngle,
  colorStops: number[] = DEFAULT_MATRIX_SETTINGS.gradientStops,
) {
  const diagonal = Math.hypot(width, height);
  const rotatedAngle = (normalizeGradientAngle(angle) * Math.PI) / 180;
  const centerX = width / 2;
  const centerY = height / 2;
  const offsetX = Math.cos(rotatedAngle) * diagonal / 2;
  const offsetY = Math.sin(rotatedAngle) * diagonal / 2;
  const gradient = context.createLinearGradient(
    centerX - offsetX,
    centerY - offsetY,
    centerX + offsetX,
    centerY + offsetY,
  );
  const stops = colors.length > 0 ? colors : DEFAULT_MATRIX_SETTINGS.gradientColors;

  stops.forEach((color, index) => {
    const stop = colorStops[index] ?? (stops.length > 1 ? index / (stops.length - 1) : 0);
    gradient.addColorStop(stop, color);
  });

  return gradient;
}

const asciiGlyphs: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '01000', '10000', '10000', '10000', '01000', '01111'],
  D: ['11100', '10010', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '11101', '10101', '10111', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
  ',': ['00000', '00000', '00000', '00000', '00110', '00110', '00100'],
  ':': ['00000', '00110', '00110', '00000', '00110', '00110', '00000'],
  ';': ['00000', '00110', '00110', '00000', '00110', '00110', '00100'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '\\': ['10000', '01000', '01000', '00100', '00010', '00010', '00001'],
  '(': ['001', '010', '100', '100', '100', '010', '001'],
  ')': ['100', '010', '001', '001', '001', '010', '100'],
  '[': ['111', '100', '100', '100', '100', '100', '111'],
  ']': ['111', '001', '001', '001', '001', '001', '111'],
  '#': ['01010', '01010', '11111', '01010', '01010', '11111', '01010'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '&': ['00110', '01001', '00101', '01110', '10101', '10010', '01101'],
  '*': ['00000', '10101', '01110', '11111', '01110', '10101', '00000'],
  '@': ['01110', '10001', '10111', '10101', '10111', '10000', '01111'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
};

const fallbackGlyph = ['11111', '10000', '10000', '11110', '10000', '10000', '11111'];

export function createStaticArt({
  text,
  effect,
  canvasWidth,
  canvasHeight,
  columnWidth = DEFAULT_MATRIX_SETTINGS.columnWidth,
}: {
  text: string;
  effect: Effect;
  canvasWidth: number;
  canvasHeight: number;
  columnWidth?: number;
}): StaticArt {
  const visibleLines = text.toUpperCase().split('\n').filter(Boolean);
  const blockSize = Math.max(1, Number.isFinite(columnWidth) ? columnWidth : DEFAULT_MATRIX_SETTINGS.columnWidth);
  const glyphWidth = 5 * blockSize;
  const letterGap = blockSize;
  const lineWidths = visibleLines.map(
    (line) => line.length * glyphWidth + Math.max(0, line.length - 1) * letterGap,
  );
  const totalWidth = Math.max(0, ...lineWidths);
  const totalHeight = visibleLines.length * 7 * blockSize
    + Math.max(0, visibleLines.length - 1) * blockSize;
  const fontSize = Math.min(
    effect.baseFontSize,
    canvasWidth * 0.9 / Math.max(1, totalWidth),
    canvasHeight * 0.8 / Math.max(1, totalHeight),
  );

  effect.setFontSize(fontSize);

  const startRow = (canvasHeight / fontSize - totalHeight) / 2;
  const cells: StaticCell[] = [];
  const occupiedColumns = new Set<number>();

  visibleLines.forEach((line, lineIndex) => {
    const lineWidth = lineWidths[lineIndex];
    const startColumn = (canvasWidth / fontSize - lineWidth) / 2;
    const lineStartRow = startRow + lineIndex * (7 * blockSize + blockSize);

    line.split('').forEach((character, characterIndex) => {
      const glyph = asciiGlyphs[character] || fallbackGlyph;
      const characterStart = startColumn + characterIndex * (glyphWidth + letterGap);

      glyph.forEach((row, rowIndex) => {
        row.split('').forEach((pixel, columnIndex) => {
          if (pixel !== '1') {
            return;
          }

          for (let blockRow = 0; blockRow < blockSize; blockRow += 1) {
            for (let blockColumn = 0; blockColumn < blockSize; blockColumn += 1) {
              const cell: StaticCell = {
                x: characterStart + columnIndex * blockSize + blockColumn,
                targetY: lineStartRow + rowIndex * blockSize + blockRow,
                y: -1,
                fontSize,
                character: characters.charAt(Math.floor(Math.random() * characters.length)),
                settled: false,
                active: false,
                removed: false,
                startFrame: undefined,
                outStartFrame: undefined,
                nextCell: null,
              };
              cells.push(cell);
              occupiedColumns.add(Math.round((cell.x * cell.fontSize) / effect.fontSize));
            }
          }
        });
      });
    });
  });

  const cellsByColumn = new Map<number, StaticCell[]>();
  cells.forEach((cell) => {
    const column = Math.round((cell.x * cell.fontSize) / effect.fontSize);
    if (!cellsByColumn.has(column)) {
      cellsByColumn.set(column, []);
    }
    cellsByColumn.get(column)?.push(cell);
  });

  const columnDurations = new Map<number, number>();
  let baseAnimationDuration = 0;
  cellsByColumn.forEach((columnCells) => {
    columnCells.sort(() => Math.random() - 0.5);
    columnCells[0].active = true;
    let columnDuration = columnCells[0].targetY + 1;
    columnCells.forEach((cell, cellIndex) => {
      cell.nextCell = columnCells[cellIndex + 1] || null;
      if (cellIndex > 0) {
        columnDuration += cell.targetY + 1;
      }
    });
    columnDurations.set(
      Math.round((columnCells[0].x * columnCells[0].fontSize) / effect.fontSize),
      columnDuration,
    );
    baseAnimationDuration = Math.max(baseAnimationDuration, columnDuration);
  });

  const maximumStartDelay = Math.floor(baseAnimationDuration * 0.75);
  columnDurations.forEach((columnDuration, column) => {
    const columnCells = cellsByColumn.get(column);
    if (!columnCells) {
      return;
    }

    columnCells[0].startFrame = Math.floor(Math.random() * (maximumStartDelay + 1));
    columnDurations.set(column, columnDuration + (columnCells[0].startFrame ?? 0));
  });

  const animationDuration = Math.max(...columnDurations.values(), 0);

  return {
    cells,
    occupiedColumns,
    frame: 0,
    canvasHeight,
    phase: 'in',
    animationDuration,
  };
}

export function beginStaticArtRainOut(staticArt: StaticArt) {
  staticArt.phase = 'out';
  staticArt.frame = 0;

  const shuffledCells = [...staticArt.cells].sort(() => Math.random() - 0.5);
  const maximumFallFrames = Math.max(
    ...staticArt.cells.map((cell) => Math.ceil(staticArt.canvasHeight / cell.fontSize) - cell.y),
  );
  const releaseWindow = Math.max(0, staticArt.animationDuration - maximumFallFrames);
  const randomReleaseWindow = Math.min(
    releaseWindow,
    Math.floor(staticArt.animationDuration * 0.75),
  );

  shuffledCells.forEach((cell) => {
    cell.outStartFrame = Math.floor(Math.random() * (randomReleaseWindow + 1));
    cell.removed = false;
  });
}

export function isStaticArtGone(staticArt: StaticArt) {
  return staticArt.phase === 'out' && staticArt.cells.every((cell) => cell.removed);
}

export function renderStaticText(
  context: CanvasRenderingContext2D,
  staticArt: StaticArt | null,
  gradient: CanvasGradient,
) {
  if (!staticArt || staticArt.cells.length === 0) {
    return;
  }

  context.save();
  context.fillStyle = gradient;
  context.textAlign = 'center';
  staticArt.frame += 1;

  staticArt.cells.forEach((cell) => {
    if (staticArt.phase === 'gone' || cell.removed) {
      return;
    }

    if (staticArt.phase === 'out') {
      if (staticArt.frame < (cell.outStartFrame ?? 0)) {
        context.font = `${cell.fontSize}px monospace`;
        context.fillText(cell.character, cell.x * cell.fontSize, (cell.y + 1) * cell.fontSize);
        return;
      }

      cell.y += 1;
      if (cell.y * cell.fontSize > staticArt.canvasHeight) {
        cell.removed = true;
        return;
      }

      cell.character = characters.charAt(Math.floor(Math.random() * characters.length));
      context.font = `${cell.fontSize}px monospace`;
      context.fillText(cell.character, cell.x * cell.fontSize, (cell.y + 1) * cell.fontSize);
      return;
    }

    if (!cell.settled && (!cell.active || staticArt.frame < (cell.startFrame ?? 0))) {
      return;
    }

    if (!cell.settled) {
      cell.y += 1;
      if (cell.y >= cell.targetY) {
        cell.y = cell.targetY;
        cell.settled = true;
        cell.active = false;
        if (cell.nextCell) {
          cell.nextCell.active = true;
        }
      }
    }

    if (cell.y >= 0) {
      if (!cell.settled) {
        cell.character = characters.charAt(Math.floor(Math.random() * characters.length));
      }
      context.font = `${cell.fontSize}px monospace`;
      context.fillText(cell.character, cell.x * cell.fontSize, (cell.y + 1) * cell.fontSize);
    }
  });

  context.restore();
}