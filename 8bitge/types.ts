/**
 * Types and interfaces for the 8BitPixel Game Engine
 */

export enum GameStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ENDED = 'ended'
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameConfig {
  gameId: string;
  element: string | HTMLElement;
  width?: number;
  height?: number;
  fps?: number;
  debug?: boolean;
  pixelPerfect?: boolean;
  persistState?: boolean;
  orientation?: OrientationMode;
  responsive?: boolean;
  pixelRatio?: number;
  allowPause?: boolean;
  fullscreenOnMobile?: boolean;
}

export interface GameOptions {
  gameId: string;
  element: string | HTMLElement;
  width?: number;
  height?: number;
  fps?: number;
  debug?: boolean;
  pixelPerfect?: boolean;
  persistState?: boolean;
  achievements?: Achievement[];
  audioOptions?: AudioOptions;
  orientation?: OrientationMode;
  responsive?: boolean;
  pixelRatio?: number;
  allowPause?: boolean;
  fullscreenOnMobile?: boolean;
}

export interface GameState {
  status: GameStatus;
  score: number;
  level: number;
  timer: number;
  entities: any[];
  custom: Record<string, any>;
}

export interface Entity {
  id?: string;
  type: string;
  position: Vector2D;
  velocity?: Vector2D;
  active?: boolean;
  collider?: Rect;
  update?: (deltaTime: number, engine: any) => void;
  render?: (context: CanvasRenderingContext2D) => void;
  onCollision?: (other: Entity) => void;
  [key: string]: any;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  secret?: boolean;
  condition?: (state: GameState) => boolean;
  reward?: number;
  progress?: {
    current: number;
    target: number;
  };
  unlocked?: boolean;
  unlockDate?: Date;
  category?: string;
  points?: number;
}

export interface AchievementProgress {
  id: string;
  achieved: boolean;
  date?: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  date: number;
  gameVersion?: string;
}

export interface AudioOptions {
  muted?: boolean;
  volume?: number;
  sounds?: Record<string, string>;
  autoUnlock?: boolean;
  autoSuspend?: boolean;
}

export interface InputState {
  keyboard: Record<string, boolean>;
  mouse: {
    x: number;
    y: number;
    buttons: {
      left: boolean;
      middle: boolean;
      right: boolean;
    };
  };
  touches: Touch[];
}

export interface Touch {
  id: number;
  x: number;
  y: number;
  active: boolean;
}

export interface EventCallback {
  (data: any): void;
}

export enum OrientationMode {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
  BOTH = 'both'
}

export interface Platform {
  isMobile: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  hasTouch: boolean;
  isPWA: boolean;
  pixelRatio: number;
}
